/**
 * Convertit les biographies de membres stockées en HTML brut (importées de
 * WordPress) vers le format Lexical JSON attendu par le champ `richText`.
 *
 * Pourquoi : une valeur HTML (string) dans la colonne jsonb `membres.biographie`
 * fait planter l'éditeur Lexical dans /admin (renderFieldFn / addFieldStatePromise).
 *
 * Lecture/écriture en SQL brut (pg) pour ne pas déclencher les hooks afterRead
 * de Lexical sur les valeurs invalides. Payload n'est utilisé que pour obtenir
 * la config de l'éditeur. Idempotent : relançable sans effet sur les bios déjà
 * au format Lexical.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/convert-bios-to-lexical.ts
 *   npx tsx --tsconfig tsconfig.json scripts/convert-bios-to-lexical.ts --dry-run
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { convertHTMLToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import { Pool } from 'pg'

const DRY_RUN = process.argv.includes('--dry-run')

async function main() {
  if (DRY_RUN) console.log('— Mode simulation (--dry-run) : aucune écriture —\n')

  const payload = await getPayload({ config })
  const editorConfig = await editorConfigFactory.default({ config: payload.config })

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })

  // Seules les valeurs jsonb de type "string" (HTML brut) sont concernées ;
  // les biographies déjà au format Lexical (objet avec .root) sont ignorées.
  const { rows } = await pool.query<{ id: number; prenom: string; nom: string; biographie: string }>(
    `SELECT id, prenom, nom, biographie
       FROM membres
      WHERE jsonb_typeof(biographie) = 'string'`,
  )

  if (rows.length === 0) {
    console.log('Aucune biographie HTML à convertir. ✓')
    await pool.end()
    process.exit(0)
  }

  console.log(`${rows.length} biographie(s) HTML à convertir :\n`)

  let ok = 0
  for (const r of rows) {
    const lexical = convertHTMLToLexical({ editorConfig, html: r.biographie, JSDOM })

    if (DRY_RUN) {
      const blocks = lexical?.root?.children?.length ?? 0
      console.log(`  ○ #${r.id} ${r.prenom} ${r.nom} — ${blocks} bloc(s) Lexical (non écrit)`)
      ok++
      continue
    }

    await pool.query('UPDATE membres SET biographie = $1::jsonb WHERE id = $2', [
      JSON.stringify(lexical),
      r.id,
    ])
    ok++
    console.log(`  ✔ #${r.id} ${r.prenom} ${r.nom}`)
  }

  console.log(
    DRY_RUN
      ? `\nSimulation terminée : ${ok}/${rows.length} biographie(s) à convertir.`
      : `\nTerminé : ${ok}/${rows.length} biographie(s) converti(s) en Lexical.`,
  )
  await pool.end()
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
