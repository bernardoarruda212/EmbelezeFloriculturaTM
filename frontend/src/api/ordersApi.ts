import api from './axiosInstance'
import type { Order, OrderDetail, OrderCreate, OrderStatus } from '../types/order'
import type { PaginatedResult } from '../types/product'

export interface OrderFilter {
  status?: OrderStatus
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  pageSize?: number
}

export const ordersApi = {
  create: (data: OrderCreate) =>
    api.post<OrderDetail>('/orders', data),

  list: (params?: OrderFilter) =>
    api.get<PaginatedResult<Order>>('/orders', { params }),

  getById: (id: string) =>
    api.get<OrderDetail>(`/orders/${id}`),

  updateStatus: (id: string, status: OrderStatus) =>
    api.patch(`/orders/${id}/status`, { status }),

  getStats: () =>
    api.get('/orders/stats'),
}
