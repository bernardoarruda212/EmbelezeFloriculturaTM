import { useState, useEffect, useCallback } from 'react'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiBox,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { suppliersApi } from '../../api/suppliersApi'
import type { Supplier, SupplierDetail, SupplierCreate } from '../../types/inventory'
import type { PaginatedResult, Product } from '../../types/product'
import api from '../../api/axiosInstance'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

interface SupplierFormState {
  id?: string
  name: string
  contactPerson: string
  phone: string
  email: string
  address: string
  notes: string
  productIds: string[]
}

const emptyForm: SupplierFormState = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
  productIds: [],
}

export default function SuppliersPage() {
  // List state
  const [suppliers, setSuppliers] = useState<PaginatedResult<Supplier> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<{
    search?: string
    isActive?: boolean
    page: number
    pageSize: number
  }>({
    page: 1,
    pageSize: 15,
  })

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState<SupplierFormState>(emptyForm)
  const [isSaving, setIsSaving] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  // Products for multi-select
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productSearch, setProductSearch] = useState('')

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await suppliersApi.list(filters)
      setSuppliers(res.data)
    } catch {
      toast.error('Erro ao carregar fornecedores.')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  // Fetch products for multi-select
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true)
    try {
      const res = await api.get<PaginatedResult<Product>>('/products', {
        params: { pageSize: 100, isActive: true },
      })
      setAllProducts(res.data.items)
    } catch {
      toast.error('Erro ao carregar produtos.')
    } finally {
      setProductsLoading(false)
    }
  }, [])

  const updateFilter = (update: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...update, page: update.page ?? 1 }))
  }

  const openCreateModal = () => {
    setFormData(emptyForm)
    setModalOpen(true)
    fetchProducts()
  }

  const openEditModal = async (supplier: Supplier) => {
    setFormLoading(true)
    setModalOpen(true)
    fetchProducts()

    try {
      const res = await suppliersApi.getById(supplier.id)
      const detail: SupplierDetail = res.data
      setFormData({
        id: detail.id,
        name: detail.name,
        contactPerson: detail.contactPerson ?? '',
        phone: detail.phone ?? '',
        email: detail.email ?? '',
        address: detail.address ?? '',
        notes: detail.notes ?? '',
        productIds: detail.products.map((p) => p.id),
      })
    } catch {
      toast.error('Erro ao carregar dados do fornecedor.')
      setModalOpen(false)
    } finally {
      setFormLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome e obrigatorio.')
      return
    }

    setIsSaving(true)
    try {
      const payload: SupplierCreate = {
        name: formData.name,
        contactPerson: formData.contactPerson || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        notes: formData.notes || undefined,
        productIds: formData.productIds,
      }

      if (formData.id) {
        await suppliersApi.update(formData.id, payload)
        toast.success('Fornecedor atualizado com sucesso.')
      } else {
        await suppliersApi.create(payload)
        toast.success('Fornecedor criado com sucesso.')
      }

      setModalOpen(false)
      fetchSuppliers()
    } catch {
      toast.error('Erro ao salvar fornecedor.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (supplier: Supplier) => {
    try {
      await suppliersApi.toggleActive(supplier.id)
      toast.success(supplier.isActive ? 'Fornecedor desativado.' : 'Fornecedor ativado.')
      fetchSuppliers()
    } catch {
      toast.error('Erro ao alterar status do fornecedor.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await suppliersApi.delete(deleteTarget.id)
      toast.success('Fornecedor excluido com sucesso.')
      setDeleteTarget(null)
      fetchSuppliers()
    } catch {
      toast.error('Erro ao excluir fornecedor.')
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleProductSelection = (productId: string) => {
    setFormData((f) => ({
      ...f,
      productIds: f.productIds.includes(productId)
        ? f.productIds.filter((id) => id !== productId)
        : [...f.productIds, productId],
    }))
  }

  const filteredProducts = allProducts.filter(
    (p) =>
      !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-dark heading-ornament-left">Fornecedores</h1>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          Novo Fornecedor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              placeholder="Buscar por nome, contato, email..."
              value={filters.search ?? ''}
              onChange={(e) => updateFilter({ search: e.target.value || undefined })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            />
          </div>
          <select
            value={filters.isActive === undefined ? '' : filters.isActive ? 'true' : 'false'}
            onChange={(e) =>
              updateFilter({
                isActive: e.target.value === '' ? undefined : e.target.value === 'true',
              })
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 bg-white"
          >
            <option value="">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-top-accent bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-blue border-t-transparent" />
          </div>
        ) : !suppliers || suppliers.items.length === 0 ? (
          <div className="text-center py-20">
            <FiBox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-text-light">Nenhum fornecedor encontrado.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="admin-table-header">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Contato</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Email</th>
                    <th className="text-right py-3 px-4 font-medium text-text-light">Produtos</th>
                    <th className="text-center py-3 px-4 font-medium text-text-light">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-text-light">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.items.map((supplier, idx) => (
                    <tr
                      key={supplier.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        idx % 2 === 1 ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-text-dark">{supplier.name}</td>
                      <td className="py-3 px-4 text-text-light">
                        {supplier.contactPerson ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-text-light">{supplier.phone ?? '—'}</td>
                      <td className="py-3 px-4 text-text-light">{supplier.email ?? '—'}</td>
                      <td className="py-3 px-4 text-right text-text-medium">
                        {supplier.productCount}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            supplier.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {supplier.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(supplier)}
                            className="p-2 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg"
                            title="Editar"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(supplier)}
                            className={`p-2 rounded-lg ${
                              supplier.isActive
                                ? 'text-text-light hover:text-yellow-600 hover:bg-yellow-50'
                                : 'text-text-light hover:text-brand-green hover:bg-brand-green/5'
                            }`}
                            title={supplier.isActive ? 'Desativar' : 'Ativar'}
                          >
                            {supplier.isActive ? (
                              <FiToggleRight className="w-4 h-4" />
                            ) : (
                              <FiToggleLeft className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(supplier)}
                            className="p-2 text-text-light hover:text-red-500 hover:bg-red-50 rounded-lg"
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
            {suppliers.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-text-light">
                  Pagina {suppliers.page} de {suppliers.totalPages} ({suppliers.totalCount}{' '}
                  fornecedores)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
                    disabled={filters.page <= 1}
                    className="p-2 text-text-medium hover:bg-gray-100 rounded-lg disabled:opacity-30"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        page: Math.min(suppliers.totalPages, f.page + 1),
                      }))
                    }
                    disabled={filters.page >= suppliers.totalPages}
                    className="p-2 text-text-medium hover:bg-gray-100 rounded-lg disabled:opacity-30"
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-lg font-semibold text-text-dark">
                {formData.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-text-light hover:text-text-dark"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {formLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-blue border-t-transparent" />
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Nome <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="Nome do fornecedor"
                  />
                </div>

                {/* Contact Person & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">
                      Pessoa de Contato
                    </label>
                    <input
                      value={formData.contactPerson}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, contactPerson: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                      placeholder="Nome do contato"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-1">
                      Telefone
                    </label>
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="email@fornecedor.com"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Endereco</label>
                  <input
                    value={formData.address}
                    onChange={(e) => setFormData((f) => ({ ...f, address: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
                    placeholder="Endereco completo"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Observacoes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-y"
                    placeholder="Observacoes sobre o fornecedor..."
                  />
                </div>

                {/* Products multi-select */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Produtos Fornecidos
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {/* Product search within modal */}
                    <div className="relative border-b border-gray-200">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                      <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                      />
                    </div>

                    {/* Selected count */}
                    {formData.productIds.length > 0 && (
                      <div className="px-3 py-2 bg-brand-blue/5 border-b border-gray-200">
                        <span className="text-xs font-medium text-brand-blue">
                          {formData.productIds.length} produto(s) selecionado(s)
                        </span>
                      </div>
                    )}

                    {/* Product list */}
                    <div className="max-h-48 overflow-y-auto">
                      {productsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-brand-blue border-t-transparent" />
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <p className="text-center text-sm text-text-light py-4">
                          Nenhum produto encontrado.
                        </p>
                      ) : (
                        filteredProducts.map((product) => (
                          <label
                            key={product.id}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <input
                              type="checkbox"
                              checked={formData.productIds.includes(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              className="rounded border-gray-300 text-brand-blue focus:ring-brand-blue h-4 w-4"
                            />
                            <span className="text-sm text-text-dark flex-1">{product.name}</span>
                            <span className="text-xs text-text-light">
                              Estoque: {product.stockQuantity}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-text-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    )}
                    {formData.id ? 'Salvar' : 'Criar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir Fornecedor"
        message={`Tem certeza que deseja excluir o fornecedor "${deleteTarget?.name}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
