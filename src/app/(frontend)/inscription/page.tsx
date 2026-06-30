'use client'

import { type FormEvent, useState, useRef } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle2, Upload, X, FileText } from 'lucide-react'
import { inscrire, uploadJustificatif, uploadPhoto } from './actions'

const LABEL_CLS =
  'block text-xs font-semibold uppercase tracking-wider text-ink/50 mb-1'

const INPUT_CLS =
  'border border-ink/20 rounded-lg px-4 py-2.5 w-full text-sm focus:border-[#0B6B3A] focus:outline-none'

const SELECT_CLS = INPUT_CLS + ' bg-white'

const FONCTIONS_HOMME = [
  "Président du Conseil d'Administration",
  'Président du Conseil de Surveillance',
  "Président du Conseil d'Orientation",
]

const FONCTIONS_FEMME = [
  "Présidente du Conseil d'Administration",
  'Présidente du Conseil de Surveillance',
  "Présidente du Conseil d'Orientation",
]

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_SIZE      = 5 * 1024 * 1024

const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png']
const MAX_PHOTO_SIZE      = 2 * 1024 * 1024

function Field({
  id, name, label, required, type = 'text', autoComplete, placeholder,
}: {
  id: string; name: string; label: string; required?: boolean
  type?: string; autoComplete?: string; placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLS}>
        {label}{required && <span className="text-[#0B6B3A]">*</span>}
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
  const [currentStep,      setCurrentStep]      = useState(1)
  const [loading,          setLoading]          = useState(false)
  const [error,            setError]            = useState<string | null>(null)
  const [success,          setSuccess]          = useState(false)
  const [showPwd,          setShowPwd]          = useState(false)
  const [genre,            setGenre]            = useState('')
  const [fonction,         setFonction]         = useState('')
  const [justificatifFile, setJustificatifFile] = useState<File | null>(null)
  const [fileError,        setFileError]        = useState<string | null>(null)

  const [photoFile,    setPhotoFile]    = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError,   setPhotoError]   = useState<string | null>(null)

  const justificatifRef = useRef<HTMLInputElement>(null)
  const photoRef        = useRef<HTMLInputElement>(null)

  function handleJustificatifChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setFileError(null)
    if (!file) { setJustificatifFile(null); return }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Format non supporté. Utilisez PDF, JPG ou PNG.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_SIZE) {
      setFileError('Le fichier ne doit pas dépasser 5 Mo.')
      e.target.value = ''
      return
    }
    setJustificatifFile(file)
  }

  function removeJustificatif() {
    setJustificatifFile(null)
    setFileError(null)
    if (justificatifRef.current) justificatifRef.current.value = ''
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPhotoError(null)
    if (!file) { setPhotoFile(null); setPhotoPreview(null); return }
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError('Format non supporté. Utilisez JPG ou PNG.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError('La photo ne doit pas dépasser 2 Mo.')
      e.target.value = ''
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function removePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoError(null)
    if (photoRef.current) photoRef.current.value = ''
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    // Read form values immediately before any async call
    const fd = new FormData(e.currentTarget)

    if (!justificatifFile) {
      setError('La pièce justificative est obligatoire.')
      return
    }

    setLoading(true)

    // 1. Upload justificatif
    const uploadFd = new FormData()
    uploadFd.append('file', justificatifFile)
    const uploadResult = await uploadJustificatif(uploadFd)
    if ('error' in uploadResult) {
      setError(uploadResult.error)
      setLoading(false)
      return
    }

    // 2. Upload photo (optionnelle)
    let photoId: number | undefined
    if (photoFile) {
      const photoFd = new FormData()
      photoFd.append('file', photoFile)
      const photoResult = await uploadPhoto(photoFd)
      if ('error' in photoResult) {
        setError(photoResult.error)
        setLoading(false)
        return
      }
      photoId = photoResult.id
    }

    // 3. Create user + membre
    const result = await inscrire({
      prenom:                   fd.get('prenom')                   as string,
      nom:                      fd.get('nom')                      as string,
      genre:                    fd.get('genre')                    as string,
      email:                    fd.get('email')                    as string,
      motDePasse:               fd.get('motDePasse')               as string,
      fonctionProfessionnelle:  fd.get('fonctionProfessionnelle')  as string,
      organisme:                fd.get('organisme')                as string,
      siteOrganisme:            fd.get('siteOrganisme')            as string,
      telephone:                fd.get('telephone')                as string,
      telephoneSecondaire:      fd.get('telephoneSecondaire')      as string,
      justificatifId:           uploadResult.id,
      photoId,
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
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full mx-auto bg-white rounded-2xl shadow-lg p-8 border border-ink/10 text-center">
          <CheckCircle2 size={52} className="mx-auto text-[#0B6B3A] mb-5" strokeWidth={1.5} />
          <h1 className="text-xl font-bold text-ink mb-2">Demande envoyée</h1>
          <p className="text-sm text-ink/60 leading-relaxed">
            Votre demande d&apos;adhésion est en attente de validation par l&apos;administrateur du CAP.
            Vous serez contacté(e) et pourrez accéder à votre espace membre une fois votre profil validé.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm font-semibold text-[#0B6B3A] hover:text-ink transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  const STEPS = ['Identité & Compte', 'Mandat', 'Documents']

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full mx-auto bg-white rounded-2xl shadow-lg p-8 border border-ink/10">

        {/* En-tête */}
        <div className="flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M3 2h6l-2 16H1z" fill="#0B6B3A" />
            <path d="M11 2h6l-2 16H9z" fill="#FCD116" />
          </svg>
          <span className="font-bold text-ink">CAP</span>
          <span className="text-ink/50 text-sm">· Demande d&apos;adhésion</span>
        </div>

        {/* Barre de progression */}
        <div className="flex gap-1 mt-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${i + 1 <= currentStep ? 'bg-[#0B6B3A]' : 'bg-ink/15'}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs mt-2">
          {STEPS.map((label, i) => (
            <span key={label} className={i + 1 === currentStep ? 'text-[#0B6B3A] font-bold' : 'text-ink/30'}>
              {label}
            </span>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ── Étape 1 : Identité & Compte ── */}
          <div className={currentStep === 1 ? 'flex flex-col gap-4' : 'hidden'}>
            <div className="grid grid-cols-2 gap-4">
              <Field id="prenom" name="prenom" label="Prénom" required autoComplete="given-name" />
              <Field id="nom"    name="nom"    label="Nom"    required autoComplete="family-name" />
            </div>

            <div>
              <span className={LABEL_CLS}>
                Genre<span className="text-[#0B6B3A]">*</span>
              </span>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio" name="genre" value="homme" required
                    checked={genre === 'homme'}
                    onChange={() => { setGenre('homme'); setFonction('') }}
                    className="w-4 h-4 accent-[#0B6B3A]"
                  />
                  <span className="text-sm text-ink/70">Homme</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio" name="genre" value="femme" required
                    checked={genre === 'femme'}
                    onChange={() => { setGenre('femme'); setFonction('') }}
                    className="w-4 h-4 accent-[#0B6B3A]"
                  />
                  <span className="text-sm text-ink/70">Femme</span>
                </label>
              </div>
            </div>

            <Field
              id="email" name="email" label="Email"
              required type="email" autoComplete="email"
              placeholder="prenom.nom@organisme.sn"
            />

            <div>
              <label htmlFor="motDePasse" className={LABEL_CLS}>
                Mot de passe<span className="text-[#0B6B3A]">*</span>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                  aria-label={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="mt-2 w-full bg-[#0B6B3A] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#0B6B3A]/90 transition-colors"
            >
              Suivant →
            </button>
          </div>

          {/* ── Étape 2 : Mandat ── */}
          <div className={currentStep === 2 ? 'flex flex-col gap-4' : 'hidden'}>
            <div>
              <label htmlFor="fonctionProfessionnelle" className={LABEL_CLS}>
                Fonction<span className="text-[#0B6B3A]">*</span>
              </label>
              <select
                id="fonctionProfessionnelle"
                name="fonctionProfessionnelle"
                value={fonction}
                onChange={e => setFonction(e.target.value)}
                disabled={!genre}
                className={SELECT_CLS + ' disabled:bg-ink/5 disabled:text-ink/30 disabled:cursor-not-allowed'}
              >
                <option value="">
                  {genre ? '— Sélectionnez une fonction —' : 'Sélectionnez d\'abord votre genre'}
                </option>
                {(genre === 'femme' ? FONCTIONS_FEMME : genre === 'homme' ? FONCTIONS_HOMME : []).map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <Field
              id="organisme" name="organisme" label="Organisation"
              required
              placeholder="Agence, Entreprise…"
            />
            <Field
              id="siteOrganisme" name="siteOrganisme" label="Site web (optionnel)"
              type="url" placeholder="https://…"
            />
            <Field
              id="telephone" name="telephone" label="Téléphone principal"
              required type="tel" autoComplete="tel"
              placeholder="+221 77 000 00 00"
            />
            <Field
              id="telephoneSecondaire" name="telephoneSecondaire" label="Téléphone secondaire (optionnel)"
              type="tel" autoComplete="tel"
              placeholder="+221 78 000 00 00"
            />

            <div className="mt-2 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="border border-ink/20 text-ink px-6 py-3 rounded-lg font-semibold text-sm hover:border-[#0B6B3A] hover:text-[#0B6B3A] transition-colors"
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-1 bg-[#0B6B3A] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#0B6B3A]/90 transition-colors"
              >
                Suivant →
              </button>
            </div>
          </div>

          {/* ── Étape 3 : Documents ── */}
          <div className={currentStep === 3 ? 'flex flex-col gap-4' : 'hidden'}>
            <div>
              <label className={LABEL_CLS}>Photo de profil (optionnel)</label>

              {photoPreview ? (
                <div className="flex items-center gap-3 rounded-lg border border-ink/20 bg-[#FAF8F3] px-3 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Aperçu de la photo de profil"
                    className="h-14 w-14 shrink-0 rounded-full object-cover border border-ink/10"
                  />
                  <span className="text-sm text-ink/70 flex-1 truncate">{photoFile?.name}</span>
                  <span className="text-xs text-ink/40 shrink-0">
                    {((photoFile?.size ?? 0) / 1024).toFixed(0)} Ko
                  </span>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="shrink-0 text-ink/40 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink/20 px-4 py-5 text-sm text-ink/50 hover:border-[#0B6B3A] hover:text-[#0B6B3A] transition-colors"
                >
                  <Upload size={16} />
                  Sélectionner une photo
                </button>
              )}

              <input
                ref={photoRef}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handlePhotoChange}
                className="hidden"
              />

              {photoError && (
                <p className="mt-1.5 text-xs text-red-600">{photoError}</p>
              )}
              {!photoError && (
                <p className="mt-1 text-xs text-ink/40">JPG, PNG — 2 Mo maximum</p>
              )}
            </div>

            <div>
              <label className={LABEL_CLS}>
                Pièce justificative<span className="text-[#0B6B3A]">*</span>
              </label>
              <p className="text-xs text-ink/50 mb-2">
                Joignez un document justifiant votre fonction (arrêté de nomination, décision, carte professionnelle…)
              </p>

              {justificatifFile ? (
                <div className="flex items-center gap-3 rounded-lg border border-ink/20 bg-[#FAF8F3] px-3 py-2.5">
                  <FileText size={16} className="text-ink/40 shrink-0" />
                  <span className="text-sm text-ink/70 flex-1 truncate">{justificatifFile.name}</span>
                  <span className="text-xs text-ink/40 shrink-0">
                    {(justificatifFile.size / 1024).toFixed(0)} Ko
                  </span>
                  <button
                    type="button"
                    onClick={removeJustificatif}
                    className="shrink-0 text-ink/40 hover:text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => justificatifRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink/20 px-4 py-5 text-sm text-ink/50 hover:border-[#0B6B3A] hover:text-[#0B6B3A] transition-colors"
                >
                  <Upload size={16} />
                  Sélectionner un fichier
                </button>
              )}

              <input
                ref={justificatifRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleJustificatifChange}
                className="hidden"
              />

              {fileError && (
                <p className="mt-1.5 text-xs text-red-600">{fileError}</p>
              )}
              {!fileError && (
                <p className="mt-1 text-xs text-ink/40">PDF, JPG, PNG — 5 Mo maximum</p>
              )}
            </div>

            <div className="mt-2 flex justify-between gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="border border-ink/20 text-ink px-6 py-3 rounded-lg font-semibold text-sm hover:border-[#0B6B3A] hover:text-[#0B6B3A] transition-colors"
              >
                ← Retour
              </button>
              <button
                type="submit" disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-[#0B6B3A] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#0B6B3A]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {loading ? 'Envoi en cours…' : 'Soumettre ma demande →'}
              </button>
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Déjà membre ?{' '}
          <Link href="/connexion" className="text-[#0B6B3A] font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
