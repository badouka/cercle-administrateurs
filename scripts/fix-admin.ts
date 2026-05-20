#!/usr/bin/env tsx
/**
 * Corrige le rôle du compte admin créé via /admin/create-first-user.
 *
 * Usage :
 *   npx tsx scripts/fix-admin.ts
 *   npx tsx scripts/fix-admin.ts --email autre@domaine.com
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

const args         = process.argv.slice(2)
const emailIdx     = args.indexOf('--email')
const ADMIN_EMAIL  = emailIdx !== -1 ? (args[emailIdx + 1] ?? '') : 'admin@cercle-administrateurs.sn'

async function main(): Promise<void> {
  console.log()
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║         Fix rôle admin — Payload CAP             ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log(`  Email cible : ${ADMIN_EMAIL}`)
  console.log()

  console.log('► Connexion à Payload ...')
  const payload = await getPayload({ config })
  console.log('  ✓ Payload initialisé')
  console.log()

  // Chercher le user par email
  const result = await payload.find({
    collection: 'users',
    where: { email: { equals: ADMIN_EMAIL } },
    limit: 1,
    overrideAccess: true,
  })

  const user = result.docs[0]
  if (!user) {
    console.error(`  ✗ Aucun compte trouvé avec l'email : ${ADMIN_EMAIL}`)
    process.exit(1)
  }

  console.log(`  Compte trouvé : ${user.email} | rôle actuel : ${user.role}`)

  if (user.role === 'admin') {
    console.log('  ✓ Le compte a déjà le rôle admin — rien à faire.')
    process.exit(0)
  }

  // Mettre à jour le rôle
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { role: 'admin' },
    overrideAccess: true,
  })

  console.log(`  ✓ Rôle mis à jour : ${user.role} → admin`)
  console.log()

  process.exit(0)
}

main().catch(err => {
  console.error('\nErreur fatale :', err)
  process.exit(1)
})
