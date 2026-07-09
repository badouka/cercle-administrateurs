import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'
import { isAdmin } from '@/access'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export const Membres: CollectionConfig = {
  slug: 'membres',
  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'prenom', 'organisme', 'statut', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      const { role, id } = user as User
      if (role === 'admin' || role === 'gestionnaire') return true
      return { user: { equals: id } }
    },
    create: isAdmin,
    update: ({ req: { user } }) => {
      if (!user) return false
      const { role, id } = user as User
      if (role === 'admin') return true
      if (role === 'gestionnaire') return false
      return { user: { equals: id } }
    },
    delete: isAdmin,
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => {
        const prenom = (data?.prenom ?? (originalDoc as Record<string, unknown> | undefined)?.prenom ?? '') as string
        const nom    = (data?.nom    ?? (originalDoc as Record<string, unknown> | undefined)?.nom    ?? '') as string
        if (data && (prenom || nom)) {
          data.slug = toSlug(`${prenom}${nom}`)
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const { docs } = await req.payload.find({
          collection:     'activity-registrations',
          where:          { member: { equals: id } },
          limit:          1000,
          overrideAccess: true,
        })
        for (const doc of docs) {
          await req.payload.delete({
            collection:     'activity-registrations',
            id:             doc.id,
            overrideAccess: true,
            req,
          })
        }
      },
    ],
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      unique: true,
      hasMany: false,
      admin: {
        description:
          "Compte utilisateur associé à ce profil (optionnel). Laissez vide pour un membre importé qui ne s'est pas encore connecté.",
      },
    },

    // ── Identité ──────────────────────────────────────────────────────────────
    {
      type: 'row',
      fields: [
        { name: 'prenom', type: 'text', label: 'Prénom', required: true },
        { name: 'nom',    type: 'text', label: 'Nom',    required: true },
      ],
    },
    {
      name: 'genre',
      type: 'select',
      label: 'Genre',
      options: [
        { label: 'Homme', value: 'homme' },
        { label: 'Femme', value: 'femme' },
      ],
    },
    {
      name:   'slug',
      type:   'text',
      label:  'Slug',
      unique: true,
      index:  true,
      admin:  { readOnly: true, description: 'Généré automatiquement depuis prénom + nom' },
    },
    {
      name: 'photo',
      type: 'upload',
      label: 'Photo',
      relationTo: 'media',
    },
    {
      name:       'justificatif',
      type:       'upload',
      label:      'Pièce justificative',
      relationTo: 'media',
      admin: {
        description: "Document fourni à l'inscription (arrêté de nomination, décision, carte professionnelle…)",
      },
      // Lisible uniquement par admin et gestionnaire, jamais par le membre
      access: {
        read: ({ req: { user } }) => {
          const role = (user as User | null)?.role
          return role === 'admin' || role === 'gestionnaire'
        },
      },
    },
    {
      name: 'biographie',
      type: 'richText',
      label: 'Biographie',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
        ],
      }),
    },

    // ── Poste ─────────────────────────────────────────────────────────────────
    {
      type: 'group',
      name: 'poste',
      label: 'Poste',
      fields: [
        {
          type:  'collapsible',
          label: 'Bureau CAP',
          fields: [
            {
              name:  'posteCap',
              type:  'select',
              label: 'Poste au CAP',
              admin: { description: 'Rôle dans le bureau du CAP (ex. Président, Trésorier(e)…)' },
              options: [
                { label: "Président d'honneur",                    value: "Président d'honneur" },
                { label: "Présidente d'honneur",                   value: "Présidente d'honneur" },
                { label: 'Président',                              value: 'Président' },
                { label: 'Présidente',                             value: 'Présidente' },
                { label: 'Vice-Président',                         value: 'Vice-Président' },
                { label: 'Vice-Présidente',                        value: 'Vice-Présidente' },
                { label: 'Secrétaire général',                     value: 'Secrétaire général' },
                { label: 'Secrétaire générale',                    value: 'Secrétaire générale' },
                { label: 'Secrétaire général adjoint',             value: 'Secrétaire général adjoint' },
                { label: 'Secrétaire générale adjointe',           value: 'Secrétaire générale adjointe' },
                { label: 'Trésorier',                              value: 'Trésorier' },
                { label: 'Trésorière',                             value: 'Trésorière' },
                { label: 'Trésorier Adjoint',                      value: 'Trésorier Adjoint' },
                { label: 'Trésorière Adjointe',                    value: 'Trésorière Adjointe' },
                { label: 'Présidente Commission Actions Sociales', value: 'Présidente Commission Actions Sociales' },
                { label: 'Présidente Commission Communication',    value: 'Présidente Commission Communication' },
                {
                  label: 'Président Commission Stratégie et Vulgarisation des Politiques Publiques',
                  value: 'President Commission Strategie Vulgarisation',
                },
                { label: 'Président Commission Renforcement de Capacités', value: 'Président Commission Renforcement de Capacités' },
                { label: 'Membre',                                 value: 'Membre' },
              ],
            },
          ],
        },
        {
          type:  'collapsible',
          label: 'Informations professionnelles',
          fields: [
            {
              name:  'fonctionProfessionnelle',
              type:  'text',
              label: 'Fonction',
              admin: { description: "Titre professionnel (ex. DG, Président du Conseil d'Administration…)" },
            },
            { name: 'organisme',     type: 'text',   label: 'Organisation' },
            { name: 'siteOrganisme', type: 'text',   label: "Site web de l'organisation", admin: { description: 'URL du site officiel (ex. https://pad.sn)' } },
            { name: 'direction',     type: 'text',   label: 'Direction / Département' },
            {
              name:       'logoOrganisme',
              type:       'upload',
              label:      "Logo de l'organisme",
              relationTo: 'media',
              admin:      { description: 'Logo affiché dans le profil public du membre' },
            },
          ],
        },
      ],
    },

    // ── Coordonnées ───────────────────────────────────────────────────────────
    {
      type: 'group',
      name: 'coordonnees',
      label: 'Coordonnées',
      fields: [
        { name: 'telephone',           type: 'text',  label: 'Téléphone principal' },
        { name: 'telephoneSecondaire', type: 'text',  label: 'Téléphone secondaire' },
        { name: 'emailProfessionnel',  type: 'email', label: 'Email professionnel' },
        { name: 'linkedin',            type: 'text',  label: 'Profil LinkedIn' },
      ],
    },

    // ── Adhésion ──────────────────────────────────────────────────────────────
    {
      type: 'group',
      name: 'adhesion',
      label: 'Adhésion',
      fields: [
        {
          name: 'numeroAdhesion',
          type: 'text',
          label: "Numéro d'adhésion",
          unique: true,
          index: true,
        },
        {
          name: 'dateAdhesion',
          type: 'date',
          label: "Date d'adhésion",
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'statut',
          type: 'select',
          label: 'Statut',
          required: true,
          defaultValue: 'actif',
          options: [
            { label: 'Actif',    value: 'actif' },
            { label: 'Inactif', value: 'inactif' },
            { label: 'Suspendu', value: 'suspendu' },
          ],
          // Seul l'admin peut changer le statut
          access: {
            update: ({ req: { user } }) => (user as User)?.role === 'admin',
          },
        },
      ],
    },
  ],
}
