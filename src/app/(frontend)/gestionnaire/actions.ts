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

async function requireRole(minRole: 'gestionnaire' | 'admin' = 'gestionnaire'): Promise<AuthResult> {
  const payload = await getPayload({ config })
  const h       = await headers()
  const { user } = await payload.auth({ headers: h })

  if (!user) return { error: 'Non authentifié' }

  const role = (user as User).role
  const allowed =
    minRole === 'admin'
      ? role === 'admin'
      : role === 'gestionnaire' || role === 'admin'

  if (!allowed) return { error: 'Accès refusé' }

  return { payload, user: user as User }
}

// ── Membres ───────────────────────────────────────────────────────────────────

export async function approveMembre(membreId: number, posteCap?: string): Promise<ActionResult> {
  const ctx = await requireRole()
  if ('error' in ctx) return ctx

  try {
    const membre = await ctx.payload.findByID({
      collection:     'membres',
      id:             membreId,
      overrideAccess: true,
    })
    await ctx.payload.update({
      collection:     'membres',
      id:             membreId,
      data: {
        adhesion: { ...(membre.adhesion ?? {}), statut: 'actif' },
        ...(posteCap?.trim()
          ? { poste: { ...(membre.poste ?? {}), posteCap: posteCap.trim() } }
          : {}),
      },
      overrideAccess: true,
    })
    revalidatePath('/gestionnaire')
    revalidatePath('/gestionnaire/membres')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Erreur lors de l'approbation" }
  }
}

export async function rejectMembre(membreId: number): Promise<ActionResult> {
  const ctx = await requireRole()
  if ('error' in ctx) return ctx

  try {
    const membre = await ctx.payload.findByID({
      collection:     'membres',
      id:             membreId,
      overrideAccess: true,
    })
    await ctx.payload.update({
      collection:     'membres',
      id:             membreId,
      data:           { adhesion: { ...(membre.adhesion ?? {}), statut: 'suspendu' } },
      overrideAccess: true,
    })
    revalidatePath('/gestionnaire')
    revalidatePath('/gestionnaire/membres')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erreur lors du rejet' }
  }
}

// ── Posts ─────────────────────────────────────────────────────────────────────

export async function togglePostStatut(
  postId:    number,
  newStatut: 'publie' | 'brouillon',
): Promise<ActionResult> {
  const ctx = await requireRole()
  if ('error' in ctx) return ctx

  try {
    if (ctx.user.role === 'gestionnaire') {
      const post    = await ctx.payload.findByID({ collection: 'posts', id: postId, overrideAccess: true })
      const auteurId = typeof post.auteur === 'object' ? post.auteur.id : post.auteur
      if (auteurId !== ctx.user.id) return { error: 'Accès refusé : vous ne pouvez modifier que vos propres articles' }
    }
    await ctx.payload.update({
      collection:     'posts',
      id:             postId,
      data:           { statut: newStatut },
      overrideAccess: true,
    })
    revalidatePath('/gestionnaire/articles')
    revalidatePath('/actualites')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' }
  }
}

export async function deletePost(postId: number): Promise<ActionResult> {
  const ctx = await requireRole('admin')
  if ('error' in ctx) return ctx

  try {
    await ctx.payload.delete({ collection: 'posts', id: postId, overrideAccess: true })
    revalidatePath('/gestionnaire/articles')
    revalidatePath('/actualites')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erreur lors de la suppression' }
  }
}

// ── Media upload ──────────────────────────────────────────────────────────────

export async function uploadMedia(
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

// ── Pages statiques ──────────────────────────────────────────────────────────

export async function updatePageAction(
  slug:     string,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireRole()
  if ('error' in ctx) return ctx

  const contenuJson = formData.get('contenuJson') as string | null
  const statut      = formData.get('statut') as 'brouillon' | 'publie' | null
  const titre       = (formData.get('titre') as string | null)?.trim()

  if (!contenuJson) return { error: 'Le contenu est requis' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contenu: any
  try { contenu = JSON.parse(contenuJson) } catch { return { error: 'Contenu invalide' } }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { docs } = await (ctx.payload.find as any)({
      collection:     'pages',
      where:          { slug: { equals: slug } },
      limit:          1,
      overrideAccess: true,
    })
    if (!docs[0]) return { error: 'Page introuvable' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = { contenu }
    if (statut) data.statut = statut
    if (titre)  data.titre  = titre

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (ctx.payload.update as any)({
      collection:     'pages',
      id:             docs[0].id,
      data,
      overrideAccess: true,
    })

    revalidatePath('/a-propos')
    revalidatePath('/a-propos/mot-du-president')
    revalidatePath('/a-propos/partenaires')
    revalidatePath(`/gestionnaire/pages/${slug}`)
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' }
  }
}

// ── Lexical helper ────────────────────────────────────────────────────────────

function textToLexical(text: string) {
  const paras  = text.split(/\n{2,}/).filter(p => p.trim())
  const blocks = paras.length > 0 ? paras : ['']
  return {
    root: {
      type:      'root',
      format:    '',
      indent:    0,
      version:   1,
      direction: 'ltr' as const,
      children:  blocks.map(p => ({
        type:      'paragraph',
        format:    '',
        indent:    0,
        version:   1,
        direction: 'ltr' as const,
        children:  [{
          type:    'text',
          detail:  0,
          format:  0,
          mode:    'normal' as const,
          style:   '',
          text:    p.trim(),
          version: 1,
        }],
      })),
    },
  }
}

// ── Article CRUD ──────────────────────────────────────────────────────────────

export async function createPostAction(
  formData: FormData,
): Promise<{ success: true; id: number } | { error: string }> {
  const ctx = await requireRole()
  if ('error' in ctx) return ctx

  const titre        = (formData.get('titre')       as string | null)?.trim()
  const contenuJson  = (formData.get('contenuJson') as string | null)
  const categorie    = formData.get('categorie') as 'actualites' | 'ateliers_seminaires' | null
  const statut       = (formData.get('statut')   as 'brouillon' | 'publie' | null) ?? 'brouillon'
  const imageId      = formData.get('imageId')   ? Number(formData.get('imageId')) : undefined

  if (!titre)       return { error: 'Le titre est requis' }
  if (!contenuJson) return { error: 'Le contenu est requis' }
  if (!categorie)   return { error: 'La catégorie est requise' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let contenu: any
  try { contenu = JSON.parse(contenuJson) } catch { return { error: 'Contenu invalide' } }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const post = await ctx.payload.create({
      collection:     'posts',
      data: {
        titre,
        contenu,
        categorie,
        statut,
        auteur:    ctx.user.id,
        ...(imageId ? { image: imageId } : {}),
      },
      overrideAccess: true,
    })
    revalidatePath('/gestionnaire/articles')
    revalidatePath('/actualites')
    return { success: true, id: post.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erreur lors de la création' }
  }
}

export async function updatePostAction(
  postId:   number,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireRole()
  if ('error' in ctx) return ctx

  const titre       = (formData.get('titre')       as string | null)?.trim()
  const contenuJson = (formData.get('contenuJson') as string | null)
  const categorie   = formData.get('categorie') as 'actualites' | 'ateliers_seminaires' | null
  const statut      = formData.get('statut')    as 'brouillon' | 'publie' | null
  const imageId     = formData.get('imageId')   ? Number(formData.get('imageId')) : undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {}
  if (titre)       data.titre     = titre
  if (contenuJson) { try { data.contenu = JSON.parse(contenuJson) } catch { /* ignore */ } }
  if (categorie)   data.categorie = categorie
  if (statut)      data.statut    = statut
  if (imageId)     data.image     = imageId

  try {
    if (ctx.user.role === 'gestionnaire') {
      const post    = await ctx.payload.findByID({ collection: 'posts', id: postId, overrideAccess: true })
      const auteurId = typeof post.auteur === 'object' ? post.auteur.id : post.auteur
      if (auteurId !== ctx.user.id) return { error: 'Accès refusé : vous ne pouvez modifier que vos propres articles' }
    }
    await ctx.payload.update({
      collection:     'posts',
      id:             postId,
      data,
      overrideAccess: true,
    })
    revalidatePath('/gestionnaire/articles')
    revalidatePath('/actualites')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erreur lors de la mise à jour' }
  }
}
