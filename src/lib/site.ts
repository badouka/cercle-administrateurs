// Domaine canonique du site, source unique pour les métadonnées, le sitemap
// et robots.txt.
//
// Le site répond aussi sur cercle-administrateurs.vercel.app et sur une URL
// par déploiement : ces hôtes servent le même contenu, d'où la nécessité d'une
// URL canonique unique pour éviter le contenu dupliqué.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cercle-administrateurs.sn'
).replace(/\/$/, '')
