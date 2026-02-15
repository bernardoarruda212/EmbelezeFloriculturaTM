import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
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
                  {products.items.map((product, idx) => (
                    <tr
                      key={product.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        idx % 2 === 1 ? 'bg-gray-50/50' : ''
                      }`}
                    >
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
                        {product.badge && (
                          <span className="inline-block mt-0.5 text-xs bg-brand-pink-light text-brand-pink px-2 py-0.5 rounded-full">
                            {product.badge}
                          </span>
                        )}
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
                  ))}
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
