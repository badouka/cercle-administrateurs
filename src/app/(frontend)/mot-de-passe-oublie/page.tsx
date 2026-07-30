'use client'

import { type FormEvent, useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function MotDePasseOubliePage() {
  const [loading, setLoading] = useState(false)
  const [envoye,  setEnvoye]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const email = (new FormData(e.currentTarget).get('email') as string).trim()

    try {
      const res = await fetch('/api/users/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })

      // Payload répond 200 même si l'adresse est inconnue : ne pas révéler
      // quelles adresses sont inscrites. On affiche donc toujours la
      // confirmation, sauf erreur technique.
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.errors?.[0]?.message ?? "L'envoi a échoué. Veuillez réessayer.")
        setLoading(false)
        return
      }

      setEnvoye(true)
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg sm:p-10">

        <Link
          href="/connexion"
          className="inline-flex items-center gap-1.5 text-xs text-[#14110B]/50 transition-colors hover:text-[#1a7a3a]"
        >
          <ArrowLeft size={13} /> Retour à la connexion
        </Link>

        {envoye ? (
          <>
            <div className="mt-6 flex items-center gap-3">
              <CheckCircle2 size={22} className="shrink-0 text-[#1a7a3a]" />
              <h1 className="font-serif text-2xl font-bold text-[#14110B]">Message envoyé</h1>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-[#14110B]/70">
              Si un compte est associé à cette adresse, vous recevrez un e-mail contenant un
              lien pour choisir un nouveau mot de passe. Ce lien est valable une heure.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#14110B]/60">
              Pensez à vérifier vos courriers indésirables. Sans e-mail au bout de quelques
              minutes, écrivez-nous à{' '}
              <a
                href="mailto:contact@cercle-administrateurs.sn"
                className="font-semibold text-[#1a7a3a] underline underline-offset-2"
              >
                contact@cercle-administrateurs.sn
              </a>
              .
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-6 font-serif text-2xl font-bold text-[#14110B]">
              Mot de passe oublié
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#14110B]/70">
              Indiquez l&apos;adresse e-mail de votre compte. Nous vous enverrons un lien
              pour définir un nouveau mot de passe.
            </p>

            {error && (
              <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#14110B]/60">
                  Adresse e-mail
                </span>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#14110B]/30"
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="vous@exemple.sn"
                    className="w-full rounded-lg border border-[#14110B]/20 py-2.5 pl-9 pr-3 text-sm text-[#14110B] placeholder:text-[#14110B]/30 focus:border-[#1a7a3a] focus:outline-none focus:ring-1 focus:ring-[#1a7a3a]"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-lg bg-[#1a7a3a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C8A24A] hover:text-[#14110B] disabled:opacity-50"
              >
                {loading ? 'Envoi en cours…' : 'Recevoir le lien'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
