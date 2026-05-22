import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'
import { isAdmin } from '@/access'

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
      required: true,
      unique: true,
      hasMany: false,
      admin: { description: 'Compte utilisateur associé à ce profil' },
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
      name: 'photo',
      type: 'upload',
      label: 'Photo',
      relationTo: 'media',
    },
    {
      name:       'logoOrganisme',
      type:       'upload',
      label:      "Logo de l'organisme",
      relationTo: 'media',
      admin: { description: 'Logo affiché dans le profil public du membre' },
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
      type: 'textarea',
      label: 'Biographie',
    },

    // ── Poste ─────────────────────────────────────────────────────────────────
    {
      type: 'group',
      name: 'poste',
      label: 'Poste',
      fields: [
        {
          name:  'posteCap',
          type:  'text',
          label: 'Poste au CAP',
          admin: { description: 'Rôle dans le bureau du CAP (ex. Président, Trésorier(e)…)' },
        },
        {
          name:  'fonctionProfessionnelle',
          type:  'text',
          label: 'Fonction professionnelle',
          admin: { description: "Titre professionnel (ex. DG, Président de Conseil d'Administration…)" },
        },
        { name: 'organisme',     type: 'text', label: 'Organisme / Administration' },
        { name: 'siteOrganisme', type: 'text', label: "Site web de l'organisme", admin: { description: 'URL du site officiel (ex. https://pad.sn)' } },
        { name: 'direction',     type: 'text', label: 'Direction / Département' },
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
