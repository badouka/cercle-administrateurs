import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'

const isAdmin = ({ req: { user } }: Parameters<NonNullable<CollectionConfig['access']>['read']>[0]) =>
  (user as User)?.role === 'admin'

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
