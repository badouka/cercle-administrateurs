/**
 * Désactivation des membres absents de Liste-membres-CAP.xlsx.
 *
 * Le fichier Excel fait foi : toute fiche dont le slug ne correspond à aucune
 * de ses 35 lignes passe en `adhesion.statut = 'inactif'`. Rien n'est supprimé,
 * et le reste du groupe `adhesion` (numéro et date d'adhésion) est préservé.
 *
 * Les membres du bureau absents du fichier sont désactivés eux aussi : le
 * fichier ne liste que des présidents de conseil, mais c'est la liste de
 * référence retenue.
 *
 * Rappel : `inactif` ne bloque pas la connexion (seul `suspendu` le fait dans
 * src/middleware.ts) ; il retire du site public, du sitemap et du chatbot.
 *
 * Usage :
 *   pnpm tsx scripts/desactiver-hors-excel.ts --dry-run
 *   pnpm tsx scripts/desactiver-hors-excel.ts
 */

import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const DRY_RUN = process.argv.includes('--dry-run')

/** Les 35 lignes de la feuille, sous la forme [nom, prénom]. */
const MEMBRES_EXCEL: [string, string][] = [
  ['Biteye', 'Cheikh'],          ['Sakho', 'Lansana Gagny'],  ['Badiane', 'Cheikh'],
  ['Sané', 'Hatab'],             ['Watt', 'Omar'],            ['Gueye', 'Papa Madieye'],
  ['Dia', 'Moctar'],             ['Mboup', 'Mamadou Ngouda'], ['Diop', 'Médou Mané'],
  ['Djiba', 'Sadibou'],          ['Ndiaye', 'Mor Talla'],     ['Seck', 'Sidy M.'],
  ['Goudiaby', 'Mamadou'],       ['Diouf', 'Abdou'],          ['Kanté', 'Abdou Salam'],
  ['Beye', 'Sidya'],             ['Badji', 'Pape Ali'],       ['Cissé', 'Amadou'],
  ['Faye', 'Adama'],             ['Ndiaye', 'Tahir'],         ['Diop', 'Bocar'],
  ['Diouf', 'Colonel Tabaski'],  ['Sarr', 'Mamadou'],         ['Diallo', 'Saliou'],
  ['Mbodji', 'Abdou Aziz'],      ['Thiam', 'Khady G.'],       ['Ba', 'Moussa'],
  ['Niass', 'Tidjani'],          ['Thiam', 'Demba'],          ['Diouf', 'Mamadou'],
  ['Sow', 'Taha'],               ['Ndiaye', 'Sidy Alboury'],  ['Sène', 'Mbaye'],
  ['Mbacké', 'Bassirou'],        ['Diop', 'Doudou Gnagna'],
]

/**
 * Membres conservés actifs bien qu'absents du fichier : le .xlsx ne recense
 * que les présidents de conseil en exercice, il ignore les distinctions
 * honorifiques. Sans cette liste, rejouer le script les désactiverait.
 */
const EXCEPTIONS: string[] = [
  'mamadoufaye', // Mamadou Faye, membre d'honneur
]

/** Réplique du `toSlug` de src/collections/Membres.ts. */
function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

async function main() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')

  const slugsExcel = MEMBRES_EXCEL.map(([nom, prenom]) => toSlug(`${prenom}${nom}`))
  const aConserver = new Set([...slugsExcel, ...EXCEPTIONS])

  console.log('')
  console.log('  Désactivation des membres hors fichier Excel')
  console.log(`  ${slugsExcel.length} slug(s) du fichier + ${EXCEPTIONS.length} exception(s)`)
  if (DRY_RUN) console.log('  MODE DRY-RUN — aucune écriture en base')
  console.log('')

  const payload = await getPayload({ config })

  const { docs, totalDocs } = await payload.find({
    collection:     'membres',
    limit:          1000,
    depth:          0,
    overrideAccess: true,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fiches = docs as any[]

  // Garde-fou : si une ligne du fichier ne retrouve pas sa fiche, le
  // rapprochement est faux quelque part et désactiver serait dangereux.
  const introuvables = slugsExcel.filter(s => !fiches.some(f => f.slug === s))
  if (introuvables.length > 0) {
    console.error(`  ABANDON — ${introuvables.length} slug(s) du fichier sans fiche en base :`)
    for (const s of introuvables) console.error(`   - ${s}`)
    process.exit(1)
  }

  const aDesactiver = fiches
    .filter(f => !aConserver.has(f.slug))
    .sort((a, b) => `${a.nom}`.localeCompare(`${b.nom}`, 'fr'))

  console.log(`  ${totalDocs} fiche(s) en base — ${aDesactiver.length} à désactiver\n`)

  let majs      = 0
  let dejaFaits = 0
  let echecs    = 0

  for (const fiche of aDesactiver) {
    const etiquette = `${fiche.prenom} ${fiche.nom}`.replace(/\s+/g, ' ').trim()
    const statut    = fiche.adhesion?.statut ?? '—'
    const posteCap  = (fiche.poste?.posteCap ?? '').trim()
    const bureau    = posteCap !== '' && posteCap !== 'Membre' ? `  (bureau : ${posteCap})` : ''

    if (statut === 'inactif') {
      console.log(`  DEJA   ${etiquette}  [${fiche.slug}]${bureau}`)
      dejaFaits++
      continue
    }

    console.log(`  INACTIF ${etiquette}  [${fiche.slug}]  ${statut} -> inactif${bureau}`)

    if (DRY_RUN) {
      majs++
      continue
    }

    try {
      await payload.update({
        collection:     'membres',
        id:             fiche.id,
        data:           { adhesion: { ...(fiche.adhesion ?? {}), statut: 'inactif' } },
        overrideAccess: true,
      })
      majs++
    } catch (e) {
      console.error(`          ECHEC — ${e instanceof Error ? e.message : String(e)}`)
      echecs++
    }
  }

  console.log('')
  console.log('  ─────────────────────────────────────────────')
  console.log(`  Désactivés    : ${majs}`)
  console.log(`  Déjà inactifs : ${dejaFaits}`)
  console.log(`  Échecs        : ${echecs}`)
  console.log(`  Actifs restants : ${totalDocs - aDesactiver.length}`)
  console.log('  ─────────────────────────────────────────────')
  console.log('')

  process.exit(echecs > 0 ? 1 : 0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
