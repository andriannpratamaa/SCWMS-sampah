import api from './api'
import type { Sopir, PaginatedResponse, PaginationParams, ApiResponse } from '@/types'

export const sopirService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Sopir>> {
    const { data } = await api.get<PaginatedResponse<Sopir>>('/sopir', { params })
    return data
  },

  async getById(id: number): Promise<ApiResponse<Sopir>> {
    const { data } = await api.get<ApiResponse<Sopir>>(`/sopir/${id}`)
    return data
  },

  async create(payload: Partial<Sopir>): Promise<ApiResponse<Sopir>> {
    const { data } = await api.post<ApiResponse<Sopir>>('/sopir', payload)
    return data
  },

  async update(id: number, payload: Partial<Sopir>): Promise<ApiResponse<Sopir>> {
    const { data } = await api.put<ApiResponse<Sopir>>(`/sopir/${id}`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/sopir/${id}`)
  },
}
