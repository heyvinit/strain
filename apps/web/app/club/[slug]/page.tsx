import { supabaseAdmin } from '@/lib/supabase'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Users } from 'lucide-react'
import Link from 'next/link'
import ClubAdminPanel from '@/components/ClubAdminPanel'

export default async function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()
  const viewerId = session?.user?.userId ?? null

  const { data: club } = await supabaseAdmin
    .from('run_clubs')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!club) notFound()

  // Approved members with user info
  const { data: memberRows } = await supabaseAdmin
    .from('run_club_members')
    .select('role, joined_at, users(id, name, username, avatar_url)')
    .eq('club_id', club.id)
    .eq('status', 'approved')
    .order('joined_at', { ascending: true })

  const memberIds = (memberRows ?? []).map((m: any) => m.users?.id).filter(Boolean)

  // Race counts + marathon PBs in parallel
  const [{ data: raceCounts }, { data: marathonPBs }] = await Promise.all([
    supabaseAdmin.from('user_races').select('user_id').in('user_id', memberIds).eq('status', 'completed'),
    supabaseAdmin.from('user_races').select('user_id, net_time').in('user_id', memberIds).eq('status', 'completed').eq('is_pb', true).ilike('distance', '%42%'),
  ])

  const countMap: Record<string, number> = {}
  for (const r of raceCounts ?? []) countMap[r.user_id] = (countMap[r.user_id] ?? 0) + 1

  const pbMap: Record<string, string> = {}
  for (const r of marathonPBs ?? []) {
    if (r.net_time && (!pbMap[r.user_id] || r.net_time < pbMap[r.user_id])) pbMap[r.user_id] = r.net_time
  }

  const members = (memberRows ?? []).map((m: any) => ({
    role: m.role as 'admin' | 'member',
    joined_at: m.joined_at,
    user: m.users as { id: string; name: string | null; username: string; avatar_url: string | null },
    race_count: countMap[m.users?.id] ?? 0,
    marathon_pb: pbMap[m.users?.id] ?? null,
  }))

  // Pending requests (only visible to admin)
  const viewerMembership = memberRows?.find((m: any) => m.users?.id === viewerId)
  const isAdmin = viewerMembership?.role === 'admin'

  const { data: pendingRows } = isAdmin
    ? await supabaseAdmin
        .from('run_club_members')
        .select('user_id, joined_at, users(id, name, username, avatar_url)')
        .eq('club_id', club.id)
        .eq('status', 'pending')
        .order('joined_at', { ascending: true })
    : { data: null }

  const pending = (pendingRows ?? []).map((p: any) => ({
    user_id: p.user_id,
    joined_at: p.joined_at,
    user: p.users as { id: string; name: string | null; username: string; avatar_url: string | null },
  }))

  return (
    <div className="min-h-screen px-5 pt-14 pb-10 max-w-[500px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'white', border: '1px solid #F0F0EE' }}
        >
          <ArrowLeft size={15} color="#111" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-lg font-bold leading-tight truncate" style={{ color: '#111' }}>{club.name}</h1>
          <p className="text-xs" style={{ color: '#aaa' }}>
            {club.city ? `${club.city} · ` : ''}{members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
        {club.link && (
          <a
            href={club.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'white', border: '1px solid #F0F0EE' }}
          >
            <ExternalLink size={15} color="#aaa" />
          </a>
        )}
      </div>

      {/* Admin panel — pending requests */}
      {isAdmin && pending.length > 0 && (
        <ClubAdminPanel slug={slug} pending={pending} />
      )}

      {/* Members list */}
      <div className="rounded-3xl overflow-hidden" style={{ background: 'white', border: '1px solid #F0F0EE' }}>
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <Users size={13} color="#aaa" />
          <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#aaa' }}>Members</p>
        </div>

        {members.length === 0 && (
          <p className="px-5 pb-5 text-sm" style={{ color: '#bbb' }}>No members yet.</p>
        )}

        {members.map((m, i) => (
          <div key={m.user.id}>
            {i > 0 && <div style={{ height: 1, background: '#F0F0EE', marginLeft: 20 }} />}
            <Link
              href={`/${m.user.username}`}
              className="flex items-center gap-3 px-5 py-3.5 active:bg-gray-50 transition-colors"
            >
              {m.user.avatar_url ? (
                <img src={m.user.avatar_url} alt={m.user.name ?? ''} className="w-9 h-9 rounded-2xl object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-white text-sm font-bold" style={{ background: '#FC4C02' }}>
                  {(m.user.name ?? m.user.username)[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight truncate" style={{ color: '#111' }}>
                  {m.user.name ?? m.user.username}
                  {m.role === 'admin' && (
                    <span className="ml-1.5 text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded-md" style={{ background: '#F0F0EE', color: '#888' }}>ADMIN</span>
                  )}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#aaa' }}>@{m.user.username}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold" style={{ color: '#111' }}>{m.race_count}</p>
                <p className="text-[10px]" style={{ color: '#aaa' }}>races</p>
              </div>
              {m.marathon_pb && (
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold" style={{ color: '#111' }}>{m.marathon_pb.replace(/^0(\d):/, '$1:')}</p>
                  <p className="text-[10px]" style={{ color: '#aaa' }}>marathon</p>
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
