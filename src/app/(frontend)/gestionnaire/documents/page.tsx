import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { User, Document } from '@/payload-types'
import config from '@payload-config'
import { FileText, ArrowLeft, PlusCircle } from 'lucide-react'
import { DocumentListActions } from './DocumentListActions'

export const metadata: Metadata = { title: 'Gestion des documents' }

function formatDate(d: string) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))
}

const CATEGORIES: Record<string, string> = {
  textes_statutaires:        'Textes statutaires',
  textes_reglementaires:     'Textes réglementaires',
  pv_reunion:                'PV de réunion',
  ressources:                'Ressources',
  magazines:                 'Magazines',
  docs_politique_economique: 'Docs politique économique',
}

export default async function DocumentsPage() {
  const [payload, headers] = await Promise.all([getPayload({ config }), getHeaders()])
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/connexion')

  const role = (user as User).role
  if (role !== 'gestionnaire' && role !== 'admin') redirect('/dashboard')

  const { docs: documents, totalDocs } = await payload.find({
    collection:     'documents',
    sort:           '-updatedAt',
    limit:          200,
    depth:          0,
    overrideAccess: true,
  })

  const canDelete = role === 'gestionnaire' || role === 'admin'

  return (
    <div className="mx-auto max-w-5xl px-4 pt-24 pb-10 sm:px-6 lg:px-8 space-y-8">

      {/* ── Header ── */}
      <div>
        <Link
          href="/gestionnaire"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft size={13} /> Tableau de bord
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-black p-3">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black">Documents</h1>
              <p className="text-sm text-gray-500">{totalDocs} document{totalDocs > 1 ? 's' : ''} au total</p>
            </div>
          </div>
          <Link
            href="/gestionnaire/documents/nouveau"
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shrink-0"
          >
            <PlusCircle size={15} />
            Nouveau document
          </Link>
        </div>
      </div>

      {/* ── Liste ── */}
      {documents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">Aucun document pour le moment</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-[#F9F9F9]">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-2/5">Titre</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Accès</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Modifié le</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(documents as Document[]).map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-black w-2/5">
                      <span className="block truncate max-w-[180px]">{doc.titre}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {CATEGORIES[doc.categorie] ?? doc.categorie}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        doc.acces === 'public' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {doc.acces === 'public' ? 'Public' : 'Membres'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {formatDate(doc.updatedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <DocumentListActions
                        documentId={doc.id}
                        titre={doc.titre}
                        canDelete={canDelete}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
