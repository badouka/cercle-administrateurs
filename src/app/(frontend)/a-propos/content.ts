// Contenu éditorial par défaut de la page « Qui sommes-nous ? ».
// Sert à la fois de fallback sur la page publique et de valeurs initiales dans l'éditeur.

export const INTRO_LEAD =
  "Le secteur parapublic sénégalais occupe une place stratégique dans l'architecture de l'État. Entreprises nationales, établissements publics, agences d'exécution, offices et fonds : ces entités sont le bras opérationnel des politiques publiques, les instruments par lesquels l'État traduit ses ambitions en actes concrets au bénéfice des citoyens."

export const INTRO_RIGHT = [
  "Leur performance n'est pas une question de gestion interne — c'est une question de souveraineté économique et de développement national.",
  "Or ce secteur traverse une période charnière. La loi d'orientation n° 2022-08 a posé les fondations d'une gouvernance modernisée. Les décrets d'application de 2025 ont précisé les règles de fonctionnement des organes délibérants, institué le Comité de Suivi du Secteur Parapublic et fixé les statuts-types des sociétés nationales. Le Plan de Transformation Sénégal 2050 du Président Bassirou Diomaye Faye a élevé la performance de l'administration publique au rang de priorité nationale. Le cadre existe. L'ambition est affirmée.",
  "Il reste à accomplir l'essentiel : opérationnaliser ces réformes dans la réalité quotidienne des entités parapubliques.",
]

export const DIAGNOSTIC_TITRE = 'Un écart persistant entre la qualité du cadre et la réalité des pratiques'
export const DIAGNOSTIC_TEXTE =
  "L'expérience accumulée au sein du secteur révèle un écart persistant entre la qualité du cadre normatif et la réalité des pratiques. Les contrats de performance existent rarement à l'état de véritables engagements évalués. Les comités d'audit fonctionnent trop souvent comme des organes de validation formelle plutôt que comme des outils de pilotage des risques. Les plans stratégiques pluriannuels sont adoptés en conseil mais rarement revisités en cours d'exercice. La culture de la reddition des comptes et de la mesure des résultats peine à s'imposer face à une logique procédurale qui privilégie la conformité sur la performance. Cette situation ne reflète pas un manque de textes : elle révèle un déficit de doctrine opérationnelle, de formation adaptée et de dialogue institutionnel structuré entre les organes délibérants, les directions générales et les autorités de tutelle. C'est précisément ce vide que le CAP a vocation à combler."

export const RAISON_TITRE = "La gouvernance se construit d'abord dans les organes délibérants"
export const RAISON_PARAS = [
  "C'est pour répondre à ce défi que le Cercle des Administrateurs Publics a été créé. Le CAP rassemble les présidents des conseils d'administration, de surveillance et d'orientation des entités du secteur parapublic autour d'une conviction fondatrice : la qualité de la gouvernance se construit d'abord dans les organes délibérants.",
  "Le CAP n'est pas une chambre de représentation. Il est un espace de transformation — un lieu où les administrateurs publics se forment, échangent, se challengent mutuellement et construisent ensemble les standards d'une gouvernance publique à la hauteur des ambitions du Sénégal 2050.",
]

export const ENGAGEMENTS_TITLE = "Ce que le CAP s'engage à faire"
export const ENGAGEMENTS: { titre: string; texte: string }[] = [
  {
    titre: 'Renforcer les capacités',
    texte:
      'Des programmes de formation continue sur la gouvernance, la gestion des risques et la performance des organes dirigeants.',
  },
  {
    titre: 'Promouvoir les meilleures pratiques',
    texte:
      "Diffusion de référentiels et d'outils de gouvernance issus des meilleures pratiques africaines et internationales.",
  },
  {
    titre: 'Structurer le dialogue institutionnel',
    texte: "Un dialogue permanent avec les ministères de tutelle et les corps de contrôle de l'État.",
  },
  {
    titre: 'Être une force de proposition',
    texte:
      "La promotion d'une culture de la performance et du contrat de performance au sein du secteur parapublic.",
  },
  {
    titre: "Incarner l'exigence de résultats",
    texte:
      'Un suivi rigoureux des objectifs à travers des tableaux de bord et des organes délibérants engagés.',
  },
]

export const CADRE_SUB =
  "Le secteur parapublic traverse une période charnière : le cadre existe, l'ambition est affirmée. Il reste à l'opérationnaliser."
export const CADRE_TITLE = 'Une réforme posée, une mise en œuvre à accomplir'
export const CADRE: { titre: string; texte: string }[] = [
  {
    titre: "Loi d'orientation n° 2022-08",
    texte: "Pose les fondations d'une gouvernance modernisée du secteur parapublic.",
  },
  {
    titre: "Décrets d'application 2025",
    texte: 'Précisent les règles de fonctionnement des organes délibérants et fixent les statuts-types.',
  },
  {
    titre: 'Plan Sénégal 2050',
    texte: "Élève la performance de l'administration publique au rang de priorité nationale.",
  },
]

// ── Forme du champ JSON `sections` ─────────────────────────────────────────────
export interface AProposSectionsData {
  secteurParapublic: string
  diagnostic:        string
  raisonEtre:        string
  engagements:       string[]
  cadre:             string[]
  vision:            string
}

// Valeurs par défaut « aplaties » (une chaîne par zone de texte) pour l'éditeur.
// Les paragraphes multiples sont séparés par une ligne vide.
export const A_PROPOS_SECTION_DEFAULTS: AProposSectionsData = {
  secteurParapublic: [INTRO_LEAD, ...INTRO_RIGHT].join('\n\n'),
  diagnostic:        DIAGNOSTIC_TEXTE,
  raisonEtre:        RAISON_PARAS.join('\n\n'),
  engagements:       ENGAGEMENTS.map((e) => e.texte),
  cadre:             CADRE.map((c) => c.texte),
  vision:            '',
}

// Découpe un bloc de texte en paragraphes (séparés par une ou plusieurs lignes vides).
export function splitParas(text?: string | null): string[] {
  return (text ?? '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
}
