#!/usr/bin/env tsx
/**
 * Génère les slugs manquants pour tous les membres existants.
 *
 * Usage :
 *   npx tsx scripts/backfill-membres-slugs.ts
 *   npx tsx scripts/backfill-membres-slugs.ts --dry-run
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

const args    = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')

function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

async function main(): Promise<void> {
  console.log()
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║   Backfill slugs des membres                     ║')
  console.log('╚══════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('  Mode : DRY RUN  (aucune donnée modifiée)')
  console.log()

  const payload = await getPayload({ config })
  console.log('  ✓ Payload initialisé\n')

  const { docs, totalDocs } = await payload.find({
    collection:     'membres',
    limit:          1000,
    depth:          0,
    overrideAccess: true,
  })
  console.log(`► ${totalDocs} membre(s) trouvé(s)\n`)

  const toFix     = docs.filter(m => !m.slug)
  const alreadyOk = docs.length - toFix.length
  console.log(`  → ${alreadyOk} déjà avec slug`)
  console.log(`  → ${toFix.length} sans slug\n`)

  if (toFix.length === 0) {
    console.log('  ✓ Rien à faire.')
    process.exit(0)
  }

  let updated = 0
  const errors: Array<{ id: number; nom: string; error: string }> = []

  for (const membre of toFix) {
    const label    = `${membre.prenom} ${membre.nom}`.trim() || `#${membre.id}`
    const slug     = toSlug(`${membre.prenom}${membre.nom}`)

    process.stdout.write(`  • ${label.substring(0, 40).padEnd(40)} → ${slug.padEnd(25)} ... `)

    if (DRY_RUN) {
      console.log('(dry-run)')
      updated++
      continue
    }

    try {
      await payload.update({
        collection:     'membres',
        id:             membre.id,
        data:           { slug },
        overrideAccess: true,
      })
      updated++
      console.log('✓')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push({ id: membre.id, nom: label, error: msg })
      console.log(`✗ ${msg}`)
    }
  }

  console.log()
  console.log('╔══════════════════════════ Résumé ═══════════════════════════╗')
  console.log(`  Mis à jour   : ${updated}`)
  console.log(`  Déjà traités : ${alreadyOk}`)
  console.log(`  Erreurs      : ${errors.length}`)
  if (errors.length > 0) {
    console.log()
    console.log('  Détail des erreurs :')
    for (const e of errors) {
      console.log(`    • [${e.id}] ${e.nom}`)
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
