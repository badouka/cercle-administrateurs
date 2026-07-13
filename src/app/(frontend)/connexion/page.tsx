'use client'

import { type FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function ConnexionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [showPwd, setShowPwd] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const fd       = new FormData(e.currentTarget)
    const email    = fd.get('email')    as string
    const password = fd.get('password') as string

    try {
      const res  = await fetch('/api/users/login', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(
          data.errors?.[0]?.message
          ?? data.message
          ?? 'Identifiants incorrects. Vérifiez votre email et mot de passe.',
        )
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion internet.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center py-16">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-3xl w-full mx-4 grid lg:grid-cols-2">

        {/* Colonne gauche */}
        <div className="bg-[#FAF8F3] border-r-4 border-[#1a7a3a] p-10 flex flex-col justify-between">
          <div>
            <div className="flex justify-center">
              <img
                src="https://fc3ao21hfkjktvli.public.blob.vercel-storage.com/cap-logoQ-nP1BOFyniyLA4pkjl2P3xsiEJ1ooZ7.png"
                alt="CAP"
                style={{ height: '80px', width: 'auto' }}
              />
            </div>

            <p className="mt-12 font-mono text-xs uppercase tracking-widest text-[#1a7a3a]">Espace membre</p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-ink">Bienvenue dans votre espace</h1>
            <p className="mt-4 text-ink/60">
              Accédez à vos ressources, suivez les activités du Cercle et gérez votre profil de membre.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[#1a7a3a] font-bold">✓</span>
                <span className="text-ink/70 text-sm">Accès aux documents exclusifs</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#1a7a3a] font-bold">✓</span>
                <span className="text-ink/70 text-sm">Suivi des activités et séminaires</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#1a7a3a] font-bold">✓</span>
                <span className="text-ink/70 text-sm">Gestion de votre profil</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="bg-white p-10 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            <h1 className="font-serif text-3xl font-bold text-ink">Connexion</h1>
            <p className="mt-2 text-sm text-ink/60">Accédez à votre espace membre</p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div>
                <label htmlFor="email" className="block mb-1.5 text-sm font-medium text-ink">
                  Adresse email
                </label>
                <input
                  id="email" name="email" type="email"
                  autoComplete="email" required
                  className="border border-ink/20 rounded-lg px-4 py-3 w-full focus:border-[#1a7a3a] focus:outline-none text-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-1.5 text-sm font-medium text-ink">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password" name="password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password" required
                    className="border border-ink/20 rounded-lg px-4 py-3 pr-10 w-full focus:border-[#1a7a3a] focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                    aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="mt-2 flex items-center justify-center gap-2 bg-[#1a7a3a] text-white w-full py-3 rounded-lg font-semibold text-sm hover:bg-[#1a7a3a]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {loading ? 'Connexion…' : 'Se connecter →'}
              </button>

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-ink/60">
              Pas encore membre ?{' '}
              <Link href="/inscription" className="text-[#1a7a3a] font-semibold">
                Faire une demande d&apos;adhésion
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
