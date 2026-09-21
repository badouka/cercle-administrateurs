/**
 * Import des membres CAP v3 — UPSERT par slug.
 *
 * Source : Liste-membres-CAP.xlsx (colonnes Nom, Prénom, Fonction, Entreprise,
 * Sigle ; Téléphone et Email sont vides dans le fichier et sont ignorés).
 * Les données sont figées ci-dessous, accents compris, pour que le script
 * n'ait pas besoin d'un lecteur XLSX.
 *
 * Contrairement à la v2, ce script NE SUPPRIME RIEN. Pour chaque ligne :
 *   - slug déjà en base  -> met à jour prenom, nom,
 *                           poste.fonctionProfessionnelle et poste.organisme,
 *                           et rien d'autre ;
 *   - slug inconnu       -> crée la fiche avec adhesion.statut = 'actif'.
 *
 * posteCap, photo, justificatif, user et adhesion sont préservés à
 * l'identique sur les fiches existantes.
 *
 * Usage :
 *   pnpm tsx scripts/import-membres-v3.ts --dry-run   (aucune écriture)
 *   pnpm tsx scripts/import-membres-v3.ts
 */

import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const DRY_RUN = process.argv.includes('--dry-run')

interface LigneExcel {
  nom:        string
  prenom:     string
  fonction:   string
  entreprise: string
  sigle:      string
}

const MEMBRES: LigneExcel[] = [
  { nom: 'Biteye',   prenom: 'Cheikh',          fonction: 'Président du conseil d\'administration', entreprise: 'Agence Sénégalaise d\'Électrification Rurale', sigle: 'ASER' },
  { nom: 'Sakho',    prenom: 'Lansana Gagny',   fonction: 'Président du conseil d\'administration', entreprise: 'Agence de Promotion des Investissements et des Grands Travaux', sigle: 'APIX' },
  { nom: 'Badiane',  prenom: 'Cheikh',          fonction: 'Président du conseil d\'administration', entreprise: 'Société Nationale des Eaux du Sénégal', sigle: 'SONES' },
  { nom: 'Sané',     prenom: 'Hatab',           fonction: 'Président du Conseil d\'administration', entreprise: 'Agence Nationale pour la Relance des Activités économiques et sociales en Casamance', sigle: 'ANRAC' },
  { nom: 'Watt',     prenom: 'Omar',            fonction: 'Président du conseil d\'administration', entreprise: 'Sénégal Numérique SA', sigle: 'SENUM' },
  { nom: 'Gueye',    prenom: 'Papa Madieye',    fonction: 'Président du conseil de surveillance', entreprise: 'Agence de Réglementation Pharmaceutique', sigle: 'ARP' },
  { nom: 'Dia',      prenom: 'Moctar',          fonction: 'Président du conseil d\'administration', entreprise: 'Centre National de Qualification Professionnelle', sigle: 'CNQP' },
  { nom: 'Mboup',    prenom: 'Mamadou Ngouda',  fonction: '', entreprise: '', sigle: '' },
  { nom: 'Diop',     prenom: 'Médou Mané',      fonction: 'Président du conseil de surveillance', entreprise: 'Agence Nationale Pour l\'Emploi des Jeunes', sigle: 'ANPEJ' },
  { nom: 'Djiba',    prenom: 'Sadibou',         fonction: 'Président du conseil de surveillance', entreprise: 'Agence Sénégalaise de la Reforestation et de la Grande Muraille Verte', sigle: 'ASERGMV' },
  { nom: 'Ndiaye',   prenom: 'Mor Talla',       fonction: 'Président du conseil d\'administration', entreprise: 'Agence des Travaux et de Gestion des Routes', sigle: 'AGEROUTE' },
  { nom: 'Seck',     prenom: 'Sidy M.',         fonction: 'Président du conseil d\'administration', entreprise: 'Société Nationale d\'Aménagement et d\'Exploitation des Terres du Delta et des Vallées du Fleuve Sénégal et de la Falémé', sigle: 'SAED' },
  { nom: 'Goudiaby', prenom: 'Mamadou',         fonction: 'Président du conseil d\'administration', entreprise: 'Dakar Dem Dikk (Société Nationale de Transport public de voyageurs)', sigle: 'DDD' },
  { nom: 'Diouf',    prenom: 'Abdou',           fonction: 'Président du conseil d\'administration', entreprise: 'Sen\'Eau (Société d\'exploitation de l\'eau du Sénégal)', sigle: 'SENEAU' },
  { nom: 'Kanté',    prenom: 'Abdou Salam',     fonction: 'Président du conseil de surveillance', entreprise: 'Agence d\'Assistance à la Sécurité de Proximité', sigle: 'ASP' },
  { nom: 'Beye',     prenom: 'Sidya',           fonction: 'Président du conseil d\'administration', entreprise: 'Fonds Souverain d\'Investissements Stratégiques', sigle: 'FONSIS' },
  { nom: 'Badji',    prenom: 'Pape Ali',        fonction: 'Président du conseil d\'administration', entreprise: 'Agence Nationale de la Petite Enfance et de la Case des Tout-Petits', sigle: 'ANPECTP' },
  { nom: 'Cissé',    prenom: 'Amadou',          fonction: 'Président du conseil d\'administration', entreprise: 'Bureau Opérationnel de Coordination et de Suivi des projets et programmes', sigle: 'BOCS' },
  { nom: 'Faye',     prenom: 'Adama',           fonction: 'Président du conseil d\'administration', entreprise: 'Société Africaine de Raffinage', sigle: 'SAR' },
  { nom: 'Ndiaye',   prenom: 'Tahir',           fonction: 'Président du conseil d\'administration', entreprise: 'AIBD Assistance Services', sigle: '2AS' },
  { nom: 'Diop',     prenom: 'Bocar',           fonction: 'Président du conseil d\'administration', entreprise: '2AS Technics', sigle: '2AS TECHNICS' },
  { nom: 'Diouf',    prenom: 'Colonel Tabaski', fonction: 'Président du conseil de surveillance', entreprise: 'Haute Autorité des Aéroports du Sénégal', sigle: 'HAAS' },
  { nom: 'Sarr',     prenom: 'Mamadou',         fonction: 'Président du conseil d\'administration', entreprise: 'Banque Nationale de Développement Économique', sigle: 'BNDE' },
  { nom: 'Diallo',   prenom: 'Saliou',          fonction: 'Président du conseil d\'administration', entreprise: 'Hôpital de Thiaroye', sigle: '' },
  { nom: 'Mbodji',   prenom: 'Abdou Aziz',      fonction: 'Président du conseil d\'administration', entreprise: 'Aéroport International Blaise Diagne SA', sigle: 'AIBD' },
  { nom: 'Thiam',    prenom: 'Khady G.',        fonction: 'Président du conseil d\'administration', entreprise: 'Société de Gestion et d\'Exploitation du Barrage de Diama', sigle: 'SOGED' },
  { nom: 'Ba',       prenom: 'Moussa',          fonction: 'Président du conseil d\'administration', entreprise: 'Agence de Régulation des Marchés', sigle: 'ARM' },
  { nom: 'Niass',    prenom: 'Tidjani',         fonction: 'Président du conseil d\'administration', entreprise: 'Société des Pétroles du Sénégal', sigle: 'PETROSEN' },
  { nom: 'Thiam',    prenom: 'Demba',           fonction: 'Président du conseil d\'orientation', entreprise: 'Fonds National de la Microfinance', sigle: 'FONAMIF' },
  { nom: 'Diouf',    prenom: 'Mamadou',         fonction: 'Président du conseil d\'administration', entreprise: 'Hôpital de Diamniadio', sigle: '' },
  { nom: 'Sow',      prenom: 'Taha',            fonction: 'Président du conseil d\'administration', entreprise: 'Société Nationale de Commercialisation des Oléagineux du Sénégal', sigle: 'SONACOS' },
  { nom: 'Ndiaye',   prenom: 'Sidy Alboury',    fonction: 'Président du conseil d\'administration', entreprise: 'Agence Nationale de l\'Aménagement du Territoire', sigle: 'ANAT' },
  { nom: 'Sène',     prenom: 'Mbaye',           fonction: 'Président du conseil d\'administration', entreprise: 'Société des Mines du Sénégal', sigle: 'SOMISEN' },
  { nom: 'Mbacké',   prenom: 'Bassirou',        fonction: 'Président du conseil d\'administration', entreprise: 'La Banque Agricole', sigle: 'LBA' },
  { nom: 'Diop',     prenom: 'Doudou Gnagna',   fonction: 'Président du conseil d\'administration', entreprise: 'Société d\'Aménagement et de Promotion des Côtes et Zones Touristiques du Sénégal', sigle: 'SAPCO' },
]

/**
 * Réplique exacte du `toSlug` de src/collections/Membres.ts (le hook
 * beforeValidate de la collection recalcule le slug à partir de prenom + nom ;
 * il faut donc viser la même valeur pour retrouver les fiches existantes).
 */
function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/** La base note l'organisme « Nom complet (SIGLE) » : on suit la convention. */
function formatOrganisme(ligne: LigneExcel): string | undefined {
  const entreprise = ligne.entreprise.trim()
  const sigle      = ligne.sigle.trim()
  if (!entreprise) return undefined
  return sigle ? `${entreprise} (${sigle})` : entreprise
}

function afficher(valeur: string | null | undefined): string {
  return valeur === null || valeur === undefined || valeur === '' ? '—' : valeur
}

/** Nom de famille normalisé, pour repérer les homonymes déjà en base. */
function cleNom(nom: string): string {
  return toSlug(nom)
}

async function main() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config')

  console.log('')
  console.log('  Import membres CAP v3 — upsert par slug')
  console.log(`  ${MEMBRES.length} ligne(s) dans la feuille Excel`)
  if (DRY_RUN) console.log('  MODE DRY-RUN — aucune écriture en base')
  console.log('')

  const payload = await getPayload({ config })

  // Instantané de la base avant toute écriture : sert au rapprochement par
  // slug et à la détection d'homonymes.
  const { docs: existants, totalDocs } = await payload.find({
    collection:     'membres',
    limit:          1000,
    depth:          0,
    overrideAccess: true,
  })
  console.log(`  ${totalDocs} fiche(s) déjà en base\n`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parSlug = new Map<string, any>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parNom  = new Map<string, any[]>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const doc of existants as any[]) {
    if (doc.slug) parSlug.set(doc.slug, doc)
    const cle = cleNom(doc.nom ?? '')
    parNom.set(cle, [...(parNom.get(cle) ?? []), doc])
  }

  let crees = 0
  let majs  = 0
  let echecs = 0
  const homonymes: string[] = []

  for (const ligne of MEMBRES) {
    const prenom    = ligne.prenom.trim()
    const nom       = ligne.nom.trim()
    const slug      = toSlug(`${prenom}${nom}`)
    const fonction  = ligne.fonction.trim() || undefined
    const organisme = formatOrganisme(ligne)
    const existant  = parSlug.get(slug)
    const etiquette = `${prenom} ${nom}`

    if (existant) {
      // Le groupe `poste` est réécrit en entier : on repart des valeurs
      // stockées et on ne remplace que les deux champs concernés, pour ne
      // dépendre d'aucune sémantique de fusion partielle côté Payload.
      const posteExistant = existant.poste ?? {}
      const poste = {
        ...posteExistant,
        fonctionProfessionnelle: fonction ?? posteExistant.fonctionProfessionnelle ?? null,
        organisme:               organisme ?? posteExistant.organisme ?? null,
      }

      const changements: string[] = []
      if (existant.prenom !== prenom) changements.push(`prénom : ${afficher(existant.prenom)} -> ${prenom}`)
      if (existant.nom !== nom)       changements.push(`nom : ${afficher(existant.nom)} -> ${nom}`)
      if (posteExistant.fonctionProfessionnelle !== poste.fonctionProfessionnelle)
        changements.push(`fonction : ${afficher(posteExistant.fonctionProfessionnelle)} -> ${afficher(poste.fonctionProfessionnelle)}`)
      if (posteExistant.organisme !== poste.organisme)
        changements.push(`organisme : ${afficher(posteExistant.organisme)} -> ${afficher(poste.organisme)}`)

      console.log(`  MAJ    ${etiquette}  [${slug}]`)
      console.log(`         posteCap conservé : ${afficher(posteExistant.posteCap)}`)
      if (changements.length === 0) {
        console.log('         aucun changement')
      } else {
        for (const c of changements) console.log(`         ${c}`)
      }

      if (!DRY_RUN) {
        try {
          await payload.update({
            collection:     'membres',
            id:             existant.id,
            data:           { prenom, nom, poste },
            overrideAccess: true,
          })
          majs++
        } catch (e) {
          console.error(`         ECHEC — ${e instanceof Error ? e.message : String(e)}`)
          echecs++
        }
      } else {
        majs++
      }
      continue
    }

    // Pas de slug correspondant : création. On signale au passage les fiches
    // portant le même nom de famille, qui sont souvent la même personne saisie
    // avec un prénom différent (Attab / Hatab, Oumar / Omar…).
    const memeNom = (parNom.get(cleNom(nom)) ?? []).filter(d => toSlug(`${d.prenom}${d.nom}`) !== slug)
    console.log(`  CREER  ${etiquette}  [${slug}]`)
    console.log(`         fonction  : ${afficher(fonction)}`)
    console.log(`         organisme : ${afficher(organisme)}`)
    if (memeNom.length > 0) {
      for (const d of memeNom) {
        const msg = `${etiquette} (nouveau) ~ ${d.prenom} ${d.nom} [${d.slug}] déjà en base — posteCap : ${afficher(d.poste?.posteCap)}`
        console.log(`         HOMONYME : ${d.prenom} ${d.nom} [${d.slug}]`)
        homonymes.push(msg)
      }
    }

    if (!DRY_RUN) {
      try {
        await payload.create({
          collection: 'membres',
          data: {
            prenom,
            nom,
            poste:    { fonctionProfessionnelle: fonction, organisme },
            adhesion: { statut: 'actif' },
          },
          overrideAccess: true,
        })
        crees++
      } catch (e) {
        console.error(`         ECHEC — ${e instanceof Error ? e.message : String(e)}`)
        echecs++
      }
    } else {
      crees++
    }
  }

  console.log('')
  console.log('  ─────────────────────────────────────────────')
  console.log(`  Mises à jour : ${majs}`)
  console.log(`  Créations    : ${crees}`)
  console.log(`  Échecs       : ${echecs}`)
  console.log(`  Base : ${totalDocs} -> ${totalDocs + crees} fiche(s)`)
  console.log('  ─────────────────────────────────────────────')

  if (homonymes.length > 0) {
    console.log('')
    console.log(`  ${homonymes.length} homonyme(s) détecté(s) — doublons probables :`)
    for (const h of homonymes) console.log(`   - ${h}`)
  }
  console.log('')

  process.exit(echecs > 0 ? 1 : 0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
