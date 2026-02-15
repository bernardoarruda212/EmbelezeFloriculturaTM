import api from './axiosInstance'

export interface DashboardData {
  ordersToday: number
  ordersThisWeek: number
  ordersThisMonth: number
  revenueThisMonth: number
  recentOrders: {
    id: string
    orderNumber: string
    customerName: string
    totalAmount: number
    status: number
    createdAt: string
  }[]
  lowStockProducts: {
    id: string
    name: string
    stockQuantity: number
  }[]
  unreadMessages: number
}

export const dashboardApi = {
  get: () =>
    api.get<DashboardData>('/dashboard'),
}
