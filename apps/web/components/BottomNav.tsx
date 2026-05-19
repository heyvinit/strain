'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, User, Sparkles } from 'lucide-react'

interface BottomNavProps {
  username: string
}

const NAV = [
  { href: '/dashboard',         icon: Home,     label: 'Home'    },
  { href: '/dashboard/add',     icon: Plus,     label: 'Add'     },
  { href: '/dashboard/card',    icon: Sparkles, label: 'Card'    },
  { href: '/dashboard/profile', icon: User,     label: 'Profile' },
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
          const target = href
          const isActive =
            (label === 'Home' && (pathname === '/dashboard' || pathname.startsWith('/dashboard/races'))) ||
            (label === 'Add' && pathname === '/dashboard/add') ||
            (label === 'Card' && pathname.startsWith('/dashboard/card')) ||
            (label === 'Profile' && pathname.startsWith('/dashboard/profile'))

          return (
            <Link
              key={label}
              href={target}
              className="flex items-center justify-center w-14 h-10 rounded-full transition-all active:scale-[0.93]"
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
