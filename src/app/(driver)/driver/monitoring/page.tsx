'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { driverService } from '@/services/driver'
import {
  MapPin,
  Camera,
  Send,
  RefreshCw,
  Truck,
  Navigation,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Status = 'terangkut' | 'tidak_terangkut'

export default function DriverMonitoringPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [namaTps, setNamaTps] = useState('')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('terangkut')
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState<string | null>(null)

  const { data: tpsList, isLoading: tpsLoading } = useQuery({
    queryKey: ['driver-tps'],
    queryFn: driverService.getTpsList,
  })

  const { data: dashboard } = useQuery({
    queryKey: ['driver-dashboard'],
    queryFn: driverService.getDashboard,
  })

  const createMutation = useMutation({
    mutationFn: (payload: FormData) => driverService.createMonitoring(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Monitoring berhasil dikirim.')
      queryClient.invalidateQueries({ queryKey: ['driver-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['driver-monitorings'] })
      resetForm()
      router.push('/driver/dashboard')
    },
    onError: () => {
      toast.error('Gagal mengirim data monitoring.')
    },
  })

  const resetForm = () => {
    setNamaTps('')
    setLatitude(null)
    setLongitude(null)
    setStatus('terangkut')
    setFotoPreview(null)
    setFotoFile(null)
    setGpsError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('GPS tidak didukung browser ini.')
      return
    }
    setGpsLoading(true)
    setGpsError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setGpsLoading(false)
        toast.success('Lokasi berhasil didapatkan.')
      },
      (err) => {
        setGpsLoading(false)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGpsError('Izin lokasi ditolak. Izinkan akses lokasi di pengaturan browser.')
            break
          case err.POSITION_UNAVAILABLE:
            setGpsError('Lokasi tidak tersedia.')
            break
          case err.TIMEOUT:
            setGpsError('Waktu pengambilan lokasi habis.')
            break
          default:
            setGpsError('Gagal mendapatkan lokasi.')
        }
        toast.error(gpsError || 'Gagal mendapatkan lokasi')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  useEffect(() => {
    getLocation()
  }, [])

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!namaTps) {
      toast.error('Nama TPS wajib dipilih.')
      return
    }
    if (!status) {
      toast.error('Status wajib dipilih.')
      return
    }
    if (!fotoFile) {
      toast.error('Foto wajib diambil.')
      return
    }
    if (latitude === null || longitude === null) {
      toast.error('Lokasi wajib diisi. Klik "Refresh Lokasi".')
      return
    }

    const payload = new FormData()
    payload.append('nama_tps', namaTps)
    payload.append('latitude', String(latitude))
    payload.append('longitude', String(longitude))
    payload.append('volume_sampah', '0')
    payload.append('status', status)
    payload.append('foto', fotoFile)

    createMutation.mutate(payload)
  }

  const armada = dashboard?.sopir?.armada
  const volumeBak = armada?.volume_bak ?? 0
  const isSubmitting = createMutation.isPending
  const canSubmit = namaTps && status && fotoFile && latitude !== null && longitude !== null && !isSubmitting

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-4">
      <div className="text-center py-2">
        <h1 className="text-lg font-bold text-gray-900">Monitoring</h1>
        <p className="text-xs text-gray-500">Kirim data sebelum membuang sampah ke TPS</p>
      </div>

      {/* Armada Info (read only) */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Truck className="w-5 h-5 text-green-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Data Armada</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-[10px] text-gray-500">Plat Nomor</p>
              <p className="font-semibold text-gray-900">{armada?.plat_nomor || '-'}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50">
              <p className="text-[10px] text-gray-500">Jenis Armada</p>
              <p className="font-semibold text-gray-900">{armada?.jenis_armada || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nama TPS */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Nama TPS</label>
        {tpsLoading ? (
          <Skeleton className="h-10 w-full rounded-xl" />
        ) : (
          <Select value={namaTps} onValueChange={setNamaTps}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih TPS" />
            </SelectTrigger>
            <SelectContent>
              {tpsList?.map((tps) => (
                <SelectItem key={tps} value={tps}>
                  {tps}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Lokasi */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-green-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Titik Koordinat</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getLocation}
              disabled={gpsLoading}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${gpsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {gpsError ? (
            <p className="text-xs text-red-500">{gpsError}</p>
          ) : latitude && longitude ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg bg-green-50">
                <p className="text-[10px] text-gray-500">Latitude</p>
                <p className="text-sm font-mono font-medium text-gray-900">
                  {latitude.toFixed(6)}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-green-50">
                <p className="text-[10px] text-gray-500">Longitude</p>
                <p className="text-sm font-mono font-medium text-gray-900">
                  {longitude.toFixed(6)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              {gpsLoading ? 'Mendapatkan lokasi...' : 'Klik Refresh untuk ambil lokasi'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Volume Sampah (read only - from ESP32) */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Volume Sampah (m³)</label>
        <div className="flex h-10 w-full items-center rounded-xl border border-gray-300 bg-gray-100 px-3 text-sm text-gray-500">
          {volumeBak > 0 ? `${volumeBak} m³ (dari ESP32)` : 'Menunggu data ESP32...'}
        </div>
        <p className="text-[10px] text-gray-400">Data volume dari sensor ESP32 otomatis</p>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Status</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setStatus('terangkut')}
            className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-medium text-sm transition-all ${
              status === 'terangkut'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Terangkut
          </button>
          <button
            type="button"
            onClick={() => setStatus('tidak_terangkut')}
            className={`flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-medium text-sm transition-all ${
              status === 'tidak_terangkut'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 bg-white text-gray-500'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Tidak Terangkut
          </button>
        </div>
      </div>

      {/* Foto */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Foto</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFoto}
        />
        {fotoPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <img
              src={fotoPreview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setFotoPreview(null)
                setFotoFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-green-400 hover:bg-green-50 transition-all"
          >
            <Camera className="w-6 h-6" />
            <span className="text-sm font-medium">Ambil Foto</span>
          </button>
        )}
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        loading={isSubmitting}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        <Send className="w-4 h-4 mr-2" />
        Kirim Monitoring
      </Button>
    </motion.div>
  )
}
