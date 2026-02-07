import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import { PlayerDetailClient } from './player-detail-client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PlayerDetailPage({ params }: { params: { id: string } }) {
  const supabase = createAdminClient()
  const userId = params.id

  const [userRes, profileRes, achievementsRes, auditRes, membershipRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('player_achievements').select('*').eq('user_id', userId).order('achievement_date', { ascending: false }),
    supabase.from('mmr_audit_log').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    supabase.from('organization_members').select('*, organizations(id, name, liga)').eq('user_id', userId).eq('status', 'active').single(),
  ])

  const user = userRes.data
  if (!user) {
    return (
      <div className="p-8">
        <PageHeader title="Player Not Found" />
        <Link href="/admin/players" className="btn-secondary">← Back</Link>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={user.name || 'Unknown Player'}
        description={`${user.phone || ''} ${user.email || ''}`}
        action={<Link href="/admin/players" className="btn-secondary">← Back to Players</Link>}
      />
      <PlayerDetailClient
        user={user}
        profile={profileRes.data}
        achievements={achievementsRes.data || []}
        auditLog={auditRes.data || []}
        membership={membershipRes.data}
      />
    </div>
  )
}
