export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import { TournamentsClient } from './tournaments-client'

export default async function TournamentsPage() {
  const supabase = createAdminClient()

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select(
      'id, name, slug, venue_name, start_date, end_date, format, team_size, max_teams, status, is_ranked, created_at',
    )
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        title="Tournaments"
        description="Browse registered tournaments"
      />
      <TournamentsClient tournaments={tournaments || []} />
    </div>
  )
}
