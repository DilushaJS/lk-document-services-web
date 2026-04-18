import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteFile } from '@/lib/r2'

export async function DELETE(request: NextRequest) {
  try {
    // Auth check
    const adminAuth = request.cookies.get('admin_auth')
    if (!adminAuth || adminAuth.value !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { submission_id } = await request.json()

    if (!submission_id) {
      return NextResponse.json({ error: 'submission_id required' }, { status: 400 })
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

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Delete submission error:', error?.message ?? error)
    return NextResponse.json(
      { error: 'Could not delete submission.' },
      { status: 500 }
    )
  }
}