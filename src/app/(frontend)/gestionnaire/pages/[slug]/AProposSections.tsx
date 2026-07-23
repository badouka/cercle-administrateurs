"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditableSection } from '@/components/EditableSection'
import {
  A_PROPOS_SECTION_DEFAULTS,
  ENGAGEMENTS,
  CADRE,
  splitParas,
  type AProposSectionsData,
} from '@/app/(frontend)/a-propos/content'
import { updatePageSection } from '../../actions'

interface Props {
  slug:               string
  initialTitre:       string
  initialDescription: string
  initialSections:    unknown
}

const labelCls = 'block text-xs font-bold uppercase tracking-wider text-[#C8A24A] mb-1.5'
const inputCls =
  'border border-[#14110B]/20 rounded-lg px-4 py-3 w-full focus:border-[#C8A24A] focus:outline-none text-sm'

async function saveSection(slug: string, fd: FormData) {
  const result = await updatePageSection(slug, fd)
  if ('error' in result) throw new Error(result.error)
}

// Fusionne les données sauvegardées avec les valeurs par défaut (fallback par champ).
function resolveSections(raw: unknown): AProposSectionsData {
  const d = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {}
  const str = (v: unknown, fb: string) => (typeof v === 'string' ? v : fb)
  const arr = (v: unknown, fb: string[]) =>
    fb.map((f, i) => (Array.isArray(v) && typeof v[i] === 'string' ? (v[i] as string) : f))
  return {
    secteurParapublic: str(d.secteurParapublic, A_PROPOS_SECTION_DEFAULTS.secteurParapublic),
    diagnostic:        str(d.diagnostic, A_PROPOS_SECTION_DEFAULTS.diagnostic),
    raisonEtre:        str(d.raisonEtre, A_PROPOS_SECTION_DEFAULTS.raisonEtre),
    engagements:       arr(d.engagements, A_PROPOS_SECTION_DEFAULTS.engagements),
    cadre:             arr(d.cadre, A_PROPOS_SECTION_DEFAULTS.cadre),
    vision:            str(d.vision, A_PROPOS_SECTION_DEFAULTS.vision),
  }
}

// Affichage lecture seule d'un texte (paragraphes séparés par une ligne vide).
function ReadOnlyText({ text }: { text: string }) {
  const paras = splitParas(text)
  if (!paras.length) return <p className="text-sm text-[#14110B]/40">Aucun contenu.</p>
  return (
    <div className="space-y-2">
      {paras.map((p, i) => (
        <p key={i} className="text-sm leading-relaxed text-[#14110B]/70">{p}</p>
      ))}
    </div>
  )
}

function Textarea({
  value,
  onChange,
  rows = 5,
  placeholder,
}: {
  value:       string
  onChange:    (v: string) => void
  rows?:       number
  placeholder?: string
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${inputCls} resize-y`}
    />
  )
}

export function AProposSections({
  slug,
  initialTitre,
  initialDescription,
  initialSections,
}: Props) {
  const router = useRouter()

  // ── Section 1 : Titre + Description (champs propres de la collection) ──
  const [titre,       setTitre]       = useState(initialTitre)
  const [description, setDescription] = useState(initialDescription)
  const [committedTitre,       setCommittedTitre]       = useState(initialTitre)
  const [committedDescription, setCommittedDescription] = useState(initialDescription)

  async function saveTitreDescription() {
    const fd = new FormData()
    fd.append('titre', titre.trim())
    fd.append('description', description)
    await saveSection(slug, fd)
    setTitre(titre.trim())
    setCommittedTitre(titre.trim())
    setCommittedDescription(description)
    router.refresh()
  }
  function cancelTitreDescription() {
    setTitre(committedTitre)
    setDescription(committedDescription)
  }

  // ── Sections 2 à 7 : stockées dans le champ JSON `sections` ──
  const initial = resolveSections(initialSections)
  const [sections, setSections] = useState<AProposSectionsData>(initial)

  const [secteur,     setSecteur]     = useState(initial.secteurParapublic)
  const [diagnostic,  setDiagnostic]  = useState(initial.diagnostic)
  const [raison,      setRaison]      = useState(initial.raisonEtre)
  const [engagements, setEngagements] = useState<string[]>(initial.engagements)
  const [cadre,       setCadre]       = useState<string[]>(initial.cadre)
  const [vision,      setVision]      = useState(initial.vision)

  // Sauvegarde le champ JSON complet en fusionnant la section modifiée.
  async function persist(next: AProposSectionsData) {
    const fd = new FormData()
    fd.append('sectionsJson', JSON.stringify(next))
    await saveSection(slug, fd)
    setSections(next)
    router.refresh()
  }

  function setEngagement(i: number, value: string) {
    setEngagements(prev => prev.map((v, idx) => (idx === i ? value : v)))
  }
  function setCadreItem(i: number, value: string) {
    setCadre(prev => prev.map((v, idx) => (idx === i ? value : v)))
  }

  return (
    <div className="space-y-5">

      {/* Section 1 : Titre + Description */}
      <EditableSection
        title="Titre & Description"
        onSave={saveTitreDescription}
        onCancel={cancelTitreDescription}
        editor={
          <>
            <div>
              <label className={labelCls}>Titre</label>
              <input
                type="text"
                value={titre}
                onChange={e => setTitre(e.target.value)}
                placeholder="Titre de la page"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Sous-titre ou résumé court de la page"
                className={`${inputCls} resize-none`}
              />
            </div>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#062812]">
            {committedTitre || <span className="text-[#14110B]/40">Aucun titre</span>}
          </p>
          <p className="text-sm text-[#14110B]/70">
            {committedDescription || <span className="text-[#14110B]/40">Aucune description</span>}
          </p>
        </div>
      </EditableSection>

      {/* Section 2 : Le secteur parapublic */}
      <EditableSection
        title="Le secteur parapublic"
        onSave={() => persist({ ...sections, secteurParapublic: secteur })}
        onCancel={() => setSecteur(sections.secteurParapublic)}
        editor={
          <div>
            <label className={labelCls}>Texte de la section</label>
            <Textarea
              value={secteur}
              onChange={setSecteur}
              rows={8}
              placeholder="Séparez les paragraphes par une ligne vide."
            />
          </div>
        }
      >
        <ReadOnlyText text={sections.secteurParapublic} />
      </EditableSection>

      {/* Section 3 : Un diagnostic lucide */}
      <EditableSection
        title="Un diagnostic lucide"
        onSave={() => persist({ ...sections, diagnostic })}
        onCancel={() => setDiagnostic(sections.diagnostic)}
        editor={
          <div>
            <label className={labelCls}>Texte de la section</label>
            <Textarea value={diagnostic} onChange={setDiagnostic} rows={8} />
          </div>
        }
      >
        <ReadOnlyText text={sections.diagnostic} />
      </EditableSection>

      {/* Section 4 : La raison d'être du CAP */}
      <EditableSection
        title="La raison d'être du CAP"
        onSave={() => persist({ ...sections, raisonEtre: raison })}
        onCancel={() => setRaison(sections.raisonEtre)}
        editor={
          <div>
            <label className={labelCls}>Texte de la section</label>
            <Textarea
              value={raison}
              onChange={setRaison}
              rows={7}
              placeholder="Séparez les paragraphes par une ligne vide."
            />
          </div>
        }
      >
        <ReadOnlyText text={sections.raisonEtre} />
      </EditableSection>

      {/* Section 5 : Nos cinq engagements */}
      <EditableSection
        title="Nos cinq engagements"
        onSave={() => persist({ ...sections, engagements })}
        onCancel={() => setEngagements(sections.engagements)}
        editor={
          <div className="space-y-4">
            {engagements.map((texte, i) => (
              <div key={i}>
                <label className={labelCls}>{ENGAGEMENTS[i]?.titre ?? `Engagement ${i + 1}`}</label>
                <Textarea value={texte} onChange={v => setEngagement(i, v)} rows={3} />
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {sections.engagements.map((texte, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-[#062812]">{ENGAGEMENTS[i]?.titre ?? `Engagement ${i + 1}`}</p>
              <p className="text-sm leading-relaxed text-[#14110B]/70">{texte}</p>
            </div>
          ))}
        </div>
      </EditableSection>

      {/* Section 6 : Le cadre */}
      <EditableSection
        title="Le cadre"
        onSave={() => persist({ ...sections, cadre })}
        onCancel={() => setCadre(sections.cadre)}
        editor={
          <div className="space-y-4">
            {cadre.map((texte, i) => (
              <div key={i}>
                <label className={labelCls}>{CADRE[i]?.titre ?? `Élément ${i + 1}`}</label>
                <Textarea value={texte} onChange={v => setCadreItem(i, v)} rows={3} />
              </div>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {sections.cadre.map((texte, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-[#062812]">{CADRE[i]?.titre ?? `Élément ${i + 1}`}</p>
              <p className="text-sm leading-relaxed text-[#14110B]/70">{texte}</p>
            </div>
          ))}
        </div>
      </EditableSection>

      {/* Section 7 : Notre Vision */}
      <EditableSection
        title="Notre Vision"
        onSave={() => persist({ ...sections, vision })}
        onCancel={() => setVision(sections.vision)}
        editor={
          <div>
            <label className={labelCls}>Texte de la vision</label>
            <Textarea
              value={vision}
              onChange={setVision}
              rows={6}
              placeholder="Décrivez la vision du CAP…"
            />
          </div>
        }
      >
        {sections.vision.trim()
          ? <ReadOnlyText text={sections.vision} />
          : <p className="text-sm text-[#14110B]/40">Aucune vision renseignée.</p>}
      </EditableSection>
    </div>
  )
}
