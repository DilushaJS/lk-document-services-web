import { createClient } from '@supabase/supabase-js'
import { ensureEnv, REQUIRED_SERVER_ENV } from '@/lib/utils/env'

ensureEnv(REQUIRED_SERVER_ENV)

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}