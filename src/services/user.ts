import api from './api'
import type { User, PaginatedResponse, PaginationParams, ApiResponse } from '@/types'

export const userService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const { data } = await api.get<PaginatedResponse<User>>('/users', { params })
    return data
  },

  async getById(id: number): Promise<ApiResponse<User>> {
    const { data } = await api.get<ApiResponse<User>>(`/users/${id}`)
    return data
  },

  async create(payload: Partial<User> & { password: string }): Promise<ApiResponse<User>> {
    const { data } = await api.post<ApiResponse<User>>('/users', payload)
    return data
  },

  async update(id: number, payload: Partial<User>): Promise<ApiResponse<User>> {
    const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  },
}
