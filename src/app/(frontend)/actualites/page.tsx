import { getPayload } from 'payload'
import type { Metadata } from 'next'
import type { Post } from '@/payload-types'
import config from '@payload-config'
import { ActualitesGrid } from './ActualitesGrid'

export const metadata: Metadata = { title: 'Actualités' }

export default async function ActualitesPage() {
  const payload = await getPayload({ config })

  const { docs: posts } = await payload.find({
    collection:     'posts',
    where:          { statut: { equals: 'publie' } },
    sort:           '-publie_le',
    depth:          1,
    limit:          50,
    overrideAccess: true,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-black">Actualités</h1>
        <p className="mt-2 text-gray-500">
          Restez informé des dernières nouvelles du Cercle des Administrateurs Publics.
        </p>
      </div>

      <ActualitesGrid posts={posts as Post[]} />
    </div>
  )
}
