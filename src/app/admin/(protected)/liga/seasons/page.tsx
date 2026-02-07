import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import { SeasonsClient } from './seasons-client'

export const dynamic = 'force-dynamic'

export default async function SeasonsPage() {
  const supabase = createAdminClient()
  const { data: seasons } = await supabase
    .from('liga_seasons')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader title="Liga Seasons" description="Manage liga seasons and configurations" />
      <SeasonsClient seasons={seasons || []} />
    </div>
  )
}
