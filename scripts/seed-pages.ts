import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { A_PROPOS_SECTION_DEFAULTS } from '@/app/(frontend)/a-propos/content'

// ── Helpers Lexical ────────────────────────────────────────────────────────

const t = (text: string) => ({
  type: 'text', text, format: 0, mode: 'normal', style: '', detail: 0, version: 1,
})

const p = (...children: ReturnType<typeof t>[]) => ({
  type: 'paragraph', children, version: 1,
  direction: 'ltr', format: '', indent: 0, textFormat: 0,
})

const h2 = (text: string) => ({
  type: 'heading', tag: 'h2', children: [t(text)], version: 1,
  direction: 'ltr', format: '', indent: 0,
})

const h3 = (text: string) => ({
  type: 'heading', tag: 'h3', children: [t(text)], version: 1,
  direction: 'ltr', format: '', indent: 0,
})

const ul = (...items: string[]) => ({
  type: 'list', listType: 'bullet', tag: 'ul', start: 1, version: 1,
  direction: 'ltr', format: '', indent: 0,
  children: items.map((item, i) => ({
    type: 'listitem', value: i + 1, version: 1,
    direction: 'ltr', format: '', indent: 0,
    children: [t(item)],
  })),
})

const quote = (text: string) => ({
  type: 'quote', children: [t(text)], version: 1,
  direction: 'ltr', format: '', indent: 0,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lexical = (...nodes: any[]) => ({
  root: { type: 'root', children: nodes, version: 1, direction: 'ltr', format: '', indent: 0 },
})

// ── Contenu des pages ──────────────────────────────────────────────────────

const PAGES = [
  {
    slug:   'a-propos',
    titre:  'Qui sommes-nous ?',
    description: 'Le Cercle des Administrateurs Publics (CAP) rassemble les présidents de conseil d\'administration, de surveillance ou d\'orientation des établissements du secteur parapublic.',
    extrait: 'Le secteur parapublic sénégalais occupe une place stratégique dans l\'architecture de l\'État.',
    contenu: null,
    statut: 'publie',
    // Vrai contenu éditorial de la page « Qui sommes-nous ? » (champ JSON `sections`).
    sections: A_PROPOS_SECTION_DEFAULTS,
  },
  {
    slug:   'mot-du-president',
    titre:  'Mot du Président',
    statut: 'publie',
    citation: 'Le Sénégal a toujours fait de la performance de son administration publique un chantier prioritaire. Du Plan Sénégal Émergent au Plan de Transformation Sénégal 2050 du Président Bassirou Diomaye Faye, la même conviction traverse les ambitions de notre pays : l\'État ne peut pleinement servir ses citoyens qu\'en se réformant lui-même, en s\'allégeant, en se concentrant sur ses missions essentielles et en confiant l\'exécution de certaines politiques publiques à des structures plus agiles et plus proches du terrain.',
    contenu: lexical(
      quote("« L'administration publique est le reflet de notre engagement collectif envers le bien commun. À travers le CAP, nous bâtissons ensemble les ponts entre les générations d'administrateurs, entre les expériences et les aspirations. »"),
      p(t('Chers membres, chers amis,')),
      p(t("C'est avec une grande fierté que je m'adresse à vous en tant que Président du Cercle des Administrateurs Publics. Notre association représente bien plus qu'un simple réseau professionnel : elle incarne une vision partagée de ce que peut et doit être le service public dans notre pays.")),
      p(t("Ces dernières années ont été marquées par des transformations profondes de l'environnement administratif. La digitalisation, les nouvelles attentes des citoyens, les défis budgétaires et les enjeux environnementaux ont profondément redessiné le paysage dans lequel nous évoluons. Face à ces mutations, la formation continue et le partage de bonnes pratiques sont devenus des impératifs.")),
      p(t("Le CAP s'est toujours inscrit dans cette dynamique en offrant à ses membres des espaces d'échange, de formation et de réflexion prospective. Nos rencontres, nos publications et nos événements visent à doter chaque administrateur des outils et des réseaux nécessaires pour relever les défis de demain.")),
      p(t("Je vous invite à vous impliquer davantage dans la vie de notre cercle, à partager vos expériences et à contribuer aux débats qui façonnent l'avenir de notre administration.")),
      p(t("Ensemble, continuons à construire une administration publique performante, humaine et au service de tous.")),
    ),
  },
  {
    slug:   'partenaires',
    titre:  'Nos partenaires',
    statut: 'publie',
    contenu: lexical(
      h2('Institutions publiques'),
      ul(
        "Ministère de la Fonction Publique — Partenaire institutionnel pour la formation et la mobilité des agents.",
        "École Nationale d'Administration — Partenaire académique pour les programmes de développement des compétences.",
        "Direction Générale de l'Administration — Collaboration sur les projets de modernisation administrative.",
      ),
      h2('Organisations professionnelles'),
      ul(
        "Association des Directeurs Généraux — Réseau partenaire pour les échanges de pratiques de direction.",
        "Fédération des Cadres Publics — Partenaire pour la défense et la valorisation des métiers publics.",
        "Institut du Management Public — Partenaire formation pour les programmes de leadership public.",
      ),
      h2('Partenaires académiques'),
      ul(
        "Université Paris-Dauphine — Partenariat de recherche sur la gouvernance publique.",
        "Sciences Po — Collaboration pour les programmes d'études et de recherche.",
      ),
    ),
  },
]

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const payload = await getPayload({ config })

  for (const page of PAGES) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { docs } = await (payload.find as any)({
      collection:     'pages',
      where:          { slug: { equals: page.slug } },
      limit:          1,
      overrideAccess: true,
    })

    if (docs.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (payload.update as any)({
        collection:     'pages',
        id:             docs[0].id,
        data:           page,
        overrideAccess: true,
      })
      console.log(`↻  Page "${page.slug}" mise à jour.`)
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (payload.create as any)({
        collection:     'pages',
        data:           page,
        overrideAccess: true,
      })
      console.log(`✓  Page "${page.slug}" créée.`)
    }
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
