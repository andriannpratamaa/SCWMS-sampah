'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { driverService } from '@/services/driver'
import { getPhotoUrl } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, MapPin, Truck, Trash2, Camera } from 'lucide-react'

export default function DriverRiwayatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: res, isLoading, error } = useQuery({
    queryKey: ['driver-monitoring', id],
    queryFn: () => driverService.getMonitoringById(Number(id)),
  })

  const item = res?.data

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : error || !item ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-red-500">Gagal memuat detail monitoring.</p>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Kembali
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <h1 className="text-lg font-bold text-gray-900 text-center">Detail Monitoring</h1>

          {/* Foto */}
          {item.foto && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img
                src={getPhotoUrl(item.foto)}
                alt="Foto monitoring"
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Tanggal
                  </p>
                  <p className="font-semibold text-gray-900">{item.tanggal}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Jam
                  </p>
                  <p className="font-semibold text-gray-900">{item.jam?.slice(0, 5) || '-'}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Nama TPS
                  </p>
                  <p className="font-semibold text-gray-900">{item.nama_tps || '-'}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Plat Nomor
                  </p>
                  <p className="font-semibold text-gray-900">{item.plat_nomor}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-[10px] text-gray-500">Jenis Armada</p>
                  <p className="font-semibold text-gray-900">{item.jenis_armada}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Volume
                  </p>
                  <p className="font-semibold text-gray-900">{item.volume_sampah} m³</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-[10px] text-gray-500">Latitude</p>
                  <p className="font-mono font-medium text-gray-900 text-xs">
                    {item.latitude}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-[10px] text-gray-500">Longitude</p>
                  <p className="font-mono font-medium text-gray-900 text-xs">
                    {item.longitude}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 font-medium">Status</p>
                <Badge variant={item.status === 'terangkut' ? 'success' : 'warning'} className="text-sm px-3 py-1">
                  {item.status === 'terangkut' ? 'Terangkut' : 'Tidak Terangkut'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  )
}
