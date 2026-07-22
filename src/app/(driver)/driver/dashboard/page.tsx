'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { driverService } from '@/services/driver'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Truck, MapPin, Clock, Calendar, User as UserIcon, Phone } from 'lucide-react'
import { getPhotoUrl } from '@/lib/utils'

export default function DriverDashboardPage() {
  const { user } = useAuth()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['driver-dashboard'],
    queryFn: driverService.getDashboard,
    refetchInterval: 60000,
  })

  const sopir = dashboard?.sopir
  const stat = dashboard?.statistik
  const armada = sopir?.armada

  const today = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const now = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-xl font-bold text-gray-900">Selamat Datang</h1>
        {isLoading ? (
          <Skeleton className="h-6 w-40 mx-auto mt-1" />
        ) : (
          <p className="text-lg font-semibold text-green-700">{sopir?.nama}</p>
        )}
      </div>

      {/* Date & Time */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-green-600" />
              <span>{today}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="font-mono">{now}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-xl font-bold overflow-hidden shrink-0">
              {user?.foto_profil ? (
                <img
                  src={getPhotoUrl(user.foto_profil)}
                  alt={sopir?.nama ?? ''}
                  className="object-cover w-full h-full"
                />
              ) : (
                sopir?.nama?.charAt(0)?.toUpperCase() || 'S'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{sopir?.nama}</p>
              <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" />
                {sopir?.nomor_hp}
              </p>
              <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                <UserIcon className="w-3 h-3" />
                {dashboard?.user.email}
              </p>
            </div>
            <Badge variant="success" className="shrink-0">
              Online
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Armada Info */}
      {armada && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-5 h-5 text-green-600" />
              <h2 className="font-semibold text-gray-900">Armada Ditugaskan</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500">Plat Nomor</p>
                <p className="font-semibold text-gray-900">{armada.plat_nomor}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500">Jenis Armada</p>
                <p className="font-semibold text-gray-900">{armada.jenis_armada}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500">Merk</p>
                <p className="font-semibold text-gray-900">{armada.merk_kendaraan}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-50">
                <p className="text-xs text-gray-500">Volume Bak</p>
                <p className="font-semibold text-gray-900">{armada.volume_bak} m³</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {stat && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{stat.monitoring_hari_ini}</p>
              <p className="text-[10px] text-gray-500">Hari Ini</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Truck className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{stat.volume_hari_ini} m³</p>
              <p className="text-[10px] text-gray-500">Volume</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-900">{stat.total_monitoring}</p>
              <p className="text-[10px] text-gray-500">Total</p>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}
    </motion.div>
  )
}
