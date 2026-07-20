import api from './api'
import type { LaporanFilter, Monitoring } from '@/types'

export const laporanService = {
  async getLaporan(filter?: LaporanFilter): Promise<Monitoring[]> {
    const { data } = await api.get<Monitoring[]>('/laporan', { params: filter })
    return data
  },

  async exportExcel(filter?: LaporanFilter): Promise<Blob> {
    const { data } = await api.get('/laporan/export-excel', {
      params: filter,
      responseType: 'blob',
    })
    return data
  },

  async exportPdf(filter?: LaporanFilter): Promise<Blob> {
    const { data } = await api.get('/laporan/export-pdf', {
      params: filter,
      responseType: 'blob',
    })
    return data
  },
}
