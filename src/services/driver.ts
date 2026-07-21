import api from './api'
import type {
  DriverDashboard,
  Monitoring,
  PaginatedResponse,
  ChangePasswordPayload,
} from '@/types'

export const driverService = {
  async getDashboard(): Promise<DriverDashboard> {
    const { data } = await api.get<DriverDashboard>('/driver/dashboard')
    return data
  },

  async getMonitorings(params?: {
    page?: number
    per_page?: number
  }): Promise<PaginatedResponse<Monitoring>> {
    const { data } = await api.get<PaginatedResponse<Monitoring>>('/driver/monitorings', {
      params,
    })
    return data
  },

  async getMonitoringById(id: number): Promise<{ success: boolean; data: Monitoring }> {
    const { data } = await api.get(`/driver/monitorings/${id}`)
    return data
  },

  async createMonitoring(payload: FormData): Promise<{ success: boolean; message: string; data: Monitoring }> {
    const { data } = await api.post('/driver/monitorings', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async getTpsList(): Promise<string[]> {
    const { data } = await api.get<string[]>('/driver/tps')
    return data
  },

  async changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean; message: string }> {
    const { data } = await api.put('/driver/password', payload)
    return data
  },

  async updatePhoto(payload: FormData): Promise<{ success: boolean; message: string; data: { foto_profil: string } }> {
    const { data } = await api.post('/driver/photo', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
}
