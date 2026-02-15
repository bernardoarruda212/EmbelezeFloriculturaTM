import api from './axiosInstance'
import type { Supplier, SupplierDetail, SupplierCreate } from '../types/inventory'
import type { PaginatedResult } from '../types/product'

export const suppliersApi = {
  list: (params?: { search?: string; isActive?: boolean; page?: number; pageSize?: number }) =>
    api.get<PaginatedResult<Supplier>>('/suppliers', { params }),

  getById: (id: string) =>
    api.get<SupplierDetail>(`/suppliers/${id}`),

  create: (data: SupplierCreate) =>
    api.post<SupplierDetail>('/suppliers', data),

  update: (id: string, data: SupplierCreate) =>
    api.put<SupplierDetail>(`/suppliers/${id}`, data),

  delete: (id: string) =>
    api.delete(`/suppliers/${id}`),

  toggleActive: (id: string) =>
    api.patch(`/suppliers/${id}/toggle-active`),
}
