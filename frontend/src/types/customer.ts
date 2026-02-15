export enum CustomerSegment {
  New = 0,
  Regular = 1,
  VIP = 2,
  Inactive = 3,
}

export const CustomerSegmentLabels: Record<CustomerSegment, string> = {
  [CustomerSegment.New]: 'Novo',
  [CustomerSegment.Regular]: 'Regular',
  [CustomerSegment.VIP]: 'VIP',
  [CustomerSegment.Inactive]: 'Inativo',
}

export const CustomerSegmentColors: Record<CustomerSegment, string> = {
  [CustomerSegment.New]: 'bg-brand-blue text-white',
  [CustomerSegment.Regular]: 'bg-brand-green text-white',
  [CustomerSegment.VIP]: 'bg-brand-pink text-white',
  [CustomerSegment.Inactive]: 'bg-gray-400 text-white',
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  segment: CustomerSegment
  totalOrders: number
  totalSpent: number
  lastOrderDate: string | null
  createdAt: string
}

export interface CustomerDetail {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  birthDate: string | null
  notes: string | null
  segment: CustomerSegment
  totalOrders: number
  totalSpent: number
  averageTicket: number
  firstOrderDate: string | null
  lastOrderDate: string | null
  createdAt: string
  recentOrders: CustomerOrder[]
}

export interface CustomerOrder {
  id: string
  orderNumber: string
  status: number
  totalAmount: number
  createdAt: string
}

export interface CustomerCreate {
  name: string
  phone: string
  email?: string
  address?: string
  birthDate?: string
  notes?: string
}

export interface CustomerUpdate {
  name: string
  email?: string
  address?: string
  birthDate?: string
  notes?: string
}

export interface CustomerFilter {
  search?: string
  segment?: CustomerSegment
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface CustomerStats {
  totalCustomers: number
  newCustomers: number
  regularCustomers: number
  vipCustomers: number
  inactiveCustomers: number
}
