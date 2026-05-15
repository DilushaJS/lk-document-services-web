import { NextRequest, NextResponse } from 'next/server'
import { getSignedDownloadUrl } from '@/lib/r2'
import { createServerClient } from '@supabase/ssr'
import { isAdminUser } from '@/lib/supabase/admin-auth'
import { getAdminCorsHeaders, handleCorsPreFlight } from '@/lib/utils/cors'
import { z } from 'zod'

const schema = z.object({
  file_key: z.string().min(1),
})

export async function OPTIONS() {
  return handleCorsPreFlight(getAdminCorsHeaders())
}

export async function POST(request: NextRequest) {
  try {
    // Auth check: Verify user has valid admin session
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll() {},
        },
      }
    )

    const { data: { session } } = await supabaseAuth.auth.getSession()
    if (!session?.user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      Object.entries(getAdminCorsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    // Verify user is admin
    const isAdmin = await isAdminUser(session.user.id)
    if (!isAdmin) {
      const response = NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      Object.entries(getAdminCorsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    const body = await request.json()
    const validated = schema.safeParse(body)

    if (!validated.success) {
      const response = NextResponse.json(
        { error: 'file_key is required' },
        { status: 400 }
      )
      Object.entries(getAdminCorsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    // Generate signed URL valid for 1 hour
    const url = await getSignedDownloadUrl(validated.data.file_key, 3600)

    const response = NextResponse.json({ url })
    Object.entries(getAdminCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response

  } catch (error) {
    console.error('Signed URL error:', error)
    const response = NextResponse.json(
      { error: 'Could not generate download link.' },
      { status: 500 }
    )
    Object.entries(getAdminCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }
}