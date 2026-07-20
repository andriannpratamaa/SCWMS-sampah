import api from './api'
import type { ArmadaAktif } from '@/types'

export const trackingService = {
  async getAll(): Promise<ArmadaAktif[]> {
    const { data } = await api.get<ArmadaAktif[]>('/tracking')
    return data
  },
}
