import api from './axiosInstance'
import type { ProductPromotion, ProductPromotionCreate } from '../types/marketing'
import type { PaginatedResult } from '../types/product'

export const productPromotionsApi = {
  list: (params?: { productId?: string; isActive?: boolean; page?: number; pageSize?: number }) =>
    api.get<PaginatedResult<ProductPromotion>>('/product-promotions', { params }),

  create: (data: ProductPromotionCreate) =>
    api.post<ProductPromotion>('/product-promotions', data),

  update: (id: string, data: ProductPromotionCreate) =>
    api.put<ProductPromotion>(`/product-promotions/${id}`, data),

  delete: (id: string) =>
    api.delete(`/product-promotions/${id}`),
}
