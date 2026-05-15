import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ensureEnv, REQUIRED_SERVER_ENV } from '@/lib/utils/env'

ensureEnv(REQUIRED_SERVER_ENV)

export async function createAuthClient() {
  const cookieStore = await cookies()

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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function getAdminSession() {
  const supabase = await createAuthClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) return null
  return session
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const { createAdminClient } = await import('./admin')
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('id', userId)
    .single()
  return !!data
}