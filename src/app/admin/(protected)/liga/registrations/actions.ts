'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

export async function updateRegistrationStatus(id: string, status: 'approved' | 'rejected') {
  const supabase = createAdminClient()
  const update: any = { status }
  if (status === 'approved') update.approved_at = new Date().toISOString()
  const { error } = await supabase.from('liga_registrations').update(update).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/liga/registrations')
  return { success: true }
}

export async function updatePaymentStatus(id: string, paymentStatus: 'unpaid' | 'paid' | 'waived') {
  const supabase = createAdminClient()
  const { error } = await supabase.from('liga_registrations').update({ payment_status: paymentStatus }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/liga/registrations')
  return { success: true }
}

export async function updateAdminNotes(id: string, notes: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('liga_registrations').update({ admin_notes: notes }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/liga/registrations')
  return { success: true }
}
