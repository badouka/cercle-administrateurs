#!/usr/bin/env tsx
/**
 * Corrige le champ `acces` de tous les documents déjà importés dans Payload
 * en fonction de leur catégorie.
 *
 * Usage :
 *   npx tsx scripts/fix-documents-access.ts
 *   npx tsx scripts/fix-documents-access.ts --dry-run
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

// ─── Configuration ────────────────────────────────────────────────────────────

const args    = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')

type DocumentCategorie =
  | 'textes_statutaires'
  | 'textes_reglementaires'
  | 'pv_reunion'
  | 'ressources'
  | 'magazines'
  | 'docs_politique_economique'

const CATEGORY_ACCESS: Record<DocumentCategorie, 'public' | 'membres'> = {
  textes_statutaires:        'public',
  textes_reglementaires:     'public',
  pv_reunion:                'membres',
  ressources:                'membres',
  magazines:                 'public',
  docs_politique_economique: 'public',
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log()
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║   Fix accès documents Payload                    ║')
  console.log('╚══════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('  Mode : DRY RUN  (aucune donnée modifiée)')
  console.log()

  console.log('► Connexion à Payload ...')
  const payload = await getPayload({ config })
  console.log('  ✓ Payload initialisé')
  console.log()

  console.log('► Récupération de tous les documents ...')
  const { docs, totalDocs } = await payload.find({
    collection: 'documents',
    limit: 1000,
    depth: 0,
    overrideAccess: true,
  })
  console.log(`  → ${totalDocs} document(s) trouvé(s)`)
  console.log()

  let updated = 0
  let skipped = 0
  const errors: Array<{ titre: string; error: string }> = []

  for (const doc of docs) {
    const categorie = doc.categorie as DocumentCategorie
    const correctAcces = CATEGORY_ACCESS[categorie]

    if (!correctAcces) {
      errors.push({ titre: doc.titre, error: `catégorie inconnue : ${categorie}` })
      continue
    }

    if (doc.acces === correctAcces) {
      skipped++
      continue
    }

    process.stdout.write(
      `  • "${doc.titre.substring(0, 45)}" [${categorie}] : ${doc.acces} → ${correctAcces} ... `,
    )

    if (DRY_RUN) {
      console.log('(dry-run)')
      updated++
      continue
    }

    try {
      await payload.update({
        collection: 'documents',
        id: doc.id,
        data: { acces: correctAcces },
        overrideAccess: true,
      })
      updated++
      console.log('✓')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push({ titre: doc.titre, error: msg })
      console.log(`✗ ${msg}`)
    }
  }

  console.log()
  console.log('╔══════════════════════════ Résumé ═══════════════════════════╗')
  console.log(`  Mis à jour : ${updated}`)
  console.log(`  Déjà OK    : ${skipped}`)
  console.log(`  Erreurs    : ${errors.length}`)
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
