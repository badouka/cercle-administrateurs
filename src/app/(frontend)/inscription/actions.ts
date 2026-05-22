'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export interface InscriptionData {
  prenom:                string
  nom:                   string
  email:                 string
  motDePasse:            string
  poste?:                string
  organisme?:            string
  telephone?:            string
  telephoneSecondaire?:  string
}

export async function inscrire(
  data: InscriptionData,
): Promise<{ success: true } | { error: string }> {
  const { prenom, nom, email, motDePasse, poste, organisme, telephone, telephoneSecondaire } = data

  if (!prenom.trim() || !nom.trim() || !email.trim() || !motDePasse) {
    return { error: 'Veuillez remplir tous les champs obligatoires.' }
  }
  if (motDePasse.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  }

  try {
    const payload = await getPayload({ config })

    const existing = await payload.find({
      collection:     'users',
      where:          { email: { equals: email.toLowerCase().trim() } },
      limit:          1,
      overrideAccess: true,
    })
    if (existing.docs.length > 0) {
      return { error: 'Cette adresse email est déjà utilisée.' }
    }

    const user = await payload.create({
      collection:     'users',
      data:           { email: email.toLowerCase().trim(), password: motDePasse, role: 'membre' },
      overrideAccess: true,
    })

    await payload.create({
      collection: 'membres',
      data: {
        user:    user.id,
        prenom:  prenom.trim(),
        nom:     nom.trim(),
        poste: {
          titre:     poste?.trim()     ?? '',
          organisme: organisme?.trim() ?? '',
        },
        coordonnees: {
          telephone:           telephone?.trim()           ?? '',
          telephoneSecondaire: telephoneSecondaire?.trim() ?? '',
        },
        adhesion: { statut: 'inactif' },
      },
      overrideAccess: true,
    })

    return { success: true }
  } catch (err) {
    console.error('[inscrire]', err)
    return { error: err instanceof Error ? err.message : 'Une erreur est survenue.' }
  }
}
