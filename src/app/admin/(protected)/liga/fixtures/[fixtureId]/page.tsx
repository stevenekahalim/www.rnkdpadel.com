import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import { PlayerAssignment } from '../player-assignment'
import { ScoreEntry } from '../score-entry'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function FixtureDetailPage({ params }: { params: { fixtureId: string } }) {
  const supabase = createAdminClient()
  const fixtureId = params.fixtureId

  // Fetch fixture with club names
  const { data: fixture } = await supabase
    .from('liga_fixtures')
    .select('*, home_club:home_club_id(id, name), away_club:away_club_id(id, name), liga_seasons(id, name, liga)')
    .eq('id', fixtureId)
    .single()

  if (!fixture) {
    return (
      <div>
        <PageHeader title="Fixture Not Found" />
        <Link href="/admin/liga/fixtures" className="btn-secondary">← Back</Link>
      </div>
    )
  }

  // Fetch liga matches for this fixture
  const { data: matches } = await supabase
    .from('liga_matches')
    .select('*')
    .eq('fixture_id', fixtureId)
    .order('match_number')

  // Fetch home club members
  const { data: homeMembers } = await supabase
    .from('organization_members')
    .select('user_id, users:user_id(id, name)')
    .eq('organization_id', fixture.home_club_id)
    .eq('status', 'active')

  // Fetch away club members
  const { data: awayMembers } = await supabase
    .from('organization_members')
    .select('user_id, users:user_id(id, name)')
    .eq('organization_id', fixture.away_club_id)
    .eq('status', 'active')

  const homePlayers = (homeMembers || []).map((m: any) => ({
    id: m.user_id,
    name: m.users?.name || 'Unknown',
  }))
  const awayPlayers = (awayMembers || []).map((m: any) => ({
    id: m.user_id,
    name: m.users?.name || 'Unknown',
  }))

  const homeClub = (fixture as any).home_club
  const awayClub = (fixture as any).away_club

  // Determine state
  const hasPlayers = (matches || []).some((m: any) => m.home_player1_id)
  const allCompleted = (matches || []).every((m: any) => m.status === 'completed')

  // Build fixture object matching component interfaces
  const fixtureForComponents = {
    id: fixtureId,
    home_club_name: homeClub?.name || '',
    away_club_name: awayClub?.name || '',
  }

  // Build playerMap for ScoreEntry: { [playerId]: playerName }
  const allPlayers = [...homePlayers, ...awayPlayers]
  const playerMap: Record<string, string> = {}
  allPlayers.forEach((p) => {
    playerMap[p.id] = p.name
  })

  return (
    <div>
      <PageHeader
        title={`${homeClub?.name || '?'} vs ${awayClub?.name || '?'}`}
        description={`Gameweek ${fixture.gameweek} · ${fixture.scheduled_date || 'TBD'} · ${fixture.venue_name || 'TBD'}`}
        action={
          <Link href={`/admin/liga/fixtures?seasonId=${fixture.season_id}`} className="btn-secondary">
            ← Back to Fixtures
          </Link>
        }
      />

      {/* Status */}
      <div className="mb-6 flex gap-3">
        <span className={`badge ${
          fixture.status === 'completed' ? 'badge-green' :
          fixture.status === 'in_progress' ? 'badge-yellow' : 'badge-blue'
        }`}>
          {fixture.status}
        </span>
        {allCompleted && (
          <span className="text-lg font-bold">
            {fixture.home_matches_won} - {fixture.away_matches_won}
          </span>
        )}
      </div>

      {/* Player Assignment */}
      {!allCompleted && (
        <div className="mb-8">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">
                {hasPlayers ? '✓ Player Assignment' : '1. Assign Players'}
              </h2>
            </div>
            <div className="card-body">
              <PlayerAssignment
                fixture={fixtureForComponents}
                matches={matches || []}
                homeMembers={homePlayers}
                awayMembers={awayPlayers}
              />
            </div>
          </div>
        </div>
      )}

      {/* Score Entry */}
      {hasPlayers && (
        <div className="mb-8">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold">
                {allCompleted ? '✓ Match Results' : '2. Enter Scores'}
              </h2>
            </div>
            <div className="card-body">
              <ScoreEntry
                fixture={fixtureForComponents}
                matches={matches || []}
                playerMap={playerMap}
              />
            </div>
          </div>
        </div>
      )}

      {!hasPlayers && (
        <div className="card">
          <div className="card-body text-center text-gray-400 py-12">
            Assign players first before entering scores
          </div>
        </div>
      )}
    </div>
  )
}
