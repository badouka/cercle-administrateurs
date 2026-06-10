#!/usr/bin/env tsx
/**
 * Re-télécharge les fichiers médias dont l'URL pointe vers une source externe
 * (ex. ancien site WordPress) afin de reconstituer le dossier `media/` local
 * (staticDir de la collection `media`) après suppression accidentelle.
 *
 * Pour chaque média dont le champ `url` commence par "http" :
 *  1. Télécharge le fichier depuis cette URL
 *  2. L'enregistre dans `media/<filename>`
 *  3. Met à jour `filename` et `url` dans Payload pour pointer vers le
 *     fichier local servi par `/api/media/file/<filename>`
 *
 * Usage :
 *   npx tsx scripts/redownload-media.ts
 *   npx tsx scripts/redownload-media.ts --dry-run
 *   npx tsx scripts/redownload-media.ts --force   (re-télécharge même si le fichier local existe déjà)
 */

import 'dotenv/config'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'

// ─── Configuration ────────────────────────────────────────────────────────────

const args     = process.argv.slice(2)
const DRY_RUN  = args.includes('--dry-run')
const FORCE    = args.includes('--force')
const MEDIA_DIR = path.resolve(process.cwd(), 'media')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function localFilenameFor(url: string, fallback: string | null | undefined, id: number): string {
  if (fallback) return fallback
  try {
    const base = decodeURIComponent(path.basename(new URL(url).pathname))
    if (base) return base
  } catch {
    // ignore
  }
  return `media-${id}`
}

function localUrlFor(filename: string): string {
  return `/api/media/file/${encodeURIComponent(filename)}`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log()
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║   Re-téléchargement des médias externes            ║')
  console.log('╚══════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('  Mode : DRY RUN  (aucune donnée modifiée)')
  if (FORCE)   console.log('  Mode : FORCE    (re-télécharge même si le fichier existe déjà)')
  console.log()

  console.log('► Connexion à Payload ...')
  const payload = await getPayload({ config })
  console.log('  ✓ Payload initialisé')
  console.log()

  console.log('► Récupération de tous les médias ...')
  const { docs, totalDocs } = await payload.find({
    collection:     'media',
    limit:          1000,
    overrideAccess: true,
  })
  console.log(`  → ${totalDocs} média(s) trouvé(s)`)
  console.log()

  let downloaded   = 0
  let alreadyLocal = 0
  let updated      = 0
  let skipped      = 0
  const errors:    Array<{ id: number; error: string }> = []

  for (const doc of docs) {
    const url = doc.url

    if (!url || !url.startsWith('http')) {
      skipped++
      continue
    }

    const filename  = localFilenameFor(url, doc.filename, doc.id)
    const localPath = path.join(MEDIA_DIR, filename)
    const exists    = existsSync(localPath)

    process.stdout.write(`  • [#${doc.id}] ${filename} ... `)

    if (exists && !FORCE) {
      console.log('déjà présent localement')
      alreadyLocal++
    } else {
      if (DRY_RUN) {
        console.log(`(dry-run) téléchargerait depuis ${url}`)
        downloaded++
      } else {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const buffer = Buffer.from(await res.arrayBuffer())
          await mkdir(MEDIA_DIR, { recursive: true })
          await writeFile(localPath, buffer)
          console.log('✓ téléchargé')
          downloaded++
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          console.log(`✗ ${msg}`)
          errors.push({ id: doc.id, error: msg })
          continue
        }
      }
    }

    // Met à jour le chemin dans Payload si nécessaire
    const newUrl = localUrlFor(filename)
    const data: Record<string, string> = {}
    if (doc.filename !== filename) data.filename = filename
    if (doc.url !== newUrl)        data.url      = newUrl

    if (Object.keys(data).length > 0) {
      if (DRY_RUN) {
        console.log(`      (dry-run) mettrait à jour Payload : ${JSON.stringify(data)}`)
      } else {
        try {
          await payload.update({
            collection:     'media',
            id:             doc.id,
            data,
            overrideAccess: true,
          })
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          errors.push({ id: doc.id, error: `mise à jour Payload : ${msg}` })
          continue
        }
      }
      updated++
    }
  }

  console.log()
  console.log('╔══════════════════════════ Résumé ═══════════════════════════╗')
  console.log(`  Téléchargés         : ${downloaded}`)
  console.log(`  Déjà présents       : ${alreadyLocal}`)
  console.log(`  Mis à jour (Payload): ${updated}`)
  console.log(`  Ignorés (URL locale): ${skipped}`)
  console.log(`  Erreurs             : ${errors.length}`)
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
