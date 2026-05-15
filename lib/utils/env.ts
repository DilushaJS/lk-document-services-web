export function ensureEnv(keys: string[]) {
  const missing: string[] = []
  for (const k of keys) {
    if (!process.env[k]) missing.push(k)
  }

  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`
    console.error(msg)
    throw new Error(msg)
  }
}

export const REQUIRED_SERVER_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
]

export const REQUIRED_STRIPE_ENV = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
]
