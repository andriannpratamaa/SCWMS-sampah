'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { FileText, Download, FileSpreadsheet } from 'lucide-react'
import { laporanService } from '@/services/laporan'
import { armadaService } from '@/services/armada'
import { sopirService } from '@/services/sopir'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable, type Column } from '@/components/features/data-table'
import type { Monitoring } from '@/types'

export default function LaporanPage() {
  const [tanggalAwal, setTanggalAwal] = useState('')
  const [tanggalAkhir, setTanggalAkhir] = useState('')
  const [armadaId, setArmadaId] = useState('')
  const [sopirId, setSopirId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  const filter = {
    ...(tanggalAwal && { tanggal_awal: tanggalAwal }),
    ...(tanggalAkhir && { tanggal_akhir: tanggalAkhir }),
    ...(armadaId && { armada_id: Number(armadaId) }),
    ...(sopirId && { sopir_id: Number(sopirId) }),
    ...(status && { status }),
    page,
    per_page: 10,
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['laporan', filter],
    queryFn: () => laporanService.getLaporan(filter),
  })

  const { data: armadaData } = useQuery({
    queryKey: ['armada-laporan'],
    queryFn: () => armadaService.getAll({ per_page: 100 }),
  })

  const { data: sopirData } = useQuery({
    queryKey: ['sopir-laporan'],
    queryFn: () => sopirService.getAll({ per_page: 100 }),
  })

  const handleFilter = () => {
    setPage(1)
    refetch()
  }

  const handleExport = async (type: 'excel' | 'pdf') => {
    setExporting(type)
    try {
      const blob = type === 'excel'
        ? await laporanService.exportExcel(filter)
        : await laporanService.exportPdf(filter)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-${type}-${Date.now()}.${type}`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success(`Laporan berhasil di-export sebagai ${type.toUpperCase()}`)
    } catch {
      toast.error(`Gagal export ${type.toUpperCase()}`)
    } finally {
      setExporting(null)
    }
  }

  const columns: Column<Monitoring>[] = [
    { key: 'tanggal', header: 'Tanggal' },
    { key: 'jam', header: 'Jam' },
    { key: 'plat_nomor', header: 'Plat Nomor' },
    {
      key: 'sopir',
      header: 'Sopir',
      render: (item) => item.sopir?.nama || '-',
    },
    { key: 'jenis_armada', header: 'Jenis' },
    {
      key: 'volume_sampah',
      header: 'Volume',
      render: (item) => `${item.volume_sampah} m³`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'terangkut' ? 'success' : 'warning'}>
          {item.status === 'terangkut' ? 'Terangkut' : 'Tidak Terangkut'}
        </Badge>
      ),
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-sm text-gray-500 mt-1">Generate laporan pengangkutan sampah</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            loading={exporting === 'excel'}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            loading={exporting === 'pdf'}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Tanggal Awal</label>
              <Input type="date" value={tanggalAwal} onChange={(e) => setTanggalAwal(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Tanggal Akhir</label>
              <Input type="date" value={tanggalAkhir} onChange={(e) => setTanggalAkhir(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Armada</label>
              <Select value={armadaId} onValueChange={setArmadaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Armada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Armada</SelectItem>
                  {armadaData?.data?.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>{a.plat_nomor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Sopir</label>
              <Select value={sopirId} onValueChange={setSopirId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Sopir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Sopir</SelectItem>
                  {sopirData?.data?.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua Status</SelectItem>
                  <SelectItem value="terangkut">Terangkut</SelectItem>
                  <SelectItem value="tidak_terangkut">Tidak Terangkut</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleFilter}>
              <FileText className="w-4 h-4 mr-2" />
              Tampilkan
            </Button>
            <Button variant="outline" onClick={() => {
              setTanggalAwal(''); setTanggalAkhir(''); setArmadaId(''); setSopirId(''); setStatus(''); setPage(1)
            }}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            loading={isLoading}
            error={error ? 'Gagal memuat laporan' : null}
            onRetry={() => refetch()}
            emptyMessage="Pilih filter dan klik Tampilkan"
            page={data?.current_page}
            totalPages={data?.last_page}
            total={data?.total}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
