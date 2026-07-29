import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Page } from '@/payload-types'
import { PageHero } from '@/components/PageHero'
import { lexicalToHtml } from '@/lib/lexical-to-html'
import { MENTIONS_LEGALES_DEFAUT } from '@/lib/contenu-legal'

const SLUG        = 'mentions-legales'
const TITRE_DEFAUT = 'Mentions Légales'

async function fetchPage(): Promise<Page | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection:     'pages',
    where:          { slug: { equals: SLUG } },
    depth:          0,
    limit:          1,
    overrideAccess: true,
  })
  return (docs[0] as Page | undefined) ?? null
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage()
  return { title: `${page?.titre?.trim() || TITRE_DEFAUT} — CAP` }
}

export default async function MentionsLegalesPage() {
  const payload = await getPayload({ config })

  const headersList = await headers()
  let isGestionnaire = false
  try {
    const { user } = await payload.auth({ headers: headersList })
    isGestionnaire = user?.role === 'gestionnaire' || user?.role === 'admin'
  } catch {
    isGestionnaire = false
  }

  const page  = await fetchPage()
  const titre = page?.titre?.trim() || TITRE_DEFAUT

  // Contenu de la base, avec repli sur le texte par défaut tant que la page
  // n'a pas été enregistrée depuis le gestionnaire.
  const htmlBase = lexicalToHtml(page?.contenu)
  const html     = htmlBase.replace(/<[^>]*>/g, '').trim().length > 0
    ? htmlBase
    : lexicalToHtml(MENTIONS_LEGALES_DEFAUT)

  return (
    <div>
      {isGestionnaire && (
        <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
          <Link
            href={`/gestionnaire/pages/${SLUG}`}
            className="flex items-center gap-2 bg-[#1a7a3a] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:bg-[#C8A24A] hover:text-[#14110B] transition-colors"
          >
            ✏️ Modifier cette page
          </Link>
        </div>
      )}

      <PageHero
        title={titre}
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: titre,     href: `/${SLUG}` },
        ]}
      />

      <section className="bg-white py-16">
        <div
          className="max-w-3xl mx-auto px-6 text-sm leading-relaxed text-[#14110B]/70 [&_p]:mt-3 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#14110B] [&_h2]:mt-10 [&_h2:first-child]:mt-0 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#14110B] [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mt-3 [&_a]:text-[#1a7a3a] [&_a]:font-semibold [&_a]:transition-colors hover:[&_a]:text-[#C8A24A] [&_blockquote]:border-l-2 [&_blockquote]:border-[#C8A24A] [&_blockquote]:pl-4 [&_blockquote]:italic"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
    </div>
  )
}
