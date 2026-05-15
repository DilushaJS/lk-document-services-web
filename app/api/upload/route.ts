import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerClient } from '@supabase/ssr'
import { isAdminUser } from '@/lib/supabase/admin-auth'
import { getPublicCorsHeaders, handleCorsPreFlight } from '@/lib/utils/cors'
import { uploadFile, generateFileKey } from '@/lib/r2'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function OPTIONS() {
  return handleCorsPreFlight(getPublicCorsHeaders())
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const file = formData.get('file') as File | null
    const submissionId = formData.get('submission_id') as string | null
    const clientId = formData.get('client_id') as string | null
    const clientEmail = formData.get('client_email') as string | null
    const documentType = formData.get('document_type') as string | null
    const description = formData.get('description') as string | null

    if (!file || !submissionId) {
      const response = NextResponse.json(
        { error: 'Missing required fields: file, submission_id' },
        { status: 400 }
      )
      Object.entries(getPublicCorsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    // Auth check: Verify user is authorized to upload
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
    const adminClient = createAdminClient()

    // Check if admin or if client owns the submission
    let isAuthorized = false
    if (session?.user) {
      const isAdmin = await isAdminUser(session.user.id)
      if (isAdmin) {
        isAuthorized = true
      } else {
        // For authenticated clients: verify submission belongs to them by client_id
        if (clientId) {
          const { data: submission } = await adminClient
            .from('submissions')
            .select('client_id')
            .eq('id', submissionId)
            .single()

          if (submission?.client_id === clientId) {
            isAuthorized = true
          }
        }
      }
    } else if (clientEmail && clientId) {
      // For unauthenticated clients: verify via client_id
      const { data: submission } = await adminClient
        .from('submissions')
        .select('client_id')
        .eq('id', submissionId)
        .eq('client_id', clientId)
        .single()

      if (submission) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      const response = NextResponse.json(
        { error: 'Unauthorized: Cannot upload to this submission' },
        { status: 403 }
      )
      Object.entries(getPublicCorsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      const response = NextResponse.json(
        { error: 'File type not allowed. Please upload PDF, JPG, PNG, or DOCX.' },
        { status: 400 }
      )
      Object.entries(getPublicCorsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    if (file.size > MAX_FILE_SIZE) {
      const response = NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
      Object.entries(getPublicCorsHeaders()).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileKey = generateFileKey(submissionId, file.name)
    const fileUrl = await uploadFile(fileKey, buffer, file.type)

    const { data: document, error: documentError } = await adminClient
      .from('documents')
      .insert({
        submission_id: submissionId,
        client_id: clientId,
        document_type: documentType || 'supporting_file',
        file_name: file.name,
        file_key: fileKey,
        file_url: fileUrl,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: 'client',
        description: description || null,
      })
      .select()
      .single()

    if (documentError) {
      console.error('Document DB insert error:', JSON.stringify(documentError))
      throw documentError
    }

    const response = NextResponse.json({
      success: true,
      document_id: document.id,
      file_name: file.name,
      file_url: fileUrl,
    })
    Object.entries(getPublicCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response

  } catch (error: any) {
    console.error('File upload error:', error?.message ?? error)
    const response = NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
    Object.entries(getPublicCorsHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }
}