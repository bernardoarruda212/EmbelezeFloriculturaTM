import api from './axiosInstance'
import type { HomePageSection, Banner } from '../types/homePage'

export const homePageApi = {
  getVisibleSections: () =>
    api.get<HomePageSection[]>('/homepage/sections'),

  getAllSections: () =>
    api.get<HomePageSection[]>('/homepage/sections/all'),

  updateSection: (id: string, data: Partial<HomePageSection>) =>
    api.put<HomePageSection>(`/homepage/sections/${id}`, data),

  reorderSections: (sectionIds: string[]) =>
    api.put('/homepage/sections/reorder', { sectionIds }),

  getBanners: () =>
    api.get<Banner[]>('/homepage/banners'),

  createBanner: (data: FormData) =>
    api.post<Banner>('/homepage/banners', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateBanner: (id: string, data: Partial<Banner>) =>
    api.put<Banner>(`/homepage/banners/${id}`, data),

  deleteBanner: (id: string) =>
    api.delete(`/homepage/banners/${id}`),

  reorderBanners: (bannerIds: string[]) =>
    api.put('/homepage/banners/reorder', { bannerIds }),
}
