import Link from 'next/link'
import type { Metadata } from 'next'

// Page 404.
//
// Le projet expose deux layouts racines — (frontend) et (payload) — et dans
// cette configuration Next ne rattache `not-found.tsx` à aucun d'eux : la page
// est rendue dans une coque minimale, sans navigation, sans pied de page et
// **sans la feuille de style globale**. Les classes Tailwind y seraient donc
// sans effet : tout est écrit en styles en ligne pour que la page s'affiche
// correctement quoi qu'il arrive, tout en conservant le vrai statut HTTP 404.

export const metadata: Metadata = {
  title: 'Page introuvable',
  // Une page d'erreur ne doit pas entrer dans l'index.
  robots: { index: false, follow: true },
}

const VERT   = '#1a7a3a'
const SOMBRE = '#062812'
const OR     = '#C8A24A'
const ENCRE  = '#14110B'
const CREME  = '#FAF8F3'

const SERIF = 'Georgia, "Times New Roman", serif'
const SANS  = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

const RACCOURCIS = [
  { href: '/actualites', label: 'Actualités', desc: 'Articles et événements du Cercle' },
  { href: '/annuaire',   label: 'Annuaire',   desc: 'Les membres et le bureau exécutif' },
  { href: '/documents',  label: 'Documents',  desc: 'Textes statutaires et ressources' },
  { href: '/contact',    label: 'Contact',    desc: 'Nous écrire directement' },
]

function Tricolore() {
  return (
    <div style={{ display: 'flex', height: 16, width: '100%' }}>
      <div style={{ flex: 1, background: '#14b53a' }} />
      <div
        style={{
          flex: 1,
          background: '#fcd116',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: '#14b53a', fontSize: 16, fontWeight: 700, lineHeight: 1 }}>★</span>
      </div>
      <div style={{ flex: 1, background: '#ce0726' }} />
    </div>
  )
}

export default function NotFound() {
  return (
    <main style={{ margin: 0, background: '#fff', fontFamily: SANS, color: ENCRE }}>
      <Tricolore />

      {/* ── Bandeau ── */}
      <section
        style={{
          background: SOMBRE,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(143,185,168,0.10) 1px, transparent 0)',
          backgroundSize: '22px 22px',
          padding: '72px 24px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            color: OR,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Erreur 404
        </p>

        <p
          style={{
            margin: '18px 0 0',
            fontFamily: SERIF,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1,
            color: '#fff',
          }}
        >
          404
        </p>

        <h1
          style={{
            margin: '18px 0 0',
            fontFamily: SERIF,
            fontSize: 30,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          Cette page est introuvable
        </h1>

        <p
          style={{
            margin: '14px auto 0',
            maxWidth: 560,
            fontSize: 16,
            lineHeight: 1.65,
            color: '#6FAE8E',
          }}
        >
          La page que vous cherchez a peut-être été déplacée, renommée, ou n&apos;existe plus.
          Vous pouvez rejoindre l&apos;une des rubriques ci-dessous.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: 28,
            background: VERT,
            color: '#fff',
            padding: '13px 26px',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Retour à l&apos;accueil
        </Link>
      </section>

      <Tricolore />

      {/* ── Raccourcis ── */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: '56px 24px 72px' }}>
        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          }}
        >
          {RACCOURCIS.map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'block',
                background: CREME,
                border: '1px solid rgba(20,17,11,0.10)',
                borderRadius: 16,
                padding: 24,
                textDecoration: 'none',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontSize: 18,
                  fontWeight: 700,
                  color: ENCRE,
                }}
              >
                {label}
              </p>
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'rgba(20,17,11,0.60)',
                }}
              >
                {desc}
              </p>
              <p style={{ margin: '14px 0 0', fontSize: 14, fontWeight: 600, color: VERT }}>
                Consulter →
              </p>
            </Link>
          ))}
        </div>

        <p
          style={{
            margin: '40px 0 0',
            paddingTop: 28,
            borderTop: '1px solid rgba(20,17,11,0.10)',
            textAlign: 'center',
            fontSize: 14,
            color: 'rgba(20,17,11,0.60)',
          }}
        >
          Vous ne trouvez pas ce que vous cherchez ?{' '}
          <a
            href="mailto:contact@cercle-administrateurs.sn"
            style={{ color: VERT, fontWeight: 600 }}
          >
            contact@cercle-administrateurs.sn
          </a>
        </p>
      </section>
    </main>
  )
}
