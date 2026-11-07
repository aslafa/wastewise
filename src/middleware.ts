import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect rute legacy ke rute admin yang sesuai
  if (pathname === '/penjemputan') {
    return NextResponse.redirect(new URL('/admin/penjemputan', request.url))
  }
  if (pathname === '/data-sampah') {
    return NextResponse.redirect(new URL('/admin/data-sampah', request.url))
  }
  if (pathname === '/ai-monitoring') {
    return NextResponse.redirect(new URL('/admin/ai-monitoring', request.url))
  }
  if (pathname === '/pengguna') {
    return NextResponse.redirect(new URL('/admin/pengguna', request.url))
  }
  if (pathname === '/laporan') {
    return NextResponse.redirect(new URL('/admin/laporan', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/penjemputan',
    '/data-sampah',
    '/ai-monitoring',
    '/pengguna',
    '/laporan',
  ],
}

