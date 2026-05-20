import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'

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
    create: ({ req: { user } }) => (user as User)?.role === 'admin',
    update: ({ req: { user } }) => {
      if (!user) return false
      const { role, id } = user as User
      if (role === 'admin') return true
      if (role === 'gestionnaire') return false
      return { user: { equals: id } }
    },
    delete: ({ req: { user } }) => (user as User)?.role === 'admin',
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
        { name: 'titre',     type: 'text', label: 'Titre / Fonction' },
        { name: 'organisme', type: 'text', label: 'Organisme / Administration' },
        { name: 'direction', type: 'text', label: 'Direction / Département' },
      ],
    },

    // ── Coordonnées ───────────────────────────────────────────────────────────
    {
      type: 'group',
      name: 'coordonnees',
      label: 'Coordonnées',
      fields: [
        { name: 'telephone',          type: 'text',  label: 'Téléphone' },
        { name: 'emailProfessionnel', type: 'email', label: 'Email professionnel' },
        { name: 'linkedin',           type: 'text',  label: 'Profil LinkedIn' },
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
