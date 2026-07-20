import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, Lock, ArrowRight, Mail, Phone } from 'lucide-react'
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

  // Utilisateur connecté (pour l'affichage des coordonnées)
  const headersList = await headers()
  let currentUser = null
  try {
    const { user } = await payload.auth({ headers: headersList })
    currentUser = user
  } catch {
    currentUser = null
  }

  const email = membre.coordonnees?.emailProfessionnel ?? ''
  const telephone = membre.coordonnees?.telephone ?? ''
  const telephoneSecondaire = membre.coordonnees?.telephoneSecondaire ?? ''

  const photo = membre.photo && typeof membre.photo === 'object' && 'filename' in membre.photo
    ? (membre.photo as Media)
    : null

  const posteCap = membre.poste?.posteCap ?? ''
  const organisme = membre.poste?.organisme ?? ''
  const fonctionPro = membre.poste?.fonctionProfessionnelle ?? ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const siteOrganisme = (membre.poste as any)?.siteOrganisme ?? ''
  const siteUrl = siteOrganisme
    ? (siteOrganisme.startsWith('http') ? siteOrganisme : `https://${siteOrganisme}`)
    : `https://www.google.com/search?q=${encodeURIComponent(organisme)}`

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
        <div className="max-w-3xl mx-auto px-6 pt-8">

        {/* Lien retour */}
        <Link href="/annuaire" className="inline-flex items-center gap-2 text-sm font-medium text-[#14110B]/50 hover:text-[#1a7a3a] transition-colors mb-12">
          <ArrowLeft size={15} /> Retour à l&apos;annuaire
        </Link>

        {/* Header card sombre */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl" style={{ background: 'linear-gradient(135deg, #083A1E, #062812)' }}>
          {/* Pattern points */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(143,185,168,0.10) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
          {/* Filet tricolore bas */}
          <div className="absolute bottom-0 left-0 right-0 h-4 flex">
            <div className="flex-1" style={{ background: '#14b53a' }}></div>
            <div className="relative flex flex-1 items-center justify-center" style={{ background: '#fcd116' }}>
              <span className="absolute text-[16px] font-bold leading-none" style={{ color: '#14b53a' }}>★</span>
            </div>
            <div className="flex-1" style={{ background: '#ce0726' }}></div>
          </div>
          {/* Contenu */}
          <div className="relative flex flex-wrap items-center gap-6 p-8 pt-10">
            {/* Photo */}
            <div className="flex-none w-32 h-40 rounded-xl overflow-hidden bg-[#0A5530] border border-[#0A5530] flex items-center justify-center shadow-lg">
              {photo?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.url} alt={`${membre.prenom} ${membre.nom}`} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-4xl font-bold text-[#C8A24A]">{initiales}</span>
              )}
            </div>
            {/* Identité */}
            <div className="flex-1 min-w-[200px]">
              <h2 className="font-serif text-3xl font-bold text-white">{membre.prenom} {membre.nom}</h2>
              {posteCap && (
                <span className="inline-block mt-3 bg-[#C8A24A] text-[#062812] text-xs font-bold px-3 py-1 rounded-full">{posteCap}</span>
              )}
              {organisme && (
                <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-[#6FAE8E]">{organisme}</p>
              )}
              {fonctionPro && (
                <p className="mt-2 text-sm text-white/70">{fonctionPro}</p>
              )}
            </div>
            {/* Logo organisme */}
            {organisme ? (
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-none w-24 h-20 rounded-xl bg-white flex flex-col items-center justify-center gap-1 shadow p-2 hover:shadow-md transition-shadow"
              >
                {logoMedia?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoMedia.url}
                    alt={organisme || 'Organisme'}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <>
                    <Building2 size={24} className="text-[#1a7a3a]" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-[#062812] text-center leading-tight">
                      {organisme.match(/\b([A-ZÉÈÀ])/g)?.join('').slice(0, 5) ?? 'CAP'}
                    </span>
                  </>
                )}
              </a>
            ) : (
              <div className="flex-none w-24 h-20 rounded-xl bg-white flex flex-col items-center justify-center gap-1 shadow p-2">
                {logoMedia?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoMedia.url}
                    alt={organisme || 'Organisme'}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <Building2 size={24} className="text-[#1a7a3a]" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Biographie */}
        <section className="mt-10 px-1">
          <div className="flex items-center gap-3 mb-5">
            <span className="block w-8 h-0.5 bg-[#C8A24A]"></span>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A24A] font-bold">Biographie</span>
          </div>
          {hasBio ? (
            <div className="prose prose-sm max-w-none article-prose text-[#14110B]/70 leading-relaxed text-justify">
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
          <div className="bg-[#C8A24A] rounded-xl p-6 border border-[#14110B]/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-sm font-black uppercase tracking-widest text-[#062812]">{posteCap}</span>
            </div>
            {fonctionPro && <p className="text-sm text-white/80 mt-1">{fonctionPro}</p>}
            {organisme && (
              <p className="flex items-center gap-2 text-sm text-white/70 mt-3">
                <Building2 size={14} className="text-white/60" /> {organisme}
              </p>
            )}
          </div>
          {/* Coordonnées */}
          <div className="bg-[#FAF8F3] rounded-xl p-6 border border-[#14110B]/10">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs uppercase tracking-widest font-black text-[#C8A24A]">COORDONNÉES</span>
            </div>
            <div className="bg-white rounded-xl border border-[#14110B]/10 p-5">
              {currentUser ? (
                <div className="flex flex-col gap-3">
                  {email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-[#1a7a3a] flex-none" />
                      <a href={`mailto:${email}`} className="text-sm text-[#14110B]/70 hover:text-[#1a7a3a] break-all">{email}</a>
                    </div>
                  )}
                  {telephone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-[#1a7a3a] flex-none" />
                      <a href={`tel:${telephone}`} className="text-sm text-[#14110B]/70 hover:text-[#1a7a3a]">{telephone}</a>
                    </div>
                  )}
                  {telephoneSecondaire && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-[#1a7a3a] flex-none" />
                      <a href={`tel:${telephoneSecondaire}`} className="text-sm text-[#14110B]/70 hover:text-[#1a7a3a]">{telephoneSecondaire}</a>
                    </div>
                  )}
                  {!email && !telephone && !telephoneSecondaire && (
                    <p className="text-sm text-[#14110B]/60 leading-relaxed">Aucune coordonnée renseignée</p>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <Lock size={16} className="text-[#14110B]/30 mt-0.5 flex-none" />
                  <div>
                    <p className="text-sm text-[#14110B]/60 leading-relaxed">Connectez-vous pour accéder aux coordonnées</p>
                    <Link href="/connexion" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[#1a7a3a] hover:underline">
                      Se connecter <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
    </div>
  )
}
