'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { driverService } from '@/services/driver'
import { useAuth } from '@/hooks/use-auth'
import { Camera, Lock, LogOut, User, Phone, MapPin, Truck, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Form, FormField } from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { getPhotoUrl, compressImage } from '@/lib/utils'

const passwordSchema = z.object({
  password_lama: z.string().min(1, 'Password lama harus diisi'),
  password_baru: z.string().min(6, 'Password baru minimal 6 karakter'),
  konfirmasi_password: z.string().min(1, 'Konfirmasi password harus diisi'),
}).refine((data) => data.password_baru === data.konfirmasi_password, {
  message: 'Konfirmasi password tidak cocok',
  path: ['konfirmasi_password'],
})

type PasswordForm = z.infer<typeof passwordSchema>

export default function DriverProfilPage() {
  const { user, logout } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [passwordDialog, setPasswordDialog] = useState(false)

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['driver-dashboard'],
    queryFn: driverService.getDashboard,
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const updatePhotoMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData()
      fd.append('foto_profil', file)
      return driverService.updatePhoto(fd)
    },
    onSuccess: () => {
      toast.success('Foto profil berhasil diperbarui')
    },
    onError: () => toast.error('Gagal memperbarui foto profil'),
  })

  const changePasswordMutation = useMutation({
    mutationFn: (p: PasswordForm) => driverService.changePassword(p),
    onSuccess: () => {
      toast.success('Password berhasil diubah')
      setPasswordDialog(false)
      passwordForm.reset()
    },
    onError: () => toast.error('Gagal mengubah password. Periksa password lama Anda'),
  })

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, 2048)
      updatePhotoMutation.mutate(compressed)
    } catch {
      toast.error('Gagal memproses foto')
    }
  }

  const onSubmitPassword = async (values: PasswordForm) => {
    await changePasswordMutation.mutateAsync(values)
  }

  const sopir = dashboard?.sopir
  const armada = sopir?.armada

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pb-4">
      <div className="text-center py-2">
        <h1 className="text-lg font-bold text-gray-900">Profil</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Photo & Name */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden mx-auto">
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
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-9 h-9 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center active:bg-gray-100 transition-colors"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mt-4">{sopir?.nama}</h2>
              <p className="text-sm text-gray-500">Driver</p>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-green-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-green-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">Nomor HP</p>
                  <p className="font-medium text-gray-900">{sopir?.nomor_hp}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-green-600 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">Alamat</p>
                  <p className="font-medium text-gray-900">{sopir?.alamat}</p>
                </div>
              </div>
              {armada && (
                <>
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-4 h-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Armada</p>
                      <p className="font-medium text-gray-900">{armada.merk_kendaraan}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-4 h-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Plat Nomor</p>
                      <p className="font-medium text-gray-900">{armada.plat_nomor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-4 h-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Jenis Armada</p>
                      <p className="font-medium text-gray-900">{armada.jenis_armada}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start h-12"
              onClick={() => setPasswordDialog(true)}
            >
              <Lock className="w-4 h-4 mr-3" />
              Ubah Password
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start min-h-[48px] text-red-500 active:text-red-600 active:bg-red-50 border-red-200"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </>
      )}

      {/* Password Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
            <DialogDescription>Masukkan password lama dan password baru Anda</DialogDescription>
          </DialogHeader>
          <Form form={passwordForm} onSubmit={onSubmitPassword} className="space-y-4">
            <FormField label="Password Lama" error={passwordForm.formState.errors.password_lama?.message} required>
              <Input type="password" {...passwordForm.register('password_lama')} />
            </FormField>
            <FormField label="Password Baru" error={passwordForm.formState.errors.password_baru?.message} required>
              <Input type="password" {...passwordForm.register('password_baru')} />
            </FormField>
            <FormField label="Konfirmasi Password" error={passwordForm.formState.errors.konfirmasi_password?.message} required>
              <Input type="password" {...passwordForm.register('konfirmasi_password')} />
            </FormField>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setPasswordDialog(false)}>Batal</Button>
              <Button type="submit" loading={changePasswordMutation.isPending}>
                Simpan
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
