import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiUserPlus,
  FiStar,
  FiUserMinus,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { customersApi } from '../../api/customersApi'
import type { Customer, CustomerFilter, CustomerStats } from '../../types/customer'
import { CustomerSegment, CustomerSegmentLabels, CustomerSegmentColors } from '../../types/customer'
import type { PaginatedResult } from '../../types/product'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { buildWhatsAppUrl } from '../../utils/whatsappUrl'
import { formatPhone } from '../../utils/formatPhone'
import StatsCard from '../../components/admin/StatsCard'
import ConfirmDialog from '../../components/admin/ConfirmDialog'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<PaginatedResult<Customer> | null>(null)
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<CustomerFilter>({
    page: 1,
    pageSize: 15,
  })

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await customersApi.list(filters)
      setCustomers(res.data)
    } catch {
      toast.error('Erro ao carregar clientes.')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const fetchStats = useCallback(async () => {
    try {
      const res = await customersApi.getStats()
      setStats(res.data)
    } catch {
      // Stats are non-critical, fail silently
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const updateFilter = (update: Partial<CustomerFilter>) => {
    setFilters((prev) => ({ ...prev, ...update, page: update.page ?? 1 }))
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await customersApi.delete(deleteTarget.id)
      toast.success('Cliente excluído com sucesso.')
      setDeleteTarget(null)
      fetchCustomers()
      fetchStats()
    } catch {
      toast.error('Erro ao excluir cliente.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-dark heading-ornament-left">Clientes</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Clientes"
            value={stats.totalCustomers}
            icon={FiUsers}
            colorClass="bg-brand-blue"
          />
          <StatsCard
            label="Novos"
            value={stats.newCustomers}
            icon={FiUserPlus}
            colorClass="bg-brand-green"
          />
          <StatsCard
            label="VIP"
            value={stats.vipCustomers}
            icon={FiStar}
            colorClass="bg-brand-pink"
          />
          <StatsCard
            label="Inativos"
            value={stats.inactiveCustomers}
            icon={FiUserMinus}
            colorClass="bg-gray-400"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={filters.search ?? ''}
              onChange={(e) => updateFilter({ search: e.target.value || undefined })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            />
          </div>
          <select
            value={filters.segment ?? ''}
            onChange={(e) =>
              updateFilter({
                segment: e.target.value !== '' ? (Number(e.target.value) as CustomerSegment) : undefined,
              })
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 bg-white"
          >
            <option value="">Todos os segmentos</option>
            {Object.entries(CustomerSegmentLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={(e) => updateFilter({ dateFrom: e.target.value || undefined })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            placeholder="Data início"
          />
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={(e) => updateFilter({ dateTo: e.target.value || undefined })}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            placeholder="Data fim"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card-top-accent bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-blue border-t-transparent" />
          </div>
        ) : !customers || customers.items.length === 0 ? (
          <div className="text-center py-20">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-text-light">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="admin-table-header">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Nome</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Segmento</th>
                    <th className="text-right py-3 px-4 font-medium text-text-light">Pedidos</th>
                    <th className="text-right py-3 px-4 font-medium text-text-light">Total Gasto</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Último Pedido</th>
                    <th className="text-right py-3 px-4 font-medium text-text-light">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.items.map((customer, idx) => (
                    <tr
                      key={customer.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        idx % 2 === 1 ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-text-dark">
                        <Link
                          to={`/admin/clientes/${customer.id}`}
                          className="hover:text-brand-blue transition-colors"
                        >
                          {customer.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-text-light">
                        {formatPhone(customer.phone)}
                      </td>
                      <td className="py-3 px-4 text-text-light">
                        {customer.email ?? '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            CustomerSegmentColors[customer.segment]
                          }`}
                        >
                          {CustomerSegmentLabels[customer.segment]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-text-medium">
                        {customer.totalOrders}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-text-dark">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-text-light">
                        {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/clientes/${customer.id}`}
                            className="p-2 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg"
                            title="Ver detalhes"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <a
                            href={buildWhatsAppUrl(
                              customer.phone,
                              `Olá ${customer.name}, aqui é da Floricultura Embeleze!`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-text-light hover:text-brand-green hover:bg-brand-green/5 rounded-lg"
                            title="WhatsApp"
                          >
                            <FaWhatsapp className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setDeleteTarget(customer)}
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
            {customers.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-text-light">
                  Página {customers.page} de {customers.totalPages} ({customers.totalCount} clientes)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
                    disabled={(filters.page ?? 1) <= 1}
                    className="p-2 text-text-medium hover:bg-gray-100 rounded-lg disabled:opacity-30"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        page: Math.min(customers.totalPages, (f.page ?? 1) + 1),
                      }))
                    }
                    disabled={(filters.page ?? 1) >= customers.totalPages}
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
