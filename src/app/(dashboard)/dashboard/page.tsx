'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Truck, Users, MapPin, Trash2, BarChart3, RefreshCw } from 'lucide-react'
import dynamic from 'next/dynamic'
import { dashboardService } from '@/services/dashboard'
import { StatCard } from '@/components/features/stat-card'
import { VolumeChart } from '@/components/features/volume-chart'
import { PengangkutanChart } from '@/components/features/pengangkutan-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const TrackingMap = dynamic(
  () => import('@/components/features/tracking-map').then((m) => ({ default: m.TrackingMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-400">Memuat peta...</p>
        </div>
      </div>
    ),
  }
)

const REFRESH_INTERVAL = 60000

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: REFRESH_INTERVAL,
    placeholderData: keepPreviousData,
  })

  const { data: volumeData, isLoading: volumeLoading } = useQuery({
    queryKey: ['dashboard-volume'],
    queryFn: dashboardService.getVolumePerHari,
    refetchInterval: REFRESH_INTERVAL,
    placeholderData: keepPreviousData,
  })

  const { data: pengangkutanData, isLoading: pengangkutanLoading } = useQuery({
    queryKey: ['dashboard-pengangkutan'],
    queryFn: dashboardService.getPengangkutanPerBulan,
    refetchInterval: REFRESH_INTERVAL,
    placeholderData: keepPreviousData,
  })

  const { data: aktivitas, isLoading: aktivitasLoading } = useQuery({
    queryKey: ['dashboard-aktivitas'],
    queryFn: dashboardService.getAktivitasTerbaru,
    refetchInterval: REFRESH_INTERVAL,
    placeholderData: keepPreviousData,
  })

  const { data: armadaAktif, isLoading: armadaLoading } = useQuery({
    queryKey: ['dashboard-armada-aktif'],
    queryFn: dashboardService.getArmadaAktif,
    refetchInterval: REFRESH_INTERVAL,
    placeholderData: keepPreviousData,
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-[10px] text-gray-500 mt-1 max-w-2xl">
            Sistem Monitoring Proses Distribusi Armada Heterogen Pengangkut Sampah di Kota Tasikmalaya Berbasis Internet of Things (IoT)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <RefreshCw className="w-3 h-3" />
          Auto-refresh 60 detik
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Armada"
          value={stats?.total_armada ?? 0}
          icon={<Truck className="w-6 h-6" />}
          loading={statsLoading}
        />
        <StatCard
          title="Armada Aktif"
          value={stats?.armada_aktif ?? 0}
          icon={<MapPin className="w-6 h-6" />}
          loading={statsLoading}
        />
        <StatCard
          title="Jumlah Sopir"
          value={stats?.jumlah_sopir ?? 0}
          icon={<Users className="w-6 h-6" />}
          loading={statsLoading}
        />
        <StatCard
          title="Pengangkutan Hari Ini"
          value={stats?.pengangkutan_hari_ini ?? 0}
          icon={<BarChart3 className="w-6 h-6" />}
          loading={statsLoading}
        />
        <StatCard
          title="Volume Sampah Hari Ini"
          value={(stats?.volume_sampah_hari_ini ?? 0) + ' m³'}
          icon={<Trash2 className="w-6 h-6" />}
          loading={statsLoading}
        />
        <StatCard
          title="Total Pengangkutan Bulan Ini"
          value={stats?.total_pengangkutan_bulan_ini ?? 0}
          icon={<RefreshCw className="w-6 h-6" />}
          loading={statsLoading}
        />
        <StatCard
          title="Total TPS"
          value={stats?.total_tps ?? 0}
          icon={<MapPin className="w-6 h-6" />}
          loading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VolumeChart data={volumeData ?? []} loading={volumeLoading} />
        <PengangkutanChart data={pengangkutanData ?? []} loading={pengangkutanLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrackingMap armada={armadaAktif ?? []} loading={armadaLoading} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 text-base">Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {aktivitasLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : aktivitas && aktivitas.length > 0 ? (
                <div className="space-y-3">
                  {aktivitas.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.armada_plat}</p>
                        <p className="text-xs text-gray-500">{a.sopir_nama}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{a.volume} m³</p>
                        <Badge
                          variant={a.status === 'terangkut' ? 'success' : 'warning'}
                        >
                          {a.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada aktivitas</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 text-base">Armada Aktif</CardTitle>
            </CardHeader>
            <CardContent>
              {armadaLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : armadaAktif && armadaAktif.length > 0 ? (
                <div className="space-y-2">
                  {armadaAktif.slice(0, 5).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">
                        {a.plat_nomor?.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {a.plat_nomor}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{a.sopir_nama}</p>
                      </div>
                      <span className="text-xs text-green-600 font-medium">
                        {a.volume_sampah} m³
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">Tidak ada armada aktif</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
