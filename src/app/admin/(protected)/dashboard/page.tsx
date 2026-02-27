import { createAdminClient } from '@/lib/supabase-admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createAdminClient()

  // Time boundaries
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay()
  ).toISOString()

  const [
    // Lifetime totals
    totalPlayersRes,
    totalMatchesRes,
    totalClubsRes,
    // Time-based
    newUsersThisWeekRes,
    newUsersTodayRes,
    matchesThisWeekRes,
    matchesTodayRes,
    // Issues
    disputesRes,
    pendingRegsRes,
    staleMatchesRes,
    // Recent signups (last 10 with names)
    recentSignupsRes,
    // Recent matches (last 12 with player info)
    recentMatchesRes,
    // Active seasons
    activeSeasonsRes,
    // Push devices
    pushTokensRes,
  ] = await Promise.all([
    // Lifetime
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }),
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    // This week
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart),
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart),
    supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart),
    supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart),
    // Issues
    supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'DISPUTED'),
    supabase
      .from('liga_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    // Stale = PENDING for > 48 hours
    supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING')
      .lt('created_at', new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()),
    // Recent signups
    supabase
      .from('users')
      .select('id, name, avatar_url, auth_provider, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    // Recent matches with players
    recentMatchesQuery(supabase),
    // Active seasons
    supabase
      .from('liga_seasons')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active'),
    // Push devices
    supabase
      .from('push_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
  ])

  const totalPlayers = totalPlayersRes.count ?? 0
  const totalMatches = totalMatchesRes.count ?? 0
  const totalClubs = totalClubsRes.count ?? 0
  const newUsersThisWeek = newUsersThisWeekRes.count ?? 0
  const newUsersToday = newUsersTodayRes.count ?? 0
  const matchesThisWeek = matchesThisWeekRes.count ?? 0
  const matchesToday = matchesTodayRes.count ?? 0
  const disputes = disputesRes.count ?? 0
  const pendingRegs = pendingRegsRes.count ?? 0
  const staleMatches = staleMatchesRes.count ?? 0
  const activeSeasons = activeSeasonsRes.count ?? 0
  const pushDevices = pushTokensRes.count ?? 0
  const recentSignups = recentSignupsRes.data ?? []
  const recentMatches = recentMatchesRes.data ?? []

  const issueCount = disputes + pendingRegs + staleMatches
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-gray-400 mb-1">
          {dayName}, {dateStr}
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, Steven 👋</h1>
        {issueCount > 0 ? (
          <p className="text-gray-500 mt-1">
            You have <span className="text-red-600 font-semibold">{issueCount} item{issueCount > 1 ? 's' : ''}</span>{' '}
            that need attention.
          </p>
        ) : (
          <p className="text-gray-500 mt-1">All clear — no issues today.</p>
        )}
      </div>

      {/* ── ISSUES & ATTENTION ── */}
      {issueCount > 0 && (
        <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm font-bold text-red-800 mb-3 uppercase tracking-wide">
            🚨 Needs Attention
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {disputes > 0 && (
              <IssueCard
                href="/admin/matches?status=DISPUTED"
                count={disputes}
                label="Disputed Matches"
                sublabel="Players disagreed on score"
                color="red"
              />
            )}
            {staleMatches > 0 && (
              <IssueCard
                href="/admin/matches?status=PENDING"
                count={staleMatches}
                label="Stale Pending"
                sublabel="Unverified for 48+ hours"
                color="amber"
              />
            )}
            {pendingRegs > 0 && (
              <IssueCard
                href="/admin/liga/registrations"
                count={pendingRegs}
                label="Pending Registrations"
                sublabel="Waiting for approval"
                color="amber"
              />
            )}
          </div>
        </div>
      )}

      {/* ── TODAY & THIS WEEK ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <PulseCard
          label="New Users Today"
          value={newUsersToday}
          subvalue={`${newUsersThisWeek} this week`}
          icon="👤"
          href="/admin/players"
          highlight={newUsersToday > 0}
        />
        <PulseCard
          label="Matches Today"
          value={matchesToday}
          subvalue={`${matchesThisWeek} this week`}
          icon="🎾"
          href="/admin/matches"
          highlight={matchesToday > 0}
        />
        <PulseCard
          label="Active Disputes"
          value={disputes}
          subvalue={staleMatches > 0 ? `${staleMatches} stale` : 'None stale'}
          icon="⚠️"
          href="/admin/matches?status=DISPUTED"
          highlight={disputes > 0}
          highlightColor="red"
        />
        <PulseCard
          label="Pending Regs"
          value={pendingRegs}
          subvalue={`${activeSeasons} active season${activeSeasons !== 1 ? 's' : ''}`}
          icon="📋"
          href="/admin/liga/registrations"
          highlight={pendingRegs > 0}
          highlightColor="amber"
        />
      </div>

      {/* ── LIFETIME STATS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MiniStat label="Total Players" value={totalPlayers} href="/admin/players" />
        <MiniStat label="Total Matches" value={totalMatches} href="/admin/matches" />
        <MiniStat label="Clubs" value={totalClubs} href="/admin/clubs" />
        <MiniStat label="Push Devices" value={pushDevices} href="/admin/notifications" />
        <MiniStat label="Active Seasons" value={activeSeasons} href="/admin/liga/seasons" />
      </div>

      {/* ── RECENT SIGNUPS + RECENT MATCHES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Signups */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">New Users</h2>
            <Link
              href="/admin/players"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="card-body p-0">
            {recentSignups.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-sm">No signups yet</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentSignups.map((user: any) => (
                  <li key={user.id} className="flex items-center gap-3 px-5 py-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 overflow-hidden shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        (user.name || '?').charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* Name + provider */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name || 'Unnamed user'}
                      </p>
                      <p className="text-xs text-gray-400">
                        via {user.auth_provider || 'unknown'}
                      </p>
                    </div>
                    {/* Time ago */}
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      {timeAgo(user.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Matches</h2>
            <Link
              href="/admin/matches"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="card-body p-0">
            {recentMatches.length === 0 ? (
              <p className="text-center text-gray-400 py-10 text-sm">No matches yet</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentMatches.map((m: any) => (
                  <li key={m.id} className="px-5 py-3">
                    <div className="flex items-center justify-between mb-1">
                      {/* Players */}
                      <p className="text-sm font-medium text-gray-900 truncate flex-1">
                        {formatMatchPlayers(m.match_players)}
                      </p>
                      {/* Status badge */}
                      <span
                        className={`ml-2 shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(m.status)}`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>{formatScore(m)}</span>
                      <span>·</span>
                      <span>{m.context_type || 'ranked'}</span>
                      <span>·</span>
                      <span>{timeAgo(m.created_at)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Data Fetchers ──

async function recentMatchesQuery(supabase: any) {
  return supabase
    .from('matches')
    .select(
      `id, status, created_at, winner_side, context_type,
       score_set_1_team_a, score_set_1_team_b,
       score_set_2_team_a, score_set_2_team_b,
       score_set_3_team_a, score_set_3_team_b,
       match_players ( user_id, team_side, users:user_id ( name ) )`
    )
    .order('created_at', { ascending: false })
    .limit(10)
}

// ── Helpers ──

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMatchPlayers(matchPlayers: any[]): string {
  if (!matchPlayers || matchPlayers.length === 0) return 'Unknown players'
  const team1 = matchPlayers
    .filter((p: any) => p.team_side === 1)
    .map((p: any) => p.users?.name?.split(' ')[0] || '?')
    .join(' & ')
  const team2 = matchPlayers
    .filter((p: any) => p.team_side === 2)
    .map((p: any) => p.users?.name?.split(' ')[0] || '?')
    .join(' & ')
  return `${team1 || '?'} vs ${team2 || '?'}`
}

function formatScore(m: any): string {
  const sets: string[] = []
  if (m.score_set_1_team_a != null && m.score_set_1_team_b != null)
    sets.push(`${m.score_set_1_team_a}-${m.score_set_1_team_b}`)
  if (m.score_set_2_team_a != null && m.score_set_2_team_b != null)
    sets.push(`${m.score_set_2_team_a}-${m.score_set_2_team_b}`)
  if (m.score_set_3_team_a != null && m.score_set_3_team_b != null)
    sets.push(`${m.score_set_3_team_a}-${m.score_set_3_team_b}`)
  return sets.length > 0 ? sets.join(', ') : 'No score'
}

function statusColor(status: string): string {
  switch (status) {
    case 'VERIFIED':
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-700'
    case 'PENDING':
      return 'bg-amber-100 text-amber-700'
    case 'DISPUTED':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

// ── Sub-Components ──

function PulseCard({
  label,
  value,
  subvalue,
  icon,
  href,
  highlight,
  highlightColor = 'emerald',
}: {
  label: string
  value: number
  subvalue: string
  icon: string
  href: string
  highlight?: boolean
  highlightColor?: 'emerald' | 'red' | 'amber'
}) {
  const borderColor = highlight
    ? highlightColor === 'red'
      ? 'border-l-red-500'
      : highlightColor === 'amber'
        ? 'border-l-amber-500'
        : 'border-l-emerald-500'
    : 'border-l-gray-200'

  return (
    <Link
      href={href}
      className={`card group hover:shadow-md transition-all duration-200 border-l-4 ${borderColor}`}
    >
      <div className="card-body py-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <span className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">
            {icon}
          </span>
        </div>
        <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subvalue}</p>
      </div>
    </Link>
  )
}

function MiniStat({
  label,
  value,
  href,
}: {
  label: string
  value: number
  href: string
}) {
  return (
    <Link
      href={href}
      className="card group hover:shadow-sm transition-all duration-200"
    >
      <div className="card-body py-3 px-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value.toLocaleString()}</p>
      </div>
    </Link>
  )
}

function IssueCard({
  href,
  count,
  label,
  sublabel,
  color,
}: {
  href: string
  count: number
  label: string
  sublabel: string
  color: 'red' | 'amber'
}) {
  const bg = color === 'red' ? 'bg-white border-red-300' : 'bg-white border-amber-300'
  const textColor = color === 'red' ? 'text-red-700' : 'text-amber-700'
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm transition-all ${bg}`}
    >
      <span className={`text-2xl font-bold ${textColor}`}>{count}</span>
      <div>
        <p className={`text-sm font-semibold ${textColor}`}>{label}</p>
        <p className="text-xs text-gray-500">{sublabel}</p>
      </div>
    </Link>
  )
}
