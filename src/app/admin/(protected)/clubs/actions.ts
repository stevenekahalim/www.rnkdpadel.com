'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function updateClubLiga(orgId: string, liga: string | null) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('organizations').update({ liga }).eq('id', orgId)
  if (error) return { error: error.message }
  revalidatePath('/admin/clubs')
  return { success: true }
}
