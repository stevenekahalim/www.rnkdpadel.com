import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import { ClubsClient } from './clubs-client'

export const dynamic = 'force-dynamic'

export default async function ClubsPage() {
  const supabase = createAdminClient()

  const { data: clubs } = await supabase
    .from('organizations')
    .select('id, name, liga, captain_id, province, status, logo_url, users:captain_id(id, name, phone)')
    .order('name')

  // Get member counts
  const { data: memberCounts } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('status', 'active')

  const countMap: Record<string, number> = {}
  memberCounts?.forEach((m: any) => {
    countMap[m.organization_id] = (countMap[m.organization_id] || 0) + 1
  })

  const enriched = (clubs || []).map((c: any) => ({ ...c, memberCount: countMap[c.id] || 0 }))

  return (
    <div>
      <PageHeader title="Clubs" description="Manage club liga assignments" />
      <ClubsClient clubs={enriched} />
    </div>
  )
}
