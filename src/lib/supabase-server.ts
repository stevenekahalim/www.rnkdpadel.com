import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from './supabase-admin'

interface AdminUser {
  id: string
  email?: string
  name: string
  phone: string
  role: 'admin'
}

export async function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // ignore errors during SSR
          }
        },
      },
    }
  )
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Verify admin role using service_role client
  const admin = createAdminClient()
  const { data: userData, error } = await admin
    .from('users')
    .select('id, name, phone, email, role')
    .eq('id', user.id)
    .single()

  if (error || !userData || userData.role !== 'admin') return null
  
  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    phone: userData.phone,
    role: 'admin',
  }
}
