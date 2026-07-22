import type { CollectionConfig, Access } from 'payload'
import type { User } from '@/payload-types'
import { isAdminOrGestionnaire } from '@/access'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import {
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  HeadingFeature,
  UnorderedListFeature,
  OrderedListFeature,
  BlockquoteFeature,
  LinkFeature,
} from '@payloadcms/richtext-lexical'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'slug', 'statut', 'updatedAt'],
  },
  access: {
    read: (({ req: { user } }) => {
      if (!user) return { statut: { equals: 'publie' } }
      const { role } = user as User
      if (role === 'admin' || role === 'gestionnaire') return true
      return { statut: { equals: 'publie' } }
    }) as Access,
    create: isAdminOrGestionnaire,
    update: isAdminOrGestionnaire,
    delete: isAdminOrGestionnaire,
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
      required: true,
      admin: {
        description: "Identifiant unique : 'a-propos', 'mot-du-president', 'partenaires'",
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
      label: 'Description',
      admin: { description: 'Sous-titre ou résumé court de la page.' },
    },
    {
      name: 'extrait',
      type: 'textarea',
      required: false,
      label: 'Extrait',
      admin: { description: "Texte d'introduction affiché en tête de page." },
    },
    {
      name: 'citation',
      type: 'textarea',
      required: false,
      label: 'Citation',
      admin: { description: "Citation mise en avant (utilisée sur la page « Mot du Président »)." },
    },
    {
      name: 'signature_nom',
      type: 'text',
      required: false,
      label: 'Signature — nom',
      admin: { description: 'Nom affiché dans la signature (page « Mot du Président »).' },
    },
    {
      name: 'signature_titre',
      type: 'text',
      required: false,
      label: 'Signature — titre',
      admin: { description: 'Titre/fonction affiché sous le nom dans la signature.' },
    },
    {
      name: 'contenu',
      type: 'richText',
      label: 'Contenu',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          BoldFeature(),
          ItalicFeature(),
          UnderlineFeature(),
          UnorderedListFeature(),
          OrderedListFeature(),
          BlockquoteFeature(),
          LinkFeature(),
        ],
      }),
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
  ],
}
