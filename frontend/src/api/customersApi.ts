import api from './axiosInstance'
import type { Customer, CustomerDetail, CustomerCreate, CustomerUpdate, CustomerFilter, CustomerStats } from '../types/customer'
import type { PaginatedResult } from '../types/product'

export const customersApi = {
  list: (params?: CustomerFilter) =>
    api.get<PaginatedResult<Customer>>('/customers', { params }),

  getById: (id: string) =>
    api.get<CustomerDetail>(`/customers/${id}`),

  create: (data: CustomerCreate) =>
    api.post<CustomerDetail>('/customers', data),

  update: (id: string, data: CustomerUpdate) =>
    api.put<CustomerDetail>(`/customers/${id}`, data),

  delete: (id: string) =>
    api.delete(`/customers/${id}`),

  getStats: () =>
    api.get<CustomerStats>('/customers/stats'),
}
