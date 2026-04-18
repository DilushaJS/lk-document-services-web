import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const file = formData.get('file') as File | null
    const submissionId = formData.get('submission_id') as string | null
    const clientId = formData.get('client_id') as string | null
    const documentType = formData.get('document_type') as string | null
    const description = formData.get('description') as string | null

    if (!file || !submissionId || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, submission_id, client_id' },
        { status: 400 }
      )
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload PDF, JPG, PNG, or DOCX.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileKey = generateFileKey(submissionId, file.name)
    const fileUrl = await uploadFile(fileKey, buffer, file.type)

    const supabase = createAdminClient()

    const { data: document, error: documentError } = await supabase
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

    return NextResponse.json({
      success: true,
      document_id: document.id,
      file_name: file.name,
      file_url: fileUrl,
    })

  } catch (error: any) {
    console.error('File upload error:', error?.message ?? error)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}