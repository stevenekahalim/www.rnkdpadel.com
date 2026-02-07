'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'

export async function verifyAdminRole(userId: string): Promise<boolean> {
  try {
    const admin = createAdminClient()
    const { data: userData, error } = await admin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    return !error && userData?.role === 'admin'
  } catch {
    return false
  }
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
