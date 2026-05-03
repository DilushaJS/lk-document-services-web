'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string
  const from = formData.get('from') as string || '/admin/dashboard'

  const supabase = createAdminClient()
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? 'unknown'
  const userAgent = headersList.get('user-agent') ?? 'unknown'

  // Check recent failed attempts from this IP
  const windowStart = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000).toISOString()

  const { count } = await supabase
    .from('admin_login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('success', false)
    .eq('ip_address', ip)
    .gte('attempted_at', windowStart)

  if ((count ?? 0) >= MAX_ATTEMPTS) {
    redirect('/admin-login?error=locked')
  }

  const adminPassword = process.env.ADMIN_PASSWORD ?? ''
  const isCorrect = password && adminPassword && password === adminPassword

  // Log the attempt
  await supabase.from('admin_login_attempts').insert({
    success: isCorrect,
    ip_address: ip,
    user_agent: userAgent,
  })

  if (!isCorrect) {
    redirect('/admin-login?error=1')
  }

  // Set hardened cookie with exact same settings we use in middleware
  const cookieStore = await cookies()
  cookieStore.set('admin_auth', adminPassword, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/admin',
  })

  console.log('✅ Admin login successful for:', ip)
  redirect(from)
}

export async function adminLogout() {
  const cookieStore = await cookies()
  // Delete with same attributes as it was set
  cookieStore.set('admin_auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // This deletes the cookie
    path: '/admin',
  })
  redirect('/admin-login')
}