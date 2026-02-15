import { OrderStatus, OrderStatusLabels, OrderStatusColors } from '../../types/order'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${OrderStatusColors[status]}`}
    >
      {OrderStatusLabels[status]}
    </span>
  )
}
