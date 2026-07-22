'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'

export function OfflineDetector({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!online) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <WifiOff className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Koneksi Internet</h2>
        <p className="text-sm text-gray-500 mb-8 max-w-xs">
          Periksa koneksi internet Anda dan coba lagi.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 w-full max-w-xs h-12 rounded-xl bg-green-600 text-white font-semibold text-sm active:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    )
  }

  return <>{children}</>
}
