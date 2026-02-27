export const dynamic = 'force-dynamic'

import { createAdminClient } from '@/lib/supabase-admin'
import { PageHeader } from '@/components/page-header'
import { AchievementsClient } from './achievements-client'

export default async function AchievementsPage() {
  const supabase = createAdminClient()

  const { data: achievements } = await supabase
    .from('player_achievements')
    .select(
      `
      id,
      user_id,
      tournament_name,
      finish_position,
      finish_rank,
      achievement_date,
      display_text,
      is_featured,
      is_hidden,
      notes,
      created_at
    `,
    )
    .order('achievement_date', { ascending: false })
    .limit(200)

  // Get user names for display
  const userIds = Array.from(new Set((achievements || []).map((a: any) => a.user_id)))
  const { data: users } =
    userIds.length > 0
      ? await supabase.from('users').select('id, name, avatar_url').in('id', userIds)
      : { data: [] }

  const userMap = Object.fromEntries((users || []).map((u: any) => [u.id, u]))

  // Get unique tournament names for the dropdown
  const tournamentNames = Array.from(
    new Set((achievements || []).map((a: any) => a.tournament_name)),
  ).sort()

  return (
    <div>
      <PageHeader
        title="Player Achievements"
        description="Browse tournament results and player trophies"
      />
      <AchievementsClient
        achievements={(achievements || []).map((a: any) => ({
          ...a,
          user_name: userMap[a.user_id]?.name || 'Unknown',
          user_avatar: userMap[a.user_id]?.avatar_url || null,
        }))}
        tournamentNames={tournamentNames}
      />
    </div>
  )
}
