import type { CollectionConfig } from 'payload'
import type { User } from '@/payload-types'

export const ActivityRegistrations: CollectionConfig = {
  slug: 'activity-registrations',
  admin: {
    defaultColumns: ['member', 'activity', 'statut', 'inscrit_le'],
  },
  access: {
    // Unauthentifié : aucun accès
    // Gestionnaire / Admin : toutes les inscriptions
    // Membre : uniquement les siennes (résolution asynchrone du profil)
    read: async ({ req }) => {
      const { user } = req
      if (!user) return false
      const { role, id } = user as User
      if (role === 'admin' || role === 'gestionnaire') return true

      const { docs } = await req.payload.find({
        collection: 'membres',
        where: { user: { equals: id } },
        limit: 1,
        overrideAccess: true,
      })
      if (!docs[0]) return false
      return { member: { equals: docs[0].id } }
    },
    // Admin et membre peuvent créer (le membre ne peut créer que pour lui-même — cf. hook)
    create: ({ req: { user } }) => {
      if (!user) return false
      const { role } = user as User
      return role === 'admin' || role === 'membre'
    },
    update: ({ req: { user } }) => (user as User)?.role === 'admin',
    delete: ({ req: { user } }) => (user as User)?.role === 'admin',
  },
  hooks: {
    // beforeValidate : s'exécute avant la validation des champs required
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data

        // Auto-remplir inscrit_le
        if (!data.inscrit_le) {
          data.inscrit_le = new Date().toISOString()
        }

        // Auto-injecter le profil membre pour les non-admin
        // (empêche aussi de forger une inscription au nom d'un autre membre)
        const typedUser = req.user as User
        if (typedUser?.role !== 'admin') {
          const { docs } = await req.payload.find({
            collection: 'membres',
            where: { user: { equals: req.user?.id } },
            limit: 1,
            overrideAccess: true,
          })
          if (!docs[0]) throw new Error("Aucun profil membre trouvé pour cet utilisateur")
          data.member = docs[0].id
        }

        // Vérifier l'unicité member + activity
        if (data.member && data.activity) {
          const { docs: existing } = await req.payload.find({
            collection: 'activity-registrations',
            where: {
              and: [
                { member: { equals: data.member } },
                { activity: { equals: data.activity } },
              ],
            },
            limit: 1,
            overrideAccess: true,
          })
          if (existing.length > 0) {
            throw new Error("Ce membre est déjà inscrit à cette activité")
          }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'membres',
      required: true,
      admin: { description: "Auto-rempli depuis le profil de l'utilisateur connecté." },
    },
    {
      name: 'activity',
      type: 'relationship',
      relationTo: 'activities',
      required: true,
    },
    {
      name: 'statut',
      type: 'select',
      required: true,
      defaultValue: 'inscrit',
      options: [
        { label: 'Inscrit', value: 'inscrit' },
        { label: 'Annulé',  value: 'annule' },
      ],
    },
    {
      name: 'inscrit_le',
      type: 'date',
      admin: {
        description: 'Renseigné automatiquement à la création.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}
