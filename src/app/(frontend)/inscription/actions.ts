'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE     = 5 * 1024 * 1024 // 5 Mo

export interface InscriptionData {
  prenom:                   string
  nom:                      string
  email:                    string
  motDePasse:               string
  posteCap?:                string
  fonctionProfessionnelle?: string
  organisme?:               string
  siteOrganisme?:           string
  telephone?:               string
  telephoneSecondaire?:     string
  justificatifId:           number
}

// ── Upload public du justificatif ─────────────────────────────────────────────

export async function uploadJustificatif(
  formData: FormData,
): Promise<{ id: number; url: string } | { error: string }> {
  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné.' }
  if (file.size > MAX_SIZE)    return { error: 'Le fichier ne doit pas dépasser 5 Mo.' }
  if (!ALLOWED_MIME.includes(file.type)) return { error: 'Format non supporté. Utilisez PDF, JPG ou PNG.' }

  try {
    const payload = await getPayload({ config })
    const buffer  = Buffer.from(await file.arrayBuffer())
    const media   = await payload.create({
      collection:     'media',
      data:           { alt: `Justificatif — ${file.name}` },
      file:           { data: buffer, mimetype: file.type, name: file.name, size: file.size },
      overrideAccess: true,
    })
    return { id: media.id, url: media.url ?? '' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur lors de l'upload." }
  }
}

// ── Inscription ───────────────────────────────────────────────────────────────

export async function inscrire(
  data: InscriptionData,
): Promise<{ success: true } | { error: string }> {
  const {
    prenom, nom, email, motDePasse,
    posteCap, fonctionProfessionnelle, organisme, siteOrganisme, telephone, telephoneSecondaire,
    justificatifId,
  } = data

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const posteData: any = {
      posteCap:                posteCap?.trim()                || undefined,
      fonctionProfessionnelle: fonctionProfessionnelle?.trim() || undefined,
      organisme:               organisme?.trim()               ?? '',
      siteOrganisme:           siteOrganisme?.trim()           || undefined,
    }

    await payload.create({
      collection: 'membres',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        user:         user.id,
        prenom:       prenom.trim(),
        nom:          nom.trim(),
        justificatif: justificatifId,
        poste:        posteData,
        coordonnees: {
          telephone:           telephone?.trim()           ?? '',
          telephoneSecondaire: telephoneSecondaire?.trim() ?? '',
        },
        adhesion: { statut: 'inactif' },
      } as any,
      overrideAccess: true,
    })

    return { success: true }
  } catch (err) {
    console.error('[inscrire]', err)
    return { error: err instanceof Error ? err.message : 'Une erreur est survenue.' }
  }
}
