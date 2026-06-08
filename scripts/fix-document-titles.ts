#!/usr/bin/env tsx
/**
 * Corrige les titres de documents corrompus par un mauvais encodage lors de
 * l'import WordPress (séquences UTF-8 mal réinterprétées, ex. "├®" au lieu de "é").
 *
 * Exemples :
 *   "D├®cret n┬░2021 03"  →  "Décret n°2021 03"
 *   "v├®hicules"          →  "véhicules"
 *   "indemnit├®"          →  "indemnité"
 *
 * Usage :
 *   npx tsx scripts/fix-document-titles.ts
 *   npx tsx scripts/fix-document-titles.ts --dry-run
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

// ─── Configuration ────────────────────────────────────────────────────────────

const args    = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')

// Caractères dont la présence trahit un titre corrompu
const CORRUPTION_REGEX = /[├┬╠╣╗¨ª░]/

// Séquences corrompues → caractère français correct.
// L'ordre compte : les séquences les plus longues doivent être testées en premier
// pour éviter qu'un remplacement partiel ne casse une séquence plus longue.
const MOJIBAKE_MAP: Array<[string, string]> = [
  // Lettre de base + accent combinant décomposé (U+0301, mojibaké en "╠ü") :
  // "e╠ü" représente un "e" suivi d'un accent aigu combinant → "é"
  // (les deux caractères doivent être consommés ensemble, sinon on obtient "eé")
  ['e╠ü', 'é'],
  ['E╠ü', 'É'],
  ['├«',  '«'], // guillemet ouvrant français
  ['├╗',  '»'], // guillemet fermant français
  ['├®',  'é'],
  ['├¨',  'è'],
  ['├ª',  'ê'],
  ['┬░',  '°'],
  ['┬®',  '®'],
]

// ─── Nettoyage ────────────────────────────────────────────────────────────────

function cleanTitle(titre: string): string {
  let result = titre
  for (const [corrompu, correct] of MOJIBAKE_MAP) {
    result = result.split(corrompu).join(correct)
  }
  return result
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log()
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║   Fix titres de documents corrompus (encodage)  ║')
  console.log('╚══════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('  Mode : DRY RUN  (aucune donnée modifiée)')
  console.log()

  console.log('► Connexion à Payload ...')
  const payload = await getPayload({ config })
  console.log('  ✓ Payload initialisé')
  console.log()

  console.log('► Récupération de tous les documents ...')
  const { docs, totalDocs } = await payload.find({
    collection:     'documents',
    limit:          1000,
    depth:          0,
    overrideAccess: true,
  })
  console.log(`  → ${totalDocs} document(s) trouvé(s)`)
  console.log()

  let updated      = 0
  let skipped      = 0
  const needsReview: Array<{ titre: string; cleaned: string }> = []
  const errors:      Array<{ titre: string; error: string }>  = []

  for (const doc of docs) {
    const original = doc.titre

    if (!CORRUPTION_REGEX.test(original)) {
      skipped++
      continue
    }

    const cleaned = cleanTitle(original)

    if (cleaned === original) {
      skipped++
      continue
    }

    if (CORRUPTION_REGEX.test(cleaned)) {
      needsReview.push({ titre: original, cleaned })
      continue
    }

    process.stdout.write(`  • "${original}" → "${cleaned}" ... `)

    if (DRY_RUN) {
      console.log('(dry-run)')
      updated++
      continue
    }

    try {
      await payload.update({
        collection:     'documents',
        id:             doc.id,
        data:           { titre: cleaned },
        overrideAccess: true,
      })
      updated++
      console.log('✓')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push({ titre: original, error: msg })
      console.log(`✗ ${msg}`)
    }
  }

  console.log()
  console.log('╔══════════════════════════ Résumé ═══════════════════════════╗')
  console.log(`  Corrigés     : ${updated}`)
  console.log(`  Déjà OK      : ${skipped}`)
  console.log(`  À revoir     : ${needsReview.length}`)
  console.log(`  Erreurs      : ${errors.length}`)
  if (needsReview.length > 0) {
    console.log()
    console.log('  Titres encore suspects après nettoyage (séquence inconnue) :')
    for (const r of needsReview) {
      console.log(`    • "${r.titre}"`)
      console.log(`      → "${r.cleaned}"`)
    }
  }
  if (errors.length > 0) {
    console.log()
    console.log('  Détail des erreurs :')
    for (const e of errors) {
      console.log(`    • ${e.titre}`)
      console.log(`      ${e.error}`)
    }
  }
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log()

  process.exit(0)
}

main().catch(err => {
  console.error('\nErreur fatale :', err)
  process.exit(1)
})
