import { AdminLoginForm } from '@/components/admin/AdminLoginForm'


const LOCKOUT_MINUTES = 15

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; from?: string }>
}) {
  const params = await searchParams

  return (
    <AdminLoginForm
      from={params.from || '/admin/dashboard'}
      error={params.error}
      lockoutMinutes={LOCKOUT_MINUTES}
    />
  )
}