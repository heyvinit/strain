import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function ShareButton({ username }: { username: string }) {
  return (
    <Link
      href={`/${username}`}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold"
      style={{ background: '#F0F0EE', color: '#555' }}
    >
      <ArrowUpRight size={13} />
      Preview
    </Link>
  )
}
