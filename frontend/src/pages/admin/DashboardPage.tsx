import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingBag, FiCalendar, FiTrendingUp, FiDollarSign, FiAlertTriangle, FiMail } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { dashboardApi, type DashboardData } from '../../api/dashboardApi'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import StatsCard from '../../components/admin/StatsCard'
import OrderStatusBadge from '../../components/admin/OrderStatusBadge'
import type { OrderStatus } from '../../types/order'

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardApi.get()
        setData(res.data)
      } catch {
        toast.error('Erro ao carregar dados do dashboard.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blue border-t-transparent" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-text-medium">Erro ao carregar o dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-dark">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Pedidos Hoje"
          value={data.ordersToday}
          icon={FiShoppingBag}
          colorClass="bg-brand-blue"
        />
        <StatsCard
          label="Pedidos Semana"
          value={data.ordersThisWeek}
          icon={FiCalendar}
          colorClass="bg-brand-green"
        />
        <StatsCard
          label="Pedidos Mês"
          value={data.ordersThisMonth}
          icon={FiTrendingUp}
          colorClass="bg-brand-pink"
        />
        <StatsCard
          label="Receita Mês"
          value={formatCurrency(data.revenueThisMonth)}
          icon={FiDollarSign}
          colorClass="bg-brand-navy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-dark">Pedidos Recentes</h2>
            <Link
              to="/admin/pedidos"
              className="text-sm text-brand-blue hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <p className="text-text-light text-sm py-8 text-center">Nenhum pedido recente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-text-light">#</th>
                    <th className="text-left py-3 px-2 font-medium text-text-light">Cliente</th>
                    <th className="text-left py-3 px-2 font-medium text-text-light">Data</th>
                    <th className="text-left py-3 px-2 font-medium text-text-light">Status</th>
                    <th className="text-right py-3 px-2 font-medium text-text-light">Total</th>
                    <th className="text-right py-3 px-2 font-medium text-text-light"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium text-text-dark">{order.orderNumber}</td>
                      <td className="py-3 px-2 text-text-medium">{order.customerName}</td>
                      <td className="py-3 px-2 text-text-light">{formatDateTime(order.createdAt)}</td>
                      <td className="py-3 px-2">
                        <OrderStatusBadge status={order.status as OrderStatus} />
                      </td>
                      <td className="py-3 px-2 text-right font-medium text-text-dark">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Link
                          to={`/admin/pedidos/${order.id}`}
                          className="text-brand-blue hover:underline text-xs"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {/* Unread messages */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-pink/10 flex items-center justify-center">
                <FiMail className="w-5 h-5 text-brand-pink" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-dark">{data.unreadMessages}</p>
                <p className="text-sm text-text-light">Mensagens não lidas</p>
              </div>
            </div>
            <Link
              to="/admin/mensagens"
              className="text-sm text-brand-blue hover:underline"
            >
              Ver mensagens
            </Link>
          </div>

          {/* Low stock */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FiAlertTriangle className="w-5 h-5 text-brand-yellow" />
              <h2 className="text-lg font-semibold text-text-dark">Estoque Baixo</h2>
            </div>

            {data.lowStockProducts.length === 0 ? (
              <p className="text-text-light text-sm">Todos os produtos em estoque.</p>
            ) : (
              <ul className="space-y-3">
                {data.lowStockProducts.map((product) => (
                  <li key={product.id} className="flex items-center justify-between">
                    <Link
                      to={`/admin/produtos/${product.id}/editar`}
                      className="text-sm text-text-medium hover:text-brand-blue truncate mr-2"
                    >
                      {product.name}
                    </Link>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      product.stockQuantity === 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-brand-yellow/20 text-yellow-700'
                    }`}>
                      {product.stockQuantity} un.
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
