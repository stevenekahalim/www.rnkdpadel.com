import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import { StandingsClient } from './standings-client'

export const dynamic = 'force-dynamic'

export default async function StandingsPage({ searchParams }: { searchParams: { seasonId?: string } }) {
  const supabase = createAdminClient()

  const { data: seasons } = await supabase
    .from('liga_seasons')
    .select('id, name, liga, status')
    .order('created_at', { ascending: false })

  const selectedSeasonId = searchParams.seasonId || seasons?.[0]?.id
  let standings: any[] = []

  if (selectedSeasonId) {
    const { data } = await supabase
      .from('liga_standings')
      .select('*, organizations(id, name, logo_url)')
      .eq('season_id', selectedSeasonId)
      .order('position', { ascending: true })
    standings = data || []
  }

  const selectedSeason = seasons?.find((s: any) => s.id === selectedSeasonId)

  return (
    <div>
      <PageHeader title="Liga Standings" description="Auto-calculated league tables (read-only)" />
      <StandingsClient seasons={seasons || []} standings={standings} selectedSeasonId={selectedSeasonId || ''} selectedSeason={selectedSeason} />
    </div>
  )
}
