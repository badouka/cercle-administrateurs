'use server'

import { getPayload, type BasePayload } from 'payload'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import config from '@payload-config'
import type { User } from '@/payload-types'

type ActionResult = { success: true } | { error: string }
type AuthOK       = { payload: BasePayload; user: User }
type AuthResult   = AuthOK | { error: string }

// ── Auth helper ───────────────────────────────────────────────────────────────

async function requireRole(): Promise<AuthResult> {
  const payload  = await getPayload({ config })
  const h        = await headers()
  const { user } = await payload.auth({ headers: h })

  if (!user) return { error: 'Non authentifié' }

  const role = (user as User).role
  if (role !== 'gestionnaire' && role !== 'admin') return { error: 'Accès refusé' }

  return { payload, user: user as User }
}

// ── Media upload ──────────────────────────────────────────────────────────────

export async function uploadBlogMedia(
  formData: FormData,
): Promise<{ id: number; url: string } | { error: string }> {
  const ctx = await requireRole()
  if ('error' in ctx) return ctx

  const file = formData.get('file') as File | null
  const alt  = (formData.get('alt') as string | null) || 'image'

  if (!file || file.size === 0) return { error: 'Aucun fichier sélectionné' }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const media  = await ctx.payload.create({
      collection:     'media',
      data:           { alt },
      file:           { data: buffer, mimetype: file.type, name: file.name, size: file.size },
      overrideAccess: true,
    })
    return { id: media.id, url: media.url ?? '' }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur lors de l'upload" }
  }
}

// ── Blog CRUD ─────────────────────────────────────────────────────────────────

export async function createBlogPostAction(
  formData: FormData,
): Promise<{ success: true; id: number } | { error: string }> {
  const ctx = await requireRole()
  if ('error' in ctx) return ctx

  const titre       = (formData.get('titre')       as string | null)?.trim()
  const contenuJson = (formData.get('contenuJson') as string | null)
  const extrait     = (formData.get('extrait')     as string | null)?.trim()
  const statut      = (formData.get('statut')      as 'draft' | 'published' | null) ?? 'draft'
  const imageId     = formData.get('imageId') ? Number(formData.get('imageId')) : undefined

  if (!titre)       return { error: 'Le titre est requis' }
  if (!contenuJson) return { error: 'Le contenu est requis' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contenu: any
  try { contenu = JSON.parse(contenuJson) } catch { return { error: 'Contenu invalide' } }

  try {
    const post = await ctx.payload.create({
      collection: 'blog-posts',
      data: {
        titre,
        contenu,
        statut,
        auteur:  ctx.user.id,
        ...(extrait ? { extrait } : {}),
        ...(imageId ? { image: imageId } : {}),
      },
      overrideAccess: true,
    })
    revalidatePath('/gestionnaire/blog')
    revalidatePath('/blog')
    return { success: true, id: post.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erreur lors de la création' }
  }
}

export async function updateBlogPostAction(
  postId:   number,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireRole()
  if ('error' in ctx) return ctx

  const titre       = (formData.get('titre')       as string | null)?.trim()
  const contenuJson = (formData.get('contenuJson') as string | null)
  const extrait     = formData.get('extrait') as string | null
  const statut      = formData.get('statut')  as 'draft' | 'published' | null
  const imageId     = formData.get('imageId') ? Number(formData.get('imageId')) : undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {}
  if (titre)            data.titre   = titre
  if (contenuJson)      { try { data.contenu = JSON.parse(contenuJson) } catch { /* ignore */ } }
  if (extrait !== null) data.extrait = extrait.trim()
  if (statut)           data.statut  = statut
  if (imageId)          data.image   = imageId

  try {
    await ctx.payload.update({
      collection:     'blog-posts',
      id:             postId,
      data,
      overrideAccess: true,
    })
    revalidatePath('/gestionnaire/blog')
    revalidatePath('/blog')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' }
  }
}

export async function toggleBlogPostStatut(
  postId:    number,
  newStatut: 'published' | 'draft',
): Promise<ActionResult> {
  const ctx = await requireRole()
  if ('error' in ctx) return ctx

  try {
    await ctx.payload.update({
      collection:     'blog-posts',
      id:             postId,
      data:           { statut: newStatut },
      overrideAccess: true,
    })
    revalidatePath('/gestionnaire/blog')
    revalidatePath('/blog')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' }
  }
}

export async function deleteBlogPost(postId: number): Promise<ActionResult> {
  const ctx = await requireRole()
  if ('error' in ctx) return ctx

  try {
    await ctx.payload.delete({ collection: 'blog-posts', id: postId, overrideAccess: true })
    revalidatePath('/gestionnaire/blog')
    revalidatePath('/blog')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erreur lors de la suppression' }
  }
}
