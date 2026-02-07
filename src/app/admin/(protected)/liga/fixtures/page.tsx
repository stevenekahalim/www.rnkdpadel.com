import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import { AddFixtureButton } from './add-fixture-button'
import Link from 'next/link'

interface Season {
  id: string
  name: string
  slug: string
  liga: 'liga1' | 'liga1_women' | 'liga2'
  status: string
}

interface Organization {
  id: string
  name: string
}

interface Fixture {
  id: string
  season_id: string
  home_club_id: string
  away_club_id: string
  gameweek: number
  scheduled_date: string
  scheduled_time: string
  venue_name: string
  status: 'scheduled' | 'in_progress' | 'completed'
  home_matches_won: number | null
  away_matches_won: number | null
  home_club: Organization
  away_club: Organization
}

async function fetchSeasons(): Promise<Season[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('liga_seasons')
    .select('id, name, slug, liga, status')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch seasons:', error)
    return []
  }

  return data || []
}

async function fetchFixtures(seasonId: string): Promise<Fixture[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('liga_fixtures')
    .select(
      `
      id,
      season_id,
      home_club_id,
      away_club_id,
      gameweek,
      scheduled_date,
      scheduled_time,
      venue_name,
      status,
      home_matches_won,
      away_matches_won,
      home_club:organizations!home_club_id(id, name),
      away_club:organizations!away_club_id(id, name)
      `
    )
    .eq('season_id', seasonId)
    .order('gameweek', { ascending: true })

  if (error) {
    console.error('Failed to fetch fixtures:', error)
    return []
  }

  // Supabase returns joined relations with correct shape but TS infers arrays
  return (data as unknown as Fixture[]) || []
}

async function fetchClubs(): Promise<Organization[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('status', 'active')
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch clubs:', error)
    return []
  }

  return data || []
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'badge-green'
    case 'in_progress':
      return 'badge-blue'
    case 'scheduled':
      return 'badge-yellow'
    default:
      return 'badge-gray'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'Scheduled'
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    default:
      return status
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: { seasonId?: string }
}) {
  const seasons = await fetchSeasons()
  const selectedSeasonId = searchParams.seasonId || seasons[0]?.id
  const fixtures = selectedSeasonId ? await fetchFixtures(selectedSeasonId) : []
  const clubs = await fetchClubs()

  const selectedSeason = seasons.find((s) => s.id === selectedSeasonId)

  // Group fixtures by gameweek
  const fixturesByGameweek = fixtures.reduce(
    (acc, fixture) => {
      if (!acc[fixture.gameweek]) {
        acc[fixture.gameweek] = []
      }
      acc[fixture.gameweek].push(fixture)
      return acc
    },
    {} as Record<number, Fixture[]>
  )

  const sortedGameweeks = Object.keys(fixturesByGameweek)
    .map(Number)
    .sort((a, b) => a - b)

  // Group seasons by liga type
  const seasonsByLiga = seasons.reduce(
    (acc, season) => {
      if (!acc[season.liga]) {
        acc[season.liga] = []
      }
      acc[season.liga].push(season)
      return acc
    },
    {} as Record<string, Season[]>
  )

  const ligaLabels = {
    liga1: 'Liga 1',
    liga1_women: 'Liga 1 Women',
    liga2: 'Liga 2',
  }

  return (
    <div>
      <PageHeader
        title="Fixtures & Scores"
        description="Manage liga fixtures and match scores. This is the core interface for liga management."
      />

      {/* Season Selector */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Select Season
          </h2>
        </div>
        <div className="card-body space-y-4">
          {Object.entries(seasonsByLiga).map(([liga, seasonList]) => (
            <div key={liga}>
              <p className="text-xs font-medium text-gray-600 uppercase mb-2">
                {ligaLabels[liga as keyof typeof ligaLabels]}
              </p>
              <div className="flex flex-wrap gap-2">
                {seasonList.map((season) => (
                  <Link
                    key={season.id}
                    href={`/admin/liga/fixtures?seasonId=${season.id}`}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      selectedSeasonId === season.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {season.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!selectedSeasonId ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-gray-500">Select a season to view fixtures</p>
          </div>
        </div>
      ) : (
        <>
          {/* Fixtures by Gameweek */}
          <div className="space-y-6">
            {sortedGameweeks.length === 0 ? (
              <div className="card">
                <div className="card-body text-center py-12">
                  <p className="text-gray-500 mb-4">No fixtures yet for {selectedSeason?.name}</p>
                </div>
              </div>
            ) : (
              sortedGameweeks.map((gameweek) => {
                const gameweekFixtures = fixturesByGameweek[gameweek]

                return (
                  <div key={gameweek} className="card">
                    <div className="card-header flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Gameweek {gameweek}
                      </h2>
                      <AddFixtureButton
                        seasonId={selectedSeasonId}
                        gameweek={gameweek}
                        clubs={clubs}
                      />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Home</th>
                            <th>Away</th>
                            <th>Date & Time</th>
                            <th>Venue</th>
                            <th>Status</th>
                            <th>Score</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {gameweekFixtures.map((fixture) => {
                            const hasScore = fixture.home_matches_won !== null && fixture.away_matches_won !== null
                            const scoreDisplay = hasScore
                              ? `${fixture.home_matches_won}-${fixture.away_matches_won}`
                              : '—'

                            return (
                              <tr key={fixture.id}>
                                <td className="font-medium text-gray-900">
                                  {fixture.home_club?.name}
                                </td>
                                <td className="font-medium text-gray-900">
                                  {fixture.away_club?.name}
                                </td>
                                <td className="text-sm text-gray-600">
                                  {formatDate(fixture.scheduled_date)} at {fixture.scheduled_time}
                                </td>
                                <td className="text-sm text-gray-600">
                                  {fixture.venue_name}
                                </td>
                                <td>
                                  <span
                                    className={`badge ${getStatusBadgeClass(
                                      fixture.status
                                    )}`}
                                  >
                                    {getStatusLabel(fixture.status)}
                                  </span>
                                </td>
                                <td className="font-mono text-sm font-medium">
                                  {scoreDisplay}
                                </td>
                                <td className="space-x-2">
                                  <Link
                                    href={`/admin/liga/fixtures/${fixture.id}`}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    Manage
                                  </Link>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Season info */}
          <div className="mt-6 text-center text-sm text-gray-400">
            {selectedSeason?.name} — {fixtures.length} fixture(s) across {sortedGameweeks.length} gameweek(s)
          </div>
        </>
      )}
    </div>
  )
}
