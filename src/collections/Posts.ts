import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'
import { isAdmin, isAdminOrGestionnaire } from '@/access'

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'categorie', 'statut', 'auteur', 'publie_le'],
  },
  access: {
    // Public / membre : articles publiés uniquement
    // Gestionnaire   : ses propres articles (tout statut) + articles publiés des autres
    // Admin           : tout
    read: ({ req: { user } }) => {
      if (!user) return { statut: { equals: 'publie' } }
      const { role, id } = user as User
      if (role === 'admin') return true
      if (role === 'gestionnaire') {
        return { or: [{ statut: { equals: 'publie' } }, { auteur: { equals: id } }] }
      }
      return { statut: { equals: 'publie' } }
    },
    // Admin et gestionnaire peuvent créer
    create: isAdminOrGestionnaire,
    // Admin : tout ; gestionnaire : seulement ses propres articles
    update: ({ req: { user } }) => {
      if (!user) return false
      const { role, id } = user as User
      if (role === 'admin') return true
      if (role === 'gestionnaire') return { auteur: { equals: id } }
      return false
    },
    delete: isAdmin,
  },
  hooks: {
    // beforeValidate : s'exécute avant la validation des champs "required"
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create') {
          if (data?.titre && !data.slug) {
            data.slug = toSlug(data.titre)
          }
          // Injecte l'auteur même si field-level access l'a retiré de la requête
          if (req.user && !data.auteur) {
            data.auteur = req.user.id
          }
        }
        return data
      },
    ],
    // beforeChange : horodate la première publication
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.statut === 'publie' && !originalDoc?.publie_le && !data.publie_le) {
          data.publie_le = new Date().toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'titre', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: { description: 'Auto-généré depuis le titre à la création.' },
    },
    {
      name: 'contenu',
      type: 'richText',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'categorie',
      type: 'select',
      required: true,
      options: [
        { label: 'Actualités',          value: 'actualites' },
        { label: 'Ateliers & Séminaires', value: 'ateliers_seminaires' },
      ],
    },
    {
      name: 'statut',
      type: 'select',
      required: true,
      defaultValue: 'brouillon',
      options: [
        { label: 'Brouillon', value: 'brouillon' },
        { label: 'Publié',    value: 'publie' },
      ],
    },
    {
      name: 'publie_le',
      type: 'date',
      admin: {
        description: 'Renseigné automatiquement à la première publication.',
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'auteur',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { description: 'Défini automatiquement à la création.' },
      // Empêche le client de forger ou de changer l'auteur
      // (le hook beforeValidate l'injecte côté serveur)
      access: {
        create: ({ req: { user } }) => (user as User)?.role === 'admin',
        update: ({ req: { user } }) => (user as User)?.role === 'admin',
      },
    },
  ],
}
