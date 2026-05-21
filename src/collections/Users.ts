import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'
import { isAdmin } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'createdAt'],
  },
  auth: true,
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
