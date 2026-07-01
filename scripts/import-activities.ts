#!/usr/bin/env tsx
/**
 * Migration WordPress → Payload CMS : activités CAP (Ateliers & Séminaires)
 *
 * Extrait les posts WordPress de la catégorie "Ateliers et Séminaires"
 * (term_taxonomy_id = 65) et les importe comme Activities dans Payload.
 *
 * Usage :
 *   npx tsx scripts/import-activities.ts
 *   npx tsx scripts/import-activities.ts --dry-run
 *   npx tsx scripts/import-activities.ts --limit 5
 *   npx tsx scripts/import-activities.ts --skip-images
 */

import * as fs   from 'node:fs'
import * as path from 'node:path'
import { getPayload } from 'payload'
import type { Activity } from '../src/payload-types'
import config from '../src/payload.config'

// Type du champ richText « description » attendu par Payload (sans null/undefined).
type LexicalField = NonNullable<Activity['description']>

// ─── Configuration ────────────────────────────────────────────────────────────

const SQL_PATH = path.resolve(process.cwd(), 'wp-data/wp_database.sql')

const args        = process.argv.slice(2)
const DRY_RUN     = args.includes('--dry-run')
const SKIP_IMAGES = args.includes('--skip-images')
const LIMIT       = (() => {
  const i = args.indexOf('--limit')
  return i !== -1 ? parseInt(args[i + 1] ?? '10', 10) : Infinity
})()

// term_taxonomy_id for "Ateliers et Séminaires"
const ATELIERS_TAX_ID = 65

// ─── Types ────────────────────────────────────────────────────────────────────

interface WpActivity {
  id:         number
  title:      string
  slug:       string
  content:    string
  date:       string
  imageUrl:   string | null
}

interface ImageFile {
  buffer:   Buffer
  filename: string
  mimetype: string
}

interface ImportStats {
  imported: number
  skipped:  number
  errors:   Array<{ title: string; error: string }>
}

// ─── Lexical types ────────────────────────────────────────────────────────────

type LexicalFormat = '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'

interface LexicalTextNode {
  type:    'text'
  detail:  0
  format:  number
  mode:    'normal'
  style:   ''
  text:    string
  version: 1
}

interface LexicalParagraphNode {
  type:       'paragraph'
  format:     LexicalFormat
  indent:     0
  version:    1
  direction:  'ltr'
  textFormat: 0
  textStyle:  ''
  children:   LexicalTextNode[]
}

interface LexicalHeadingNode {
  type:      'heading'
  tag:       'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  format:    LexicalFormat
  indent:    0
  version:   1
  direction: 'ltr'
  children:  LexicalTextNode[]
}

interface LexicalListItemNode {
  type:      'listitem'
  format:    ''
  indent:    0
  version:   1
  direction: 'ltr'
  value:     number
  children:  LexicalTextNode[]
}

interface LexicalListNode {
  type:      'list'
  listType:  'bullet' | 'number'
  start:     1
  tag:       'ul' | 'ol'
  format:    ''
  indent:    0
  version:   1
  direction: 'ltr'
  children:  LexicalListItemNode[]
}

type LexicalBlockNode = LexicalParagraphNode | LexicalHeadingNode | LexicalListNode

interface LexicalDocument {
  root: {
    type:      'root'
    format:    ''
    indent:    0
    version:   1
    direction: 'ltr'
    children:  LexicalBlockNode[]
  }
}

// ─── HTML → Lexical ───────────────────────────────────────────────────────────

function makeText(text: string, format = 0): LexicalTextNode {
  return { type: 'text', detail: 0, format, mode: 'normal', style: '', text, version: 1 }
}

function makeParagraph(children: LexicalTextNode[]): LexicalParagraphNode {
  return {
    type: 'paragraph', format: '', indent: 0, version: 1,
    direction: 'ltr', textFormat: 0, textStyle: '', children,
  }
}

function makeHeading(tag: LexicalHeadingNode['tag'], children: LexicalTextNode[]): LexicalHeadingNode {
  return { type: 'heading', tag, format: '', indent: 0, version: 1, direction: 'ltr', children }
}

function makeListItem(value: number, children: LexicalTextNode[]): LexicalListItemNode {
  return { type: 'listitem', format: '', indent: 0, version: 1, direction: 'ltr', value, children }
}

function makeList(tag: 'ul' | 'ol', items: LexicalListItemNode[]): LexicalListNode {
  return {
    type: 'list', listType: tag === 'ul' ? 'bullet' : 'number',
    start: 1, tag, format: '', indent: 0, version: 1, direction: 'ltr', children: items,
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g,           '&')
    .replace(/&lt;/g,            '<')
    .replace(/&gt;/g,            '>')
    .replace(/&quot;/g,          '"')
    .replace(/&apos;|&#039;/g,   "'")
    .replace(/&nbsp;/g,          ' ')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&rdquo;|&ldquo;/g, '"')
    .replace(/&mdash;/g,         '—')
    .replace(/&ndash;/g,         '–')
    .replace(/&hellip;/g,        '…')
    .replace(/&#(\d+);/g,        (_, n) => String.fromCharCode(+n))
    .replace(/&#x([0-9a-f]+);/gi,(_, n) => String.fromCharCode(parseInt(n, 16)))
}

function parseInlineNodes(html: string): LexicalTextNode[] {
  const tokenized = html
    .replace(/<(?:strong|b)[^>]*>/gi, '\x01')
    .replace(/<\/(?:strong|b)>/gi,    '\x02')
    .replace(/<(?:em|i)[^>]*>/gi,     '\x03')
    .replace(/<\/(?:em|i)>/gi,        '\x04')
    .replace(/<a[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/<br\s*\/?>/gi,           ' ')
    .replace(/<[^>]+>/g,               '')

  const nodes: LexicalTextNode[] = []
  let format = 0
  let buf    = ''

  for (const ch of tokenized) {
    if (ch === '\x01') { if (buf.trim()) nodes.push(makeText(decodeEntities(buf), format)); buf = ''; format |= 1 }
    else if (ch === '\x02') { if (buf.trim() || buf) nodes.push(makeText(decodeEntities(buf), format)); buf = ''; format &= ~1 }
    else if (ch === '\x03') { if (buf.trim()) nodes.push(makeText(decodeEntities(buf), format)); buf = ''; format |= 2 }
    else if (ch === '\x04') { if (buf.trim() || buf) nodes.push(makeText(decodeEntities(buf), format)); buf = ''; format &= ~2 }
    else buf += ch
  }
  if (buf.trim()) nodes.push(makeText(decodeEntities(buf), format))

  return nodes.filter(n => n.text !== '')
}

function cleanWordPressHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g,           '')
    .replace(/<style[\s\S]*?<\/style>/gi,   '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\[[^\]]+\]/g,                 '')
    .trim()
}

function htmlToLexical(rawHtml: string): LexicalField {
  const html   = cleanWordPressHtml(rawHtml)
  const blocks: LexicalBlockNode[] = []

  const blockRe = /<(p|h[1-6]|ul|ol)[^>]*>([\s\S]*?)<\/\1>/gi
  let m: RegExpExecArray | null

  while ((m = blockRe.exec(html)) !== null) {
    const tag   = m[1].toLowerCase()
    const inner = m[2].trim()
    if (!inner) continue

    if (tag === 'ul' || tag === 'ol') {
      const items: LexicalListItemNode[] = []
      let n = 0
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
      let li: RegExpExecArray | null
      while ((li = liRe.exec(inner)) !== null) {
        const nodes = parseInlineNodes(li[1])
        if (nodes.length) items.push(makeListItem(++n, nodes))
      }
      if (items.length) blocks.push(makeList(tag as 'ul' | 'ol', items))
    } else if (/^h[1-6]$/.test(tag)) {
      const nodes = parseInlineNodes(inner)
      if (nodes.length) blocks.push(makeHeading(tag as LexicalHeadingNode['tag'], nodes))
    } else {
      const nodes = parseInlineNodes(inner)
      if (nodes.length) blocks.push(makeParagraph(nodes))
    }
  }

  if (blocks.length === 0) {
    const text = decodeEntities(html.replace(/<[^>]+>/g, ''))
    for (const para of text.split(/\n{2,}/)) {
      const t = para.trim()
      if (t) blocks.push(makeParagraph([makeText(t)]))
    }
  }

  if (blocks.length === 0) {
    blocks.push(makeParagraph([makeText('(contenu vide)')]))
  }

  const doc: LexicalDocument = {
    root: {
      type: 'root', format: '', indent: 0, version: 1,
      direction: 'ltr', children: blocks,
    },
  }
  return doc as unknown as LexicalField
}

// ─── SQL parsing ──────────────────────────────────────────────────────────────

function parseSqlValues(line: string): string[] {
  const start = line.indexOf('VALUES (')
  if (start === -1) return []

  const fields: string[] = []
  let i = start + 8

  while (i < line.length && line[i] !== ')') {
    if (line[i] === ' ' || line[i] === ',') { i++; continue }

    if (line[i] === "'") {
      let value = ''
      i++
      while (i < line.length) {
        const ch   = line[i]
        const next = line[i + 1]
        if (ch === '\\' && next !== undefined) {
          switch (next) {
            case 'n':  value += '\n'; break
            case 'r':  break
            case 't':  value += '\t'; break
            case "'":  value += "'";  break
            case '\\': value += '\\'; break
            case '0':  value += '\0'; break
            default:   value += next; break
          }
          i += 2
        } else if (ch === "'") {
          i++; break
        } else {
          value += ch; i++
        }
      }
      fields.push(value)
    } else {
      let value = ''
      while (i < line.length && line[i] !== ',' && line[i] !== ')') {
        value += line[i++]
      }
      fields.push(value.trim())
    }
  }

  return fields
}

function parseSql(content: string): WpActivity[] {
  const rawPosts       = new Map<number, Omit<WpActivity, 'imageUrl'>>()
  const attachmentUrls = new Map<number, string>()
  const thumbnailIds   = new Map<number, number>()
  const atelierPostIds = new Set<number>()

  for (const line of content.split('\n')) {
    if (line.startsWith('INSERT INTO `wprb_posts`')) {
      const isPost       = line.includes(",'post',")
      const isAttachment = line.includes(",'attachment',")
      if (!isPost && !isAttachment) continue

      const f = parseSqlValues(line)
      if (f.length < 21) continue

      const id         = parseInt(f[0]!, 10)
      const postType   = f[20]!
      const postStatus = f[7]!

      if (postType === 'attachment') {
        const guid = f[18]!
        if (guid && guid.startsWith('http')) attachmentUrls.set(id, guid)
        continue
      }

      if (postType === 'post' && postStatus === 'publish') {
        rawPosts.set(id, {
          id,
          title:   f[5]!.trim(),
          slug:    f[11]!.trim(),
          content: f[4]!,
          date:    f[2]!,
        })
      }
      continue
    }

    if (line.startsWith('INSERT INTO `wprb_postmeta`')) {
      if (!line.includes('_thumbnail_id')) continue
      const f = parseSqlValues(line)
      if (f.length < 4) continue
      if (f[2] === '_thumbnail_id') {
        thumbnailIds.set(parseInt(f[1]!, 10), parseInt(f[3]!, 10))
      }
      continue
    }

    if (line.startsWith('INSERT INTO `wprb_term_relationships`')) {
      const f = parseSqlValues(line)
      if (f.length < 2) continue
      if (parseInt(f[1]!, 10) === ATELIERS_TAX_ID) {
        atelierPostIds.add(parseInt(f[0]!, 10))
      }
    }
  }

  const activities: WpActivity[] = []
  for (const [id, post] of rawPosts) {
    if (!atelierPostIds.has(id)) continue
    const thumbnailId = thumbnailIds.get(id) ?? null
    const imageUrl    = thumbnailId ? (attachmentUrls.get(thumbnailId) ?? null) : null
    activities.push({ ...post, imageUrl })
  }

  return activities
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function downloadImage(url: string): Promise<ImageFile | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return null
    const mimetype = res.headers.get('content-type') ?? 'image/jpeg'
    const buffer   = Buffer.from(await res.arrayBuffer())
    const filename = path.basename(new URL(url).pathname) || 'image.jpg'
    return { buffer, filename, mimetype }
  } catch {
    return null
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log()
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║  Migration WordPress → Payload : Activités CAP   ║')
  console.log('╚══════════════════════════════════════════════════╝')
  if (DRY_RUN)     console.log('  Mode   : DRY RUN  (aucune donnée créée)')
  if (SKIP_IMAGES) console.log('  Images : ignorées (--skip-images)')
  if (LIMIT !== Infinity) console.log(`  Limite : ${LIMIT} activités`)
  console.log()

  // 1 ── Lecture et parsing
  console.log('► Lecture de wp-data/wp_database.sql ...')
  if (!fs.existsSync(SQL_PATH)) {
    console.error(`  ✗ Fichier introuvable : ${SQL_PATH}`)
    process.exit(1)
  }
  const sql = fs.readFileSync(SQL_PATH, 'utf-8')
  let activities = parseSql(sql)

  console.log(`  → ${activities.length} activité(s) (catégorie Ateliers & Séminaires) trouvée(s)`)

  if (LIMIT !== Infinity) {
    activities = activities.slice(0, LIMIT)
    console.log(`  → Limité à ${activities.length} activité(s) (--limit)`)
  }
  console.log()

  // 2 ── Dry-run
  if (DRY_RUN) {
    console.log('► Aperçu des activités à importer :')
    console.log()
    for (const a of activities) {
      const blocks = htmlToLexical(a.content).root.children.length
      console.log(`  • ${a.title}`)
      console.log(`    date: ${a.date} | blocs Lexical: ${blocks} | type: seminaire | statut: termine`)
      if (a.imageUrl) console.log(`    image: ${a.imageUrl}`)
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
  console.log(`► Import de ${activities.length} activité(s) ...\n`)
  const stats: ImportStats = { imported: 0, skipped: 0, errors: [] }

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i]!

    process.stdout.write(`  [${String(i + 1).padStart(2)}/${activities.length}] ${activity.title.substring(0, 50)} ... `)

    try {
      // 4a ── Vérifier si le titre existe déjà
      const existing = await payload.find({
        collection: 'activities',
        where: { titre: { equals: activity.title } },
        limit: 1,
        overrideAccess: true,
      })
      if (existing.docs.length > 0) {
        stats.skipped++
        console.log('ignoré (titre déjà existant)')
        continue
      }

      // 4b ── Télécharger et uploader l'image à la une
      let imageId: number | null = null
      if (!SKIP_IMAGES && activity.imageUrl) {
        const file = await downloadImage(activity.imageUrl)
        if (file) {
          const mediaDoc = await payload.create({
            collection: 'media',
            data: { alt: activity.title },
            file: {
              data:     file.buffer,
              mimetype: file.mimetype,
              name:     file.filename,
              size:     file.buffer.length,
            },
            overrideAccess: true,
          })
          imageId = mediaDoc.id
        }
      }

      // 4c ── Créer l'activité Payload
      await payload.create({
        collection: 'activities',
        data: {
          titre:       activity.title,
          type:        'seminaire',
          statut:      'termine',
          date_debut:  activity.date,
          description: htmlToLexical(activity.content) as unknown as NonNullable<Activity['description']>,
          ...(imageId ? { image: imageId } : {}),
        },
        overrideAccess: true,
      })

      stats.imported++
      console.log(`✓${imageId ? ' +image' : ''}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      stats.errors.push({ title: activity.title, error: msg })
      console.log(`✗ ${msg}`)
    }
  }

  // 5 ── Résumé
  console.log()
  console.log('╔══════════════════════════ Résumé ═══════════════════════════╗')
  console.log(`  Importées : ${stats.imported}`)
  console.log(`  Ignorées  : ${stats.skipped}  (titres déjà présents dans Payload)`)
  console.log(`  Erreurs   : ${stats.errors.length}`)
  if (stats.errors.length > 0) {
    console.log()
    console.log('  Détail des erreurs :')
    for (const e of stats.errors) {
      console.log(`    • ${e.title}`)
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
