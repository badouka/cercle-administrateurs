#!/usr/bin/env tsx
/**
 * Migration documents PDF → Payload CMS : documents CAP
 *
 * Usage :
 *   npx tsx scripts/import-documents.ts
 *   npx tsx scripts/import-documents.ts --dry-run   # aperçu sans écriture
 *   npx tsx scripts/import-documents.ts --limit 5   # test sur 5 documents
 */

import * as fs   from 'node:fs'
import * as path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'

// ─── Configuration ────────────────────────────────────────────────────────────

const DOCS_DIR = path.resolve(process.cwd(), 'wp-data/documents')

const args    = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const LIMIT   = (() => {
  const i = args.indexOf('--limit')
  return i !== -1 ? parseInt(args[i + 1] ?? '10', 10) : Infinity
})()

// ─── Types ────────────────────────────────────────────────────────────────────

type DocumentCategorie =
  | 'textes_statutaires'
  | 'textes_reglementaires'
  | 'pv_reunion'
  | 'ressources'
  | 'magazines'
  | 'docs_politique_economique'

interface PdfFile {
  filepath:  string
  filename:  string
  titre:     string
  categorie: DocumentCategorie | null
}

interface ImportStats {
  imported: number
  skipped:  number
  errors:   Array<{ filename: string; error: string }>
}

// ─── Détection de catégorie ───────────────────────────────────────────────────

/** Normalise une chaîne pour la comparaison (minuscules, sans accents) */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const CATEGORY_RULES: Array<{ keywords: string[]; categorie: DocumentCategorie }> = [
  {
    keywords: ['statuts', 'statut', 'reglement', 'reglements'],
    categorie: 'textes_statutaires',
  },
  {
    keywords: ['decret', 'loi', 'circulaire', 'lettre'],
    categorie: 'textes_reglementaires',
  },
  {
    keywords: ['compte-rendu', 'compte rendu', 'pv', 'reunion'],
    categorie: 'pv_reunion',
  },
  {
    keywords: ['magazine', 'revue', 'bulletin'],
    categorie: 'magazines',
  },
  {
    keywords: ['strategie', 'plan'],
    categorie: 'docs_politique_economique',
  },
  {
    keywords: ['communication', 'synthese', 'note', 'resultats', 'rapport', 'guide'],
    categorie: 'ressources',
  },
]

function detectCategorie(filename: string): DocumentCategorie | null {
  const normalized = normalize(filename)
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => normalized.includes(kw))) {
      return rule.categorie
    }
  }
  return null
}

/** Transforme un nom de fichier en titre lisible */
function fileNameToTitre(filename: string): string {
  return path.basename(filename, path.extname(filename))
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Lecture du dossier ───────────────────────────────────────────────────────

function readPdfFiles(): PdfFile[] {
  if (!fs.existsSync(DOCS_DIR)) return []

  return fs
    .readdirSync(DOCS_DIR)
    .filter(f => f.toLowerCase().endsWith('.pdf'))
    .map(filename => ({
      filepath:  path.join(DOCS_DIR, filename),
      filename,
      titre:     fileNameToTitre(filename),
      categorie: detectCategorie(filename),
    }))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log()
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║   Migration PDF → Payload : Documents CAP        ║')
  console.log('╚══════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('  Mode   : DRY RUN  (aucune donnée créée)')
  if (LIMIT !== Infinity) console.log(`  Limite : ${LIMIT} documents`)
  console.log()

  // 1 ── Lecture du dossier
  console.log(`► Lecture de wp-data/documents/ ...`)
  if (!fs.existsSync(DOCS_DIR)) {
    console.error(`  ✗ Dossier introuvable : ${DOCS_DIR}`)
    process.exit(1)
  }

  let files = readPdfFiles()

  const withCat    = files.filter(f => f.categorie !== null)
  const withoutCat = files.filter(f => f.categorie === null)

  console.log(`  → ${files.length} fichier(s) PDF trouvé(s)`)
  console.log(`  → ${withCat.length} avec catégorie détectée`)
  if (withoutCat.length) {
    console.log(`  → ${withoutCat.length} sans catégorie détectée (seront importés comme 'ressources') :`)
    for (const f of withoutCat) console.log(`     • ${f.filename}`)
    // Fallback : ressources
    for (const f of withoutCat) f.categorie = 'ressources'
  }

  if (LIMIT !== Infinity) {
    files = files.slice(0, LIMIT)
    console.log(`  → Limité à ${files.length} fichier(s) (--limit)`)
  }
  console.log()

  // 2 ── Dry-run
  if (DRY_RUN) {
    console.log('► Aperçu des documents à importer :')
    console.log()
    for (const f of files) {
      const size = (fs.statSync(f.filepath).size / 1024).toFixed(0)
      console.log(`  • ${f.titre}`)
      console.log(`    fichier: ${f.filename} (${size} Ko) | catégorie: ${f.categorie} | accès: membres`)
    }
    console.log()
    console.log("  Relancer sans --dry-run pour lancer l'import réel.")
    return
  }

  // 3 ── Initialisation Payload
  console.log('► Connexion à Payload ...')
  const payload = await getPayload({ config })
  console.log('  ✓ Payload initialisé')
  console.log()

  // 4 ── Import
  console.log(`► Import de ${files.length} document(s) ...\n`)
  const stats: ImportStats = { imported: 0, skipped: 0, errors: [] }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]!

    process.stdout.write(`  [${String(i + 1).padStart(2)}/${files.length}] ${file.titre.substring(0, 50)} ... `)

    try {
      // 4a ── Vérifier si le titre existe déjà
      const existing = await payload.find({
        collection: 'documents',
        where: { titre: { equals: file.titre } },
        limit: 1,
        overrideAccess: true,
      })
      if (existing.docs.length > 0) {
        stats.skipped++
        console.log('ignoré (titre déjà existant)')
        continue
      }

      // 4b ── Uploader le PDF dans la collection media
      const buffer = fs.readFileSync(file.filepath)
      const mediaDoc = await payload.create({
        collection: 'media',
        data: { alt: file.titre },
        file: {
          data:     buffer,
          mimetype: 'application/pdf',
          name:     file.filename,
          size:     buffer.length,
        },
        overrideAccess: true,
      })

      // 4c ── Créer le document (slug auto-généré par le hook beforeChange)
      await payload.create({
        collection: 'documents',
        data: {
          titre:     file.titre,
          fichier:   mediaDoc.id,
          categorie: file.categorie!,
          acces:     'membres',
        },
        overrideAccess: true,
      })

      stats.imported++
      console.log('✓')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      stats.errors.push({ filename: file.filename, error: msg })
      console.log(`✗ ${msg}`)
    }
  }

  // 5 ── Résumé
  console.log()
  console.log('╔══════════════════════════ Résumé ═══════════════════════════╗')
  console.log(`  Importés  : ${stats.imported}`)
  console.log(`  Ignorés   : ${stats.skipped}  (titres déjà présents dans Payload)`)
  console.log(`  Erreurs   : ${stats.errors.length}`)
  if (stats.errors.length > 0) {
    console.log()
    console.log('  Détail des erreurs :')
    for (const e of stats.errors) {
      console.log(`    • ${e.filename}`)
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
