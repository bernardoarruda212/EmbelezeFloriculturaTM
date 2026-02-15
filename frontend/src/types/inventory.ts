export enum StockMovementType {
  In = 0,
  Out = 1,
  Adjustment = 2,
}

export const StockMovementTypeLabels: Record<StockMovementType, string> = {
  [StockMovementType.In]: 'Entrada',
  [StockMovementType.Out]: 'Saída',
  [StockMovementType.Adjustment]: 'Ajuste',
}

export const StockMovementTypeColors: Record<StockMovementType, string> = {
  [StockMovementType.In]: 'bg-green-100 text-green-800',
  [StockMovementType.Out]: 'bg-red-100 text-red-800',
  [StockMovementType.Adjustment]: 'bg-yellow-100 text-yellow-800',
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  productVariationId: string | null
  variationName: string | null
  type: StockMovementType
  quantity: number
  quantityBefore: number
  quantityAfter: number
  reason: string | null
  orderId: string | null
  orderNumber: string | null
  createdAt: string
}

export interface StockMovementCreate {
  productId: string
  productVariationId?: string
  type: StockMovementType
  quantity: number
  reason?: string
}

export interface StockMovementFilter {
  productId?: string
  type?: StockMovementType
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface LowStockAlert {
  productId: string
  productName: string
  currentStock: number
  threshold: number
  hasVariations: boolean
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  isActive: boolean
  productCount: number
  createdAt: string
}

export interface SupplierDetail {
  id: string
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  products: SupplierProduct[]
}

export interface SupplierProduct {
  id: string
  name: string
  stockQuantity: number
}

export interface SupplierCreate {
  name: string
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  productIds: string[]
}
