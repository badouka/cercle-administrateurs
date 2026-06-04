import type { CollectionConfig, Access } from 'payload'
import type { User } from '@/payload-types'
import { isAdmin, isAdminOrGestionnaire } from '@/access'

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const Mediatheque: CollectionConfig = {
  slug: 'mediatheque',
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'date', 'statut'],
  },
  access: {
    read: (({ req: { user } }) => {
      if (!user) return { statut: { equals: 'publie' } }
      const role = (user as User)?.role
      if (role === 'admin' || role === 'gestionnaire') return true
      return { statut: { equals: 'publie' } }
    }) as Access,
    create: isAdminOrGestionnaire,
    update: isAdminOrGestionnaire,
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if (operation === 'create' && data?.titre && !data.slug) {
          data.slug = toSlug(data.titre)
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, operation }) => {
        // Sécurité : génère le slug si toujours absent après beforeValidate
        if (operation === 'create' && data?.titre && !data.slug) {
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
      name: 'date',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'photos',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'legende',
          type: 'text',
          label: 'Légende',
        },
      ],
    },
    {
      name: 'statut',
      type: 'select',
      required: true,
      defaultValue: 'publie',
      options: [
        { label: 'Publié',    value: 'publie' },
        { label: 'Brouillon', value: 'brouillon' },
      ],
    },
  ],
}
