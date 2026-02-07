import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createAdminClient()

  // Fetch stats in parallel
  const [playersRes, seasonsRes, clubsRes, disputesRes, recentMatchesRes] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('liga_seasons').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('organizations').select('*', { count: 'exact', head: true }),
    supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'DISPUTED'),
    supabase
      .from('matches')
      .select('id, status, created_at, winner_side, context_type')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const totalPlayers = playersRes.count ?? 0
  const activeSeasons = seasonsRes.count ?? 0
  const totalClubs = clubsRes.count ?? 0
  const pendingDisputes = disputesRes.count ?? 0
  const recentMatches = recentMatchesRes.data ?? []

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of RNKD Padel platform" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Players" value={totalPlayers} icon="👥" />
        <StatCard label="Active Seasons" value={activeSeasons} icon="🏆" />
        <StatCard label="Total Clubs" value={totalClubs} icon="🏢" />
        <StatCard
          label="Pending Disputes"
          value={pendingDisputes}
          icon="⚠️"
          description={pendingDisputes > 0 ? 'Needs attention' : 'All clear'}
        />
      </div>

      {/* Recent Matches */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Recent Matches</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Winner</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentMatches.map((match: any) => (
                <tr key={match.id}>
                  <td className="font-mono text-xs">{match.id.slice(0, 8)}...</td>
                  <td>
                    <span className="badge badge-blue">
                      {match.context_type || 'ranked'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      match.status === 'VERIFIED' ? 'badge-green' :
                      match.status === 'PENDING' ? 'badge-yellow' :
                      match.status === 'DISPUTED' ? 'badge-red' :
                      match.status === 'VOIDED' ? 'badge-gray' : 'badge-gray'
                    }`}>
                      {match.status}
                    </span>
                  </td>
                  <td>{match.winner_side ? `Team ${match.winner_side}` : '—'}</td>
                  <td className="text-gray-500 text-xs">
                    {new Date(match.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
              {recentMatches.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-400 py-8">No matches yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
