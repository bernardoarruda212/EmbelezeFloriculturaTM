import api from './axiosInstance'
import type { Coupon, CouponCreate, CouponValidation, CouponValidationResult } from '../types/marketing'
import type { PaginatedResult } from '../types/product'

export const couponsApi = {
  list: (params?: { search?: string; isActive?: boolean; page?: number; pageSize?: number }) =>
    api.get<PaginatedResult<Coupon>>('/coupons', { params }),

  getById: (id: string) =>
    api.get<Coupon>(`/coupons/${id}`),

  create: (data: CouponCreate) =>
    api.post<Coupon>('/coupons', data),

  update: (id: string, data: CouponCreate) =>
    api.put<Coupon>(`/coupons/${id}`, data),

  delete: (id: string) =>
    api.delete(`/coupons/${id}`),

  validate: (data: CouponValidation) =>
    api.post<CouponValidationResult>('/coupons/validate', data),
}
