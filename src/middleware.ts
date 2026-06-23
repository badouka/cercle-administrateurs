import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import payloadConfig from '@payload-config'
import type { User } from '@/payload-types'

const PROTECTED = ['/dashboard', '/gestionnaire']
const AUTH_ONLY = ['/connexion', '/inscription']

export async function middleware(req: NextRequest) {
  const token        = req.cookies.get('payload-token')?.value
  const { pathname } = req.nextUrl

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthOnly  = AUTH_ONLY.some(p => pathname === p)

  // Aucun cookie : inutile d'initialiser Payload.
  if (!token) {
    if (isProtected) {
      const url = req.nextUrl.clone()
      url.pathname = '/connexion'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Un cookie est présent : il faut VÉRIFIER sa validité.
  // On ne peut pas se contenter de sa présence : un token périmé ou invalide
  // (changement de secret, base réinitialisée, session expirée non nettoyée)
  // ferait croire au middleware que l'utilisateur est connecté → il renverrait
  // /connexion vers /dashboard, que la page renvoie à son tour vers /connexion :
  // boucle de redirection infinie qui empêche totalement la connexion.
  const payload = await getPayload({ config: payloadConfig })

  let user: User | null = null
  try {
    const result = await payload.auth({ headers: req.headers })
    user = (result.user as User | null) ?? null
  } catch {
    user = null
  }

  // Token invalide → on considère l'utilisateur déconnecté et on purge le cookie
  // pour casser la boucle.
  if (!user) {
    const res = isProtected
      ? NextResponse.redirect(new URL('/connexion', req.url))
      : NextResponse.next()
    res.cookies.delete('payload-token')
    return res
  }

  // Utilisateur authentifié : on évite les pages réservées aux visiteurs.
  if (isAuthOnly) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Un membre suspendu ne peut pas accéder aux pages de gestion.
  if (pathname.startsWith('/gestionnaire')) {
    const { docs } = await payload.find({
      collection:     'membres',
      where:          { user: { equals: user.id } },
      limit:          1,
      overrideAccess: true,
    })
    if (docs[0]?.adhesion?.statut === 'suspendu') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/dashboard/:path*', '/gestionnaire/:path*', '/connexion', '/inscription'],
}
