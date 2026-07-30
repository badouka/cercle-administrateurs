'use client'

import { type FormEvent, Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react'

const MIN_LONGUEUR = 8

function Formulaire() {
  const router = useRouter()
  const token  = useSearchParams().get('token') ?? ''

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const fd            = new FormData(e.currentTarget)
    const password      = fd.get('password') as string
    const confirmation  = fd.get('confirmation') as string

    if (password.length < MIN_LONGUEUR) {
      setError(`Le mot de passe doit contenir au moins ${MIN_LONGUEUR} caractères.`)
      return
    }
    if (password !== confirmation) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/users/reset-password', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        body:        JSON.stringify({ token, password }),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(
          data.errors?.[0]?.message
          ?? 'Ce lien est invalide ou a expiré. Demandez-en un nouveau.',
        )
        setLoading(false)
        return
      }

      // Payload connecte automatiquement l'utilisateur après réinitialisation.
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion internet.')
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <>
        <div className="mt-6 flex items-center gap-3">
          <AlertCircle size={22} className="shrink-0 text-red-600" />
          <h1 className="font-serif text-2xl font-bold text-[#14110B]">Lien incomplet</h1>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[#14110B]/70">
          Ce lien ne contient pas de jeton de réinitialisation. Il a peut-être été tronqué
          par votre messagerie. Vous pouvez en demander un nouveau.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="mt-6 inline-block rounded-lg bg-[#1a7a3a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C8A24A] hover:text-[#14110B]"
        >
          Demander un nouveau lien
        </Link>
      </>
    )
  }

  return (
    <>
      <h1 className="mt-6 font-serif text-2xl font-bold text-[#14110B]">
        Nouveau mot de passe
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#14110B]/70">
        Choisissez un mot de passe d&apos;au moins {MIN_LONGUEUR} caractères.
      </p>

      {error && (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14110B]/60">
            Nouveau mot de passe
          </span>
          <div className="relative">
            <input
              name="password"
              type={visible ? 'text' : 'password'}
              required
              minLength={MIN_LONGUEUR}
              autoComplete="new-password"
              className="w-full rounded-lg border border-[#14110B]/20 py-2.5 pl-3 pr-10 text-sm text-[#14110B] focus:border-[#1a7a3a] focus:outline-none focus:ring-1 focus:ring-[#1a7a3a]"
            />
            <button
              type="button"
              onClick={() => setVisible(v => !v)}
              aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#14110B]/40 hover:text-[#1a7a3a]"
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14110B]/60">
            Confirmation
          </span>
          <input
            name="confirmation"
            type={visible ? 'text' : 'password'}
            required
            minLength={MIN_LONGUEUR}
            autoComplete="new-password"
            className="w-full rounded-lg border border-[#14110B]/20 px-3 py-2.5 text-sm text-[#14110B] focus:border-[#1a7a3a] focus:outline-none focus:ring-1 focus:ring-[#1a7a3a]"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-[#1a7a3a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C8A24A] hover:text-[#14110B] disabled:opacity-50"
        >
          {loading ? 'Enregistrement…' : 'Définir le mot de passe'}
        </button>
      </form>
    </>
  )
}

export default function ReinitialiserMotDePassePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg sm:p-10">
        <Link
          href="/connexion"
          className="inline-flex items-center gap-1.5 text-xs text-[#14110B]/50 transition-colors hover:text-[#1a7a3a]"
        >
          <ArrowLeft size={13} /> Retour à la connexion
        </Link>
        {/* useSearchParams impose une frontière Suspense au prérendu. */}
        <Suspense fallback={<p className="mt-6 text-sm text-[#14110B]/50">Chargement…</p>}>
          <Formulaire />
        </Suspense>
      </div>
    </div>
  )
}
