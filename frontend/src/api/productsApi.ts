import api from './axiosInstance'
import type { Product, ProductDetail, ProductCreate, ProductFilter, PaginatedResult } from '../types/product'

export const productsApi = {
  list: (params?: ProductFilter) =>
    api.get<PaginatedResult<Product>>('/products', { params }),

  getBySlug: (slug: string) =>
    api.get<ProductDetail>(`/products/${slug}`),

  getFeatured: (count: number = 8) =>
    api.get<Product[]>('/products/featured', { params: { count } }),

  create: (data: ProductCreate) =>
    api.post<ProductDetail>('/products', data),

  update: (id: string, data: ProductCreate) =>
    api.put<ProductDetail>(`/products/${id}`, data),

  delete: (id: string) =>
    api.delete(`/products/${id}`),

  toggleActive: (id: string) =>
    api.patch(`/products/${id}/toggle-active`),

  toggleFeatured: (id: string) =>
    api.patch(`/products/${id}/toggle-featured`),

  uploadImage: (productId: string, file: FormData) =>
    api.post<{ imageUrl: string }>(`/products/${productId}/images`, file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  addImageByUrl: (productId: string, imageUrl: string) =>
    api.post<{ imageUrl: string }>(`/products/${productId}/images/url`, { imageUrl }),

  deleteImage: (productId: string, imageId: string) =>
    api.delete(`/products/${productId}/images/${imageId}`),

  reorderImages: (productId: string, imageIds: string[]) =>
    api.put(`/products/${productId}/images/reorder`, { imageIds }),

  setMainImage: (productId: string, imageId: string) =>
    api.patch(`/products/${productId}/images/${imageId}/set-main`),
}
