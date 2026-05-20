import { getPayload } from 'payload'
import type { Metadata } from 'next'
import config from '@payload-config'
import { AnnuaireGrid } from '@/components/AnnuaireGrid'

export const metadata: Metadata = { title: 'Annuaire des membres' }

export default async function AnnuairePage() {
  const payload = await getPayload({ config })

  const { docs: membres } = await payload.find({
    collection: 'membres',
    depth: 1,
    limit: 500,
    sort: 'nom',
    overrideAccess: true,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

      <div className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-black">Annuaire des membres</h1>
        <p className="mt-2 text-gray-500">
          Retrouvez les membres du Cercle des Administrateurs Publics du Sénégal.
        </p>
      </div>

      <AnnuaireGrid membres={membres} />
    </div>
  )
}
