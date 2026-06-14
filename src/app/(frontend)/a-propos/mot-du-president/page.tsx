import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Membre, Media, Page } from '@/payload-types'
import { ChevronRight, ArrowRight, User } from 'lucide-react'
import RichTextContent from '@/components/RichTextContent'

// ── Helpers ────────────────────────────────────────────────────────────────────

const ORDRE_POSTES = [
  "Président d'honneur",
  "Présidente d'honneur",
  'Président',
  'Présidente',
  'Vice-Président',
  'Vice-Présidente',
  'Secrétaire général',
  'Secrétaire générale',
  'Secrétaire général adjoint',
  'Secrétaire générale adjointe',
  'Trésorier',
  'Trésorière',
  'Trésorier Adjoint',
  'Trésorière Adjointe',
  'Présidente Commission Actions Sociales',
  'Présidente Commission Communication',
  'Président Commission Stratégie et Vulgarisation des Politiques Publiques',
  'Président Commission Renforcement de Capacités',
]

function rankPoste(posteCap: string | null | undefined): number {
  const p = (posteCap ?? '').trim()
  const idx = ORDRE_POSTES.indexOf(p)
  return idx === -1 ? 999 : idx
}

function isAuBureau(m: Membre): boolean {
  const posteCap = (m.poste?.posteCap ?? '').trim()
  return posteCap !== '' && posteCap !== 'Membre'
}

async function fetchPage(): Promise<Page | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection:     'pages',
    where:          { slug: { equals: 'mot-du-president' } },
    depth:          0,
    limit:          1,
    overrideAccess: true,
  })
  return (docs[0] as Page | undefined) ?? null
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage()
  return { title: page ? `${page.titre} — CAP` : 'Mot du Président — CAP' }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function MotDuPresidentPage() {
  const payload = await getPayload({ config })

  const [page, presidentRes, membresRes] = await Promise.all([
    fetchPage(),
    payload.find({
      collection:     'membres',
      where:          { 'poste.posteCap': { in: ['Président', 'Présidente'] } },
      depth:          1,
      limit:          1,
      overrideAccess: true,
    }),
    payload.find({
      collection:     'membres',
      depth:          1,
      limit:          500,
      sort:           'nom',
      overrideAccess: true,
    }),
  ])

  const president = (presidentRes.docs[0] as Membre | undefined) ?? null
  const presidentPhoto = president && typeof president.photo === 'object' && president.photo
    ? (president.photo as Media)
    : null

  const bureau = (membresRes.docs as Membre[])
    .filter(isAuBureau)
    .sort((a, b) => {
      const diff = rankPoste(a.poste?.posteCap) - rankPoste(b.poste?.posteCap)
      if (diff !== 0) return diff
      return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`, 'fr')
    })

  return (
    <div>
      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-900 bg-grain">
        <div className="absolute inset-0 bg-gradient-to-br from-[#14B53A]/25 via-gray-900 to-gray-900" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-white/50">
            <Link href="/" className="transition-colors hover:text-[#FCD116]">
              Accueil
            </Link>
            <ChevronRight size={14} className="text-white/30" />
            <Link href="/a-propos" className="transition-colors hover:text-[#FCD116]">
              À propos
            </Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white/80">Mot du Président</span>
          </nav>
          <h1 className="mt-6 font-serif text-4xl font-medium text-white sm:text-5xl lg:text-6xl">
            Mot du Président
          </h1>
          <div className="mt-6 h-1 w-16 rounded-full bg-[#FCD116]" />
        </div>
      </section>

      {/* ── 2. Contenu ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              {page?.contenu ? (
                <RichTextContent data={page.contenu} />
              ) : (
                <p className="text-ink/50">
                  Le mot du Président n&apos;est pas encore disponible.
                </p>
              )}
            </div>

            <div className="lg:col-span-2">
              {president ? (
                <div className="rounded-2xl border border-ink/10 bg-[#F5F5F5] p-8 text-center">
                  <div className="mx-auto mb-5 h-32 w-32 shrink-0 overflow-hidden rounded-full bg-ink/5 ring-4 ring-[#14B53A]/15">
                    {presidentPhoto?.url ? (
                      <Image
                        src={presidentPhoto.url}
                        alt={`${president.prenom} ${president.nom}`}
                        width={128}
                        height={128}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User size={40} className="text-ink/30" />
                      </div>
                    )}
                  </div>
                  <p className="font-serif text-xl font-medium text-ink">
                    {president.prenom} {president.nom}
                  </p>
                  {president.poste?.posteCap && (
                    <p className="mt-1 text-sm font-semibold text-[#14B53A]">
                      {president.poste.posteCap}
                    </p>
                  )}
                  {president.poste?.organisme && (
                    <p className="mt-1 text-sm text-ink/60">{president.poste.organisme}</p>
                  )}
                  {president.coordonnees?.linkedin && (
                    <div className="mt-5 flex items-center justify-center gap-3">
                      <a
                        href={president.coordonnees.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="LinkedIn"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink/50 transition-colors hover:border-[#14B53A] hover:text-[#14B53A]"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                          <rect x="2" y="9" width="4" height="12" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-ink/50">Le Président n&apos;est pas encore renseigné.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Bureau ───────────────────────────────────────────────────────── */}
      <section className="bg-[#F5F5F5] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#FCD116]">Gouvernance</p>
            <h2 className="mt-3 font-serif text-3xl font-medium text-ink sm:text-4xl">Les membres du bureau</h2>
          </div>

          {bureau.length === 0 ? (
            <p className="text-center text-ink/50">
              Aucun membre du bureau renseigné pour le moment.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {bureau.map(membre => {
                const photo = typeof membre.photo === 'object' && membre.photo
                  ? (membre.photo as Media)
                  : null

                return (
                  <Link
                    key={membre.id}
                    href={`/annuaire/${membre.slug || membre.id}`}
                    className="group flex flex-col items-center rounded-xl border border-ink/10 bg-white p-6 text-center transition-shadow hover:shadow-lg"
                  >
                    <div className="mb-4 h-24 w-24 shrink-0 overflow-hidden rounded-full bg-ink/5 ring-2 ring-transparent transition-all group-hover:ring-[#14B53A]">
                      {photo?.url ? (
                        <Image
                          src={photo.url}
                          alt={`${membre.prenom} ${membre.nom}`}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <User size={32} className="text-ink/30" />
                        </div>
                      )}
                    </div>
                    <p className="font-serif text-base font-medium text-ink">
                      {membre.prenom} {membre.nom}
                    </p>
                    {membre.poste?.posteCap && (
                      <p className="mt-1 text-sm text-[#14B53A]">{membre.poste.posteCap}</p>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              href="/annuaire?filtre=bureau"
              className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-[#14B53A] hover:text-[#14B53A]"
            >
              Voir l&apos;annuaire
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
