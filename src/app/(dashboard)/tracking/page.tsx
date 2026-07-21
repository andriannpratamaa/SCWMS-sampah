'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { trackingService } from '@/services/tracking'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Navigation } from 'lucide-react'

const TrackingMap = dynamic(
  () => import('@/components/features/tracking-map').then((m) => ({ default: m.TrackingMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full min-h-[500px] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-400">Memuat peta...</p>
        </div>
      </div>
    ),
  }
)

export default function TrackingPage() {
  const { data: armada, isLoading } = useQuery({
    queryKey: ['tracking'],
    queryFn: trackingService.getAll,
    refetchInterval: 30000,
    placeholderData: keepPreviousData,
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tracking Armada</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau posisi armada secara real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[calc(100vh-220px)] min-h-[500px]">
          <TrackingMap
            armada={armada ?? []}
            loading={isLoading}
            fullscreen
          />
        </div>

        <Card className="h-[calc(100vh-220px)] min-h-[500px] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-green-600" />
              <CardTitle className="text-base">Daftar Armada</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : armada && armada.length > 0 ? (
              <div className="space-y-3">
                {armada.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-gray-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{a.plat_nomor}</p>
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <p className="text-xs text-gray-500">{a.sopir_nama}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{a.volume_sampah} m³</span>
                      <span className="text-gray-400">{a.update_terakhir}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">Tidak ada armada</p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
