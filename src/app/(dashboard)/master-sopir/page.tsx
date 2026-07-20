'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { sopirService } from '@/services/sopir'
import { armadaService } from '@/services/armada'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
import type { Sopir } from '@/types'

const sopirSchema = z.object({
  nama: z.string().min(1, 'Nama harus diisi'),
  nik: z.string().min(16, 'NIK harus 16 digit').max(16, 'NIK harus 16 digit'),
  alamat: z.string().min(1, 'Alamat harus diisi'),
  nomor_hp: z.string().min(10, 'Nomor HP minimal 10 digit'),
  armada_id: z.coerce.number().optional(),
  status: z.enum(['aktif', 'tidak_aktif']),
})

type SopirForm = z.infer<typeof sopirSchema>

export default function MasterSopirPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('nama')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const debouncedSearch = useDebounce(search)

  const { data: paginatedData, isLoading, error, refetch } = useQuery({
    queryKey: ['sopir', debouncedSearch, page, sortBy, sortOrder],
    queryFn: () =>
      sopirService.getAll({
        search: debouncedSearch || undefined,
        page,
        per_page: 10,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  })

  const { data: armadaData } = useQuery({
    queryKey: ['armada-select'],
    queryFn: () => armadaService.getAll({ per_page: 100 }),
  })

  const form = useForm<SopirForm>({
    resolver: zodResolver(sopirSchema),
    defaultValues: { nama: '', nik: '', alamat: '', nomor_hp: '', status: 'aktif' },
  })

  const createMutation = useMutation({
    mutationFn: (p: SopirForm) => sopirService.create(p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sopir'] })
      toast.success('Sopir berhasil ditambahkan')
      closeDialog()
    },
    onError: () => toast.error('Gagal menyimpan sopir'),
  })

  const updateMutation = useMutation({
    mutationFn: (p: SopirForm) => sopirService.update(editingId!, p),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sopir'] })
      toast.success('Sopir berhasil diperbarui')
      closeDialog()
    },
    onError: () => toast.error('Gagal memperbarui sopir'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => sopirService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sopir'] })
      toast.success('Sopir berhasil dihapus')
      setDeleteId(null)
    },
    onError: () => toast.error('Gagal menghapus sopir'),
  })

  const openCreateDialog = useCallback(() => {
    setEditingId(null)
    form.reset({ nama: '', nik: '', alamat: '', nomor_hp: '', status: 'aktif' })
    setDialogOpen(true)
  }, [form])

  const openEditDialog = useCallback(async (id: number) => {
    setEditingId(id)
    try {
      const { data } = await sopirService.getById(id)
      form.reset({
        nama: data.nama,
        nik: data.nik,
        alamat: data.alamat,
        nomor_hp: data.nomor_hp,
        armada_id: data.armada_id,
        status: data.status,
      })
      setDialogOpen(true)
    } catch {
      toast.error('Gagal memuat data sopir')
    }
  }, [form])

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
    setEditingId(null)
    form.reset()
  }, [form])

  const onSubmit = async (values: SopirForm) => {
    if (editingId) await updateMutation.mutateAsync(values)
    else await createMutation.mutateAsync(values)
  }

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortOrder('asc') }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const columns: Column<Sopir>[] = [
    { key: 'nama', header: 'Nama', sortable: true },
    { key: 'nik', header: 'NIK' },
    { key: 'nomor_hp', header: 'Nomor HP' },
    {
      key: 'armada',
      header: 'Armada',
      render: (item) => item.armada?.plat_nomor || '-',
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
          <h1 className="text-2xl font-bold text-gray-900">Master Sopir</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data sopir armada</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Sopir
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
            onSearchChange={(v) => { setSearch(v); setPage(1) }}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            page={paginatedData?.current_page}
            totalPages={paginatedData?.last_page}
            total={paginatedData?.total}
            onPageChange={setPage}
            onRetry={() => refetch()}
            emptyMessage="Belum ada data sopir"
            actions={(item) => (
              <div className="flex items-center gap-1 justify-end">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(item.id)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
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
            <DialogTitle>{editingId ? 'Edit Sopir' : 'Tambah Sopir'}</DialogTitle>
            <DialogDescription>{editingId ? 'Perbarui data sopir' : 'Masukkan data sopir baru'}</DialogDescription>
          </DialogHeader>
          <Form form={form} onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Nama" error={form.formState.errors.nama?.message} required>
                <Input {...form.register('nama')} placeholder="Nama lengkap" />
              </FormField>
              <FormField label="NIK" error={form.formState.errors.nik?.message} required>
                <Input {...form.register('nik')} placeholder="16 digit NIK" maxLength={16} />
              </FormField>
              <div className="col-span-2">
                <FormField label="Alamat" error={form.formState.errors.alamat?.message} required>
                  <Input {...form.register('alamat')} placeholder="Alamat lengkap" />
                </FormField>
              </div>
              <FormField label="Nomor HP" error={form.formState.errors.nomor_hp?.message} required>
                <Input {...form.register('nomor_hp')} placeholder="08xxxxxxxxxx" />
              </FormField>
              <FormField label="Armada" error={form.formState.errors.armada_id?.message}>
                <Select value={String(form.watch('armada_id') ?? '')} onValueChange={(v) => form.setValue('armada_id', v ? Number(v) : undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih armada (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {armadaData?.data?.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.plat_nomor} - {a.merk_kendaraan}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Status" error={form.formState.errors.status?.message} required>
                <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v as 'aktif' | 'tidak_aktif')}>
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
              <Button type="button" variant="outline" onClick={closeDialog}>Batal</Button>
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
            <DialogTitle>Hapus Sopir</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus sopir ini?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" loading={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Hapus</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
