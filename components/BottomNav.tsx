'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Plus, Layers } from 'lucide-react'

interface BottomNavProps {
  username: string
}

const NAV = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '#passport', icon: BookOpen, label: 'Passport' },
  { href: '/dashboard/add', icon: Plus, label: 'Add' },
  { href: '/', icon: Layers, label: 'Card' },
]

export default function BottomNav({ username }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 px-6">
      <nav
        className="flex items-center gap-1 px-3 py-3 rounded-full shadow-xl"
        style={{ background: '#111', backdropFilter: 'blur(12px)' }}
      >
        {NAV.map(({ href, icon: Icon, label }) => {
          // Passport links to the user's public page
          const target = label === 'Passport' ? `/${username}` : href
          const isActive = pathname === target || (label === 'Home' && pathname === '/dashboard')

          return (
            <Link
              key={label}
              href={target}
              className="flex flex-col items-center justify-center w-14 h-10 rounded-full transition-all"
              style={{
                background: isActive ? '#FC4C02' : 'transparent',
                color: isActive ? 'white' : '#666',
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
