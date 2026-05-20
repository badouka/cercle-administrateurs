'use client'

import { type FormEvent, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { inscrire } from './actions'

const INPUT_CLS =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black'

function Field({
  id, name, label, required, type = 'text', autoComplete, placeholder,
}: {
  id: string; name: string; label: string; required?: boolean
  type?: string; autoComplete?: string; placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="ml-0.5 text-black">*</span>}
      </label>
      <input
        id={id} name={name} type={type}
        autoComplete={autoComplete} required={required}
        placeholder={placeholder}
        className={INPUT_CLS}
      />
    </div>
  )
}

export default function InscriptionPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const result = await inscrire({
      prenom:     fd.get('prenom')     as string,
      nom:        fd.get('nom')        as string,
      email:      fd.get('email')      as string,
      motDePasse: fd.get('motDePasse') as string,
      poste:      fd.get('poste')      as string,
      organisme:  fd.get('organisme')  as string,
      telephone:  fd.get('telephone')  as string,
    })

    if ('error' in result) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <CheckCircle2 size={52} className="mx-auto text-black mb-5" strokeWidth={1.5} />
          <h1 className="text-xl font-bold text-black mb-2">Demande envoyée</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Votre demande d'adhésion est en attente de validation par l'administrateur du CAP.
            Vous serez contacté(e) et pourrez accéder à votre espace membre une fois votre profil validé.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-semibold text-black underline underline-offset-2 hover:text-gray-700"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">

      <div className="mb-8">
        <span className="inline-flex rounded bg-black px-3 py-1 text-sm font-extrabold text-white tracking-wide mb-4">
          CAP
        </span>
        <h1 className="text-2xl font-bold text-black">Demande d'adhésion</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Complétez ce formulaire pour rejoindre le Cercle des Administrateurs Publics.
          Votre demande sera examinée par l'administrateur.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Identité ── */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Identité
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <Field id="prenom" name="prenom" label="Prénom" required autoComplete="given-name" />
            <Field id="nom"    name="nom"    label="Nom"    required autoComplete="family-name" />
          </div>
        </fieldset>

        {/* ── Compte ── */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Compte
          </legend>
          <Field
            id="email" name="email" label="Adresse email"
            required type="email" autoComplete="email"
            placeholder="prenom.nom@organisme.sn"
          />
          <div>
            <label htmlFor="motDePasse" className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot de passe<span className="ml-0.5 text-black">*</span>
            </label>
            <div className="relative">
              <input
                id="motDePasse" name="motDePasse"
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password" required minLength={8}
                placeholder="8 caractères minimum"
                className={INPUT_CLS + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPwd(p => !p)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                aria-label={showPwd ? 'Masquer' : 'Afficher'}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </fieldset>

        {/* ── Poste ── */}
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Poste
          </legend>
          <Field
            id="poste" name="poste" label="Fonction / Titre"
            placeholder="Directeur général, Conseiller technique…"
          />
          <Field
            id="organisme" name="organisme" label="Organisme / Administration"
            placeholder="Ministère, Agence, Direction…"
          />
          <Field
            id="telephone" name="telephone" label="Téléphone"
            type="tel" autoComplete="tel"
            placeholder="+221 77 000 00 00"
          />
        </fieldset>

        <button
          type="submit" disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {loading ? 'Envoi en cours…' : 'Soumettre ma demande'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Déjà membre ?{' '}
        <Link
          href="/connexion"
          className="font-semibold text-black underline underline-offset-2 hover:text-gray-700"
        >
          Se connecter
        </Link>
      </p>
    </div>
  )
}
