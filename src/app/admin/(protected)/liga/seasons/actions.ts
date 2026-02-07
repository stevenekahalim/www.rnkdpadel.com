'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function createSeason(formData: FormData) {
  const supabase = createAdminClient()
  const name = formData.get('name') as string
  const { error } = await supabase.from('liga_seasons').insert({
    name,
    slug: slugify(name),
    season_number: parseInt(formData.get('season_number') as string) || 1,
    liga: formData.get('liga') as string,
    province: (formData.get('province') as string) || 'East Java',
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    registration_deadline: (formData.get('registration_deadline') as string) || null,
    status: (formData.get('status') as string) || 'upcoming',
    matches_per_fixture: parseInt(formData.get('matches_per_fixture') as string) || 4,
    sets_per_match: parseInt(formData.get('sets_per_match') as string) || 3,
    games_per_set: parseInt(formData.get('games_per_set') as string) || 6,
    description: (formData.get('description') as string) || null,
    sponsor_name: (formData.get('sponsor_name') as string) || null,
    banner_url: (formData.get('banner_url') as string) || null,
    sponsor_logo_url: (formData.get('sponsor_logo_url') as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/liga/seasons')
  return { success: true }
}

export async function updateSeason(id: string, formData: FormData) {
  const supabase = createAdminClient()
  const name = formData.get('name') as string
  const { error } = await supabase.from('liga_seasons').update({
    name,
    slug: slugify(name),
    season_number: parseInt(formData.get('season_number') as string) || 1,
    liga: formData.get('liga') as string,
    province: (formData.get('province') as string) || 'East Java',
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    registration_deadline: (formData.get('registration_deadline') as string) || null,
    status: formData.get('status') as string,
    matches_per_fixture: parseInt(formData.get('matches_per_fixture') as string) || 4,
    sets_per_match: parseInt(formData.get('sets_per_match') as string) || 3,
    games_per_set: parseInt(formData.get('games_per_set') as string) || 6,
    description: (formData.get('description') as string) || null,
    sponsor_name: (formData.get('sponsor_name') as string) || null,
    banner_url: (formData.get('banner_url') as string) || null,
    sponsor_logo_url: (formData.get('sponsor_logo_url') as string) || null,
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/liga/seasons')
  return { success: true }
}

export async function updateSeasonStatus(id: string, status: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('liga_seasons').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/liga/seasons')
  return { success: true }
}
