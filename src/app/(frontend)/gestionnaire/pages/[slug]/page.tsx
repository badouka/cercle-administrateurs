import { getPayload } from 'payload'
import { headers as getHeaders } from 'next/headers'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { User } from '@/payload-types'
import config from '@payload-config'
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react'
import { lexicalToHtml } from '@/lib/lexical-to-html'
import { PageEditor } from './PageEditor'

interface RawPage {
  id:      number
  titre:   string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contenu?: any
  statut:  'brouillon' | 'publie'
}

const PUBLIC_PATHS: Record<string, string> = {
  'a-propos':         '/a-propos',
  'mot-du-president': '/a-propos/mot-du-president',
  'partenaires':      '/a-propos/partenaires',
}

const VALID_SLUGS = Object.keys(PUBLIC_PATHS)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return { title: `Modifier la page — ${slug}` }
}

export default async function ModifierPagePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (!VALID_SLUGS.includes(slug)) notFound()

  const [payload, hdrs] = await Promise.all([getPayload({ config }), getHeaders()])
  const { user }        = await payload.auth({ headers: hdrs })

  if (!user) redirect('/connexion')

  const role = (user as User).role
  if (role !== 'gestionnaire' && role !== 'admin') redirect('/dashboard')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { docs } = await (payload.find as any)({
    collection:     'pages',
    where:          { slug: { equals: slug } },
    depth:          0,
    limit:          1,
    overrideAccess: true,
  })

  const page = docs[0] as RawPage | undefined
  if (!page) notFound()

  const htmlContent = lexicalToHtml(page.contenu)
  const publicPath  = PUBLIC_PATHS[slug]!

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

      {/* ── Retour ── */}
      <Link
        href="/gestionnaire"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft size={13} />
        Tableau de bord
      </Link>

      {/* ── Header ── */}
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-xl bg-black p-3 shrink-0">
          <FileText size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-black truncate">{page.titre}</h1>
          <p className="text-sm text-gray-500">Modifier le contenu de cette page</p>
        </div>
      </div>

      {/* ── Éditeur ── */}
      <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6 sm:p-8">
        <PageEditor
          slug={slug}
          initialContent={htmlContent}
          initialStatut={page.statut}
        />
      </div>

      {/* ── Lien page publique ── */}
      <div className="mt-4 text-right">
        <Link
          href={publicPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors"
        >
          <ExternalLink size={12} />
          Voir la page publique
        </Link>
      </div>
    </div>
  )
}
