import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Membres } from './collections/Membres'
import { Activities } from './collections/Activities'
import { Posts } from './collections/Posts'
import { Documents } from './collections/Documents'
import { ActivityRegistrations } from './collections/ActivityRegistrations'
import { Mediatheque } from './collections/Mediatheque'
import { Pages } from './collections/Pages'
import { Partenaires } from './collections/Partenaires'
import { BlogPosts } from './collections/BlogPosts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Membres, Activities, Posts, Documents, ActivityRegistrations, Mediatheque, Pages, Partenaires, BlogPosts],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      enabled: true,
      collections: {
        // disablePayloadAccessControl => l'URL native pointe directement sur le
        // CDN Blob (https://<store>.public.blob.vercel-storage.com/<fichier>)
        // au lieu de la route proxy /api/media/file/. Le hook afterRead du
        // plugin ne prend la branche « URL Blob directe » que si ce flag est mis.
        media: {
          disablePayloadAccessControl: true,
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
    }),
  ],
})
