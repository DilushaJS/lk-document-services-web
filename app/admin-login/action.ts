'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAuthClient } from '@/lib/supabase/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'

export async function adminLogin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const from = formData.get('from') as string || '/admin/dashboard'

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? 'unknown'
  const userAgent = headersList.get('user-agent') ?? 'unknown'

  const supabaseAdmin = createAdminClient()

  // Check recent failed attempts
  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString()
  const { count } = await supabaseAdmin
    .from('admin_login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('success', false)
    .eq('ip_address', ip)
    .gte('attempted_at', windowStart)

  if ((count ?? 0) >= 5) {
    redirect('/admin-login?error=locked')
  }

  // Attempt Supabase Auth sign in
  const supabase = await createAuthClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  const isCorrect = !error && !!data.session

  // Log attempt
  await supabaseAdmin.from('admin_login_attempts').insert({
    success: isCorrect,
    ip_address: ip,
    user_agent: userAgent,
  })

  if (!isCorrect) {
    // Generic error to avoid revealing whether the email exists
    redirect('/admin-login?error=invalid')
  }

  // Verify user is in admin_users table
  const { data: adminUser } = await supabaseAdmin
    .from('admin_users')
    .select('role')
    .eq('id', data.user!.id)
    .single()

  if (!adminUser) {
    // Sign out and show a generic error (do not reveal admin existence)
    await supabase.auth.signOut()
    redirect('/admin-login?error=invalid')
  }

  redirect(from)
}

export async function adminLogout() {
  const supabase = await createAuthClient()
  await supabase.auth.signOut()
  redirect('/admin-login')
}