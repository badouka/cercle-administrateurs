import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminOrGestionnaire } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Les fichiers sont publics (URLs directes dans les pages)
    read:   () => true,
    // Admin et gestionnaire peuvent uploader (les gestionnaires créent des posts avec images)
    create: isAdminOrGestionnaire,
    // Seul l'admin peut modifier les métadonnées ou supprimer
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
