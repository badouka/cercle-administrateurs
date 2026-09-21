/**
 * Ajout de Mamadou Faye, membre d'honneur.
 *
 * `posteCap` est un select adossé à une énumération Postgres : la valeur
 * « Membre d'honneur » doit exister en base avant qu'une fiche la porte, et
 * avant même que Payload démarre — au démarrage il pousse le schéma via
 * drizzle-kit, qui n'échappe pas l'apostrophe et casserait sur
 * `ADD VALUE 'Membre d'honneur'`. D'où l'ordre imposé ci-dessous.
 *
 * Le schéma de ce projet est géré par ce push et non par `payload migrate`
 * (payload_migrations ne contient que la sentinelle `dev`).
 *
 * Idempotent : une fiche portant déjà le slug `mamadoufaye` est mise à jour
 * plutôt que dupliquée.
 *
 * Usage :
 *   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/membre-honneur-enum.sql
 *   pnpm tsx scripts/ajouter-membre-honneur.ts --dry-run
 *   pnpm tsx scripts/ajouter-membre-honneur.ts
 */

import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const DRY_RUN = process.argv.includes('--dry-run')

const SLUG      = 'mamadoufaye'
const PRENOM    = 'Mamadou'
const NOM       = 'Faye'
const FONCTION  = 'Premier président'
const ORGANISME = 'Cour des comptes'
const POSTE_CAP = "Membre d'honneur"

async function main() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')

  console.log('')
  console.log(`  Ajout de ${PRENOM} ${NOM} — ${POSTE_CAP}`)
  if (DRY_RUN) console.log('  MODE DRY-RUN — aucune écriture en base')
  console.log('')

  const payload = await getPayload({ config })

  // ── 1. la valeur d'énumération doit préexister ────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { rows } = await (payload.db as any).pool.query(
    `select 1 from pg_enum e
       join pg_type t on t.oid = e.enumtypid
      where t.typname = 'enum_membres_poste_poste_cap' and e.enumlabel = $1`,
    [POSTE_CAP],
  )

  if (rows.length === 0) {
    console.error(`  ABANDON — « ${POSTE_CAP} » absente de l'énumération en base.`)
    console.error('  Jouer d\'abord :')
    console.error('    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/membre-honneur-enum.sql')
    process.exit(1)
  }
  console.log(`  ENUM   « ${POSTE_CAP} » présente en base`)

  // ── 2. la fiche ───────────────────────────────────────────────────────────
  const { docs } = await payload.find({
    collection:     'membres',
    where:          { slug: { equals: SLUG } },
    limit:          2,
    depth:          0,
    overrideAccess: true,
  })

  if (docs.length > 1) {
    console.error(`  ABANDON — ${docs.length} fiches portent déjà le slug ${SLUG}`)
    process.exit(1)
  }

  const poste = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...((docs[0] as any)?.poste ?? {}),
    posteCap:                POSTE_CAP,
    fonctionProfessionnelle: FONCTION,
    organisme:               ORGANISME,
  }

  console.log(`  ${docs.length === 1 ? 'MAJ   ' : 'CREER '} ${PRENOM} ${NOM}  [${SLUG}]`)
  console.log(`         posteCap  : ${POSTE_CAP}`)
  console.log(`         fonction  : ${FONCTION}`)
  console.log(`         organisme : ${ORGANISME}`)

  if (DRY_RUN) {
    console.log('')
    process.exit(0)
  }

  if (docs.length === 1) {
    await payload.update({
      collection:     'membres',
      id:             docs[0].id,
      data:           { prenom: PRENOM, nom: NOM, poste },
      overrideAccess: true,
    })
  } else {
    await payload.create({
      collection: 'membres',
      data: {
        prenom:   PRENOM,
        nom:      NOM,
        poste,
        adhesion: { statut: 'actif' },
      },
      overrideAccess: true,
    })
  }

  console.log('')
  console.log('  ✓ Fiche enregistrée')
  console.log('')
  process.exit(0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
