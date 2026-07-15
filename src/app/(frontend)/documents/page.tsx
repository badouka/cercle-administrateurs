import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import type { Metadata } from 'next'
import type { Document, Media } from '@/payload-types'
import config from '@payload-config'
import { PageHero } from '@/components/PageHero'
import { DocumentsClient, type DocumentItem } from '@/components/DocumentsClient'

export const metadata: Metadata = {
  title: 'Documents',
  description: 'Textes statutaires, réglementaires et ressources documentaires du Cercle des Administrateurs Publics du Sénégal.',
}

export default async function DocumentsPage() {
  const [payload, headers] = await Promise.all([getPayload({ config }), getHeaders()])

  const { user } = await payload.auth({ headers })
  const isLoggedIn = Boolean(user)

  const { docs } = await payload.find({
    collection:     'documents',
    where:          { categorie: { not_equals: 'magazines' } },
    depth:          1,
    limit:          100,
    sort:           '-createdAt',
    overrideAccess: true,
  })

  const documents: DocumentItem[] = (docs as Document[]).map(d => {
    const fichier = typeof d.fichier === 'object' && d.fichier ? (d.fichier as Media) : null
    const ext = fichier?.filename ? fichier.filename.split('.').pop() : null
    const isPublic = d.acces === 'public'
    return {
      id: d.id,
      titre: d.titre,
      slug: d.slug ?? null,
      description: d.description ?? null,
      categorie: d.categorie,
      acces: d.acces,
      fileType: ext ? ext.toUpperCase().slice(0, 4) : null,
      // Le nom de fichier n'est exposé que pour les documents publics, ou pour
      // un utilisateur connecté : les documents "membres" restent verrouillés
      // (pas d'URL en clair) tant que le visiteur n'est pas authentifié.
      filename: isPublic || isLoggedIn ? (fichier?.filename ?? null) : null,
      url: isPublic || isLoggedIn ? (fichier?.url ?? null) : null,
      createdAt: d.createdAt,
    }
  })

  return (
    <div>
      <PageHero
        title="Documents"
        subtitle="Textes de référence et documents officiels du Cercle des Administrateurs Publics."
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Documents', href: '/documents' },
        ]}
      />

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <DocumentsClient documents={documents} isLoggedIn={isLoggedIn} />
        </div>
      </section>
    </div>
  )
}
