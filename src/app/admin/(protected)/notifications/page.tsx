export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import { NotificationsClient } from './notifications-client'

export default async function NotificationsPage() {
  const supabase = createAdminClient()

  // Get recent notifications sent (last 50)
  const { data: recentNotifications } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, body, screen, created_at')
    .eq('type', 'league_update')
    .order('created_at', { ascending: false })
    .limit(50)

  // Get stats
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: activePushTokens } = await supabase
    .from('push_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: ligaPlayers } = await supabase
    .from('liga_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  return (
    <div>
      <PageHeader title="Notifications" description="View sent push notifications log" />
      <NotificationsClient
        recentNotifications={recentNotifications || []}
        stats={{
          totalUsers: totalUsers || 0,
          activePushTokens: activePushTokens || 0,
          ligaPlayers: ligaPlayers || 0,
        }}
      />
    </div>
  )
}
