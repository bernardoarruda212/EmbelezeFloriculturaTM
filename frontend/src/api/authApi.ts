import api from './axiosInstance'
import type { LoginRequest, LoginResponse, ChangePasswordRequest, UserInfo } from '../types/auth'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', data),

  refresh: (refreshToken: string) =>
    api.post<LoginResponse>('/auth/refresh', { refreshToken }),

  revoke: () =>
    api.post('/auth/revoke'),

  getMe: () =>
    api.get<UserInfo>('/auth/me'),

  changePassword: (data: ChangePasswordRequest) =>
    api.put('/auth/change-password', data),

  updateProfile: (data: { fullName: string; email: string }) =>
    api.put('/auth/profile', data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
}
