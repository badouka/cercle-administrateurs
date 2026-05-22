'use server'

import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import config from '@payload-config'

export interface ProfileData {
  prenom:              string
  nom:                 string
  biographie?:         string
  posteTitre?:         string
  organisme?:          string
  direction?:          string
  telephone?:          string
  emailProfessionnel?: string
  linkedin?:           string
}

export async function updateProfile(
  membreId: number,
  data: ProfileData,
): Promise<{ success: true } | { error: string }> {
  try {
    const payload = await getPayload({ config })
    const h       = await headers()
    const { user } = await payload.auth({ headers: h })

    if (!user) return { error: 'Vous devez être connecté.' }

    await payload.update({
      collection: 'membres',
      id:         membreId,
      data: {
        prenom:     data.prenom.trim(),
        nom:        data.nom.trim(),
        biographie: data.biographie?.trim() ?? '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        poste: {
          titre:     data.posteTitre?.trim() ?? '' as any,
          organisme: data.organisme?.trim()  ?? '',
          direction: data.direction?.trim()  ?? '',
        },
        coordonnees: {
          telephone:          data.telephone?.trim()          ?? '',
          emailProfessionnel: data.emailProfessionnel?.trim() ?? '',
          linkedin:           data.linkedin?.trim()           ?? '',
        },
      },
      user,
      overrideAccess: false,
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('[updateProfile]', err)
    return { error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour.' }
  }
}
