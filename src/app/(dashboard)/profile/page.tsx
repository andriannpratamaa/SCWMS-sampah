'use client'

import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Camera, Save, Lock } from 'lucide-react'
import { compressImage } from '@/lib/utils'
import { authService } from '@/services/auth'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField } from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

const passwordSchema = z.object({
  password_lama: z.string().min(1, 'Password lama harus diisi'),
  password_baru: z.string().min(6, 'Password baru minimal 6 karakter'),
  konfirmasi_password: z.string().min(1, 'Konfirmasi password harus diisi'),
}).refine((data) => data.password_baru === data.konfirmasi_password, {
  message: 'Konfirmasi password tidak cocok',
  path: ['konfirmasi_password'],
})

type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [passwordDialog, setPasswordDialog] = useState(false)

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const updatePhotoMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData()
      fd.append('foto_profil', file)
      return authService.updateProfile(fd)
    },
    onSuccess: () => {
      toast.success('Foto profil berhasil diperbarui')
    },
    onError: () => toast.error('Gagal memperbarui foto profil'),
  })

  const changePasswordMutation = useMutation({
    mutationFn: (p: PasswordForm) => authService.changePassword(p),
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi profil Anda</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
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
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Nama</p>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Role</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className="text-sm font-medium text-green-600 capitalize">{user?.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keamanan</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setPasswordDialog(true)}>
            <Lock className="w-4 h-4 mr-2" />
            Ubah Password
          </Button>
        </CardContent>
      </Card>

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
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </Button>
            </div>
          </Form>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
