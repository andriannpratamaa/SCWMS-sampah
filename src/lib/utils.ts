import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPhotoUrl(path?: string | null): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `/storage/${path}`
}

export function compressImage(file: File, maxSizeKB = 5120): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      const MAX = 1920
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX }
        else { width = Math.round(width * MAX / height); height = MAX }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      const tryQuality = (q: number): Blob | null => {
        const data = canvas.toDataURL('image/jpeg', q)
        const parts = data.split(',')
        const bin = atob(parts[1])
        const len = bin.length
        const buf = new Uint8Array(len)
        for (let i = 0; i < len; i++) buf[i] = bin.charCodeAt(i)
        return new Blob([buf], { type: 'image/jpeg' })
      }

      let quality = 0.8
      let blob = tryQuality(quality)
      while (blob.size > maxSizeKB * 1024 && quality > 0.2) {
        quality -= 0.1
        blob = tryQuality(quality)
      }

      const name = file.name.replace(/\.[^.]+$/, '.jpg')
      resolve(new File([blob], name, { type: 'image/jpeg' }))
    }
    img.onerror = () => reject(new Error('Gagal membaca gambar'))
    const reader = new FileReader()
    reader.onload = (e) => { img.src = e.target?.result as string }
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsDataURL(file)
  })
}
