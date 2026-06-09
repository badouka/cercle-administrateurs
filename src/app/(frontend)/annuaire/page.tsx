import { getPayload } from 'payload'
import type { Metadata } from 'next'
import config from '@payload-config'
import { AnnuaireGrid } from '@/components/AnnuaireGrid'

export const metadata: Metadata = { title: 'Annuaire des membres' }

type PageProps = { searchParams: Promise<{ filtre?: string }> }

export default async function AnnuairePage({ searchParams }: PageProps) {
  const { filtre } = await searchParams

  const payload = await getPayload({ config })

  const { docs: tous } = await payload.find({
    collection: 'membres',
    depth: 1,
    limit: 500,
    sort: 'nom',
    overrideAccess: true,
  })

  let membres = tous
  let titre    = 'Annuaire des membres'
  let sousTitre = 'Retrouvez les membres du Cercle des Administrateurs Publics du Sénégal.'

  if (filtre === 'bureau') {
    membres  = tous.filter(m => m.poste?.posteCap && m.poste.posteCap.trim() !== '' && m.poste.posteCap !== 'Membre')
    titre    = 'Bureau exécutif'
    sousTitre = 'Les membres du bureau exécutif du Cercle des Administrateurs Publics du Sénégal.'
  } else if (filtre === 'membres') {
    membres  = tous.filter(m => !m.poste?.posteCap || m.poste.posteCap.trim() === '' || m.poste.posteCap === 'Membre')
    titre    = 'Membres'
    sousTitre = 'Les membres du Cercle des Administrateurs Publics du Sénégal.'
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-black">{titre}</h1>
        <p className="mt-2 text-gray-500">{sousTitre}</p>
      </div>

      <AnnuaireGrid membres={membres} />
    </div>
  )
}
