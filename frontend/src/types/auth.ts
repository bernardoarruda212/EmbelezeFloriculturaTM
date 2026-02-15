export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: UserInfo
}

export interface UserInfo {
  id: string
  email: string
  fullName: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}
