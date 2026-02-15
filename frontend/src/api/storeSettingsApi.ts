import api from './axiosInstance'
import type { StoreSettings } from '../types/storeSettings'

export const storeSettingsApi = {
  get: () =>
    api.get<StoreSettings>('/store-settings'),

  update: (data: Partial<StoreSettings>) =>
    api.put<StoreSettings>('/store-settings', data),
}
