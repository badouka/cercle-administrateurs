import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { ArrowLeft } from 'lucide-react'
import RichTextContent from '@/components/RichTextContent'

interface Page {
  id:      number
  titre:   string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contenu?: any
  statut:  string
}

async function fetchPage(): Promise<Page | null> {
  const payload = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { docs } = await (payload.find as any)({
    collection:     'pages',
    where:          { slug: { equals: 'partenaires' } },
    depth:          0,
    limit:          1,
    overrideAccess: true,
  })
  return (docs[0] as Page) ?? null
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage()
  return { title: page ? `${page.titre} — CAP` : 'Nos partenaires — CAP' }
}

export default async function PartenairesPage() {
  const page = await fetchPage()
  if (!page || page.statut !== 'publie') notFound()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/a-propos"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        Qui sommes-nous ?
      </Link>

      <div className="mb-10 border-b border-gray-200 pb-8">
        <h1 className="text-3xl font-bold text-black">{page.titre}</h1>
      </div>

      <div className="max-w-3xl">
        <RichTextContent data={page.contenu} />
      </div>
    </div>
  )
}
