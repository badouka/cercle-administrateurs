import type { CollectionConfig } from 'payload'
import { isAdminOrGestionnaire } from '@/access'

export const Partenaires: CollectionConfig = {
  slug: 'partenaires',
  labels: { singular: 'Partenaire', plural: 'Partenaires' },
  admin: {
    useAsTitle: 'nom',
    group: 'Contenu',
  },
  access: {
    read: () => true,
    create: isAdminOrGestionnaire,
    update: isAdminOrGestionnaire,
    delete: isAdminOrGestionnaire,
  },
  fields: [
    { name: 'nom', type: 'text', required: true, label: 'Nom du partenaire' },
    { name: 'logo', type: 'upload', relationTo: 'media', required: true, label: 'Logo' },
    { name: 'site_web', type: 'text', label: 'Site web (URL)' },
    { name: 'ordre', type: 'number', label: "Ordre d'affichage", defaultValue: 0 },
  ],
}
