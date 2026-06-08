#!/usr/bin/env tsx
/**
 * Corrige les champs "filename" et "alt" des médias corrompus par un mauvais
 * encodage lors de l'import WordPress (séquences UTF-8 mal réinterprétées,
 * ex. "├®" au lieu de "é"). Réutilise le MOJIBAKE_MAP de fix-document-titles.ts.
 *
 * Quand "filename" change, le fichier physique correspondant dans le dossier
 * `media/` (staticDir de la collection) est également renommé, sinon l'URL
 * générée par Payload pointerait vers un fichier introuvable.
 *
 * Usage :
 *   npx tsx scripts/fix-media-filenames.ts
 *   npx tsx scripts/fix-media-filenames.ts --dry-run
 */

import 'dotenv/config'
import { rename } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { CORRUPTION_REGEX, cleanTitle } from './fix-document-titles'

// ─── Configuration ────────────────────────────────────────────────────────────

const args     = process.argv.slice(2)
const DRY_RUN  = args.includes('--dry-run')
const MEDIA_DIR = path.resolve(process.cwd(), 'media')

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log()
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║   Fix filename/alt des médias corrompus (encodage) ║')
  console.log('╚══════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('  Mode : DRY RUN  (aucune donnée modifiée)')
  console.log()

  console.log('► Connexion à Payload ...')
  const payload = await getPayload({ config })
  console.log('  ✓ Payload initialisé')
  console.log()

  console.log('► Récupération de tous les médias ...')
  const { docs, totalDocs } = await payload.find({
    collection:     'media',
    limit:          500,
    overrideAccess: true,
  })
  console.log(`  → ${totalDocs} média(s) trouvé(s)`)
  console.log()

  let updated       = 0
  let skipped       = 0
  let renamed       = 0
  const needsReview: Array<{ champ: string; original: string; cleaned: string }> = []
  const errors:      Array<{ id: number; error: string }>                        = []
  const renameWarnings: Array<{ id: number; from: string; to: string; error: string }> = []

  for (const doc of docs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {}
    const changes: string[] = []

    const filename = doc.filename
    const alt      = doc.alt

    let filenameChange: { from: string; to: string } | null = null

    if (filename && CORRUPTION_REGEX.test(filename)) {
      const cleaned = cleanTitle(filename)
      if (cleaned !== filename) {
        if (CORRUPTION_REGEX.test(cleaned)) {
          needsReview.push({ champ: 'filename', original: filename, cleaned })
        } else {
          data.filename  = cleaned
          filenameChange = { from: filename, to: cleaned }
          changes.push(`filename: "${filename}" → "${cleaned}"`)
        }
      }
    }

    if (alt && CORRUPTION_REGEX.test(alt)) {
      const cleaned = cleanTitle(alt)
      if (cleaned !== alt) {
        if (CORRUPTION_REGEX.test(cleaned)) {
          needsReview.push({ champ: 'alt', original: alt, cleaned })
        } else {
          data.alt = cleaned
          changes.push(`alt: "${alt}" → "${cleaned}"`)
        }
      }
    }

    if (changes.length === 0) {
      skipped++
      continue
    }

    process.stdout.write(`  • [#${doc.id}] ${changes.join(' | ')} ... `)

    if (DRY_RUN) {
      console.log(filenameChange ? '(dry-run, fichier également renommé sur disque)' : '(dry-run)')
      updated++
      continue
    }

    try {
      await payload.update({
        collection:     'media',
        id:             doc.id,
        data,
        overrideAccess: true,
      })
      updated++

      // Renomme le fichier physique pour qu'il corresponde au nouveau "filename"
      // (l'URL générée par Payload est construite à partir de ce champ)
      if (filenameChange) {
        try {
          await rename(
            path.join(MEDIA_DIR, filenameChange.from),
            path.join(MEDIA_DIR, filenameChange.to),
          )
          renamed++
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          renameWarnings.push({ id: doc.id, from: filenameChange.from, to: filenameChange.to, error: msg })
        }
      }

      console.log('✓')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push({ id: doc.id, error: msg })
      console.log(`✗ ${msg}`)
    }
  }

  console.log()
  console.log('╔══════════════════════════ Résumé ═══════════════════════════╗')
  console.log(`  Corrigés       : ${updated}`)
  console.log(`  Fichiers renommés sur disque : ${renamed}`)
  console.log(`  Déjà OK        : ${skipped}`)
  console.log(`  À revoir       : ${needsReview.length}`)
  console.log(`  Erreurs        : ${errors.length}`)
  if (renameWarnings.length > 0) {
    console.log()
    console.log('  Fichiers non renommés sur disque (filename mis à jour en base uniquement) :')
    for (const w of renameWarnings) {
      console.log(`    • #${w.id} : "${w.from}" → "${w.to}"`)
      console.log(`      ${w.error}`)
    }
  }
  if (needsReview.length > 0) {
    console.log()
    console.log('  Champs encore suspects après nettoyage (séquence inconnue) :')
    for (const r of needsReview) {
      console.log(`    • [${r.champ}] "${r.original}"`)
      console.log(`      → "${r.cleaned}"`)
    }
  }
  if (errors.length > 0) {
    console.log()
    console.log('  Détail des erreurs :')
    for (const e of errors) {
      console.log(`    • #${e.id} : ${e.error}`)
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
