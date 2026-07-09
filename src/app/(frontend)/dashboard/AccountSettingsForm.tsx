'use client'

import { useState, type FormEvent } from 'react'
import { Mail, Lock, Check, X, Settings } from 'lucide-react'
import { updateAccountEmail, updateAccountPassword } from './actions'

interface Props {
  email: string
}

const INPUT_CLS =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black'

type Panel = 'none' | 'email' | 'password'

export function AccountSettingsForm({ email }: Props) {
  const [panel, setPanel]       = useState<Panel>('none')
  const [currentEmail, setCurrentEmail] = useState(email)

  // Email
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError]     = useState<string | null>(null)
  const [emailSaved, setEmailSaved]     = useState(false)

  // Mot de passe
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError]     = useState<string | null>(null)
  const [pwdSaved, setPwdSaved]     = useState(false)

  function closePanels() {
    setPanel('none')
    setEmailError(null)
    setPwdError(null)
  }

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setEmailError(null)
    setEmailSaved(false)
    setEmailLoading(true)

    const fd       = new FormData(e.currentTarget)
    const newEmail = fd.get('email') as string

    const result = await updateAccountEmail(newEmail)
    setEmailLoading(false)

    if ('error' in result) {
      setEmailError(result.error)
    } else {
      setCurrentEmail(newEmail.trim().toLowerCase())
      setEmailSaved(true)
      setPanel('none')
    }
  }

  async function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwdError(null)
    setPwdSaved(false)

    const fd              = new FormData(e.currentTarget)
    const currentPassword = fd.get('currentPassword') as string
    const newPassword     = fd.get('newPassword') as string
    const confirmPassword = fd.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      setPwdError('Les deux mots de passe ne correspondent pas.')
      return
    }

    setPwdLoading(true)
    const result = await updateAccountPassword(currentPassword, newPassword)
    setPwdLoading(false)

    if ('error' in result) {
      setPwdError(result.error)
    } else {
      const form = e.currentTarget
      form.reset()
      setPwdSaved(true)
      setPanel('none')
    }
  }

  return (
    <section>
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-black border-b-2 border-black pb-3">
        <Settings size={18} />
        Paramètres du compte
      </h2>

      {emailSaved && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <Check size={14} />
          Adresse email mise à jour avec succès.
        </div>
      )}
      {pwdSaved && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <Check size={14} />
          Mot de passe modifié avec succès.
        </div>
      )}

      <div className="space-y-3">
        {/* ── Email ── */}
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 rounded-lg bg-[#F5F5F5] p-2">
                <Mail size={15} className="text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-black">Adresse email</p>
                <p className="text-xs text-gray-500 truncate">{currentEmail}</p>
              </div>
            </div>
            {panel !== 'email' && (
              <button
                onClick={() => { closePanels(); setPanel('email'); setEmailSaved(false) }}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors"
              >
                Modifier
              </button>
            )}
          </div>

          {panel === 'email' && (
            <form onSubmit={handleEmailSubmit} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              {emailError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {emailError}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1">
                  Nouvelle adresse email
                </label>
                <input
                  id="email" name="email" type="email" required
                  defaultValue={currentEmail} placeholder="vous@exemple.com"
                  className={INPUT_CLS}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit" disabled={emailLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {emailLoading
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <Check size={14} />
                  }
                  {emailLoading ? 'Enregistrement…' : "Enregistrer l'email"}
                </button>
                <button
                  type="button" onClick={closePanels}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 hover:border-gray-400 transition-colors"
                >
                  <X size={14} />
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Mot de passe ── */}
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 rounded-lg bg-[#F5F5F5] p-2">
                <Lock size={15} className="text-gray-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-black">Mot de passe</p>
                <p className="text-xs text-gray-500">••••••••</p>
              </div>
            </div>
            {panel !== 'password' && (
              <button
                onClick={() => { closePanels(); setPanel('password'); setPwdSaved(false) }}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors"
              >
                Modifier
              </button>
            )}
          </div>

          {panel === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              {pwdError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {pwdError}
                </div>
              )}
              <div>
                <label htmlFor="currentPassword" className="block text-xs font-medium text-gray-600 mb-1">
                  Mot de passe actuel
                </label>
                <input
                  id="currentPassword" name="currentPassword" type="password" required
                  autoComplete="current-password" className={INPUT_CLS}
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-xs font-medium text-gray-600 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  id="newPassword" name="newPassword" type="password" required minLength={8}
                  autoComplete="new-password" placeholder="8 caractères minimum"
                  className={INPUT_CLS}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-600 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  id="confirmPassword" name="confirmPassword" type="password" required minLength={8}
                  autoComplete="new-password" className={INPUT_CLS}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit" disabled={pwdLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {pwdLoading
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <Check size={14} />
                  }
                  {pwdLoading ? 'Enregistrement…' : 'Changer le mot de passe'}
                </button>
                <button
                  type="button" onClick={closePanels}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500 hover:border-gray-400 transition-colors"
                >
                  <X size={14} />
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
