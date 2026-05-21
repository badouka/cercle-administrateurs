import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/gestionnaire']
const AUTH_ONLY = ['/connexion', '/inscription']

export function middleware(req: NextRequest) {
  const token    = req.cookies.get('payload-token')?.value
  const { pathname } = req.nextUrl

  if (!token && PROTECTED.some(p => pathname.startsWith(p))) {
    const url = req.nextUrl.clone()
    url.pathname = '/connexion'
    return NextResponse.redirect(url)
  }

  if (token && AUTH_ONLY.some(p => pathname === p)) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/gestionnaire/:path*', '/connexion', '/inscription'],
}
