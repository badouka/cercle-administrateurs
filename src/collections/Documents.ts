import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'categorie', 'acces', 'createdAt'],
  },
  access: {
    // Unauthentifié : documents publics uniquement
    // Tout utilisateur connecté (membre, gestionnaire, admin) : tous les documents
    read: ({ req: { user } }) => {
      if (!user) return { acces: { equals: 'public' } }
      return true
    },
    create: ({ req: { user } }) => (user as User)?.role === 'admin',
    update: ({ req: { user } }) => (user as User)?.role === 'admin',
    delete: ({ req: { user } }) => (user as User)?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && data.titre && !data.slug) {
          data.slug = toSlug(data.titre)
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
      name: 'fichier',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'categorie',
      type: 'select',
      required: true,
      options: [
        { label: 'Textes statutaires',        value: 'textes_statutaires' },
        { label: 'Textes réglementaires',     value: 'textes_reglementaires' },
        { label: 'PV de réunion',             value: 'pv_reunion' },
        { label: 'Ressources',                value: 'ressources' },
        { label: 'Magazines',                 value: 'magazines' },
        { label: 'Docs politique économique', value: 'docs_politique_economique' },
      ],
    },
    {
      name: 'acces',
      type: 'select',
      required: true,
      defaultValue: 'public',
      options: [
        { label: 'Public',   value: 'public' },
        { label: 'Membres',  value: 'membres' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
  ],
}
