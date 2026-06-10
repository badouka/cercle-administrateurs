import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import type { User } from '@/payload-types'

const PROTECTED = ['/dashboard', '/gestionnaire']
const AUTH_ONLY = ['/connexion', '/inscription']

export async function middleware(req: NextRequest) {
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

  // Un membre suspendu ne peut pas accéder aux pages de gestion
  if (token && pathname.startsWith('/gestionnaire')) {
    const payload  = await getPayload({ config: payloadConfig })
    const { user } = await payload.auth({ headers: req.headers })

    if (user) {
      const { docs } = await payload.find({
        collection:     'membres',
        where:          { user: { equals: (user as User).id } },
        limit:          1,
        overrideAccess: true,
      })
      if (docs[0]?.adhesion?.statut === 'suspendu') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/dashboard/:path*', '/gestionnaire/:path*', '/connexion', '/inscription'],
}
