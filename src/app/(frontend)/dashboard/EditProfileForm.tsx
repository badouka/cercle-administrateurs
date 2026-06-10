'use client'

import { useState, useRef, type FormEvent } from 'react'
import Image from 'next/image'
import { Pencil, X, Check, Upload, ExternalLink } from 'lucide-react'
import type { Membre, Media } from '@/payload-types'
import { updateProfile, uploadMemberLogo, type ProfileData } from './actions'
import { BiographyEditor, type BiographyEditorRef } from '@/components/editor/BiographyEditor'

interface Props {
  membre: Membre
}

const INPUT_CLS =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black'

const SELECT_CLS =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black bg-white focus:border-black focus:outline-none focus:ring-1 focus:ring-black'

const FONCTIONS = [
  "Président d'honneur",
  'Président',
  'Vice-Président',
  'Secrétaire général',
  'Secrétaire général adjoint',
  'Trésorier',
  'Trésorier Adjoint',
  'Présidente Commission Actions Sociales',
  'Présidente Commission Communication',
  'Président Commission Stratégie et Vulgarisation des Politiques Publiques',
  'Président Commission Renforcement de Capacités',
  'Membre',
]

const LOGO_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const LOGO_MAX  = 2 * 1024 * 1024

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  )
}

export function EditProfileForm({ membre }: Props) {
  const [editing, setEditing]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [saved, setSaved]           = useState(false)
  const [posteCap, setPosteCap]     = useState(membre.poste?.posteCap ?? '')
  const [logoFile, setLogoFile]     = useState<File | null>(null)
  const [logoError, setLogoError]   = useState<string | null>(null)

  const bioEditorRef = useRef<BiographyEditorRef>(null)
  const logoRef      = useRef<HTMLInputElement>(null)

  const currentLogo = typeof membre.poste?.logoOrganisme === 'object' && membre.poste?.logoOrganisme
    ? (membre.poste.logoOrganisme as Media)
    : null

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setLogoError(null)
    if (!file) { setLogoFile(null); return }
    if (!LOGO_MIME.includes(file.type)) {
      setLogoError('Format non supporté. Utilisez JPG, PNG, WebP ou SVG.')
      e.target.value = ''
      return
    }
    if (file.size > LOGO_MAX) {
      setLogoError('Le logo ne doit pas dépasser 2 Mo.')
      e.target.value = ''
      return
    }
    setLogoFile(file)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setSaved(false)

    const fd = new FormData(e.currentTarget)

    let logoOrganismeId: number | null | undefined = undefined

    if (logoFile) {
      const logoFd = new FormData()
      logoFd.append('file', logoFile)
      const uploadResult = await uploadMemberLogo(logoFd)
      if ('error' in uploadResult) {
        setError(uploadResult.error)
        setLoading(false)
        return
      }
      logoOrganismeId = uploadResult.id
    }

    const data: ProfileData = {
      prenom:                  fd.get('prenom')                  as string,
      nom:                     fd.get('nom')                     as string,
      biographie:              bioEditorRef.current?.getHTML()   ?? '',
      posteCap:                fd.get('posteCap')                as string,
      fonctionProfessionnelle: fd.get('fonctionProfessionnelle') as string,
      organisme:               fd.get('organisme')               as string,
      siteOrganisme:           fd.get('siteOrganisme')           as string,
      direction:               fd.get('direction')               as string,
      telephone:               fd.get('telephone')               as string,
      telephoneSecondaire:     fd.get('telephoneSecondaire')     as string,
      emailProfessionnel:      fd.get('emailProfessionnel')      as string,
      linkedin:                fd.get('linkedin')                as string,
      logoOrganismeId,
    }

    const result = await updateProfile(membre.id, data)
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      setSaved(true)
      setEditing(false)
      setLogoFile(null)
    }
  }

  const p = membre.poste ?? {}
  const c = membre.coordonnees ?? {}

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Profil
          </h2>
          <button
            onClick={() => { setEditing(true); setSaved(false) }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors"
          >
            <Pencil size={12} />
            Modifier
          </button>
        </div>

        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            <Check size={14} />
            Profil mis à jour avec succès.
          </div>
        )}

        <dl className="space-y-3">
          {membre.biographie && (
            <div>
              <dt className="text-xs text-gray-400">Biographie</dt>
              <dd
                className="mt-0.5 text-sm text-gray-900 bio-prose"
                dangerouslySetInnerHTML={{ __html: membre.biographie }}
              />
            </div>
          )}
          <InfoRow label="Poste au CAP" value={p.posteCap} />
          <InfoRow label="Fonction"     value={p.fonctionProfessionnelle} />
          <InfoRow label="Organisation" value={p.organisme} />
          {p.siteOrganisme && (
            <div>
              <dt className="text-xs text-gray-400">Site organisation</dt>
              <dd className="mt-0.5">
                <a
                  href={p.siteOrganisme}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-black underline underline-offset-2 hover:text-gray-600"
                >
                  {p.siteOrganisme}
                  <ExternalLink size={11} />
                </a>
              </dd>
            </div>
          )}
          <InfoRow label="Direction"               value={p.direction} />
          {currentLogo?.url && (
            <div>
              <dt className="text-xs text-gray-400">Logo organisation</dt>
              <dd className="mt-1">
                <Image
                  src={currentLogo.url}
                  alt="Logo organisation"
                  width={80}
                  height={40}
                  className="object-contain rounded border border-gray-100 p-1"
                />
              </dd>
            </div>
          )}
          <InfoRow label="Téléphone"               value={c.telephone} />
          <InfoRow label="Téléphone secondaire"    value={c.telephoneSecondaire} />
          <InfoRow label="Email pro"               value={c.emailProfessionnel} />
          <InfoRow label="LinkedIn"                value={c.linkedin} />
        </dl>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Modifier le profil
        </h2>
        <button
          type="button"
          onClick={() => { setEditing(false); setLogoFile(null); setLogoError(null) }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-gray-400 transition-colors"
        >
          <X size={12} />
          Annuler
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="prenom" className="block text-xs font-medium text-gray-600 mb-1">Prénom *</label>
          <input id="prenom" name="prenom" type="text" required
            defaultValue={membre.prenom} className={INPUT_CLS} />
        </div>
        <div>
          <label htmlFor="nom" className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
          <input id="nom" name="nom" type="text" required
            defaultValue={membre.nom} className={INPUT_CLS} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Biographie</label>
        <BiographyEditor
          ref={bioEditorRef}
          initialContent={membre.biographie ?? ''}
          placeholder="Parlez de vous…"
        />
      </div>

      <div className="pt-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Poste</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="posteCap" className="block text-xs font-medium text-gray-600 mb-1">
              Poste au CAP
            </label>
            <select
              id="posteCap"
              name="posteCap"
              value={posteCap}
              onChange={e => setPosteCap(e.target.value)}
              className={SELECT_CLS}
            >
              <option value="">— Sélectionnez un poste —</option>
              {FONCTIONS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fonctionProfessionnelle" className="block text-xs font-medium text-gray-600 mb-1">
              Fonction
            </label>
            <input
              id="fonctionProfessionnelle"
              name="fonctionProfessionnelle"
              type="text"
              defaultValue={p.fonctionProfessionnelle ?? ''}
              placeholder="DG, Président de Conseil d'Administration…"
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label htmlFor="organisme" className="block text-xs font-medium text-gray-600 mb-1">Organisation</label>
            <input id="organisme" name="organisme" type="text"
              defaultValue={p.organisme ?? ''} className={INPUT_CLS} />
          </div>

          <div>
            <label htmlFor="siteOrganisme" className="block text-xs font-medium text-gray-600 mb-1">
              Site web de l&apos;organisation (optionnel)
            </label>
            <input
              id="siteOrganisme"
              name="siteOrganisme"
              type="url"
              placeholder="https://…"
              defaultValue={p.siteOrganisme ?? ''}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Logo de l&apos;organisation (optionnel)
            </label>
            {currentLogo?.url && !logoFile && (
              <div className="mb-2 flex items-center gap-3">
                <Image
                  src={currentLogo.url}
                  alt="Logo actuel"
                  width={60}
                  height={30}
                  className="object-contain rounded border border-gray-200 p-1"
                />
                <span className="text-xs text-gray-400">Logo actuel</span>
              </div>
            )}
            {logoFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-700 flex-1 truncate">{logoFile.name}</span>
                <span className="text-xs text-gray-400 shrink-0">
                  {(logoFile.size / 1024).toFixed(0)} Ko
                </span>
                <button
                  type="button"
                  onClick={() => { setLogoFile(null); setLogoError(null); if (logoRef.current) logoRef.current.value = '' }}
                  className="shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoRef.current?.click()}
                className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 hover:border-black hover:text-black transition-colors"
              >
                <Upload size={13} />
                {currentLogo ? 'Remplacer le logo' : 'Ajouter un logo'}
              </button>
            )}
            <input
              ref={logoRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleLogoChange}
              className="hidden"
            />
            {logoError && <p className="mt-1 text-xs text-red-600">{logoError}</p>}
            {!logoError && <p className="mt-1 text-xs text-gray-400">JPG, PNG, WebP, SVG — 2 Mo max</p>}
          </div>

          <div>
            <label htmlFor="direction" className="block text-xs font-medium text-gray-600 mb-1">Direction / Département</label>
            <input id="direction" name="direction" type="text"
              defaultValue={p.direction ?? ''} className={INPUT_CLS} />
          </div>
        </div>
      </div>

      <div className="pt-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Coordonnées</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="telephone" className="block text-xs font-medium text-gray-600 mb-1">Téléphone principal</label>
            <input id="telephone" name="telephone" type="tel"
              placeholder="+221 77 000 00 00"
              defaultValue={c.telephone ?? ''} className={INPUT_CLS} />
          </div>
          <div>
            <label htmlFor="telephoneSecondaire" className="block text-xs font-medium text-gray-600 mb-1">Téléphone secondaire (optionnel)</label>
            <input id="telephoneSecondaire" name="telephoneSecondaire" type="tel"
              placeholder="+221 78 000 00 00"
              defaultValue={c.telephoneSecondaire ?? ''} className={INPUT_CLS} />
          </div>
          <div>
            <label htmlFor="emailProfessionnel" className="block text-xs font-medium text-gray-600 mb-1">Email professionnel</label>
            <input id="emailProfessionnel" name="emailProfessionnel" type="email"
              defaultValue={c.emailProfessionnel ?? ''} className={INPUT_CLS} />
          </div>
          <div>
            <label htmlFor="linkedin" className="block text-xs font-medium text-gray-600 mb-1">Profil LinkedIn</label>
            <input id="linkedin" name="linkedin" type="url"
              placeholder="https://linkedin.com/in/..."
              defaultValue={c.linkedin ?? ''} className={INPUT_CLS} />
          </div>
        </div>
      </div>

      <button
        type="submit" disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading
          ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          : <Check size={14} />
        }
        {loading ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}
