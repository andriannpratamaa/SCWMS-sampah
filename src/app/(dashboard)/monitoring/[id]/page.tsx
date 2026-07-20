'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ArrowLeft, Truck, User, MapPin, Trash2 } from 'lucide-react'
import { monitoringService } from '@/services/monitoring'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'

const DetailMap = dynamic(
  () => import('@/components/features/detail-map'),
  { ssr: false, loading: () => <Skeleton className="h-[400px] rounded-xl" /> }
)

export default function MonitoringDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['monitoring-detail', id],
    queryFn: () => monitoringService.getById(Number(id)),
    enabled: !!id,
  })

  const item = response?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-gray-500 font-medium">Data tidak ditemukan</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Monitoring</h1>
          <p className="text-sm text-gray-500 mt-1">
            {item.tanggal} {item.jam} - {item.plat_nomor}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-600" />
              <CardTitle className="text-base">Informasi Armada</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Plat Nomor</p>
              <p className="text-sm font-medium text-gray-900">{item.plat_nomor}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Jenis Armada</p>
              <p className="text-sm font-medium text-gray-900">{item.jenis_armada || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              <CardTitle className="text-base">Informasi Sopir</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Nama</p>
              <p className="text-sm font-medium text-gray-900">{item.sopir?.nama || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Nomor HP</p>
              <p className="text-sm font-medium text-gray-900">{item.sopir?.nomor_hp || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-green-600" />
              <CardTitle className="text-base">Volume Sampah</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Volume</p>
              <p className="text-2xl font-bold text-gray-900">{item.volume_sampah} m³</p>
            </div>
            <div>
              <Badge variant={item.status === 'terangkut' ? 'success' : 'warning'}>
                {item.status === 'terangkut' ? 'Terangkut' : 'Tidak Terangkut'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <CardTitle className="text-base">Lokasi</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DetailMap latitude={item.latitude} longitude={item.longitude} />
        </CardContent>
      </Card>

      {item.foto && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={item.foto}
              alt="Foto sampah"
              className="rounded-xl max-h-[400px] object-cover"
            />
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
