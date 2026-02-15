export enum OrderStatus {
  Novo = 0,
  EmPreparo = 1,
  Pronto = 2,
  Enviado = 3,
  Entregue = 4,
  Cancelado = 5,
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Novo]: 'Novo',
  [OrderStatus.EmPreparo]: 'Em Preparo',
  [OrderStatus.Pronto]: 'Pronto',
  [OrderStatus.Enviado]: 'Enviado',
  [OrderStatus.Entregue]: 'Entregue',
  [OrderStatus.Cancelado]: 'Cancelado',
}

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.Novo]: 'bg-brand-blue text-white',
  [OrderStatus.EmPreparo]: 'bg-brand-yellow text-text-dark',
  [OrderStatus.Pronto]: 'bg-orange-500 text-white',
  [OrderStatus.Enviado]: 'bg-purple-500 text-white',
  [OrderStatus.Entregue]: 'bg-brand-green text-white',
  [OrderStatus.Cancelado]: 'bg-red-500 text-white',
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  deliveryAddress: string | null
  deliveryNotes: string | null
  status: OrderStatus
  totalAmount: number
  whatsAppNotified: boolean
  createdAt: string
  updatedAt: string | null
}

export interface OrderDetail extends Order {
  items: OrderItem[]
}

export interface OrderItem {
  id: string
  productId: string
  productVariationId: string | null
  productName: string
  variationName: string | null
  unitPrice: number
  quantity: number
  subtotal: number
}

export interface OrderCreate {
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryAddress?: string
  deliveryNotes?: string
  items: OrderItemCreate[]
}

export interface OrderItemCreate {
  productId: string
  productVariationId?: string
  quantity: number
}
