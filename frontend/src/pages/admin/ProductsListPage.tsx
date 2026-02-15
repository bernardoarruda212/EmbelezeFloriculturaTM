import { useState, useEffect, useCallback, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { productsApi } from '../../api/productsApi'
import type { Product, PaginatedResult } from '../../types/product'
import { formatCurrency } from '../../utils/formatCurrency'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

export default function ProductsListPage() {
  const [products, setProducts] = useState<PaginatedResult<Product> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const pageSize = 10

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await productsApi.list({ search: search || undefined, page, pageSize })
      setProducts(res.data)
    } catch {
      toast.error('Erro ao carregar produtos.')
    } finally {
      setIsLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const toggleExpanded = (productId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const handleToggleFeatured = async (product: Product) => {
    try {
      await productsApi.toggleFeatured(product.id)
      setProducts((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((p) =>
                p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p
              ),
            }
          : null
      )
      toast.success(product.isFeatured ? 'Destaque removido.' : 'Produto destacado.')
    } catch {
      toast.error('Erro ao alterar destaque.')
    }
  }

  const handleToggleActive = async (product: Product) => {
    try {
      await productsApi.toggleActive(product.id)
      setProducts((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((p) =>
                p.id === product.id ? { ...p, isActive: !p.isActive } : p
              ),
            }
          : null
      )
      toast.success(product.isActive ? 'Produto desativado.' : 'Produto ativado.')
    } catch {
      toast.error('Erro ao alterar status.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await productsApi.delete(deleteTarget.id)
      toast.success('Produto excluído.')
      setDeleteTarget(null)
      fetchProducts()
    } catch {
      toast.error('Erro ao excluir produto.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-dark">Produtos</h1>
        <Link
          to="/admin/produtos/novo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Novo Produto
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-gray-100 text-text-medium text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-blue border-t-transparent" />
          </div>
        ) : !products || products.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-light">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-8 py-3 px-2"></th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Imagem</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Preço</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Categorias</th>
                    <th className="text-center py-3 px-4 font-medium text-text-light">Estoque</th>
                    <th className="text-center py-3 px-4 font-medium text-text-light">Destaque</th>
                    <th className="text-center py-3 px-4 font-medium text-text-light">Ativo</th>
                    <th className="text-right py-3 px-4 font-medium text-text-light">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.items.map((product, idx) => {
                    const isExpanded = expandedProducts.has(product.id)
                    const hasVariations = product.variationCount > 0

                    return (
                      <Fragment key={product.id}>
                        <tr
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            idx % 2 === 1 ? 'bg-gray-50/50' : ''
                          }`}
                        >
                          <td className="py-3 px-2 text-center">
                            {hasVariations ? (
                              <button
                                onClick={() => toggleExpanded(product.id)}
                                className="p-1 text-text-light hover:text-brand-blue rounded transition-colors"
                                title={isExpanded ? 'Recolher variações' : 'Ver variações'}
                              >
                                {isExpanded ? (
                                  <FiChevronUp className="w-4 h-4" />
                                ) : (
                                  <FiChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            ) : null}
                          </td>
                          <td className="py-3 px-4">
                            {product.mainImageUrl ? (
                              <img
                                src={product.mainImageUrl}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-text-light text-xs">
                                Sem img
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-text-dark">{product.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {product.badge && (
                                <span className="text-xs bg-brand-pink-light text-brand-pink px-2 py-0.5 rounded-full">
                                  {product.badge}
                                </span>
                              )}
                              {hasVariations && (
                                <button
                                  onClick={() => toggleExpanded(product.id)}
                                  className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full hover:bg-purple-100 transition-colors cursor-pointer"
                                >
                                  {product.variationCount} {product.variationCount === 1 ? 'variação' : 'variações'}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-text-medium">
                            {formatCurrency(product.basePrice)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {product.categoryNames.map((cat) => (
                                <span
                                  key={cat}
                                  className="text-xs bg-brand-sky/10 text-brand-blue px-2 py-0.5 rounded-full"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                product.stockQuantity === 0
                                  ? 'bg-red-100 text-red-700'
                                  : product.stockQuantity <= 5
                                  ? 'bg-brand-yellow/20 text-yellow-700'
                                  : 'bg-brand-green/10 text-brand-green'
                              }`}
                            >
                              {product.stockQuantity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleFeatured(product)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                product.isFeatured ? 'bg-brand-blue' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  product.isFeatured ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleActive(product)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                product.isActive ? 'bg-brand-green' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  product.isActive ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/admin/produtos/${product.id}/editar`}
                                className="p-2 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => setDeleteTarget(product)}
                                className="p-2 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded variations row */}
                        {isExpanded && hasVariations && (
                          <tr className="bg-purple-50/30">
                            <td colSpan={9} className="px-4 py-3">
                              <div className="ml-10">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                    Variações de {product.name}
                                  </p>
                                  <Link
                                    to={`/admin/produtos/${product.id}/editar`}
                                    className="text-xs text-brand-blue hover:underline"
                                  >
                                    Editar variações
                                  </Link>
                                </div>
                                <div className="grid gap-2">
                                  {product.variations.map((variation) => (
                                    <div
                                      key={variation.id}
                                      className="flex items-center gap-4 bg-white rounded-lg px-4 py-2.5 border border-purple-100"
                                    >
                                      <span className="font-medium text-text-dark min-w-[120px]">
                                        {variation.name}
                                      </span>
                                      <span className="text-text-medium">
                                        {formatCurrency(variation.price)}
                                      </span>
                                      <span
                                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                          variation.stockQuantity === 0
                                            ? 'bg-red-100 text-red-700'
                                            : variation.stockQuantity <= 5
                                            ? 'bg-brand-yellow/20 text-yellow-700'
                                            : 'bg-brand-green/10 text-brand-green'
                                        }`}
                                      >
                                        Estoque: {variation.stockQuantity}
                                      </span>
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                          variation.isActive
                                            ? 'bg-brand-green/10 text-brand-green'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}
                                      >
                                        {variation.isActive ? 'Ativa' : 'Inativa'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {products.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-text-light">
                  Página {products.page} de {products.totalPages} ({products.totalCount} produtos)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 text-text-medium hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(products.totalPages, p + 1))}
                    disabled={page >= products.totalPages}
                    className="p-2 text-text-medium hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
