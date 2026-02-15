import api from './axiosInstance'
import type { ContactMessage, ContactMessageCreate, Faq } from '../types/contact'
import type { PaginatedResult } from '../types/product'

export const contactApi = {
  send: (data: ContactMessageCreate) =>
    api.post('/contact', data),

  list: (params?: { page?: number; pageSize?: number }) =>
    api.get<PaginatedResult<ContactMessage>>('/contact', { params }),

  getById: (id: string) =>
    api.get<ContactMessage>(`/contact/${id}`),

  markAsRead: (id: string) =>
    api.patch(`/contact/${id}/read`),

  delete: (id: string) =>
    api.delete(`/contact/${id}`),

  listFaqs: () =>
    api.get<Faq[]>('/faqs'),

  listAllFaqs: () =>
    api.get<Faq[]>('/faqs/all'),

  createFaq: (data: { question: string; answer: string }) =>
    api.post<Faq>('/faqs', data),

  updateFaq: (id: string, data: Partial<Faq>) =>
    api.put<Faq>(`/faqs/${id}`, data),

  deleteFaq: (id: string) =>
    api.delete(`/faqs/${id}`),

  reorderFaqs: (faqIds: string[]) =>
    api.put('/faqs/reorder', { faqIds }),
}
