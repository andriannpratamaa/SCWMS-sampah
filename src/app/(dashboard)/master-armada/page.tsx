'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Truck } from 'lucide-react'
import { armadaService } from '@/services/armada'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormField } from '@/components/ui/form'
import { DataTable, type Column } from '@/components/features/data-table'
import type { Armada } from '@/types'

const armadaSchema = z.object({
  plat_nomor: z.string().min(1, 'Plat nomor harus diisi'),
  merk_kendaraan: z.string().min(1, 'Merk kendaraan harus diisi'),
  jenis_armada: z.enum(['Truck', 'Armroll'], { required_error: 'Pilih jenis armada' }),
  tahun_pembelian: z.coerce.number().min(2000, 'Minimal tahun 2000').max(2030, 'Maksimal tahun 2030'),
  panjang_bak: z.coerce.number().min(1, 'Harus diisi'),
  lebar_bak: z.coerce.number().min(1, 'Harus diisi'),
  tinggi_bak: z.coerce.number().min(1, 'Harus diisi'),
  status: z.enum(['aktif', 'tidak_aktif']),
})

type ArmadaForm = z.infer<typeof armadaSchema>

export default function MasterArmadaPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('plat_nomor')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const debouncedSearch = useDebounce(search)

  const {
    data: paginatedData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['armada', debouncedSearch, page, sortBy, sortOrder],
    queryFn: () =>
      armadaService.getAll({
        search: debouncedSearch || undefined,
        page,
        per_page: 10,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  })

  const form = useForm<ArmadaForm>({
    resolver: zodResolver(armadaSchema),
    defaultValues: {
      plat_nomor: '',
      merk_kendaraan: '',
      jenis_armada: 'Truck',
      tahun_pembelian: new Date().getFullYear(),
      panjang_bak: 0,
      lebar_bak: 0,
      tinggi_bak: 0,
      status: 'aktif',
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: ArmadaForm) => armadaService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armada'] })
      toast.success('Armada berhasil ditambahkan')
      closeDialog()
    },
    onError: () => toast.error('Gagal menyimpan armada'),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: ArmadaForm) => armadaService.update(editingId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armada'] })
      toast.success('Armada berhasil diperbarui')
      closeDialog()
    },
    onError: () => toast.error('Gagal memperbarui armada'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => armadaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['armada'] })
      toast.success('Armada berhasil dihapus')
      setDeleteId(null)
    },
    onError: () => toast.error('Gagal menghapus armada'),
  })

  const openCreateDialog = useCallback(() => {
    setEditingId(null)
    form.reset({
      plat_nomor: '',
      merk_kendaraan: '',
      jenis_armada: 'Truck',
      tahun_pembelian: new Date().getFullYear(),
      panjang_bak: 0,
      lebar_bak: 0,
      tinggi_bak: 0,
      status: 'aktif',
    })
    setDialogOpen(true)
  }, [form])

  const openEditDialog = useCallback(
    async (id: number) => {
      setEditingId(id)
      try {
        const { data } = await armadaService.getById(id)
        form.reset({
          plat_nomor: data.plat_nomor,
          merk_kendaraan: data.merk_kendaraan,
          jenis_armada: data.jenis_armada,
          tahun_pembelian: data.tahun_pembelian,
          panjang_bak: data.panjang_bak,
          lebar_bak: data.lebar_bak,
          tinggi_bak: data.tinggi_bak,
          status: data.status,
        })
        setDialogOpen(true)
      } catch {
        toast.error('Gagal memuat data armada')
      }
    },
    [form]
  )

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
    setEditingId(null)
    form.reset()
  }, [form])

  const onSubmit = async (values: ArmadaForm) => {
    if (editingId) {
      await updateMutation.mutateAsync(values)
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const columns: Column<Armada>[] = [
    { key: 'plat_nomor', header: 'Plat Nomor', sortable: true },
    { key: 'merk_kendaraan', header: 'Merk', sortable: true },
    {
      key: 'jenis_armada',
      header: 'Jenis',
      render: (item) => (
        <Badge variant={item.jenis_armada === 'Truck' ? 'info' : 'default'}>
          {item.jenis_armada}
        </Badge>
      ),
    },
    { key: 'tahun_pembelian', header: 'Tahun', sortable: true },
    {
      key: 'volume_bak',
      header: 'Volume Bak',
      render: (item) => {
        const volume = item.panjang_bak * item.lebar_bak * item.tinggi_bak
        return `${(volume / 1000000).toFixed(2)} m³`
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <Badge variant={item.status === 'aktif' ? 'success' : 'danger'}>
          {item.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
        </Badge>
      ),
    },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Armada</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data armada pengangkut sampah</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Armada
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            columns={columns}
            data={paginatedData?.data ?? []}
            loading={isLoading}
            error={error ? 'Gagal memuat data' : null}
            searchable
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            page={paginatedData?.current_page}
            totalPages={paginatedData?.last_page}
            total={paginatedData?.total}
            onPageChange={setPage}
            onRetry={() => refetch()}
            emptyMessage="Belum ada data armada"
            actions={(item) => (
              <div className="flex items-center gap-1 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(item.id)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(item.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Armada' : 'Tambah Armada'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Perbarui data armada' : 'Masukkan data armada baru'}
            </DialogDescription>
          </DialogHeader>

          <Form form={form} onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Plat Nomor" error={form.formState.errors.plat_nomor?.message} required>
                <Input {...form.register('plat_nomor')} placeholder="B 1234 XYZ" />
              </FormField>

              <FormField label="Merk Kendaraan" error={form.formState.errors.merk_kendaraan?.message} required>
                <Input {...form.register('merk_kendaraan')} placeholder="Mitsubishi Colt Diesel" />
              </FormField>

              <FormField label="Jenis Armada" error={form.formState.errors.jenis_armada?.message} required>
                <Select
                  value={form.watch('jenis_armada')}
                  onValueChange={(v) => form.setValue('jenis_armada', v as 'Truck' | 'Armroll')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Armroll">Armroll</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Tahun Pembelian" error={form.formState.errors.tahun_pembelian?.message} required>
                <Input type="number" {...form.register('tahun_pembelian')} />
              </FormField>

              <FormField label="Panjang Bak (cm)" error={form.formState.errors.panjang_bak?.message} required>
                <Input type="number" {...form.register('panjang_bak')} />
              </FormField>

              <FormField label="Lebar Bak (cm)" error={form.formState.errors.lebar_bak?.message} required>
                <Input type="number" {...form.register('lebar_bak')} />
              </FormField>

              <FormField label="Tinggi Bak (cm)" error={form.formState.errors.tinggi_bak?.message} required>
                <Input type="number" {...form.register('tinggi_bak')} />
              </FormField>

              <FormField label="Status" error={form.formState.errors.status?.message} required>
                <Select
                  value={form.watch('status')}
                  onValueChange={(v) => form.setValue('status', v as 'aktif' | 'tidak_aktif')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Batal
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                {editingId ? 'Simpan Perubahan' : 'Simpan'}
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Armada</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus armada ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
