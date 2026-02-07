import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PBPI_COLORS: Record<string, string> = {
  beginner: 'badge-gray', low_bronze: 'badge-yellow', high_bronze: 'badge-yellow',
  low_silver: 'badge-blue', high_silver: 'badge-blue', gold: 'badge-green', platinum: 'badge-green',
}

export default async function PlayersPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createAdminClient()
  const query = searchParams.q || ''

  let q = supabase
    .from('users')
    .select('id, name, phone, email, user_profiles(mmr, games_played, wins, losses, pbpi_grading)')
    .order('name')
    .limit(50)

  if (query) {
    q = q.or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
  }

  const { data: players } = await q

  return (
    <div>
      <PageHeader title="Players" description="Search and manage player profiles" />

      {/* Search */}
      <form className="mb-6">
        <div className="flex gap-2 max-w-md">
          <input name="q" className="form-input" placeholder="Search by name or phone..." defaultValue={query} />
          <button type="submit" className="btn-primary">Search</button>
          {query && <Link href="/admin/players" className="btn-secondary">Clear</Link>}
        </div>
      </form>

      {/* Players table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Phone</th><th>MMR</th><th>PBPI</th><th>Games</th><th>Win %</th><th>Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {(players || []).map((p: any) => {
                const profile = Array.isArray(p.user_profiles) ? p.user_profiles[0] : p.user_profiles
                const winRate = profile && profile.games_played > 0
                  ? Math.round((profile.wins / profile.games_played) * 100)
                  : 0
                return (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name || '—'}</td>
                    <td className="text-gray-500 text-sm">{p.phone || '—'}</td>
                    <td className="font-mono font-bold">{profile?.mmr ?? '—'}</td>
                    <td>
                      {profile?.pbpi_grading ? (
                        <span className={`badge ${PBPI_COLORS[profile.pbpi_grading] || 'badge-gray'}`}>
                          {profile.pbpi_grading.replace('_', ' ')}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td>{profile?.games_played ?? 0}</td>
                    <td>{winRate}%</td>
                    <td><Link href={`/admin/players/${p.id}`} className="btn-secondary btn-sm">View</Link></td>
                  </tr>
                )
              })}
              {(!players || players.length === 0) && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-8">{query ? 'No players found' : 'Search for a player'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
