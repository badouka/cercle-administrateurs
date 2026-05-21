#!/usr/bin/env tsx
/**
 * Réinitialise le mot de passe d'un utilisateur via l'API locale Payload.
 *
 * Usage :
 *   npx tsx scripts/reset-member-password.ts --email user@example.com --password NouveauMotDePasse!
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

// ─── Arguments ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)

function getArg(flag: string): string | null {
  const i = args.indexOf(flag)
  return i !== -1 ? (args[i + 1] ?? null) : null
}

const email    = getArg('--email')
const password = getArg('--password')

if (!email || !password) {
  console.error('\nUsage : npx tsx scripts/reset-member-password.ts --email <email> --password <motdepasse>\n')
  process.exit(1)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log()
  console.log('► Connexion à Payload ...')
  const payload = await getPayload({ config })
  console.log('  ✓ Payload initialisé')
  console.log()

  console.log(`► Recherche de l'utilisateur : ${email} ...`)
  const { docs } = await payload.find({
    collection:     'users',
    where:          { email: { equals: email.toLowerCase().trim() } },
    limit:          1,
    overrideAccess: true,
  })

  if (docs.length === 0) {
    console.error(`  ✗ Aucun utilisateur trouvé avec l'email : ${email}`)
    process.exit(1)
  }

  const user = docs[0]!
  console.log(`  ✓ Utilisateur trouvé : ${user.email} (id=${user.id}, rôle=${user.role})`)
  console.log()

  console.log('► Mise à jour du mot de passe ...')
  await payload.update({
    collection:     'users',
    id:             user.id,
    data:           { password },
    overrideAccess: true,
  })

  console.log('  ✓ Mot de passe mis à jour avec succès.')
  console.log()

  process.exit(0)
}

main().catch(err => {
  console.error('\nErreur fatale :', err)
  process.exit(1)
})
