import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Media } from '@/payload-types'
import config from '@payload-config'
import { ArrowLeft, Briefcase, Building2, Lock, ExternalLink, Phone, Mail } from 'lucide-react'
import RichTextContent from '@/components/RichTextContent'

interface Props {
  params: Promise<{ id: string }>
}

type HeaderVariant = 'president' | 'bureau' | 'membre'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function detectBioType(bio: any): 'html' | 'lexical' | null {
  if (!bio) return null
  if (typeof bio === 'string') return 'html'
  if (typeof bio === 'object' && bio.root) return 'lexical'
  return null
}

function getHeaderVariant(posteCap?: string | null): HeaderVariant {
  const p = posteCap?.trim() ?? ''
  if (!p || p.toLowerCase() === 'membre') return 'membre'
  if (p.toLowerCase() === 'président' || p.toLowerCase() === 'présidente') return 'president'
  return 'bureau'
}

// ─── Metadata dynamique ───────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: idStr } = await params
  const id = parseInt(idStr, 10)
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
  const { id: idStr } = await params
  const id = parseInt(idStr, 10)
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

  const variant       = getHeaderVariant(membre.poste?.posteCap)
  const photo         = typeof membre.photo         === 'object' && membre.photo         ? (membre.photo         as Media) : null
  const logoOrganisme = typeof membre.poste?.logoOrganisme === 'object' && membre.poste?.logoOrganisme ? (membre.poste.logoOrganisme as Media) : null
  const initiales     = `${membre.prenom[0] ?? ''}${membre.nom[0] ?? ''}`.toUpperCase()
  const hasPoste      = membre.poste?.posteCap || membre.poste?.fonctionProfessionnelle || membre.poste?.organisme || membre.poste?.direction
  const hasCoord = membre.coordonnees?.telephone || membre.coordonnees?.emailProfessionnel || membre.coordonnees?.linkedin

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

      {/* Retour */}
      <Link
        href="/annuaire"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Retour à l'annuaire
      </Link>

      <div className="rounded-2xl border border-[#E5E5E5] overflow-hidden">

        {/* Header */}
        <div className={`px-8 py-8 ${
          variant === 'president' ? 'bg-black border-t-4 border-yellow-500' :
          variant === 'bureau'    ? 'bg-blue-950' :
                                    'bg-black'
        }`}>
          <div className="flex items-center gap-6 text-white">

            {/* Photo */}
            <div className="shrink-0 h-40 w-40 overflow-hidden rounded-lg ring-2 ring-white/20 bg-gray-800">
              {photo?.url ? (
                <Image
                  src={photo.url}
                  alt={`${membre.prenom} ${membre.nom}`}
                  width={160}
                  height={160}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-gray-500">
                  {initiales}
                </div>
              )}
            </div>

            {/* Identité */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{membre.prenom} {membre.nom}</h1>
              {variant !== 'membre' && membre.poste?.posteCap && (
                <span className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  variant === 'president'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-blue-800 text-white'
                }`}>
                  {membre.poste.posteCap}
                </span>
              )}
              {membre.poste?.organisme && (
                <p className="mt-1 text-gray-300 font-semibold">{membre.poste.organisme}</p>
              )}
            </div>

            {/* Logo organisme */}
            {logoOrganisme?.url && (
              membre.poste?.siteOrganisme ? (
                <a
                  href={membre.poste.siteOrganisme}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 hover:opacity-80 transition-opacity"
                  title={membre.poste.organisme ?? undefined}
                >
                  <div className="h-20 w-20 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center p-1">
                    <Image
                      src={logoOrganisme.url}
                      alt={membre.poste.organisme ?? 'Logo organisme'}
                      width={72} height={72}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </a>
              ) : (
                <div className="shrink-0 h-20 w-20 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/20 flex items-center justify-center p-1">
                  <Image
                    src={logoOrganisme.url}
                    alt={membre.poste?.organisme ?? 'Logo organisme'}
                    width={72} height={72}
                    className="h-full w-full object-contain"
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Corps */}
        <div className="bg-white p-8 space-y-8">

          {/* Biographie */}
          {(() => {
            const bioType = detectBioType(membre.biographie)
            if (!bioType) return null
            return (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Biographie
                </h2>
                {bioType === 'html' ? (
                  <div
                    className="text-gray-700 leading-relaxed bio-prose"
                    dangerouslySetInnerHTML={{ __html: membre.biographie as unknown as string }}
                  />
                ) : (
                  <RichTextContent data={membre.biographie} />
                )}
              </section>
            )
          })()}

          <div className="grid gap-8 sm:grid-cols-2">

            {/* Poste */}
            {hasPoste && (
              <section>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <Briefcase size={13} />
                  Poste
                </h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  {membre.poste?.posteCap && (
                    <li className="font-medium text-black">{membre.poste.posteCap}</li>
                  )}
                  {membre.poste?.fonctionProfessionnelle && (
                    <li className="text-gray-600">{membre.poste.fonctionProfessionnelle}</li>
                  )}
                  {membre.poste?.organisme && (
                    <li className="flex items-center gap-1.5">
                      <Building2 size={13} className="shrink-0 text-gray-400" />
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
                          className="inline-flex items-center gap-1.5 text-gray-700 hover:text-black transition-colors"
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
                          className="inline-flex items-center gap-1.5 text-gray-700 hover:text-black transition-colors"
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
                          className="inline-flex items-center gap-1.5 text-gray-700 hover:text-black transition-colors"
                        >
                          <ExternalLink size={13} className="shrink-0 text-gray-400" />
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
                      className="mt-2 inline-block text-sm font-semibold text-black underline underline-offset-2 hover:text-gray-700"
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
