import api from './axiosInstance'
import type { StockMovement, StockMovementCreate, StockMovementFilter, LowStockAlert } from '../types/inventory'
import type { PaginatedResult } from '../types/product'

export const stockApi = {
  getMovements: (params?: StockMovementFilter) =>
    api.get<PaginatedResult<StockMovement>>('/stock/movements', { params }),

  createMovement: (data: StockMovementCreate) =>
    api.post<StockMovement>('/stock/movements', data),

  getLowStock: (threshold: number = 5) =>
    api.get<LowStockAlert[]>('/stock/low-stock', { params: { threshold } }),
}
