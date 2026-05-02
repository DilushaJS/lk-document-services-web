import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (except /admin-login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin-login')) {
    const authCookie = request.cookies.get('admin_auth')
    const adminPassword = process.env.ADMIN_PASSWORD ?? ''

    // Simple string comparison (timing-safe crypto not available in Edge runtime)
    // The security comes from: httpOnly cookie, secure flag, strict SameSite, and environment variable
    const isValid = authCookie?.value === adminPassword

    if (!isValid) {
      const loginUrl = new URL('/admin-login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}