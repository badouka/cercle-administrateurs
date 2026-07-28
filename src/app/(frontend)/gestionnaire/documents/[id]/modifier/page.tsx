import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { User, Document, Media } from '@/payload-types'
import config from '@payload-config'
import { ArrowLeft, Pencil } from 'lucide-react'
import { DocumentForm } from '../../DocumentForm'

export const metadata: Metadata = { title: 'Modifier le document' }

export default async function ModifierDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [payload, headers] = await Promise.all([getPayload({ config }), getHeaders()])
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/connexion')

  const role = (user as User).role
  if (role !== 'gestionnaire' && role !== 'admin') redirect('/dashboard')

  const documentId = Number(id)
  if (!documentId) notFound()

  let doc: Document
  try {
    doc = await payload.findByID({
      collection:     'documents',
      id:             documentId,
      depth:          1,
      overrideAccess: true,
    }) as Document
  } catch {
    notFound()
  }

  const fichier    = typeof doc.fichier === 'object' && doc.fichier ? (doc.fichier as Media) : null
  const couverture = typeof doc.couverture === 'object' && doc.couverture ? (doc.couverture as Media) : null

  return (
    <div className="mx-auto max-w-3xl px-4 pt-24 pb-10 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="mb-8">
        <Link
          href="/gestionnaire/documents"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft size={13} /> Documents
        </Link>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-black p-3">
            <Pencil size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black truncate max-w-lg">{doc.titre}</h1>
            <p className="text-sm text-gray-500">Modifier ce document</p>
          </div>
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-8">
        <DocumentForm
          documentId={documentId}
          initialValues={{
            titre:       doc.titre,
            categorie:   doc.categorie,
            acces:       doc.acces,
            description: doc.description ?? undefined,
            fichierId:   fichier ? fichier.id : (typeof doc.fichier === 'number' ? doc.fichier : undefined),
            fichierName: fichier?.filename ?? undefined,
            couvertureId:  couverture?.id ?? undefined,
            couvertureUrl: couverture?.url ?? undefined,
          }}
        />
      </div>
    </div>
  )
}
