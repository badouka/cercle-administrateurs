'use server'

import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import config from '@payload-config'

const LOGO_MIME    = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const LOGO_MAX     = 2 * 1024 * 1024 // 2 Mo

export async function uploadMemberLogo(
  formData: FormData,
): Promise<{ id: number; url: string } | { error: string }> {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné.' }
  if (file.size > LOGO_MAX)    return { error: 'Le logo ne doit pas dépasser 2 Mo.' }
  if (!LOGO_MIME.includes(file.type)) return { error: 'Format non supporté. Utilisez JPG, PNG, WebP ou SVG.' }

  try {
    const payload = await getPayload({ config })
    const buffer  = Buffer.from(await file.arrayBuffer())
    const media   = await payload.create({
      collection:     'media',
      data:           { alt: `Logo — ${file.name}` },
      file:           { data: buffer, mimetype: file.type, name: file.name, size: file.size },
      overrideAccess: true,
    })
    return { id: media.id, url: media.url ?? '' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur lors de l'upload." }
  }
}

export interface ProfileData {
  prenom:                   string
  nom:                      string
  biographie?:              string
  posteCap?:                string
  fonctionProfessionnelle?: string
  organisme?:               string
  siteOrganisme?:           string
  direction?:               string
  telephone?:               string
  telephoneSecondaire?:     string
  emailProfessionnel?:      string
  linkedin?:                string
  logoOrganismeId?:         number | null
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const poste: any = {
      posteCap:                data.posteCap?.trim()                || undefined,
      fonctionProfessionnelle: data.fonctionProfessionnelle?.trim() || undefined,
      organisme:               data.organisme?.trim()               ?? '',
      siteOrganisme:           data.siteOrganisme?.trim()           || undefined,
      direction:               data.direction?.trim()               ?? '',
    }

    if (data.logoOrganismeId !== undefined) {
      poste.logoOrganisme = data.logoOrganismeId
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      prenom:     data.prenom.trim(),
      nom:        data.nom.trim(),
      biographie: data.biographie?.trim() ?? '',
      poste,
      coordonnees: {
        telephone:           data.telephone?.trim()           ?? '',
        telephoneSecondaire: data.telephoneSecondaire?.trim() ?? '',
        emailProfessionnel:  data.emailProfessionnel?.trim()  ?? '',
        linkedin:            data.linkedin?.trim()            ?? '',
      },
    }

    await payload.update({
      collection: 'membres',
      id:         membreId,
      data:       updateData,
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
