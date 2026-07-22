'use client'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { DriverBottomNav } from '@/components/driver/bottom-nav'
import { OfflineDetector } from '@/components/driver/offline-detector'
import Image from 'next/image'

function SplashScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-950 via-green-900 to-black">
      <div className="splash-logo mb-4">
        <Image
          src="/scwms-icon1.png"
          alt="SCWMS"
          width={80}
          height={80}
          className="rounded-2xl"
          priority
        />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!isLoading && user && user.role !== 'driver') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) {
    return <SplashScreen />
  }

  if (!isAuthenticated || user?.role !== 'driver') {
    return null
  }

  return (
    <OfflineDetector>
      <div
        className="min-h-screen bg-gray-50"
        style={{ paddingBottom: 'calc(64px + var(--safe-area-bottom))' }}
      >
        <main
          className="px-4 pt-4 pb-4 max-w-lg mx-auto"
          style={{ paddingTop: 'calc(16px + var(--safe-area-top))' }}
        >
          {children}
        </main>
        <DriverBottomNav />
      </div>
    </OfflineDetector>
  )
}
