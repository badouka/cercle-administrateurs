import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'
import { isAdmin } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'createdAt'],
  },
  auth: {
    forgotPassword: {
      // Par défaut Payload renvoie vers /admin/reset : sans effet pour un
      // membre, qui n'a pas accès à l'administration. Le lien pointe donc vers
      // la page publique de réinitialisation.
      generateEmailSubject: () => 'Réinitialisation de votre mot de passe — CAP',
      generateEmailHTML: (args) => {
        const token = (args as { token?: string } | undefined)?.token ?? ''
        const base  = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cercle-administrateurs.sn'
        const lien  = `${base}/reinitialiser-mot-de-passe?token=${token}`

        return `
          <!DOCTYPE html>
          <html lang="fr">
            <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial, Helvetica, sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:24px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
                      <tr>
                        <td style="background-color:#000000;padding:24px 32px;">
                          <span style="color:#ffffff;font-size:18px;font-weight:bold;">Cercle des Administrateurs Publics</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:32px;color:#1a1a1a;font-size:14px;line-height:1.6;">
                          <h1 style="margin:0 0 16px;font-size:20px;color:#000000;">Réinitialisation de votre mot de passe</h1>
                          <p>Vous avez demandé la réinitialisation de votre mot de passe sur le site du CAP.</p>
                          <p>
                            <a href="${lien}" style="display:inline-block;background-color:#1a7a3a;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                              Choisir un nouveau mot de passe
                            </a>
                          </p>
                          <p style="color:#666;font-size:13px;">
                            Ce lien est valable une heure. Si vous n'êtes pas à l'origine de cette
                            demande, vous pouvez ignorer ce message : votre mot de passe reste inchangé.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `
      },
    },
  },
  access: {
    // Admin et gestionnaire voient tous les utilisateurs ; membre voit uniquement son profil
    read: ({ req: { user } }) => {
      if (!user) return false
      const { role, id } = user as User
      if (role === 'admin' || role === 'gestionnaire') return true
      return { id: { equals: id } }
    },
    // Seul l'admin peut créer des comptes
    create: isAdmin,
    // Admin : tous ; gestionnaire : aucun ; membre : seulement lui-même
    update: ({ req: { user } }) => {
      if (!user) return false
      const { role, id } = user as User
      if (role === 'admin') return true
      if (role === 'gestionnaire') return false
      return { id: { equals: id } }
    },
    // Seul l'admin peut supprimer
    delete: isAdmin,
  },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        // Supprimer les articles rédigés par cet utilisateur
        const { docs: posts } = await req.payload.find({
          collection:     'posts',
          where:          { auteur: { equals: id } },
          limit:          1000,
          overrideAccess: true,
        })
        for (const post of posts) {
          await req.payload.delete({
            collection:     'posts',
            id:             post.id,
            overrideAccess: true,
            req,
          })
        }
        // Supprimer le profil Membre associé (déclenche son propre beforeDelete → ActivityRegistrations)
        const { docs: membres } = await req.payload.find({
          collection:     'membres',
          where:          { user: { equals: id } },
          limit:          1,
          overrideAccess: true,
        })
        if (membres[0]) {
          await req.payload.delete({
            collection:     'membres',
            id:             membres[0].id,
            overrideAccess: true,
            req,
          })
        }
      },
    ],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'membre',
      saveToJWT: true,
      options: [
        { label: 'Membre', value: 'membre' },
        { label: 'Gestionnaire', value: 'gestionnaire' },
        { label: 'Admin', value: 'admin' },
      ],
      // Seul l'admin peut modifier le rôle
      access: {
        update: ({ req: { user } }) => (user as User)?.role === 'admin',
      },
    },
  ],
}
