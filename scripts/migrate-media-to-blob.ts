import 'dotenv/config'
import { readdir, readFile, stat } from 'fs/promises'
import path from 'path'
import { put } from '@vercel/blob'

/**
 * Migre tous les fichiers du dossier `media/` local vers Vercel Blob.
 *
 * Cohérence des URLs :
 * Le plugin `vercelBlobStorage` est configuré SANS `prefix`, donc il stocke
 * chaque fichier à la racine du store Blob sous sa clé = nom de fichier
 * (déjà « sanitized » par Payload à l'upload d'origine, c'est le nom sur le
 * disque). Payload génère ensuite l'URL `/api/media/file/<nom>` qui pointe vers
 * cette même clé. On uploade donc chaque fichier sous son nom local exact
 * (`addRandomSuffix: false`) pour que les clés Blob correspondent.
 */

const MEDIA_DIR = path.resolve(process.cwd(), 'media')

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.error('❌ BLOB_READ_WRITE_TOKEN manquant. Définis-le dans .env ou l’environnement.')
    process.exit(1)
  }

  let entries: string[]
  try {
    entries = await readdir(MEDIA_DIR)
  } catch (err) {
    console.error(`❌ Impossible de lire le dossier ${MEDIA_DIR}:`, (err as Error).message)
    process.exit(1)
  }

  // On ne garde que les fichiers (pas les sous-dossiers ni les fichiers cachés).
  const files: string[] = []
  for (const name of entries) {
    if (name.startsWith('.')) continue
    const info = await stat(path.join(MEDIA_DIR, name))
    if (info.isFile()) files.push(name)
  }

  if (files.length === 0) {
    console.log('Aucun fichier à migrer dans media/.')
    return
  }

  console.log(`📦 ${files.length} fichier(s) à migrer depuis ${MEDIA_DIR}\n`)

  let migrated = 0
  const errors: { file: string; message: string }[] = []

  for (let i = 0; i < files.length; i++) {
    const name = files[i]
    const progress = `[${i + 1}/${files.length}]`
    try {
      const buffer = await readFile(path.join(MEDIA_DIR, name))
      const result = await put(name, buffer, {
        access: 'public',
        addRandomSuffix: false,
        token,
      })
      migrated++
      console.log(`✅ ${progress} ${name} → ${result.url}`)
    } catch (err) {
      const message = (err as Error).message
      errors.push({ file: name, message })
      console.error(`❌ ${progress} ${name} — ${message}`)
    }
  }

  console.log('\n──────── Résumé ────────')
  console.log(`✅ ${migrated} fichier(s) migré(s)`)
  console.log(`❌ ${errors.length} erreur(s)`)
  if (errors.length > 0) {
    for (const e of errors) console.log(`   • ${e.file}: ${e.message}`)
  }
}

main().catch((err) => {
  console.error('Erreur inattendue:', err)
  process.exit(1)
})
