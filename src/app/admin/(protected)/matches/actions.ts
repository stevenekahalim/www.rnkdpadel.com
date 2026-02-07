'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function voidMatch(
  matchId: string,
  reason: string,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!matchId || !reason || !adminId) {
      return {
        success: false,
        error: 'Missing required fields: matchId, reason, and adminId',
      }
    }

    const supabase = createAdminClient()

    // Call the RPC function to void the match
    const { error } = await supabase.rpc('admin_void_match', {
      p_match_id: matchId,
      p_reason: reason,
      p_admin_id: adminId,
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'Failed to void match',
      }
    }

    // Revalidate the matches page
    revalidatePath('/admin/matches')
    revalidatePath('/admin/dashboard')

    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return {
      success: false,
      error: message,
    }
  }
}
