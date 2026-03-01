import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { logout } from '@/app/actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const username = session.user.username ?? ''

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F8F8F7' }}>
      {children}
      <BottomNav username={username} logout={logout} />
    </div>
  )
}
