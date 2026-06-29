import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, Users, Lock, ArrowRight } from 'lucide-react'
import type { Membre, Media } from '@/payload-types'
import RichTextContent from '@/components/RichTextContent'
import { PageHero } from '@/components/PageHero'

export default async function MembrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'membres',
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
    overrideAccess: true,
  })
  const membre = res.docs[0] as Membre | undefined
  if (!membre) notFound()

  const photo = membre.photo && typeof membre.photo === 'object' && 'filename' in membre.photo
    ? (membre.photo as Media)
    : null

  const posteCap = membre.poste?.posteCap ?? ''
  const organisme = membre.poste?.organisme ?? ''
  const fonctionPro = membre.poste?.fonctionProfessionnelle ?? ''

  const initiales = `${membre.prenom?.[0] ?? ''}${membre.nom?.[0] ?? ''}`.toUpperCase()

  const bioObj = membre.biographie as { root?: { children?: unknown[] } } | null | undefined
  const hasBio = Boolean(bioObj?.root?.children?.length)
  const bioDefaut = [
    `${membre.prenom} ${membre.nom} est ${fonctionPro.toLowerCase() || 'administrateur public'} au sein de ${organisme}. Administrateur public engagé, ${membre.prenom} met son expertise au service de la modernisation de l'administration sénégalaise et de la bonne gouvernance du secteur parapublic.`,
    "Membre du Cercle des Administrateurs Publics, il contribue activement au partage des meilleures pratiques de gouvernance et à la promotion d'une culture de la performance au sein des établissements publics.",
  ]

  const logoMedia = membre.poste?.logoOrganisme && typeof membre.poste.logoOrganisme === 'object'
    ? (membre.poste.logoOrganisme as Media)
    : null

  return (
    <div>
      <PageHero
        title={`${membre.prenom} ${membre.nom}`}
        subtitle={posteCap || 'Membre du Cercle'}
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Annuaire', href: '/annuaire' },
          { label: `${membre.prenom} ${membre.nom}`, href: `/annuaire/${slug}` },
        ]}
      />
      <div className="bg-[#FAF8F3] min-h-screen pb-20">
        <div className="max-w-3xl mx-auto px-6">

        {/* Lien retour */}
        <Link href="/annuaire" className="inline-flex items-center gap-2 text-sm font-medium text-[#14110B]/50 hover:text-[#0B6B3A] transition-colors mb-8">
          <ArrowLeft size={15} /> Retour à l&apos;annuaire
        </Link>

        {/* Header card sombre */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl" style={{ background: 'linear-gradient(135deg, #083A1E, #062812)' }}>
          {/* Pattern points */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(143,185,168,0.10) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          {/* Filet tricolore haut */}
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            <div className="flex-1 bg-[#0B6B3A]"></div>
            <div className="flex-1 bg-[#C9A227] relative flex items-center justify-center">
              <span className="absolute text-[#0B6B3A] text-[8px] leading-none">★</span>
            </div>
            <div className="flex-1 bg-[#E2231A]"></div>
          </div>
          {/* Contenu */}
          <div className="relative flex flex-wrap items-center gap-6 p-8 pt-10">
            {/* Photo */}
            <div className="flex-none w-32 h-40 rounded-xl overflow-hidden bg-[#0A5530] border border-[#0A5530] flex items-center justify-center shadow-lg">
              {photo?.filename ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/api/media/file/${photo.filename}`} alt={`${membre.prenom} ${membre.nom}`} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-4xl font-bold text-[#C9A227]">{initiales}</span>
              )}
            </div>
            {/* Identité */}
            <div className="flex-1 min-w-[200px]">
              <h1 className="font-serif text-3xl font-bold text-white">{membre.prenom} {membre.nom}</h1>
              {posteCap && (
                <span className="inline-block mt-3 bg-[#C9A227] text-[#062812] text-xs font-bold px-3 py-1 rounded-full">{posteCap}</span>
              )}
              {organisme && (
                <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-[#6FAE8E]">{organisme}</p>
              )}
            </div>
            {/* Logo organisme */}
            <div className="flex-none w-24 h-20 rounded-xl bg-white flex flex-col items-center justify-center gap-1 shadow p-2">
              {logoMedia?.filename ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/media/file/${logoMedia.filename}`}
                  alt={organisme || 'Organisme'}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <>
                  <Building2 size={24} className="text-[#0B6B3A]" />
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#062812] text-center leading-tight">
                    {organisme.match(/\b([A-ZÉÈÀ])/g)?.join('').slice(0, 5) ?? 'CAP'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Biographie */}
        <section className="mt-10 px-1">
          <div className="flex items-center gap-3 mb-5">
            <span className="block w-8 h-0.5 bg-[#C9A227]"></span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C9A227]">Biographie</span>
          </div>
          {hasBio ? (
            <div className="prose prose-sm max-w-none article-prose text-[#14110B]/70 leading-relaxed">
              <RichTextContent data={membre.biographie} />
            </div>
          ) : (
            <div className="flex flex-col gap-4 text-[#14110B]/70 text-base leading-relaxed">
              {bioDefaut.map((para, i) => (
                <p key={i} style={{ margin: 0, textAlign: 'justify' }}>{para}</p>
              ))}
            </div>
          )}
        </section>

        {/* Poste + Coordonnées */}
        <div className="grid sm:grid-cols-2 gap-8 mt-10 pt-8 border-t border-[#14110B]/10">
          {/* Poste */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={15} className="text-[#0B6B3A]" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C9A227]">Poste</span>
            </div>
            {posteCap && <p className="font-serif text-lg font-semibold text-[#062812]">{posteCap}</p>}
            {fonctionPro && <p className="text-sm text-[#14110B]/60 mt-1">{fonctionPro}</p>}
            {organisme && (
              <p className="flex items-center gap-2 text-sm text-[#14110B]/60 mt-3">
                <Building2 size={14} className="text-[#14110B]/30" /> {organisme}
              </p>
            )}
          </div>
          {/* Coordonnées */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={15} className="text-[#0B6B3A]" />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C9A227]">Coordonnées</span>
            </div>
            <div className="bg-white rounded-xl border border-[#14110B]/10 p-5">
              <div className="flex items-start gap-3">
                <Lock size={16} className="text-[#14110B]/30 mt-0.5 flex-none" />
                <div>
                  <p className="text-sm text-[#14110B]/60 leading-relaxed">Connectez-vous pour accéder aux coordonnées de ce membre.</p>
                  <Link href="/connexion" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#0B6B3A] hover:underline">
                    Se connecter <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  )
}
