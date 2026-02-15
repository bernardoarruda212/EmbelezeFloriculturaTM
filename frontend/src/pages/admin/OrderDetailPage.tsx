import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { ordersApi } from '../../api/ordersApi'
import type { OrderDetail } from '../../types/order'
import { OrderStatus, OrderStatusLabels, OrderStatusColors } from '../../types/order'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDateTime } from '../../utils/formatDate'
import { formatPhone } from '../../utils/formatPhone'
import { buildWhatsAppUrl, buildOrderMessage } from '../../utils/whatsappUrl'

const statusSteps = [
  OrderStatus.Novo,
  OrderStatus.EmPreparo,
  OrderStatus.Pronto,
  OrderStatus.Enviado,
  OrderStatus.Entregue,
]

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchOrder = async () => {
      try {
        const res = await ordersApi.getById(id)
        setOrder(res.data)
        setNewStatus(res.data.status)
      } catch {
        toast.error('Erro ao carregar pedido.')
        navigate('/admin/pedidos')
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrder()
  }, [id, navigate])

  const handleUpdateStatus = async () => {
    if (!order || newStatus === null || newStatus === order.status) return
    setIsUpdating(true)
    try {
      await ordersApi.updateStatus(order.id, newStatus)
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null))
      toast.success('Status atualizado.')
    } catch {
      toast.error('Erro ao atualizar status.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-blue border-t-transparent" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-text-medium">Pedido não encontrado.</p>
      </div>
    )
  }

  const whatsAppMessage = buildOrderMessage({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    deliveryAddress: order.deliveryAddress ?? undefined,
    deliveryNotes: order.deliveryNotes ?? undefined,
    items: order.items.map((item) => ({
      productName: item.productName,
      variationName: item.variationName ?? undefined,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    totalAmount: order.totalAmount,
  })

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/pedidos')}
          className="p-2 text-text-medium hover:bg-gray-100 rounded-lg"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-dark">Pedido #{order.orderNumber}</h1>
          <p className="text-sm text-text-light">{formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      {/* Status timeline */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-text-dark mb-4">Status do Pedido</h2>
        <div className="flex items-center justify-between mb-6">
          {statusSteps.map((step, idx) => {
            const isCurrent = order.status === step
            const isPast = order.status > step
            const isCancelled = order.status === OrderStatus.Cancelado

            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isCancelled
                        ? 'bg-gray-200 text-text-light'
                        : isCurrent
                        ? OrderStatusColors[step]
                        : isPast
                        ? 'bg-brand-green text-white'
                        : 'bg-gray-200 text-text-light'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-xs mt-1 text-center ${
                    isCurrent ? 'font-semibold text-text-dark' : 'text-text-light'
                  }`}>
                    {OrderStatusLabels[step]}
                  </span>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isPast ? 'bg-brand-green' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {order.status === OrderStatus.Cancelado && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium">
            Este pedido foi cancelado.
          </div>
        )}

        <div className="flex items-center gap-3 mt-4">
          <select
            value={newStatus ?? order.status}
            onChange={(e) => setNewStatus(Number(e.target.value) as OrderStatus)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 bg-white"
          >
            {Object.entries(OrderStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={handleUpdateStatus}
            disabled={isUpdating || newStatus === order.status}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-blue text-white text-sm font-medium rounded-lg hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
          >
            {isUpdating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <FiSave className="w-4 h-4" />
            )}
            Atualizar Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-dark mb-4">Dados do Cliente</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-medium text-text-light uppercase">Nome</dt>
              <dd className="text-sm text-text-dark">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-light uppercase">Telefone</dt>
              <dd className="text-sm text-text-dark flex items-center gap-2">
                {formatPhone(order.customerPhone)}
                <a
                  href={buildWhatsAppUrl(order.customerPhone, whatsAppMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-brand-green hover:underline"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  WhatsApp
                </a>
              </dd>
            </div>
            {order.customerEmail && (
              <div>
                <dt className="text-xs font-medium text-text-light uppercase">E-mail</dt>
                <dd className="text-sm text-text-dark">{order.customerEmail}</dd>
              </div>
            )}
            {order.deliveryAddress && (
              <div>
                <dt className="text-xs font-medium text-text-light uppercase">Endereço de Entrega</dt>
                <dd className="text-sm text-text-dark">{order.deliveryAddress}</dd>
              </div>
            )}
            {order.deliveryNotes && (
              <div>
                <dt className="text-xs font-medium text-text-light uppercase">Observações</dt>
                <dd className="text-sm text-text-dark">{order.deliveryNotes}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-dark mb-4">Resumo</h2>
          <dl className="space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-text-medium">Itens</dt>
              <dd className="text-sm font-medium text-text-dark">{order.items.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-text-medium">Quantidade total</dt>
              <dd className="text-sm font-medium text-text-dark">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
              <dt className="text-base font-semibold text-text-dark">Total</dt>
              <dd className="text-lg font-bold text-brand-blue">
                {formatCurrency(order.totalAmount)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Items table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 pb-0">
          <h2 className="text-lg font-semibold text-text-dark">Itens do Pedido</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-text-light">Produto</th>
                <th className="text-left py-3 px-4 font-medium text-text-light">Variação</th>
                <th className="text-center py-3 px-4 font-medium text-text-light">Qtd</th>
                <th className="text-right py-3 px-4 font-medium text-text-light">Preço Unit.</th>
                <th className="text-right py-3 px-6 font-medium text-text-light">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-6 text-text-dark font-medium">{item.productName}</td>
                  <td className="py-3 px-4 text-text-light">{item.variationName ?? '-'}</td>
                  <td className="py-3 px-4 text-center text-text-medium">{item.quantity}</td>
                  <td className="py-3 px-4 text-right text-text-medium">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 px-6 text-right font-medium text-text-dark">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={4} className="py-3 px-6 text-right font-semibold text-text-dark">
                  Total
                </td>
                <td className="py-3 px-6 text-right font-bold text-brand-blue text-base">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
