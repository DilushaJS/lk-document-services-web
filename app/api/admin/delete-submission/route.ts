import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { deleteFile } from '@/lib/r2'
import { isAdminUser } from '@/lib/supabase/admin-auth'
import { getAdminCorsHeaders, handleCorsPreFlight } from '@/lib/utils/cors'

export async function OPTIONS() {
  return handleCorsPreFlight(getAdminCorsHeaders())
}

export async function DELETE(request: NextRequest) {
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

    const { submission_id } = await request.json()

    if (!submission_id) {
      const response = NextResponse.json({ error: 'submission_id required' }, { status: 400 })
      Object.entries(getAdminCorsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    const supabase = createAdminClient()

    // 1. Get all documents for this submission
    const { data: documents } = await supabase
      .from('documents')
      .select('file_key')
      .eq('submission_id', submission_id)

    // 2. Delete files from R2
    if (documents && documents.length > 0) {
      await Promise.allSettled(
        documents.map((doc) => deleteFile(doc.file_key))
      )
    }

    // 3. Delete submission from DB (cascades to documents, payments, appointments)
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', submission_id)

    if (error) throw error

    const response = NextResponse.json({ success: true })
    Object.entries(getAdminCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response

  } catch (error: any) {
    console.error('Delete submission error:', error?.message ?? error)
    const response = NextResponse.json(
      { error: 'Could not delete submission.' },
      { status: 500 }
    )
    Object.entries(getAdminCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }
}