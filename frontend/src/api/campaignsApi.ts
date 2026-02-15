import api from './axiosInstance'
import type { Campaign, CampaignCreate } from '../types/marketing'
import type { PaginatedResult } from '../types/product'

export const campaignsApi = {
  list: (params?: { search?: string; isActive?: boolean; page?: number; pageSize?: number }) =>
    api.get<PaginatedResult<Campaign>>('/campaigns', { params }),

  getById: (id: string) =>
    api.get<Campaign>(`/campaigns/${id}`),

  create: (data: CampaignCreate) =>
    api.post<Campaign>('/campaigns', data),

  update: (id: string, data: CampaignCreate) =>
    api.put<Campaign>(`/campaigns/${id}`, data),

  delete: (id: string) =>
    api.delete(`/campaigns/${id}`),

  toggleActive: (id: string) =>
    api.patch(`/campaigns/${id}/toggle-active`),
}
