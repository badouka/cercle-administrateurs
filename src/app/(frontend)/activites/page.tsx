import { getPayload } from 'payload'
import Image from 'next/image'
import type { Metadata } from 'next'
import type { Activity, Media } from '@/payload-types'
import config from '@payload-config'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr))
}

function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(dateStr))
}

const TYPE_CONFIG = {
  atelier:   { label: 'Atelier',   cls: 'bg-cap-100 text-cap-800' },
  seminaire: { label: 'Séminaire', cls: 'bg-gold-500/15 text-amber-800' },
}

const STATUT_CONFIG = {
  a_venir: { label: 'À venir',   cls: 'bg-emerald-100 text-emerald-800' },
  en_cours: { label: 'En cours', cls: 'bg-blue-100 text-blue-800' },
  termine:  { label: 'Terminé',  cls: 'bg-gray-100 text-gray-500' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const metadata: Metadata = { title: 'Activités' }

export default async function ActivitesPage() {
  const payload = await getPayload({ config })

  const { docs: activites } = await payload.find({
    collection: 'activities',
    sort: 'date_debut',
    depth: 1,
    limit: 100,
    overrideAccess: true,
  })

  // Séparer à venir / en cours vs. terminés
  const upcoming = activites.filter(a => a.statut !== 'termine')
  const past      = activites.filter(a => a.statut === 'termine')

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      {/* En-tête */}
      <div className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-cap-800">Activités</h1>
        <p className="mt-2 text-gray-500">
          Ateliers et séminaires organisés par le Cercle des Administrateurs Publics.
        </p>
      </div>

      {activites.length === 0 ? (
        <p className="text-gray-500">Aucune activité disponible pour le moment.</p>
      ) : (
        <div className="space-y-14">

          {/* Prochaines activités */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-6 text-lg font-semibold text-gray-800">
                Prochaines activités
                <span className="ml-2 rounded-full bg-cap-100 px-2.5 py-0.5 text-sm font-medium text-cap-700">
                  {upcoming.length}
                </span>
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map(activite => (
                  <ActiviteCard key={activite.id} activite={activite} />
                ))}
              </div>
            </section>
          )}

          {/* Activités passées */}
          {past.length > 0 && (
            <section>
              <h2 className="mb-6 text-lg font-semibold text-gray-500">
                Activités passées
                <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-400">
                  {past.length}
                </span>
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {past.map(activite => (
                  <ActiviteCard key={activite.id} activite={activite} past />
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  )
}

// ─── Composant carte ──────────────────────────────────────────────────────────

function ActiviteCard({ activite, past = false }: { activite: Activity; past?: boolean }) {
  const image        = typeof activite.image === 'object' && activite.image ? activite.image as Media : null
  const typeConfig   = activite.type ? TYPE_CONFIG[activite.type]   : null
  const statutConfig = STATUT_CONFIG[activite.statut]

  return (
    <article className={cn(
      'flex flex-col rounded-xl border overflow-hidden shadow-sm transition-shadow hover:shadow-md',
      past ? 'border-gray-200 opacity-80' : 'border-gray-200',
    )}>

      {/* Image ou bandeau coloré */}
      {image?.url ? (
        <div className="relative aspect-video bg-gray-100">
          <Image
            src={image.url}
            alt={activite.titre}
            fill
            className={cn('object-cover', past && 'grayscale')}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className={cn(
          'aspect-video flex items-center justify-center',
          past ? 'bg-gray-100' : 'bg-cap-800',
        )}>
          <span className={cn(
            'text-2xl font-bold select-none',
            past ? 'text-gray-300' : 'text-white/20',
          )}>
            CAP
          </span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {typeConfig && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeConfig.cls}`}>
              {typeConfig.label}
            </span>
          )}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statutConfig.cls}`}>
            {statutConfig.label}
          </span>
        </div>

        {/* Titre */}
        <h3 className="font-semibold text-gray-900 leading-snug">
          {activite.titre}
        </h3>

        {/* Méta */}
        <ul className="space-y-1.5 text-sm text-gray-500 mt-auto">
          <li className="flex items-start gap-2">
            <CalendarDays size={14} className="mt-0.5 shrink-0 text-cap-600" />
            <div>
              <span>{formatDate(activite.date_debut)}</span>
              {activite.date_fin && activite.date_fin !== activite.date_debut && (
                <span className="text-gray-400"> → {formatDateShort(activite.date_fin)}</span>
              )}
            </div>
          </li>
          {activite.lieu && (
            <li className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0 text-cap-600" />
              {activite.lieu}
            </li>
          )}
          {activite.places_disponibles != null && activite.statut === 'a_venir' && (
            <li className="flex items-center gap-2">
              <Users size={14} className="shrink-0 text-cap-600" />
              {activite.places_disponibles} place{activite.places_disponibles > 1 ? 's' : ''} disponible{activite.places_disponibles > 1 ? 's' : ''}
            </li>
          )}
        </ul>
      </div>
    </article>
  )
}
