import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import config from '@payload-config'
import { ArrowLeft, Briefcase, Building2, Lock, ExternalLink, Phone, Mail } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
}

// ─── Metadata dynamique ───────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const id = parseInt(slug, 10)
  if (isNaN(id)) return {}

  try {
    const payload = await getPayload({ config })
    const membre  = await payload.findByID({
      collection: 'membres',
      id,
      depth: 0,
      overrideAccess: true,
    })
    return { title: `${membre.prenom} ${membre.nom}` }
  } catch {
    return {}
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MembreDetailPage({ params }: Props) {
  const { slug } = await params
  const id = parseInt(slug, 10)
  if (isNaN(id)) notFound()

  const [payload, headers] = await Promise.all([
    getPayload({ config }),
    getHeaders(),
  ])

  let membre
  try {
    membre = await payload.findByID({
      collection: 'membres',
      id,
      depth: 2,
      overrideAccess: true,
    })
  } catch {
    notFound()
  }

  const { user }        = await payload.auth({ headers })
  const isAuthenticated = Boolean(user)

  const photo = typeof membre.photo === 'object' && membre.photo
    ? (membre.photo as Media)
    : null

  const initiales = `${membre.prenom[0] ?? ''}${membre.nom[0] ?? ''}`.toUpperCase()

  const hasPoste = membre.poste?.titre || membre.poste?.organisme || membre.poste?.direction
  const hasCoord = membre.coordonnees?.telephone || membre.coordonnees?.emailProfessionnel || membre.coordonnees?.linkedin

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Retour */}
      <Link
        href="/annuaire"
        className="inline-flex items-center gap-1.5 text-sm text-cap-700 hover:text-cap-800 mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Retour à l'annuaire
      </Link>

      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

        {/* Header */}
        <div className="bg-cap-800 px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-white">

            {/* Photo / initiales */}
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full ring-4 ring-gold-500/60 bg-cap-700">
              {photo?.url ? (
                <Image
                  src={photo.url}
                  alt={`${membre.prenom} ${membre.nom}`}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-cap-300">
                  {initiales}
                </div>
              )}
            </div>

            {/* Identité */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold">
                {membre.prenom} {membre.nom}
              </h1>
              {membre.poste?.titre && (
                <p className="mt-1 text-white/80">{membre.poste.titre}</p>
              )}
              {membre.poste?.organisme && (
                <p className="mt-0.5 font-medium text-gold-400">
                  {membre.poste.organisme}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Corps */}
        <div className="p-8 space-y-8">

          {/* Biographie */}
          {membre.biographie && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Biographie
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {membre.biographie}
              </p>
            </section>
          )}

          <div className="grid gap-8 sm:grid-cols-2">

            {/* Poste */}
            {hasPoste && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <Briefcase size={13} />
                  Poste
                </h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  {membre.poste?.titre && (
                    <li className="font-medium">{membre.poste.titre}</li>
                  )}
                  {membre.poste?.organisme && (
                    <li className="flex items-center gap-1.5 text-cap-700">
                      <Building2 size={13} className="shrink-0" />
                      {membre.poste.organisme}
                    </li>
                  )}
                  {membre.poste?.direction && (
                    <li className="text-gray-500">{membre.poste.direction}</li>
                  )}
                </ul>
              </section>
            )}

            {/* Coordonnées */}
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Coordonnées
              </h2>

              {isAuthenticated ? (
                hasCoord ? (
                  <ul className="space-y-2 text-sm">
                    {membre.coordonnees?.telephone && (
                      <li>
                        <a
                          href={`tel:${membre.coordonnees.telephone}`}
                          className="inline-flex items-center gap-1.5 text-gray-700 hover:text-cap-700 transition-colors"
                        >
                          <Phone size={13} className="shrink-0 text-gray-400" />
                          {membre.coordonnees.telephone}
                        </a>
                      </li>
                    )}
                    {membre.coordonnees?.emailProfessionnel && (
                      <li>
                        <a
                          href={`mailto:${membre.coordonnees.emailProfessionnel}`}
                          className="inline-flex items-center gap-1.5 text-gray-700 hover:text-cap-700 transition-colors"
                        >
                          <Mail size={13} className="shrink-0 text-gray-400" />
                          {membre.coordonnees.emailProfessionnel}
                        </a>
                      </li>
                    )}
                    {membre.coordonnees?.linkedin && (
                      <li>
                        <a
                          href={membre.coordonnees.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#0A66C2] hover:underline"
                        >
                          <ExternalLink size={13} className="shrink-0" />
                          Profil LinkedIn
                        </a>
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucune coordonnée renseignée.</p>
                )
              ) : (
                <div className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <Lock size={15} className="mt-0.5 shrink-0 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">
                      Connectez-vous pour accéder aux coordonnées de ce membre.
                    </p>
                    <Link
                      href="/connexion"
                      className="mt-2 inline-block text-sm font-semibold text-cap-700 hover:text-cap-800 underline underline-offset-2"
                    >
                      Se connecter →
                    </Link>
                  </div>
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
