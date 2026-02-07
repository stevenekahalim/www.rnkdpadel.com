import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import { RegistrationsClient } from './registrations-client'

export const dynamic = 'force-dynamic'

export default async function RegistrationsPage({ searchParams }: { searchParams: { seasonId?: string } }) {
  const supabase = createAdminClient()

  const { data: seasons } = await supabase
    .from('liga_seasons')
    .select('id, name, liga, status')
    .in('status', ['upcoming', 'registration', 'active'])
    .order('created_at', { ascending: false })

  const selectedSeasonId = searchParams.seasonId || seasons?.[0]?.id

  let registrations: any[] = []
  if (selectedSeasonId) {
    const { data } = await supabase
      .from('liga_registrations')
      .select('*, organizations(id, name, captain_id, liga, users:captain_id(id, name, phone, email))')
      .eq('season_id', selectedSeasonId)
      .order('registered_at', { ascending: false })
    registrations = data || []
  }

  return (
    <div>
      <PageHeader title="Liga Registrations" description="Approve club registrations and track payments" />
      <RegistrationsClient seasons={seasons || []} registrations={registrations} selectedSeasonId={selectedSeasonId || ''} />
    </div>
  )
}
