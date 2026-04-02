import { NextRequest, NextResponse } from 'next/server'
import { getSignedDownloadUrl } from '@/lib/r2'
import { z } from 'zod'

const schema = z.object({
  file_key: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    // Basic admin auth check
    const adminAuth = request.cookies.get('admin_auth')
    if (!adminAuth || adminAuth.value !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = schema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'file_key is required' },
        { status: 400 }
      )
    }

    // Generate signed URL valid for 1 hour
    const url = await getSignedDownloadUrl(validated.data.file_key, 3600)

    return NextResponse.json({ url })

  } catch (error) {
    console.error('Signed URL error:', error)
    return NextResponse.json(
      { error: 'Could not generate download link.' },
      { status: 500 }
    )
  }
}