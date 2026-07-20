import api from './api'
import type { AuthResponse, LoginCredentials, User, ChangePasswordPayload } from '@/types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/login', credentials)
    return data
  },

  async logout(): Promise<void> {
    await api.post('/logout')
  },

  async getUser(): Promise<User> {
    const { data } = await api.get<User>('/user')
    return data
  },

  async updateProfile(payload: FormData): Promise<User> {
    const { data } = await api.post<User>('/profile', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.put('/password', payload)
  },
}
