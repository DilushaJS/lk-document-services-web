'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function adminLogin(formData: FormData) {
  const password = formData.get('password') as string
  const from = formData.get('from') as string || '/admin/dashboard'

  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set('admin_auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    redirect(from)
  }

  redirect(`/admin-login?error=1`)
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
  redirect('/admin-login')
}