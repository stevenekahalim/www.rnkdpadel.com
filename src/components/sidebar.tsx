'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase-auth'

const nav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Liga Seasons', href: '/admin/liga/seasons', icon: '🏆' },
  { label: 'Registrations', href: '/admin/liga/registrations', icon: '📋' },
  { label: 'Fixtures & Scores', href: '/admin/liga/fixtures', icon: '⚽' },
  { label: 'Standings', href: '/admin/liga/standings', icon: '📈' },
  { label: 'Players', href: '/admin/players', icon: '👥' },
  { label: 'Clubs', href: '/admin/clubs', icon: '🏢' },
  { label: 'Matches', href: '/admin/matches', icon: '🎾' },
]

export function Sidebar({ user }: { user: { name?: string; email?: string } }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createAuthClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-tight">RNKD Admin</h1>
        <p className="text-xs text-slate-400 mt-0.5">Padel League Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Sign Out */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="text-sm font-medium text-slate-200 truncate">
          {user.name || user.email || 'Admin'}
        </div>
        <button
          onClick={handleSignOut}
          className="mt-2 w-full text-left text-xs text-slate-400 hover:text-white transition-colors"
        >
          Sign out →
        </button>
      </div>
    </aside>
  )
}
