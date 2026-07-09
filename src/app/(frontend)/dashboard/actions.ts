'use server'

import { getPayload } from 'payload'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import config from '@payload-config'
import type { User } from '@/payload-types'

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

    // Vérifie que l'utilisateur connecté est bien le propriétaire du profil
    // (ou un admin) avant d'autoriser la mise à jour.
    const existing = await payload.findByID({
      collection:     'membres',
      id:             membreId,
      depth:          0,
      overrideAccess: true,
    })
    const ownerId = existing.user && typeof existing.user === 'object'
      ? existing.user.id
      : existing.user
    const isAdmin = (user as User).role === 'admin'
    if (!isAdmin && ownerId !== user.id) {
      return { error: "Vous n'êtes pas autorisé à modifier ce profil." }
    }

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

    // Server Action authentifiée : la propriété du profil a déjà été vérifiée
    // ci-dessus, on contourne donc les règles d'accès (qui refusaient l'update).
    await payload.update({
      collection:     'membres',
      id:             membreId,
      data:           updateData,
      user,
      overrideAccess: true,
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('[updateProfile]', err)
    return { error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour.' }
  }
}

// ─── Paramètres du compte ──────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function updateAccountEmail(
  email: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const payload = await getPayload({ config })
    const h        = await headers()
    const { user } = await payload.auth({ headers: h })

    if (!user) return { error: 'Vous devez être connecté.' }

    const nextEmail = email.trim().toLowerCase()
    if (!EMAIL_RE.test(nextEmail)) return { error: 'Adresse email invalide.' }
    if (nextEmail === (user as User).email.toLowerCase()) {
      return { error: 'Cette adresse est déjà votre email actuel.' }
    }

    await payload.update({
      collection:     'users',
      id:             user.id,
      data:           { email: nextEmail },
      user,
      overrideAccess: true,
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err) {
    console.error('[updateAccountEmail]', err)
    const msg = err instanceof Error ? err.message : "Erreur lors de la mise à jour de l'email."
    // Message plus clair en cas d'email déjà utilisé
    if (/unique|already|exist/i.test(msg)) {
      return { error: 'Cette adresse email est déjà utilisée par un autre compte.' }
    }
    return { error: msg }
  }
}

export async function updateAccountPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const payload = await getPayload({ config })
    const h        = await headers()
    const { user } = await payload.auth({ headers: h })

    if (!user) return { error: 'Vous devez être connecté.' }

    if (!currentPassword) return { error: 'Veuillez saisir votre mot de passe actuel.' }
    if (newPassword.length < 8) {
      return { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' }
    }

    // Vérifie le mot de passe actuel en tentant une connexion.
    try {
      await payload.login({
        collection: 'users',
        data:       { email: (user as User).email, password: currentPassword },
      })
    } catch {
      return { error: 'Mot de passe actuel incorrect.' }
    }

    // Payload hache automatiquement le champ `password` fourni à update.
    await payload.update({
      collection:     'users',
      id:             user.id,
      data:           { password: newPassword },
      user,
      overrideAccess: true,
    })

    return { success: true }
  } catch (err) {
    console.error('[updateAccountPassword]', err)
    return { error: err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe.' }
  }
}
