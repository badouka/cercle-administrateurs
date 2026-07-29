// Contenu par défaut des pages légales, au format Lexical.
//
// Il sert de repli tant que le document `pages` correspondant n'existe pas en
// base, de valeur initiale quand le gestionnaire ouvre la page pour la première
// fois, et de contenu pour `scripts/seed-pages.ts`. Une fois la page enregistrée
// depuis /gestionnaire/pages, c'est la base qui fait foi.

const t = (text: string, format = 0) => ({
  type: 'text', text, format, mode: 'normal', style: '', detail: 0, version: 1,
})

const gras = (text: string) => t(text, 1)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lien = (url: string, text: string, newTab = false): any => ({
  type:     'link',
  version:  1,
  direction: 'ltr',
  format:   '',
  indent:   0,
  fields:   { url, newTab, linkType: 'custom' },
  children: [t(text)],
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const p = (...children: any[]) => ({
  type: 'paragraph', children, version: 1,
  direction: 'ltr', format: '', indent: 0, textFormat: 0,
})

const h2 = (text: string) => ({
  type: 'heading', tag: 'h2', children: [t(text)], version: 1,
  direction: 'ltr', format: '', indent: 0,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lexical = (...nodes: any[]) => ({
  root: { type: 'root', children: nodes, version: 1, direction: 'ltr', format: '', indent: 0 },
})

export const MENTIONS_LEGALES_DEFAUT = lexical(
  h2('Éditeur du site'),
  p(
    t('Ce site est édité par le '),
    gras('CAP — Cercle des Administrateurs Publics'),
    t('. Dakar, Sénégal. '),
    lien('mailto:contact@cap-senegal.org', 'contact@cap-senegal.org'),
  ),

  h2('Hébergement'),
  p(
    t('Ce site est développé et hébergé par '),
    lien('https://digissol.com', 'DIGISSOL', true),
    t('.'),
  ),

  h2('Propriété intellectuelle'),
  p(t(
    "L'ensemble des contenus présents sur ce site (textes, images, logos, graphismes, " +
    "documents téléchargeables) est la propriété exclusive du CAP — Cercle des Administrateurs " +
    "Publics, sauf mention contraire. Toute reproduction, représentation, modification, " +
    "publication ou adaptation, totale ou partielle, de ces éléments, quel que soit le moyen " +
    "ou le procédé utilisé, est interdite sans l'autorisation écrite préalable du CAP.",
  )),

  h2('Responsabilité'),
  p(t(
    "Le CAP s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur " +
    "ce site. Toutefois, il ne saurait être tenu responsable des erreurs, omissions ou d'une " +
    "éventuelle indisponibilité du site. Les liens vers des sites tiers sont fournis à titre " +
    "informatif ; le CAP décline toute responsabilité quant à leur contenu.",
  )),
)

export const POLITIQUE_CONFIDENTIALITE_DEFAUT = lexical(
  h2('Collecte des données'),
  p(t(
    "Le CAP — Cercle des Administrateurs Publics collecte les données personnelles que vous nous " +
    "transmettez volontairement, notamment lors de votre adhésion, de votre inscription à une " +
    "activité ou de votre prise de contact : nom, prénom, coordonnées, fonction et organisme de " +
    "rattachement. Aucune donnée n'est collectée à votre insu.",
  )),

  h2('Utilisation des données'),
  p(t(
    "Les données recueillies sont utilisées exclusivement pour la gestion des adhésions, " +
    "l'organisation des activités du Cercle, la diffusion d'informations relatives à nos actions " +
    "et la tenue de l'annuaire des membres. Elles ne sont ni vendues, ni cédées à des tiers à des " +
    "fins commerciales.",
  )),

  h2('Vos droits'),
  p(t(
    "Conformément à la réglementation en vigueur sur la protection des données personnelles, vous " +
    "disposez d'un droit d'accès, de rectification, d'opposition et de suppression des données vous " +
    "concernant. Vous pouvez exercer ces droits à tout moment en nous contactant.",
  )),

  h2('Contact'),
  p(
    t("Pour toute question relative à la présente politique ou à l'exercice de vos droits, vous pouvez nous écrire à l'adresse suivante : "),
    lien('mailto:contact@cap-senegal.org', 'contact@cap-senegal.org'),
    t('.'),
  ),
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CONTENU_DEFAUT_PAR_SLUG: Record<string, any> = {
  'mentions-legales':          MENTIONS_LEGALES_DEFAUT,
  'politique-confidentialite': POLITIQUE_CONFIDENTIALITE_DEFAUT,
}
