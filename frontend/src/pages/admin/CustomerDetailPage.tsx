import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  FiArrowLeft,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiFileText,
  FiShoppingBag,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiSave,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { customersApi } from '../../api/customersApi'
import type { CustomerDetail, CustomerUpdate } from '../../types/customer'
import { CustomerSegmentLabels, CustomerSegmentColors } from '../../types/customer'
import { OrderStatusLabels, OrderStatusColors } from '../../types/order'
import type { OrderStatus } from '../../types/order'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import { formatPhone } from '../../utils/formatPhone'
import { buildWhatsAppUrl } from '../../utils/whatsappUrl'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'info' | 'orders'>('info')
  const [isSaving, setIsSaving] = useState(false)

  const { register, handleSubmit, reset } = useForm<CustomerUpdate>()

  const fetchCustomer = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const res = await customersApi.getById(id)
      setCustomer(res.data)
      reset({
        name: res.data.name,
        email: res.data.email ?? undefined,
        address: res.data.address ?? undefined,
        birthDate: res.data.birthDate ? res.data.birthDate.split('T')[0] : undefined,
        notes: res.data.notes ?? undefined,
      })
    } catch {
      toast.error('Erro ao carregar dados do cliente.')
    } finally {
      setIsLoading(false)
    }
  }, [id, reset])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  const onSubmit = async (data: CustomerUpdate) => {
    if (!id) return
    setIsSaving(true)
    try {
      const res = await customersApi.update(id, data)
      setCustomer(res.data)
      toast.success('Cliente atualizado com sucesso.')
    } catch {
      toast.error('Erro ao atualizar cliente.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-blue border-t-transparent" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-text-light">Cliente não encontrado.</p>
        <Link to="/admin/clientes" className="text-brand-blue hover:underline mt-2 inline-block">
          Voltar para clientes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/admin/clientes"
        className="inline-flex items-center gap-2 text-sm text-text-light hover:text-text-dark transition-colors"
      >
        <FiArrowLeft className="w-4 h-4" />
        Voltar para Clientes
      </Link>

      {/* Profile Header */}
      <div className="card-top-accent bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-brand-blue">
              {customer.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-text-dark">{customer.name}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  CustomerSegmentColors[customer.segment]
                }`}
              >
                {CustomerSegmentLabels[customer.segment]}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-text-light">
              <span className="flex items-center gap-1.5">
                <FiPhone className="w-4 h-4" />
                {formatPhone(customer.phone)}
              </span>
              {customer.email && (
                <span className="flex items-center gap-1.5">
                  <FiMail className="w-4 h-4" />
                  {customer.email}
                </span>
              )}
              <a
                href={buildWhatsAppUrl(
                  customer.phone,
                  `Olá ${customer.name}, aqui é da Floricultura Embeleze!`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-brand-green hover:underline"
              >
                <FaWhatsapp className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-top-accent bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="w-12 h-12 rounded-lg bg-brand-blue flex items-center justify-center">
            <FiShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-dark">{customer.totalOrders}</p>
            <p className="text-sm text-text-light">Total Pedidos</p>
          </div>
        </div>
        <div className="card-top-accent bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="w-12 h-12 rounded-lg bg-brand-green flex items-center justify-center">
            <FiDollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-dark">{formatCurrency(customer.totalSpent)}</p>
            <p className="text-sm text-text-light">Total Gasto</p>
          </div>
        </div>
        <div className="card-top-accent bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="w-12 h-12 rounded-lg bg-brand-pink flex items-center justify-center">
            <FiTrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-dark">{formatCurrency(customer.averageTicket)}</p>
            <p className="text-sm text-text-light">Ticket Médio</p>
          </div>
        </div>
        <div className="card-top-accent bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="w-12 h-12 rounded-lg bg-brand-sky flex items-center justify-center">
            <FiClock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-dark">
              {customer.firstOrderDate ? formatDate(customer.firstOrderDate) : '—'}
            </p>
            <p className="text-sm text-text-light">Cliente Desde</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-top-accent bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-text-light hover:text-text-dark hover:border-gray-300'
              }`}
            >
              Informações
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-text-light hover:text-text-dark hover:border-gray-300'
              }`}
            >
              Histórico de Pedidos
            </button>
          </nav>
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Nome</label>
              <input
                type="text"
                {...register('name', { required: true })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                <FiMail className="inline w-4 h-4 mr-1" />
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="email@exemplo.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                <FiMapPin className="inline w-4 h-4 mr-1" />
                Endereço
              </label>
              <input
                type="text"
                {...register('address')}
                placeholder="Endereço completo"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                <FiCalendar className="inline w-4 h-4 mr-1" />
                Data de Nascimento
              </label>
              <input
                type="date"
                {...register('birthDate')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                <FiFileText className="inline w-4 h-4 mr-1" />
                Observações
              </label>
              <textarea
                {...register('notes')}
                rows={4}
                placeholder="Anotações sobre o cliente..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <FiSave className="w-4 h-4" />
                )}
                Salvar Alterações
              </button>
            </div>
          </form>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {customer.recentOrders.length === 0 ? (
              <div className="text-center py-16">
                <FiShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-text-light">Nenhum pedido encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="admin-table-header">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-text-light">#Pedido</th>
                      <th className="text-left py-3 px-4 font-medium text-text-light">Data</th>
                      <th className="text-left py-3 px-4 font-medium text-text-light">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-text-light">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.recentOrders.map((order, idx) => (
                      <tr
                        key={order.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${
                          idx % 2 === 1 ? 'bg-gray-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-text-dark">
                          <Link
                            to={`/admin/pedidos/${order.id}`}
                            className="hover:text-brand-blue transition-colors"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-text-light">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              OrderStatusColors[order.status as OrderStatus] ?? 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {OrderStatusLabels[order.status as OrderStatus] ?? 'Desconhecido'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-text-dark">
                          {formatCurrency(order.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
