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

export const Activities: CollectionConfig = {
  slug: 'activities',
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'type', 'statut', 'date_debut'],
  },
  access: {
    // Public : seulement les activités à venir ou en cours
    // Authentifié : tout
    read: ({ req: { user } }) => {
      if (!user) return { statut: { in: ['a_venir', 'en_cours'] } }
      const { role } = user as User
      if (role === 'admin' || role === 'gestionnaire') return true
      return { statut: { in: ['a_venir', 'en_cours'] } }
    },
    create: ({ req: { user } }) => (user as User)?.role === 'admin',
    update: ({ req: { user } }) => (user as User)?.role === 'admin',
    delete: ({ req: { user } }) => (user as User)?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Génère le slug à la création ; l'admin peut l'écraser manuellement
        if (operation === 'create' && data.titre && !data.slug) {
          data.slug = toSlug(data.titre)
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Auto-généré depuis le titre à la création. Modifiable manuellement.',
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Atelier',   value: 'atelier' },
        { label: 'Séminaire', value: 'seminaire' },
      ],
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'lieu',
      type: 'text',
    },
    {
      name: 'date_debut',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'date_fin',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'statut',
      type: 'select',
      required: true,
      defaultValue: 'a_venir',
      options: [
        { label: 'À venir',  value: 'a_venir' },
        { label: 'En cours', value: 'en_cours' },
        { label: 'Terminé',  value: 'termine' },
      ],
    },
    {
      name: 'places_disponibles',
      type: 'number',
      min: 0,
    },
  ],
}
