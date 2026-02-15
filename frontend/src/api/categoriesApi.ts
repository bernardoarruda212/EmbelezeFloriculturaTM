import api from './axiosInstance'
import type { Category, CategoryCreate } from '../types/category'

export const categoriesApi = {
  listActive: () =>
    api.get<Category[]>('/categories'),

  listAll: () =>
    api.get<Category[]>('/categories/all'),

  getById: (id: string) =>
    api.get<Category>(`/categories/${id}`),

  create: (data: CategoryCreate) =>
    api.post<Category>('/categories', data),

  update: (id: string, data: CategoryCreate) =>
    api.put<Category>(`/categories/${id}`, data),

  delete: (id: string) =>
    api.delete(`/categories/${id}`),

  reorder: (categoryIds: string[]) =>
    api.put('/categories/reorder', { categoryIds }),
}
