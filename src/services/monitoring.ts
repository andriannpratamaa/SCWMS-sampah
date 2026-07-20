import api from './api'
import type { Monitoring, PaginatedResponse, PaginationParams, ApiResponse } from '@/types'

export const monitoringService = {
  async getAll(params?: PaginationParams): Promise<PaginatedResponse<Monitoring>> {
    const { data } = await api.get<PaginatedResponse<Monitoring>>('/monitoring', { params })
    return data
  },

  async getById(id: number): Promise<ApiResponse<Monitoring>> {
    const { data } = await api.get<ApiResponse<Monitoring>>(`/monitoring/${id}`)
    return data
  },
}
