import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { ordersApi, type OrderFilter } from '../../api/ordersApi'
import type { Order } from '../../types/order'
import { OrderStatus, OrderStatusLabels } from '../../types/order'
import type { PaginatedResult } from '../../types/product'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import { formatPhone } from '../../utils/formatPhone'
import { buildWhatsAppUrl } from '../../utils/whatsappUrl'
import OrderStatusBadge from '../../components/admin/OrderStatusBadge'

export default function OrdersListPage() {
  const [orders, setOrders] = useState<PaginatedResult<Order> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<OrderFilter>({
    page: 1,
    pageSize: 15,
  })

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await ordersApi.list(filters)
      setOrders(res.data)
    } catch {
      toast.error('Erro ao carregar pedidos.')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateFilter = (update: Partial<OrderFilter>) => {
    setFilters((prev) => ({ ...prev, ...update, page: update.page ?? 1 }))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-dark">Pedidos</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              placeholder="Buscar por cliente ou número..."
              value={filters.search ?? ''}
              onChange={(e) => updateFilter({ search: e.target.value || undefined })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
            />
          </div>
          <select
            value={filters.status ?? ''}
            onChange={(e) =>
              updateFilter({
                status: e.target.value ? (Number(e.target.value) as OrderStatus) : undefined,
              })
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 bg-white"
          >
            <option value="">Todos os status</option>
            {Object.entries(OrderStatusLabels).map(([value, label]) => (
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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-blue border-t-transparent" />
          </div>
        ) : !orders || orders.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-light">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-text-light">#Pedido</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Telefone</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Data</th>
                    <th className="text-left py-3 px-4 font-medium text-text-light">Status</th>
                    <th className="text-right py-3 px-4 font-medium text-text-light">Total</th>
                    <th className="text-right py-3 px-4 font-medium text-text-light">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.items.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        idx % 2 === 1 ? 'bg-gray-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-medium text-text-dark">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-text-medium">{order.customerName}</td>
                      <td className="py-3 px-4 text-text-light">{formatPhone(order.customerPhone)}</td>
                      <td className="py-3 px-4 text-text-light">{formatDateTime(order.createdAt)}</td>
                      <td className="py-3 px-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-text-dark">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/pedidos/${order.id}`}
                            className="p-2 text-text-light hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg"
                            title="Ver detalhes"
                          >
                            <FiEye className="w-4 h-4" />
                          </Link>
                          <a
                            href={buildWhatsAppUrl(
                              order.customerPhone,
                              `Olá ${order.customerName}, referente ao pedido #${order.orderNumber}`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-text-light hover:text-brand-green hover:bg-brand-green/5 rounded-lg"
                            title="WhatsApp"
                          >
                            <FaWhatsapp className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {orders.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-text-light">
                  Página {orders.page} de {orders.totalPages} ({orders.totalCount} pedidos)
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
                        page: Math.min(orders.totalPages, (f.page ?? 1) + 1),
                      }))
                    }
                    disabled={(filters.page ?? 1) >= orders.totalPages}
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
    </div>
  )
}
