'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home, ClipboardList, History, User } from 'lucide-react'

const navItems = [
  { href: '/driver/dashboard', label: 'Beranda', icon: Home },
  { href: '/driver/monitoring', label: 'Monitoring', icon: ClipboardList },
  { href: '/driver/riwayat', label: 'Riwayat', icon: History },
  { href: '/driver/profil', label: 'Profil', icon: User },
]

export function DriverBottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
