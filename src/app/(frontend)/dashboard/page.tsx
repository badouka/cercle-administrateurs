import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { User, Membre, Media, Document, Activity } from '@/payload-types'
import config from '@payload-config'
import {
  FileText, Download, CalendarDays, MapPin,
  Clock, AlertCircle, LayoutDashboard, ShieldCheck,
} from 'lucide-react'
import { EditProfileForm } from './EditProfileForm'

export const metadata: Metadata = { title: 'Mon espace' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

function formatFilesize(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024)        return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

const MEMBRE_DOCS_CATEGORIES: Record<string, string> = {
  pv_reunion: 'PV de réunion',
  magazines:  'Magazines & Revues',
  ressources: 'Ressources',
}

const STATUT_ACTIVITE: Record<string, { label: string; cls: string }> = {
  a_venir:  { label: 'À venir',  cls: 'bg-black text-white' },
  en_cours: { label: 'En cours', cls: 'bg-gray-700 text-white' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [payload, headers] = await Promise.all([
    getPayload({ config }),
    getHeaders(),
  ])

  const { user } = await payload.auth({ headers })
  if (!user) redirect('/connexion')

  const role = (user as User).role

  const { docs: membres } = await payload.find({
    collection:     'membres',
    where:          { user: { equals: user.id } },
    depth:          1,
    limit:          1,
    overrideAccess: true,
  })
  const membre = (membres[0] ?? null) as Membre | null

  // ── Vue 1 : Administrateur sans profil membre ─────────────────────────────
  if (role === 'admin' && !membre) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-black">Tableau de bord administrateur</h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            Vous êtes connecté en tant qu'administrateur. Gérez les membres, les contenus
            et la configuration de la plateforme depuis le panneau d'administration.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            >
              <LayoutDashboard size={15} />
              Ouvrir le panneau d'administration
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 hover:border-black hover:text-black transition-colors"
            >
              Voir le site
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-400">
            Connecté en tant que <span className="font-medium">{user.email}</span>
          </p>
        </div>
      </div>
    )
  }

  // ── Vue 2 : Membre en attente de validation ───────────────────────────────
  if (!membre || membre.adhesion?.statut === 'inactif') {
    const photo     = typeof membre?.photo === 'object' && membre?.photo ? (membre.photo as Media) : null
    const initiales = membre
      ? `${membre.prenom[0] ?? ''}${membre.nom[0] ?? ''}`.toUpperCase()
      : (user.email[0] ?? '?').toUpperCase()

    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* Header profil */}
        <div className="rounded-2xl border border-[#E5E5E5] overflow-hidden mb-6">
          <div className="bg-black px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-white">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20 bg-gray-800">
                {photo?.url ? (
                  <Image
                    src={photo.url} alt={`${membre!.prenom} ${membre!.nom}`}
                    width={80} height={80} className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-500">
                    {initiales}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                {membre ? (
                  <h1 className="text-xl font-bold">{membre.prenom} {membre.nom}</h1>
                ) : (
                  <h1 className="text-xl font-bold">{user.email}</h1>
                )}
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-0.5 text-xs font-medium text-yellow-300">
                    <Clock size={11} />
                    En attente de validation
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8">
            <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-4">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-yellow-600" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Votre demande est en cours de traitement</p>
                <p className="mt-1 text-sm text-yellow-800 leading-relaxed">
                  L'administrateur du CAP va examiner votre demande d'adhésion et activer votre compte.
                  Vous aurez alors accès à l'ensemble des documents, ressources et activités réservés aux membres.
                </p>
              </div>
            </div>

            {membre && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Vos informations enregistrées
                </p>
                <dl className="space-y-2 text-sm">
                  {membre.poste?.posteCap && <div><dt className="text-xs text-gray-400">Poste au CAP</dt><dd className="text-gray-900">{membre.poste.posteCap}</dd></div>}
                  {membre.poste?.fonctionProfessionnelle && <div><dt className="text-xs text-gray-400">Fonction</dt><dd className="text-gray-900">{membre.poste.fonctionProfessionnelle}</dd></div>}
                  {membre.poste?.organisme && <div><dt className="text-xs text-gray-400">Organisme</dt><dd className="text-gray-900">{membre.poste.organisme}</dd></div>}
                </dl>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-black transition-colors">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  // ── Vue 3 : Membre actif — dashboard complet ──────────────────────────────

  const [{ docs: memberDocs }, { docs: activities }] = await Promise.all([
    payload.find({
      collection:     'documents',
      where:          { acces: { equals: 'membres' } },
      sort:           'categorie',
      depth:          1,
      limit:          200,
      overrideAccess: true,
    }),
    payload.find({
      collection:     'activities',
      where:          { statut: { in: ['a_venir', 'en_cours'] } },
      sort:           'date_debut',
      depth:          1,
      limit:          6,
      overrideAccess: true,
    }),
  ])

  const docsByCategory = Object.fromEntries(
    Object.keys(MEMBRE_DOCS_CATEGORIES).map(cat => [
      cat,
      memberDocs.filter(d => d.categorie === cat),
    ]),
  ) as Record<string, Document[]>

  const photo     = typeof membre.photo === 'object' && membre.photo ? (membre.photo as Media) : null
  const initiales = `${membre.prenom[0] ?? ''}${membre.nom[0] ?? ''}`.toUpperCase()

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">

      {/* ── En-tête profil ── */}
      <div className="rounded-2xl border border-[#E5E5E5] overflow-hidden">
        <div className="bg-black px-6 py-8 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-white">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20 bg-gray-800">
              {photo?.url ? (
                <Image
                  src={photo.url} alt={`${membre.prenom} ${membre.nom}`}
                  width={80} height={80} className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-500">
                  {initiales}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl font-bold">{membre.prenom} {membre.nom}</h1>
              {membre.poste?.posteCap && <p className="mt-0.5 text-gray-400 text-sm">{membre.poste.posteCap}</p>}
              {membre.poste?.fonctionProfessionnelle && <p className="mt-0 text-gray-500 text-xs">{membre.poste.fonctionProfessionnelle}</p>}
              {membre.poste?.organisme && <p className="text-gray-300 text-sm font-medium">{membre.poste.organisme}</p>}
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-xs font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Membre actif
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8">
          <EditProfileForm membre={membre} />
        </div>
      </div>

      {/* ── Documents membres ── */}
      <section>
        <h2 className="mb-5 text-lg font-bold text-black border-b-2 border-black pb-3">
          Documents membres
        </h2>
        {memberDocs.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun document disponible pour le moment.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(MEMBRE_DOCS_CATEGORIES).map(([cat, catLabel]) => {
              const docs = docsByCategory[cat] ?? []
              if (docs.length === 0) return null
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                    <h3 className="text-sm font-semibold text-black">{catLabel}</h3>
                    <span className="text-xs text-gray-400">{docs.length}</span>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {docs.map(doc => {
                      const fichier  = typeof doc.fichier === 'object' ? doc.fichier as Media : null
                      const filesize = formatFilesize(fichier?.filesize)
                      return (
                        <li key={doc.id} className="flex items-center gap-3 py-3">
                          <div className="shrink-0 rounded-lg bg-[#F5F5F5] p-2">
                            <FileText size={15} className="text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-black truncate">{doc.titre}</p>
                            {filesize && <p className="text-xs text-gray-400">PDF · {filesize}</p>}
                          </div>
                          {fichier?.url && (
                            <a
                              href={fichier.url} download
                              target="_blank" rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-black px-2.5 py-1.5 text-xs font-semibold text-black hover:bg-black hover:text-white transition-colors"
                            >
                              <Download size={12} />
                              PDF
                            </a>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Prochaines activités ── */}
      <section>
        <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-5">
          <h2 className="text-lg font-bold text-black">Prochaines activités</h2>
          <Link href="/activites" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">
            Voir tout →
          </Link>
        </div>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune activité programmée pour le moment.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map(a => {
              const activite = a as Activity
              const img      = typeof activite.image === 'object' && activite.image ? activite.image as Media : null
              const statut   = STATUT_ACTIVITE[activite.statut]
              return (
                <article key={activite.id} className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden hover:shadow-md transition-shadow">
                  {img?.url ? (
                    <div className="relative aspect-video bg-gray-100">
                      <Image
                        src={img.url} alt={activite.titre} fill className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-300 select-none">CAP</span>
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    {statut && (
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statut.cls}`}>
                        {statut.label}
                      </span>
                    )}
                    <p className="text-sm font-semibold text-black leading-snug">{activite.titre}</p>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li className="flex items-center gap-1.5">
                        <CalendarDays size={12} className="shrink-0 text-gray-400" />
                        {formatDate(activite.date_debut)}
                      </li>
                      {activite.lieu && (
                        <li className="flex items-center gap-1.5">
                          <MapPin size={12} className="shrink-0 text-gray-400" />
                          {activite.lieu}
                        </li>
                      )}
                    </ul>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
