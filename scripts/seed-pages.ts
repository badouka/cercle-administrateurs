import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

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
    statut: 'publie',
    contenu: lexical(
      h2('Notre histoire'),
      p(t("Fondé il y a plus de vingt ans, le CAP rassemble des professionnels engagés dans la modernisation et l'amélioration continue des services publics. Notre réseau compte aujourd'hui plusieurs centaines de membres actifs issus de toutes les branches de l'administration.")),
      p(t("Depuis sa création, le Cercle s'est imposé comme un acteur incontournable du dialogue entre les acteurs publics, organisant régulièrement des rencontres, des conférences et des publications spécialisées.")),
      h2('Notre mission'),
      p(t("Le CAP a pour mission de créer un espace d'échange, de réflexion et de formation pour les administrateurs publics. Nous organisons des événements, publions des ressources et facilitons la mise en réseau entre professionnels du secteur public.")),
      p(t("Nous travaillons également à la valorisation du rôle des administrateurs publics dans la société et à la promotion d'une gouvernance efficace, transparente et responsable.")),
      h2('Nos valeurs'),
      h3('Solidarité'),
      p(t("Nous favorisons les échanges entre membres, le partage d'expériences et l'entraide au sein du réseau des administrateurs publics.")),
      h3('Excellence'),
      p(t("Nous promouvons les bonnes pratiques de gouvernance et accompagnons le développement des compétences des cadres de l'administration publique.")),
      h3('Transparence'),
      p(t("Nous agissons dans un esprit d'ouverture et de responsabilité, en rendant compte de nos activités à nos membres et partenaires.")),
    ),
  },
  {
    slug:   'mot-du-president',
    titre:  'Mot du Président',
    statut: 'publie',
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
      console.log(`⏭  Page "${page.slug}" existe déjà — ignorée.`)
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
