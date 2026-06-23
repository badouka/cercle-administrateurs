import type { CollectionConfig, Access } from 'payload'
import type { User } from '@/payload-types'
import { isAdminOrGestionnaire } from '@/access'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import {
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  StrikethroughFeature,
  HeadingFeature,
  UnorderedListFeature,
  OrderedListFeature,
  BlockquoteFeature,
  LinkFeature,
} from '@payloadcms/richtext-lexical'

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'statut', 'auteur', 'publie_le'],
  },
  access: {
    // Lecture réservée aux membres connectés :
    //   - membre        : articles publiés uniquement
    //   - gestionnaire  : ses propres articles (tout statut) + publiés des autres
    //   - admin          : tout
    //   - visiteur anonyme : aucun accès
    read: (({ req: { user } }) => {
      if (!user) return false
      const { role, id } = user as User
      if (role === 'admin') return true
      if (role === 'gestionnaire') {
        return { or: [{ statut: { equals: 'published' } }, { auteur: { equals: id } }] }
      }
      return { statut: { equals: 'published' } }
    }) as Access,
    create: isAdminOrGestionnaire,
    update: isAdminOrGestionnaire,
    delete: isAdminOrGestionnaire,
  },
  hooks: {
    // Génère le slug à la création et injecte l'auteur côté serveur
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && data) {
          if (data.titre && !data.slug) {
            data.slug = toSlug(data.titre)
          }
          if (req.user && !data.auteur) {
            data.auteur = req.user.id
          }
        }
        return data
      },
    ],
    // Horodate la première publication
    beforeChange: [
      ({ data, originalDoc }) => {
        if (data.statut === 'published' && !originalDoc?.publie_le && !data.publie_le) {
          data.publie_le = new Date().toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'titre', type: 'text', label: 'Titre', required: true },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      unique: true,
      index: true,
      admin: { description: 'Auto-généré depuis le titre à la création.' },
    },
    {
      name: 'contenu',
      type: 'richText',
      label: 'Contenu',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          StrikethroughFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          BlockquoteFeature(),
          LinkFeature(),
        ],
      }),
    },
    {
      name: 'image',
      type: 'upload',
      label: 'Image de couverture',
      relationTo: 'media',
    },
    {
      name: 'extrait',
      type: 'textarea',
      label: 'Extrait',
      admin: { description: "Court résumé affiché dans la liste des articles." },
    },
    {
      name: 'statut',
      type: 'select',
      label: 'Statut',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Brouillon', value: 'draft' },
        { label: 'Publié',    value: 'published' },
      ],
    },
    {
      name: 'publie_le',
      type: 'date',
      label: 'Publié le',
      admin: {
        description: 'Renseigné automatiquement à la première publication.',
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'auteur',
      type: 'relationship',
      relationTo: 'users',
      label: 'Auteur',
      required: true,
      admin: { description: 'Défini automatiquement à la création.' },
      access: {
        create: ({ req: { user } }) => (user as User)?.role === 'admin',
        update: ({ req: { user } }) => (user as User)?.role === 'admin',
      },
    },
  ],
}
