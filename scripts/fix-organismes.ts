/**
 * Corrections ponctuelles post-import v3 :
 *   - trois organismes où le sigle de la feuille Excel venait doubler une
 *     parenthèse déjà présente dans le nom de l'entreprise ;
 *   - la fiche Mamadou Ngouda Mboup, dont la ligne Excel était vide.
 *
 * Le groupe `poste` est réécrit en entier à partir des valeurs stockées, seuls
 * les champs listés ici changent (posteCap, siteOrganisme, direction et
 * logoOrganisme sont préservés).
 *
 * Usage :
 *   pnpm tsx scripts/fix-organismes.ts --dry-run
 *   pnpm tsx scripts/fix-organismes.ts
 */

import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const DRY_RUN = process.argv.includes('--dry-run')

interface Correction {
  slug:      string
  etiquette: string
  organisme: string
  fonction?: string
}

const CORRECTIONS: Correction[] = [
  {
    slug:      'abdoudiouf',
    etiquette: 'Abdou Diouf',
    organisme: 'Société d\'exploitation de l\'eau du Sénégal (Sen\'Eau)',
  },
  {
    slug:      'mamadougoudiaby',
    etiquette: 'Mamadou Goudiaby',
    organisme: 'Dakar Dem Dikk (DDD)',
  },
  {
    slug:      'bocardiop',
    etiquette: 'Bocar Diop',
    organisme: '2AS Technics',
  },
  {
    slug:      'mamadoungoudamboup',
    etiquette: 'Mamadou Ngouda Mboup',
    organisme: 'Port autonome de Dakar (PAD)',
    fonction:  'Président du conseil d\'administration',
  },
]

function afficher(valeur: string | null | undefined): string {
  return valeur === null || valeur === undefined || valeur === '' ? '—' : valeur
}

async function main() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')

  console.log('')
  console.log('  Corrections organismes')
  if (DRY_RUN) console.log('  MODE DRY-RUN — aucune écriture en base')
  console.log('')

  const payload = await getPayload({ config })

  let majs   = 0
  let echecs = 0

  for (const c of CORRECTIONS) {
    const { docs } = await payload.find({
      collection:     'membres',
      where:          { slug: { equals: c.slug } },
      limit:          2,
      depth:          0,
      overrideAccess: true,
    })

    if (docs.length !== 1) {
      console.error(`  ECHEC  ${c.etiquette} [${c.slug}] — ${docs.length} fiche(s) trouvée(s)`)
      echecs++
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc           = docs[0] as any
    const posteExistant = doc.poste ?? {}
    const poste         = {
      ...posteExistant,
      organisme:               c.organisme,
      fonctionProfessionnelle: c.fonction ?? posteExistant.fonctionProfessionnelle ?? null,
    }

    console.log(`  MAJ    ${c.etiquette}  [${c.slug}]`)
    console.log(`         organisme : ${afficher(posteExistant.organisme)} -> ${poste.organisme}`)
    if (posteExistant.fonctionProfessionnelle !== poste.fonctionProfessionnelle)
      console.log(`         fonction  : ${afficher(posteExistant.fonctionProfessionnelle)} -> ${afficher(poste.fonctionProfessionnelle)}`)
    console.log(`         posteCap conservé : ${afficher(posteExistant.posteCap)}`)

    if (DRY_RUN) {
      majs++
      continue
    }

    try {
      await payload.update({
        collection:     'membres',
        id:             doc.id,
        data:           { poste },
        overrideAccess: true,
      })
      majs++
    } catch (e) {
      console.error(`         ECHEC — ${e instanceof Error ? e.message : String(e)}`)
      echecs++
    }
  }

  console.log('')
  console.log('  ─────────────────────────────────────────────')
  console.log(`  Mises à jour : ${majs}`)
  console.log(`  Échecs       : ${echecs}`)
  console.log('  ─────────────────────────────────────────────')
  console.log('')

  process.exit(echecs > 0 ? 1 : 0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
