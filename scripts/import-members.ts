#!/usr/bin/env tsx
/**
 * Migration WordPress → Payload CMS : membres CAP
 *
 * Usage :
 *   npx tsx scripts/import-members.ts
 *   npx tsx scripts/import-members.ts --dry-run          # aperçu sans écriture
 *   npx tsx scripts/import-members.ts --limit 5          # test sur 5 membres
 *   npx tsx scripts/import-members.ts --skip-avatars     # ignore le téléchargement des photos
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as crypto from 'node:crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config'

// ─── Configuration ────────────────────────────────────────────────────────────

const SQL_PATH = path.resolve(process.cwd(), 'wp-data/wp_database.sql')

const args         = process.argv.slice(2)
const DRY_RUN      = args.includes('--dry-run')
const SKIP_AVATARS = args.includes('--skip-avatars')
const LIMIT        = (() => {
  const i = args.indexOf('--limit')
  return i !== -1 ? parseInt(args[i + 1] ?? '10', 10) : Infinity
})()

// ─── Types ────────────────────────────────────────────────────────────────────

interface WpUser {
  id:          number
  email:       string
  displayName: string
}

interface WpMeta {
  first_name?:    string
  last_name?:     string
  description?:   string
  avatar?:        string
  user_position?: string
  societe?:       string
  user_linkedin?: string
  civilite?:      string
}

interface MemberRecord {
  user: WpUser
  meta: WpMeta
}

interface ImportStats {
  imported: number
  skipped:  number
  errors:   Array<{ email: string; error: string }>
}

// ─── Parsing SQL ──────────────────────────────────────────────────────────────

/**
 * Extrait les tuples d'un (ou plusieurs) INSERT INTO `table` (...) VALUES ...;
 * au format phpMyAdmin multi-lignes :
 *
 *   INSERT INTO `table` (`col1`, `col2`, ...) VALUES
 *   (v1, 'v2', ...),
 *   (v1, 'v2', ...);
 *
 * Renvoie un tableau de tuples, chaque tuple étant un tableau de valeurs (string).
 * Les chaînes ('...') sont déséchappées ; les valeurs nues (nombres, NULL) sont
 * conservées brutes (trim). Le tokenizer respecte l'état « dans une chaîne » afin
 * que virgules / points-virgules / parenthèses présents à l'intérieur d'une valeur
 * (ex. PHP sérialisé) ne cassent pas le découpage.
 */
function parseInsertRows(content: string, table: string): string[][] {
  const rows   = new Array<string[]>()
  const marker = `INSERT INTO \`${table}\``
  const n      = content.length
  let searchIdx = 0

  while (true) {
    const insertIdx = content.indexOf(marker, searchIdx)
    if (insertIdx === -1) break

    const valuesIdx = content.indexOf('VALUES', insertIdx)
    if (valuesIdx === -1) break

    let i = valuesIdx + 'VALUES'.length

    // Lit les tuples jusqu'au ';' de fin d'instruction (hors chaîne).
    let done = false
    while (i < n && !done) {
      const ch = content[i]
      if (ch === ';') { i++; done = true; break }
      if (ch !== '(') { i++; continue }

      // Parse un tuple ( ... )
      i++ // consomme '('
      const values: string[] = []
      let cur      = ''
      let inString = false
      let quoted   = false

      while (i < n) {
        const c = content[i]!
        if (inString) {
          if (c === '\\') { cur += c + (content[i + 1] ?? ''); i += 2; continue } // séquence échappée
          if (c === "'")  { inString = false; i++; continue }                      // fin de chaîne
          cur += c; i++; continue
        }
        if (c === "'") { inString = true; quoted = true; cur = ''; i++; continue }  // début de chaîne (ignore l'espace avant le quote)
        if (c === ',') { values.push(quoted ? unescapeSql(cur) : cur.trim()); cur = ''; quoted = false; i++; continue }
        if (c === ')') { values.push(quoted ? unescapeSql(cur) : cur.trim()); i++; break }
        cur += c; i++
      }

      rows.push(values)
    }

    searchIdx = i
  }

  return rows
}

/**
 * Extrait les membres depuis le dump SQL WordPress.
 *
 * wprb_users    : (ID, login, pass, nicename, EMAIL, url, date, key, status, DISPLAY_NAME)
 * wprb_usermeta : (umeta_id, USER_ID, META_KEY, META_VALUE)
 */
function parseSql(content: string): MemberRecord[] {
  const users = new Map<number, WpUser>()
  const metas = new Map<number, WpMeta>()

  const WANTED_KEYS = new Set([
    'first_name', 'last_name', 'description', 'avatar',
    'user_position', 'societe', 'user_linkedin', 'civilite',
  ])

  // ── wprb_users ──
  for (const row of parseInsertRows(content, 'wprb_users')) {
    if (row.length < 10) continue
    const id = parseInt(row[0]!, 10)
    if (!Number.isFinite(id)) continue
    if (id === 1) continue // exclure l'admin WordPress
    const email = row[4] ?? ''
    if (!email) continue
    users.set(id, {
      id,
      email,
      displayName: row[9] ?? '',
    })
  }

  // ── wprb_usermeta ──
  for (const row of parseInsertRows(content, 'wprb_usermeta')) {
    if (row.length < 4) continue
    const userId = parseInt(row[1]!, 10)
    const key    = row[2] ?? ''
    if (!Number.isFinite(userId)) continue
    if (!WANTED_KEYS.has(key)) continue

    if (!metas.has(userId)) metas.set(userId, {})
    ;(metas.get(userId) as Record<string, string>)[key] = row[3] ?? ''
  }

  return Array.from(users.values())
    .filter(u => {
      const m = metas.get(u.id) ?? {}
      return Boolean(m.first_name || m.last_name)
    })
    .map(user => ({ user, meta: metas.get(user.id) ?? {} }))
}

function unescapeSql(s: string): string {
  return s
    .replace(/\\'/g,  "'")
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g,  '\n')
    .replace(/\\r/g,  '')
}

function extractName(meta: WpMeta, displayName: string): { prenom: string; nom: string } {
  if (meta.first_name || meta.last_name) {
    return { prenom: meta.first_name ?? '', nom: meta.last_name ?? '' }
  }
  const parts = displayName.trim().split(/\s+/)
  return parts.length >= 2
    ? { prenom: parts[0], nom: parts.slice(1).join(' ') }
    : { prenom: displayName, nom: '' }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function downloadAvatar(
  avatarUrl: string,
): Promise<{ buffer: Buffer; filename: string; mimetype: string } | null> {
  const url = avatarUrl.startsWith('//') ? `https:${avatarUrl}` : avatarUrl
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8_000) })
    if (!res.ok) return null
    const mimetype = res.headers.get('content-type') ?? 'image/jpeg'
    const buffer   = Buffer.from(await res.arrayBuffer())
    const filename = path.basename(new URL(url).pathname) || 'avatar.jpg'
    return { buffer, filename, mimetype }
  } catch {
    return null
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log()
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║   Migration WordPress → Payload : Membres CAP   ║')
  console.log('╚══════════════════════════════════════════════════╝')
  if (DRY_RUN)      console.log('  Mode   : DRY RUN  (aucune donnée créée)')
  if (SKIP_AVATARS) console.log('  Photos : ignorées (--skip-avatars)')
  if (LIMIT !== Infinity) console.log(`  Limite : ${LIMIT} membres`)
  console.log()

  // 1 — Lecture et parsing du dump SQL
  console.log('► Lecture de wp-data/wp_database.sql ...')
  if (!fs.existsSync(SQL_PATH)) {
    console.error(`  ✗ Fichier introuvable : ${SQL_PATH}`)
    process.exit(1)
  }
  const sql = fs.readFileSync(SQL_PATH, 'utf-8')

  let records = parseSql(sql)
  console.log(`  → ${records.length} membre(s) trouvé(s) dans WordPress`)

  if (LIMIT !== Infinity) {
    records = records.slice(0, LIMIT)
    console.log(`  → Limité à ${records.length} membre(s) (--limit)`)
  }
  console.log()

  // 2 — Mode dry-run : affichage seul
  if (DRY_RUN) {
    console.log('► Aperçu des membres à importer :')
    console.log()
    for (const r of records) {
      const { prenom, nom } = extractName(r.meta, r.user.displayName)
      const poste = [r.meta.user_position, r.meta.societe].filter(Boolean).join(' — ')
      console.log(`  • ${prenom} ${nom} <${r.user.email}>`)
      if (poste) console.log(`    ${poste}`)
      if (r.meta.avatar) console.log(`    Photo: ${r.meta.avatar}`)
    }
    console.log()
    console.log("  Relancer sans --dry-run pour lancer l'import réel.")
    return
  }

  // 3 — Initialisation Payload (connexion DB directe)
  console.log('► Connexion à Payload ...')
  const payload = await getPayload({ config })
  console.log('  ✓ Payload initialisé')
  console.log()

  // 4 — Import des membres
  console.log(`► Import de ${records.length} membre(s) ...\n`)

  const stats: ImportStats = { imported: 0, skipped: 0, errors: [] }

  for (let i = 0; i < records.length; i++) {
    const record = records[i]!
    const { user, meta } = record
    const { prenom, nom } = extractName(meta, user.displayName)
    const label = `${prenom} ${nom} <${user.email}>`

    process.stdout.write(`  [${String(i + 1).padStart(2)}/${records.length}] ${label} ... `)

    try {
      // 4a — Vérifier si l'email existe déjà
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: user.email } },
        limit: 1,
        overrideAccess: true,
      })
      if (existing.docs.length > 0) {
        stats.skipped++
        console.log('ignoré (email déjà existant)')
        continue
      }

      // 4b — Télécharger et uploader la photo
      let photoId: number | null = null
      if (!SKIP_AVATARS && meta.avatar) {
        const file = await downloadAvatar(meta.avatar)
        if (file) {
          const mediaDoc = await payload.create({
            collection: 'media',
            data: { alt: `${prenom} ${nom}` },
            file: {
              data:     file.buffer,
              mimetype: file.mimetype,
              name:     file.filename,
              size:     file.buffer.length,
            },
            overrideAccess: true,
          })
          photoId = mediaDoc.id
        }
      }

      // 4c — Créer le compte User Payload
      const userDoc = await payload.create({
        collection: 'users',
        data: {
          email:    user.email,
          password: crypto.randomUUID(),
          role:     'membre',
        },
        overrideAccess: true,
      })

      // 4d — Créer le profil Membre
      await payload.create({
        collection: 'membres',
        data: {
          user:   userDoc.id,
          prenom,
          nom,
          ...(meta.description ? { biographie: meta.description } : {}),
          ...(photoId           ? { photo: photoId }               : {}),
          poste: {
            ...(meta.user_position ? { titre:     meta.user_position } : {}),
            ...(meta.societe       ? { organisme: meta.societe }       : {}),
          },
          coordonnees: {
            ...(meta.user_linkedin ? { linkedin: meta.user_linkedin } : {}),
          },
        },
        overrideAccess: true,
      })

      stats.imported++
      console.log(`✓${photoId ? ' +photo' : ''}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      stats.errors.push({ email: user.email, error: msg })
      console.log(`✗ ${msg}`)
    }
  }

  // 5 — Résumé final
  console.log()
  console.log('╔══════════════════════════ Résumé ═══════════════════════════╗')
  console.log(`  Importés  : ${stats.imported}`)
  console.log(`  Ignorés   : ${stats.skipped}  (emails déjà présents dans Payload)`)
  console.log(`  Erreurs   : ${stats.errors.length}`)
  if (stats.errors.length > 0) {
    console.log()
    console.log('  Détail des erreurs :')
    for (const e of stats.errors) {
      console.log(`    • ${e.email}`)
      console.log(`      ${e.error}`)
    }
  }
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log()
  console.log("  Note : chaque compte a reçu un mot de passe aléatoire (UUID).")
  console.log("  Les membres doivent utiliser \"Mot de passe oublié\" pour se connecter.")
  console.log()

  process.exit(0)
}

main().catch(err => {
  console.error('\nErreur fatale :', err)
  process.exit(1)
})
