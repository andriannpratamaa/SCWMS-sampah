'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { driverService } from '@/services/driver'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { History, Calendar, Clock, MapPin, Trash2, ChevronRight } from 'lucide-react'

export default function DriverRiwayatPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery({
    queryKey: ['driver-monitorings', page],
    queryFn: () => driverService.getMonitorings({ page, per_page: 20 }),
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-4">
      <div className="text-center py-2">
        <h1 className="text-lg font-bold text-gray-900">Riwayat Monitoring</h1>
        <p className="text-xs text-gray-500">Data monitoring milik Anda</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-red-500">Gagal memuat data.</p>
          </CardContent>
        </Card>
      ) : data && data.data.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.data.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                onClick={() => router.push(`/driver/riwayat/${item.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item.foto ? (
                        <img
                          src={`http://localhost:8000/storage/${item.foto}`}
                          alt="Foto"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Trash2 className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {item.nama_tps || 'TPS'}
                        </p>
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.tanggal}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.jam?.slice(0, 5)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          <Trash2 className="w-3 h-3 inline mr-1" />
                          {item.volume_sampah} m³
                        </span>
                        <Badge
                          variant={item.status === 'terangkut' ? 'success' : 'warning'}
                        >
                          {item.status === 'terangkut' ? 'Terangkut' : 'Tidak Terangkut'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {data.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-sm text-gray-500">
                {data.current_page} / {data.last_page}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.last_page, p + 1))}
                disabled={page === data.last_page}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 bg-white disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Belum ada data monitoring</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
