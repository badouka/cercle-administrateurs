import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    // Les médias sont servis directement depuis le CDN Vercel Blob (champ
    // media.url réécrit par le plugin). next/image doit autoriser ce host.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'agb8bhuqr81bkwkf.public.blob.vercel-storage.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: '/api/media/file/:path*',
      },
    ]
  },
  async redirects() {
    return [
      // ── Anciennes URL publiques (301/308 permanents) ──────────────────────
      {
        // Renommée lors de la refonte du 16/06/2026.
        source:      '/a-propos/partenaires',
        destination: '/a-propos/nos-partenaires',
        permanent:   true,
      },
      {
        // Page qui hébergeait l'iframe ChatLab, supprimée le 09/07/2026.
        // L'assistant est désormais un widget présent sur toutes les pages.
        source:      '/assistant',
        destination: '/',
        permanent:   true,
      },

      // ── Hôte dupliqué ────────────────────────────────────────────────────
      // Le site répond à l'identique sur l'alias .vercel.app : sans
      // redirection, deux hôtes servent le même contenu. Seul l'alias stable
      // de production est visé — les URL de prévisualisation
      // (cercle-administrateurs-<hash>-<team>.vercel.app) ne correspondent pas
      // à ce host exact et continuent de fonctionner normalement.
      {
        source:      '/:path*',
        has:         [{ type: 'host', value: 'cercle-administrateurs.vercel.app' }],
        destination: 'https://www.cercle-administrateurs.sn/:path*',
        permanent:   true,
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
