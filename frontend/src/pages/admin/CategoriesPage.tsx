import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiMenu, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { categoriesApi } from '../../api/categoriesApi'
import type { Category } from '../../types/category'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

interface CategoryFormState {
  id?: string
  name: string
  description: string
  iconClass: string
  isActive: boolean
}

const emptyForm: CategoryFormState = {
  name: '',
  description: '',
  iconClass: '',
  isActive: true,
}

function SortableCategoryItem({
  category,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  category: Category
  onEdit: (cat: Category) => void
  onDelete: (cat: Category) => void
  onToggleActive: (cat: Category) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-text-light hover:text-text-medium"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-dark">{category.name}</p>
        {category.description && (
          <p className="text-xs text-text-light truncate">{category.description}</p>
        )}
      </div>

      <span className="text-xs text-text-light whitespace-nowrap">
        {category.productCount ?? 0} produtos
      </span>

      <button
        onClick={() => onToggleActive(category)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          category.isActive ? 'bg-brand-green' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            category.isActive ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      <button
        onClick={() => onEdit(category)}
        className="p-2 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg"
        title="Editar"
      >
        <FiEdit2 className="w-4 h-4" />
      </button>

      <button
        onClick={() => onDelete(category)}
        className="p-2 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg"
        title="Excluir"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState<CategoryFormState>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.listAll()
      setCategories(res.data)
    } catch {
      toast.error('Erro ao carregar categorias.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = categories.findIndex((c) => c.id === active.id)
    const newIndex = categories.findIndex((c) => c.id === over.id)

    const reordered = [...categories]
    const [moved] = reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, moved)
    setCategories(reordered)

    try {
      await categoriesApi.reorder(reordered.map((c) => c.id))
      toast.success('Ordem atualizada.')
    } catch {
      toast.error('Erro ao reordenar.')
      fetchCategories()
    }
  }

  const handleToggleActive = async (category: Category) => {
    try {
      await categoriesApi.update(category.id, {
        name: category.name,
        description: category.description,
        iconClass: category.iconClass,
        displayOrder: category.displayOrder,
        isActive: !category.isActive,
      })
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, isActive: !c.isActive } : c))
      )
      toast.success(category.isActive ? 'Categoria desativada.' : 'Categoria ativada.')
    } catch {
      toast.error('Erro ao alterar status.')
    }
  }

  const openCreateModal = () => {
    setFormData(emptyForm)
    setModalOpen(true)
  }

  const openEditModal = (category: Category) => {
    setFormData({
      id: category.id,
      name: category.name,
      description: category.description ?? '',
      iconClass: category.iconClass ?? '',
      isActive: category.isActive,
    })
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        iconClass: formData.iconClass || null,
        displayOrder: 0,
        isActive: formData.isActive,
      }

      if (formData.id) {
        await categoriesApi.update(formData.id, payload)
        toast.success('Categoria atualizada.')
      } else {
        await categoriesApi.create(payload)
        toast.success('Categoria criada.')
      }

      setModalOpen(false)
      fetchCategories()
    } catch {
      toast.error('Erro ao salvar categoria.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await categoriesApi.delete(deleteTarget.id)
      toast.success('Categoria excluída.')
      setDeleteTarget(null)
      fetchCategories()
    } catch {
      toast.error('Erro ao excluir. Verifique se não há produtos associados.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blue border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark">Categorias</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-text-light">Nenhuma categoria cadastrada.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {categories.map((cat) => (
                <SortableCategoryItem
                  key={cat.id}
                  category={cat}
                  onEdit={openEditModal}
                  onDelete={setDeleteTarget}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-dark">
                {formData.id ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-text-light hover:text-text-dark">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Nome</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="Nome da categoria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-y"
                  placeholder="Descrição da categoria"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Classe do Ícone</label>
                <input
                  value={formData.iconClass}
                  onChange={(e) => setFormData((f) => ({ ...f, iconClass: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                  placeholder="Ex: fi-heart"
                />
              </div>
              <label className="flex items-center justify-between">
                <span className="text-sm text-text-medium">Ativa</span>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-5 w-5"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-text-medium bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                )}
                {formData.id ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Só é possível excluir categorias sem produtos associados.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
