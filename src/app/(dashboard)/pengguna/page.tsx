'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { userService } from '@/services/user'
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
import type { User } from '@/types'

const userSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Minimal 6 karakter').optional().or(z.literal('')),
  role: z.enum(['admin', 'operator']),
  status: z.enum(['aktif', 'tidak_aktif']),
})

type UserForm = z.infer<typeof userSchema>

export default function PenggunaPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const debouncedSearch = useDebounce(search)

  const { data: paginatedData, isLoading, error, refetch } = useQuery({
    queryKey: ['users', debouncedSearch, page, sortBy, sortOrder],
    queryFn: () =>
      userService.getAll({ search: debouncedSearch || undefined, page, per_page: 10, sort_by: sortBy, sort_order: sortOrder }),
  })

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', password: '', role: 'operator', status: 'aktif' },
  })

  const createMutation = useMutation({
    mutationFn: (p: UserForm) => userService.create(p as User & { password: string }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Pengguna berhasil ditambahkan'); closeDialog()
    },
    onError: () => toast.error('Gagal menyimpan pengguna'),
  })

  const updateMutation = useMutation({
    mutationFn: (p: UserForm) => {
      const payload = { ...p }
      if (!payload.password) delete (payload as Record<string, unknown>).password
      return userService.update(editingId!, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Pengguna berhasil diperbarui'); closeDialog()
    },
    onError: () => toast.error('Gagal memperbarui pengguna'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Pengguna berhasil dihapus'); setDeleteId(null)
    },
    onError: () => toast.error('Gagal menghapus pengguna'),
  })

  const openCreateDialog = useCallback(() => {
    setEditingId(null)
    form.reset({ name: '', email: '', password: '', role: 'operator', status: 'aktif' })
    setDialogOpen(true)
  }, [form])

  const openEditDialog = useCallback(async (id: number) => {
    setEditingId(id)
    try {
      const { data } = await userService.getById(id)
      form.reset({ name: data.name, email: data.email, password: '', role: data.role, status: data.status })
      setDialogOpen(true)
    } catch { toast.error('Gagal memuat data') }
  }, [form])

  const closeDialog = useCallback(() => {
    setDialogOpen(false); setEditingId(null); form.reset()
  }, [form])

  const onSubmit = async (values: UserForm) => {
    if (editingId) await updateMutation.mutateAsync(values)
    else await createMutation.mutateAsync(values)
  }

  const handleSort = (key: string) => {
    if (sortBy === key) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortOrder('asc') }
  }

  const columns: Column<User>[] = [
    { key: 'name', header: 'Nama', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    {
      key: 'role',
      header: 'Role',
      render: (item) => (
        <Badge variant={item.role === 'admin' ? 'info' : 'default'}>
          {item.role === 'admin' ? 'Admin' : 'Operator'}
        </Badge>
      ),
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
          <h1 className="text-2xl font-bold text-gray-900">Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola pengguna sistem</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Pengguna
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
            emptyMessage="Belum ada pengguna"
            actions={(item) => (
              <div className="flex items-center gap-1 justify-end">
                <Button variant="ghost" size="icon" onClick={() => openEditDialog(item.id)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}</DialogTitle>
            <DialogDescription>{editingId ? 'Perbarui data pengguna' : 'Masukkan data pengguna baru'}</DialogDescription>
          </DialogHeader>
          <Form form={form} onSubmit={onSubmit} className="space-y-4">
            <FormField label="Nama" error={form.formState.errors.name?.message} required>
              <Input {...form.register('name')} placeholder="Nama lengkap" />
            </FormField>
            <FormField label="Email" error={form.formState.errors.email?.message} required>
              <Input type="email" {...form.register('email')} placeholder="email@example.com" />
            </FormField>
            <FormField label="Password" error={form.formState.errors.password?.message} required={!editingId}>
              <Input type="password" {...form.register('password')} placeholder={editingId ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Role" error={form.formState.errors.role?.message} required>
                <Select value={form.watch('role')} onValueChange={(v) => form.setValue('role', v as 'admin' | 'operator')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Status" error={form.formState.errors.status?.message} required>
                <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v as 'aktif' | 'tidak_aktif')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="tidak_aktif">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeDialog}>Batal</Button>
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'Simpan Perubahan' : 'Simpan'}
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus pengguna ini?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" loading={deleteMutation.isPending}
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Hapus</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
