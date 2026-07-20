'use client'

import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { monitoringService } from '@/services/monitoring'
import { useDebounce } from '@/hooks/use-debounce'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/features/data-table'
import type { Monitoring } from '@/types'
import { Eye } from 'lucide-react'

export default function MonitoringPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('tanggal')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const debouncedSearch = useDebounce(search)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['monitoring', debouncedSearch, page, sortBy, sortOrder],
    queryFn: () =>
      monitoringService.getAll({
        search: debouncedSearch || undefined,
        page,
        per_page: 10,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
    refetchInterval: 60000,
    placeholderData: keepPreviousData,
  })

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortOrder('desc') }
  }

  const columns: Column<Monitoring>[] = [
    { key: 'tanggal', header: 'Tanggal', sortable: true },
    { key: 'jam', header: 'Jam', sortable: true },
    { key: 'plat_nomor', header: 'Plat Nomor', sortable: true },
    {
      key: 'sopir',
      header: 'Nama Sopir',
      render: (item) => item.sopir?.nama || '-',
    },
    { key: 'jenis_armada', header: 'Jenis Armada' },
    { key: 'latitude', header: 'Latitude' },
    { key: 'longitude', header: 'Longitude' },
    {
      key: 'volume_sampah',
      header: 'Volume',
      render: (item) => `${item.volume_sampah} m³`,
      sortable: true,
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
    {
      key: 'foto',
      header: 'Foto',
      render: (item) =>
        item.foto ? (
          <a href={item.foto} target="_blank" rel="noreferrer" className="text-green-600 hover:underline text-sm">
            Lihat
          </a>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        ),
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">Data monitoring pengangkutan sampah real-time</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            loading={isLoading}
            error={error ? 'Gagal memuat data' : null}
            searchable
            searchPlaceholder="Cari plat nomor, sopir..."
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1) }}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            page={data?.current_page}
            totalPages={data?.last_page}
            total={data?.total}
            onPageChange={setPage}
            onRetry={() => refetch()}
            emptyMessage="Belum ada data monitoring"
            onRowClick={(item) => router.push(`/monitoring/${item.id}`)}
            actions={(item) => (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/monitoring/${item.id}`)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
