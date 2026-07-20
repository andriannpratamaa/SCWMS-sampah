import api from './api'
import type { Armada, PaginatedResponse, PaginationParams, ApiResponse } from '@/types'

export const armadaService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Armada>> {
    const { data } = await api.get<PaginatedResponse<Armada>>('/armada', { params })
    return data
  },

  async getById(id: number): Promise<ApiResponse<Armada>> {
    const { data } = await api.get<ApiResponse<Armada>>(`/armada/${id}`)
    return data
  },

  async create(payload: Partial<Armada>): Promise<ApiResponse<Armada>> {
    const { data } = await api.post<ApiResponse<Armada>>('/armada', payload)
    return data
  },

  async update(id: number, payload: Partial<Armada>): Promise<ApiResponse<Armada>> {
    const { data } = await api.put<ApiResponse<Armada>>(`/armada/${id}`, payload)
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/armada/${id}`)
  },
}
