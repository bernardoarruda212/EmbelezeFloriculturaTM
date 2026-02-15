import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { FiPlus, FiTrash2, FiArrowLeft, FiSave } from 'react-icons/fi'
import { productsApi } from '../../api/productsApi'
import { categoriesApi } from '../../api/categoriesApi'
import { uploadApi } from '../../api/uploadApi'
import type { Category } from '../../types/category'
import type { ProductDetail } from '../../types/product'
import ImageUploader from '../../components/admin/ImageUploader'

const variationSchema = z.object({
  name: z.string().min(1, 'Nome da variação é obrigatório'),
  price: z.preprocess((v) => Number(v), z.number().min(0, 'Preço deve ser positivo')),
  stockQuantity: z.preprocess((v) => Number(v), z.number().int().min(0, 'Estoque deve ser 0 ou mais')),
})

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  basePrice: z.preprocess((v) => Number(v), z.number().min(0.01, 'Preço deve ser maior que zero')),
  stockQuantity: z.preprocess((v) => Number(v), z.number().int().min(0, 'Estoque deve ser 0 ou mais')),
  badge: z.string().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  categoryIds: z.array(z.string()),
  variations: z.array(variationSchema),
})

type ProductFormData = {
  name: string
  description?: string
  basePrice: number
  stockQuantity: number
  badge?: string
  isFeatured: boolean
  isActive: boolean
  categoryIds: string[]
  variations: { name: string; price: number; stockQuantity: number }[]
}

interface ImageItem {
  id: string
  url: string
  isMain: boolean
}

export default function ProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ImageItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [existingProduct, setExistingProduct] = useState<ProductDetail | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      basePrice: 0,
      stockQuantity: 0,
      badge: '',
      isFeatured: false,
      isActive: true,
      categoryIds: [],
      variations: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variations',
  })

  const loadProduct = useCallback(async () => {
    if (!id) return
    try {
      const res = await productsApi.getBySlug(id)
      const product = res.data
      setExistingProduct(product)
      reset({
        name: product.name,
        description: product.description ?? '',
        basePrice: product.basePrice,
        stockQuantity: product.stockQuantity,
        badge: product.badge ?? '',
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        categoryIds: product.categories.map((c) => c.id),
        variations: product.variations.map((v) => ({
          name: v.name,
          price: v.price,
          stockQuantity: v.stockQuantity,
        })),
      })
      setImages(
        product.images.map((img) => ({
          id: img.id,
          url: img.imageUrl,
          isMain: img.isMain,
        }))
      )
    } catch {
      toast.error('Erro ao carregar produto.')
      navigate('/admin/produtos')
    } finally {
      setIsLoadingProduct(false)
    }
  }, [id, navigate, reset])

  useEffect(() => {
    categoriesApi.listAll().then((res) => setCategories(res.data)).catch(() => {})
    loadProduct()
  }, [loadProduct])

  const handleImageUpload = async (files: File[]) => {
    setIsUploading(true)
    try {
      for (const file of files) {
        const res = await uploadApi.uploadImage(file)
        setImages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            url: res.data.imageUrl,
            isMain: prev.length === 0,
          },
        ])
      }
      toast.success('Imagens enviadas.')
    } catch {
      toast.error('Erro ao enviar imagens.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageRemove = (imageId: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== imageId)
      if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
        filtered[0].isMain = true
      }
      return filtered
    })
  }

  const handleSetMainImage = (imageId: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isMain: img.id === imageId,
      }))
    )
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true)
    try {
      const payload = {
        name: data.name,
        description: data.description || null,
        basePrice: data.basePrice,
        stockQuantity: data.stockQuantity,
        badge: data.badge || null,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        categoryIds: data.categoryIds,
        variations: data.variations,
      }

      if (isEditing && existingProduct) {
        await productsApi.update(existingProduct.id, payload)

        // Associate new images with the product
        const existingImageUrls = existingProduct.images.map((img) => img.imageUrl)
        for (const img of images) {
          if (!existingImageUrls.includes(img.url)) {
            await productsApi.addImageByUrl(existingProduct.id, img.url)
          }
        }

        toast.success('Produto atualizado com sucesso!')
      } else {
        const created = await productsApi.create(payload)
        const productId = created.data.id

        // Associate uploaded images with the new product
        for (const img of images) {
          await productsApi.addImageByUrl(productId, img.url)
        }

        toast.success('Produto criado com sucesso!')
      }

      navigate('/admin/produtos')
    } catch {
      toast.error('Erro ao salvar produto.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blue border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/produtos')}
          className="p-2 text-text-medium hover:bg-gray-100 rounded-lg"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-text-dark">
          {isEditing ? 'Editar Produto' : 'Novo Produto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-dark">Informações Básicas</h2>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Nome</label>
            <input
              {...register('name')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="Nome do produto"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1">Descrição</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-y"
              placeholder="Descrição do produto"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Preço Base (R$)</label>
              <input
                type="number"
                step="0.01"
                {...register('basePrice')}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                  errors.basePrice ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.basePrice && (
                <p className="mt-1 text-xs text-red-500">{errors.basePrice.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Estoque</label>
              <input
                type="number"
                {...register('stockQuantity')}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 ${
                  errors.stockQuantity ? 'border-red-400' : 'border-gray-300'
                }`}
              />
              {errors.stockQuantity && (
                <p className="mt-1 text-xs text-red-500">{errors.stockQuantity.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Badge</label>
              <input
                {...register('badge')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                placeholder="Ex: Promoção, Novo"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-dark">Categorias</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-text-light">Nenhuma categoria cadastrada.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 text-sm text-text-medium cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={cat.id}
                    {...register('categoryIds')}
                    className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-dark">Imagens</h2>
          <ImageUploader
            images={images}
            onUpload={handleImageUpload}
            onRemove={handleImageRemove}
            onSetMain={handleSetMainImage}
            isUploading={isUploading}
          />
        </div>

        {/* Variations */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-dark">Variações</h2>
            <button
              type="button"
              onClick={() => append({ name: '', price: 0, stockQuantity: 0 })}
              className="inline-flex items-center gap-1 text-sm text-brand-blue hover:text-brand-blue/80"
            >
              <FiPlus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-text-light">Nenhuma variação adicionada.</p>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-text-light mb-1">Nome</label>
                    <input
                      {...register(`variations.${index}.name`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                      placeholder="Ex: Pequeno, Grande"
                    />
                    {errors.variations?.[index]?.name && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.variations[index].name.message}
                      </p>
                    )}
                  </div>
                  <div className="w-32">
                    <label className="block text-xs font-medium text-text-light mb-1">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`variations.${index}.price`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-text-light mb-1">Estoque</label>
                    <input
                      type="number"
                      {...register(`variations.${index}.stockQuantity`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-6 p-2 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-dark">Configurações</h2>
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between">
              <span className="text-sm text-text-medium">Produto Destaque</span>
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-5 w-5"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-text-medium">Produto Ativo</span>
              <input
                type="checkbox"
                {...register('isActive')}
                className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-5 w-5"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/produtos')}
            className="px-6 py-2.5 text-sm font-medium text-text-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
        </div>
      </form>
    </div>
  )
}
