import api from './api'
import type {
  DashboardStats,
  VolumePerHari,
  PengangkutanPerBulan,
  AktivitasTerbaru,
  ArmadaAktif,
} from '@/types'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>('/dashboard/stats')
    return data
  },

  async getVolumePerHari(): Promise<VolumePerHari[]> {
    const { data } = await api.get<VolumePerHari[]>('/dashboard/volume-per-hari')
    return data
  },

  async getPengangkutanPerBulan(): Promise<PengangkutanPerBulan[]> {
    const { data } = await api.get<PengangkutanPerBulan[]>('/dashboard/pengangkutan-per-bulan')
    return data
  },

  async getAktivitasTerbaru(): Promise<AktivitasTerbaru[]> {
    const { data } = await api.get<AktivitasTerbaru[]>('/dashboard/aktivitas-terbaru')
    return data
  },

  async getArmadaAktif(): Promise<ArmadaAktif[]> {
    const { data } = await api.get<ArmadaAktif[]>('/dashboard/armada-aktif')
    return data
  },
}
