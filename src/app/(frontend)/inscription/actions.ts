'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

const FONCTIONS_PREDEFINIES = [
  'Président',
  'Secrétaire général',
  'Trésorier(e)',
  'Présidente Commission Actions Sociales',
  'Présidente Commission Communication',
  'Président Commission Stratégie et Vulgarisation des Politiques Publiques',
  'Président Commission Renforcement de Capacités',
  'Membre',
]

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

    const posteClean = poste?.trim() ?? ''
    const isPredefined = FONCTIONS_PREDEFINIES.includes(posteClean)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posteData: any = {
      titre:             isPredefined ? posteClean : (posteClean ? 'autre' : undefined),
      titrePersonnalise: isPredefined ? '' : posteClean,
      organisme:         organisme?.trim() ?? '',
    }

    await payload.create({
      collection: 'membres',
      data: {
        user:    user.id,
        prenom:  prenom.trim(),
        nom:     nom.trim(),
        poste:   posteData,
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
