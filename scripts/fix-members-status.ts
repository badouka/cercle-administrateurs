#!/usr/bin/env tsx
/**
 * Met tous les membres avec statut ≠ 'actif' en statut 'actif'.
 *
 * Usage :
 *   npx tsx scripts/fix-members-status.ts
 *   npx tsx scripts/fix-members-status.ts --dry-run
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

const args    = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')

async function main(): Promise<void> {
  console.log()
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║   Fix statut membres → actif                     ║')
  console.log('╚══════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('  Mode : DRY RUN  (aucune donnée modifiée)')
  console.log()

  console.log('► Connexion à Payload ...')
  const payload = await getPayload({ config })
  console.log('  ✓ Payload initialisé')
  console.log()

  console.log('► Récupération de tous les membres ...')
  const { docs, totalDocs } = await payload.find({
    collection:     'membres',
    limit:          1000,
    depth:          0,
    overrideAccess: true,
  })
  console.log(`  → ${totalDocs} membre(s) trouvé(s) au total`)

  const toFix  = docs.filter(m => m.adhesion?.statut !== 'actif')
  const alreadyOk = docs.length - toFix.length
  console.log(`  → ${alreadyOk} déjà actif(s)`)
  console.log(`  → ${toFix.length} à corriger (statut ≠ 'actif')`)
  console.log()

  if (toFix.length === 0) {
    console.log('  ✓ Rien à corriger.')
    process.exit(0)
  }

  let updated = 0
  const errors: Array<{ id: number; nom: string; error: string }> = []

  for (const membre of toFix) {
    const label = `${membre.prenom} ${membre.nom}`.trim() || `#${membre.id}`
    const currentStatut = membre.adhesion?.statut ?? '(vide)'

    process.stdout.write(`  • ${label.substring(0, 45).padEnd(45)} [${currentStatut} → actif] ... `)

    if (DRY_RUN) {
      console.log('(dry-run)')
      updated++
      continue
    }

    try {
      await payload.update({
        collection:     'membres',
        id:             membre.id,
        data: {
          adhesion: {
            ...(membre.adhesion ?? {}),
            statut: 'actif',
          },
        },
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
  console.log(`  Mis à jour : ${updated}`)
  console.log(`  Déjà actif : ${alreadyOk}`)
  console.log(`  Erreurs    : ${errors.length}`)
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
