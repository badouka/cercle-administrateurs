import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Membre, Media, Page } from '@/payload-types'

// ── Helpers ────────────────────────────────────────────────────────────────────

function initiales(prenom?: string | null, nom?: string | null): string {
  return `${(prenom ?? '').charAt(0)}${(nom ?? '').charAt(0)}`.toUpperCase()
}

const messageParas = [
  "Le Sénégal a toujours fait de la performance de son administration publique un chantier prioritaire. Du Plan Sénégal Émergent au Plan de Transformation Sénégal 2050 du Président Bassirou Diomaye Faye, la même conviction traverse les ambitions de notre pays : l'État ne peut pleinement servir ses citoyens qu'en se réformant lui-même, en s'allégeant, en se concentrant sur ses missions essentielles et en confiant l'exécution de certaines politiques publiques à des structures plus agiles et plus proches du terrain.",
  "C'est dans cet esprit que sont nées les entités du secteur parapublic. En externalisant certaines missions au profit de structures dotées d'une plus grande autonomie de gestion, l'État sénégalais a voulu introduire une culture de la performance au cœur de l'action publique, en s'inspirant des méthodes du secteur privé sans renoncer aux exigences de l'intérêt général.",
  "Mais une structure agile ne suffit pas. Ce qui fait la différence, c'est la qualité des femmes et des hommes qui la dirigent et notamment la compétence et la posture de ceux qui siègent dans ses organes délibérants. Un organe délibérant performant ne se décrète pas : il se construit, délibération après délibération, sur un socle de compétences diverses, de débats substantiels et d'une exigence collective tournée vers les résultats. C'est la conviction qui a présidé à la naissance du Cercle des Administrateurs Publics (CAP).",
  "Le CAP rassemble les présidents des organes délibérants du secteur parapublic avec une ambition claire : être un cadre de réflexion, d'échanges et d'impulsion d'idées au service de la modernisation de l'administration sénégalaise. Renforcer les capacités de ses membres, partager les meilleures pratiques de gouvernance, veiller à la mise en œuvre des orientations présidentielles au sein des établissements publics, constituer une force de proposition pour les pouvoirs publics telles sont les missions que notre cercle s'est assignées depuis sa création.",
  "Dans un secteur parapublic appelé à jouer un rôle croissant dans la mise en œuvre du Sénégal 2050, le CAP entend être bien plus qu'une association professionnelle. Il veut être un levier de transformation, un pilier de référence dans la promotion d'une gouvernance publique transparente, efficace et innovante au service du développement durable et de l'intérêt général.",
]

async function fetchPage(): Promise<Page | null> {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection:     'pages',
    where:          { slug: { equals: 'mot-du-president' } },
    depth:          0,
    limit:          1,
    overrideAccess: true,
  })
  return (docs[0] as Page | undefined) ?? null
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchPage()
  return { title: page ? `${page.titre} — CAP` : 'Mot du Président — CAP' }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function MotDuPresidentPage() {
  const payload = await getPayload({ config })

  const membresRes = await payload.find({
    collection:     'membres',
    depth:          1,
    limit:          500,
    sort:           'nom',
    overrideAccess: true,
  })

  // Les valeurs poste.posteCap importées contiennent parfois des espaces parasites :
  // on retrouve donc le président côté JS avec un `.trim()`.
  const president = (membresRes.docs as Membre[]).find(m => {
    const p = (m.poste?.posteCap ?? '').trim()
    return p === 'Président' || p === 'Présidente'
  }) ?? null

  const presidentMedia =
    president?.photo && typeof president.photo === 'object' ? (president.photo as Media) : null
  const presidentPhoto = presidentMedia?.url ?? null

  const presidentNom = president ? `${president.prenom} ${president.nom}` : 'Lansana Gagny SAKHO'
  const presidentInitiales = president ? initiales(president.prenom, president.nom) : 'LS'

  return (
    <div className="bg-white">
      {/* ── 1. Hero éditorial (fond sombre) ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#062812] pt-24 pb-16">
        {/* Pattern de points */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(143,185,168,0.10) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* Cercle lumineux doré */}
        <div className="absolute top-[-20%] right-[-8%] h-[40vw] max-h-[520px] w-[40vw] max-w-[520px] rounded-full bg-gradient-to-br from-[#C9A227]/20 to-transparent" />
        {/* Filet tricolore en haut */}
        <div className="absolute top-0 left-0 right-0 flex h-1.5">
          <div className="flex-1" style={{ background: '#14b53a' }}></div>
          <div className="relative flex flex-1 items-center justify-center" style={{ background: '#fcd116' }}>
            <span className="absolute text-[8px] leading-none" style={{ color: '#14b53a' }}>★</span>
          </div>
          <div className="flex-1" style={{ background: '#ce0726' }}></div>
        </div>

        <div className="relative z-10">
          {/* Lien retour */}
          <div className="mx-auto mb-8 max-w-7xl px-6">
            <Link
              href="/a-propos"
              className="text-sm font-medium text-[#6FAE8E] transition-colors hover:text-white"
            >
              ← Qui sommes-nous ?
            </Link>
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.7fr_1.3fr]">
            {/* Colonne gauche : photo */}
            <div className="relative max-w-[300px]">
              <div className="overflow-hidden rounded-2xl border border-[#0A5530] shadow-2xl">
                {presidentPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={presidentPhoto}
                    alt={presidentNom}
                    className="aspect-[4/5] w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex aspect-[4/5] w-full items-center justify-center bg-[#0A5530]">
                    <span className="font-serif text-5xl font-bold text-[#C9A227]">
                      {presidentInitiales}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute right-[-16px] bottom-6 rounded-xl bg-[#C9A227] px-4 py-3 text-[#062812] shadow-xl">
                <p className="text-base font-bold">{presidentNom}</p>
                <p className="text-xs font-semibold">Président du CAP</p>
              </div>
            </div>

            {/* Colonne droite */}
            <div>
              <div className="flex items-center gap-3">
                <span className="h-0.5 w-8 bg-[#C9A227]" />
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
                  Le mot du président
                </span>
              </div>
              <h1 className="mt-4 font-serif text-5xl leading-tight text-white">
                {'« Servir l\'État, une '}
                <span className="text-[#C9A227]">exigence</span>
                {' partagée »'}
              </h1>
              <p className="mt-5 max-w-prose text-base leading-relaxed text-[#6FAE8E]">
                {"À l'occasion du renouvellement du bureau exécutif, le Président adresse son message aux membres du Cercle et à l'ensemble des serviteurs de l'État."}
              </p>
            </div>
          </div>
        </div>

        {/* Filet tricolore en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1" style={{ background: '#14b53a' }}></div>
          <div className="relative flex flex-1 items-center justify-center" style={{ background: '#fcd116' }}>
            <span className="absolute text-[8px] leading-none" style={{ color: '#14b53a' }}>★</span>
          </div>
          <div className="flex-1" style={{ background: '#ce0726' }}></div>
        </div>
      </section>

      {/* ── 2. Corps du message ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-serif text-xl text-[#083A1E] mb-6">
          <span className="font-serif text-8xl font-bold text-[#14b53a] float-left mr-2 leading-none mt-1">L</span>
          {messageParas[0].slice(1)}
        </p>

        <div className="flex flex-col gap-6 text-[#14110B]/80 text-base leading-relaxed mt-8">
          {messageParas.slice(1).map((para, i) => (
            <p key={i} style={{ margin: 0 }}>{para}</p>
          ))}
        </div>
      </section>

      {/* ── 3. Signature ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-6 border-t border-[#14110B]/10 pt-8">
          {/* Gauche */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#C9A227] bg-[#14b53a]/10 text-lg font-bold text-[#14b53a]">
              {presidentInitiales}
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-[#062812]">{presidentNom}</p>
              <p className="text-sm font-semibold text-[#C9A227]">Président du CAP</p>
            </div>
          </div>

          {/* Droite : réseaux sociaux */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/lansanagagny"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#14110B]/15 text-[#14110B]/50 transition-colors hover:border-[#14b53a] hover:bg-[#14b53a] hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a
              href="https://x.com/LansanaGagny"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#14110B]/15 text-[#14110B]/50 transition-colors hover:border-[#14b53a] hover:bg-[#14b53a] hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/lansana-gagny-sakho/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#14110B]/15 text-[#14110B]/50 transition-colors hover:border-[#14b53a] hover:bg-[#14b53a] hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
