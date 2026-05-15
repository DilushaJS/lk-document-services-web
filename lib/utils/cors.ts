import { NextResponse } from 'next/server'

/**
 * Get CORS headers for protected admin endpoints
 * Restricts to same-origin only
 */
export function getAdminCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

/**
 * Get CORS headers for public endpoints
 * More permissive but still secure
 */
export function getPublicCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

/**
 * Handle preflight CORS requests
 */
export function handleCorsPreFlight(headers: Record<string, string>) {
  return new NextResponse(null, {
    status: 200,
    headers,
  })
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(response: NextResponse, headers: Record<string, string>) {
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}
