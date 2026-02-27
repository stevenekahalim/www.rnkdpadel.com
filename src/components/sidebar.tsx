'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase-auth'

const navGroups = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin/dashboard', icon: '📊' }],
  },
  {
    label: 'Liga',
    items: [
      { label: 'Seasons', href: '/admin/liga/seasons', icon: '🏆' },
      { label: 'Registrations', href: '/admin/liga/registrations', icon: '📋' },
      { label: 'Fixtures & Scores', href: '/admin/liga/fixtures', icon: '⚽' },
      { label: 'Standings', href: '/admin/liga/standings', icon: '📈' },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Players', href: '/admin/players', icon: '👥' },
      { label: 'Clubs', href: '/admin/clubs', icon: '🏢' },
    ],
  },
  {
    label: 'Competitions',
    items: [
      { label: 'Matches', href: '/admin/matches', icon: '🎾' },
      { label: 'Tournaments', href: '/admin/tournaments', icon: '🎯' },
      { label: 'Achievements', href: '/admin/achievements', icon: '🏅' },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Notifications', href: '/admin/notifications', icon: '🔔' },
    ],
  },
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
      <div className="px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center font-extrabold text-black text-sm">
            R
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">RNKD Admin</h1>
            <p className="text-[11px] text-slate-400">Padel League Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? 'bg-blue-600/90 text-white shadow-sm shadow-blue-900/30'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    <span className="text-base w-5 text-center">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Sign Out */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
            {(user.name || user.email || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-200 truncate">
              {user.name || 'Admin'}
            </div>
            <button
              onClick={handleSignOut}
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
