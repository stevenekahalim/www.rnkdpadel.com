'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function updatePbpiGrading(userId: string, grading: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('user_profiles').update({ pbpi_grading: grading }).eq('user_id', userId)
  if (error) return { error: error.message }
  revalidatePath(`/admin/players/${userId}`)
  return { success: true }
}

export async function addAchievement(formData: FormData) {
  const supabase = createAdminClient()
  const tournamentName = formData.get('tournament_name') as string
  const { error } = await supabase.from('player_achievements').insert({
    user_id: formData.get('user_id') as string,
    tournament_name: tournamentName,
    tournament_slug: slugify(tournamentName),
    achievement_date: formData.get('achievement_date') as string,
    finish_position: formData.get('finish_position') as string,
    display_text: formData.get('display_text') as string || null,
    is_featured: formData.get('is_featured') === 'on',
    created_by: formData.get('admin_id') as string || null,
  })
  if (error) return { error: error.message }
  revalidatePath(`/admin/players/${formData.get('user_id')}`)
  return { success: true }
}

export async function deleteAchievement(id: string, userId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('player_achievements').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/players/${userId}`)
  return { success: true }
}
