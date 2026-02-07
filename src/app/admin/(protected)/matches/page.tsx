import { createAdminClient } from '@/lib/supabase-admin'
import { getAdminUser } from '@/lib/supabase-server'
import { PageHeader } from '@/components/page-header'
import { MatchesClient } from './matches-client'

export const dynamic = 'force-dynamic'

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: { status?: string; type?: string; from?: string; to?: string; search?: string }
}) {
  const supabase = createAdminClient()
  const adminUser = await getAdminUser()

  const status = searchParams.status || 'all'
  const type = searchParams.type || 'all'
  const fromDate = searchParams.from || null
  const toDate = searchParams.to || null
  const search = searchParams.search || null

  // Build query
  let query = supabase
    .from('matches')
    .select(
      `
      id,
      type,
      status,
      context_type,
      context_id,
      winner_side,
      logged_by_user_id,
      created_at,
      voided_at,
      voided_by,
      voided_reason,
      score_set_1_team_1,
      score_set_1_team_2,
      score_set_2_team_1,
      score_set_2_team_2,
      score_set_3_team_1,
      score_set_3_team_2,
      match_players(user_id, team_side, slot_position, mmr_before, mmr_after, mmr_change, users:user_id(id, name, phone))
      `
    )

  // Apply filters
  if (status !== 'all') {
    query = query.eq('status', status)
  }
  if (type !== 'all') {
    query = query.eq('context_type', type)
  }
  if (fromDate) {
    query = query.gte('created_at', `${fromDate}T00:00:00`)
  }
  if (toDate) {
    query = query.lte('created_at', `${toDate}T23:59:59`)
  }

  query = query.order('created_at', { ascending: false }).limit(50)

  const { data, error } = await query

  // Filter by player name if search provided
  let matches = data || []
  if (search) {
    const searchLower = search.toLowerCase()
    matches = matches.filter((match: any) => {
      if (!match.match_players) return false
      return match.match_players.some((mp: any) =>
        mp.users?.name?.toLowerCase().includes(searchLower)
      )
    })
  }

  // Build serializable player map for client
  const playerMap: Record<string, { team1: { id: string; name: string }[]; team2: { id: string; name: string }[] }> = {}
  matches.forEach((match: any) => {
    if (match.match_players) {
      const team1: { id: string; name: string }[] = []
      const team2: { id: string; name: string }[] = []

      match.match_players.forEach((mp: any) => {
        if (mp.users) {
          if (mp.team_side === 1) {
            team1.push({ id: mp.users.id, name: mp.users.name })
          } else {
            team2.push({ id: mp.users.id, name: mp.users.name })
          }
        }
      })

      playerMap[match.id] = { team1, team2 }
    }
  })

  return (
    <div>
      <PageHeader
        title="Match Management"
        description="View and manage all matches"
      />

      <MatchesClient
        matches={matches as any[]}
        playerMap={playerMap}
        adminId={adminUser?.id || ''}
        filters={{ status, type, fromDate, toDate, search }}
        fetchError={error?.message || null}
      />
    </div>
  )
}
