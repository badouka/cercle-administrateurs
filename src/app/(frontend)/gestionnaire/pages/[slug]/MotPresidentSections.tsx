"use client"

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EditableSection } from '@/components/EditableSection'
import { ArticleEditor, type ArticleEditorRef } from '@/components/editor/ArticleEditor'
import { tiptapToLexical } from '@/lib/tiptap-to-lexical'
import { updatePageSection } from '../../actions'

interface Props {
  slug:                  string
  initialTitre:          string
  initialCitation:       string
  initialMessageHtml:    string
  initialSignatureNom:   string
  initialSignatureTitre: string
}

const labelCls = 'block text-xs font-bold uppercase tracking-wider text-[#C8A24A] mb-1.5'
const inputCls =
  'border border-[#14110B]/20 rounded-lg px-4 py-3 w-full focus:border-[#C8A24A] focus:outline-none text-sm'

async function saveSection(slug: string, fd: FormData) {
  const result = await updatePageSection(slug, fd)
  if ('error' in result) throw new Error(result.error)
}

export function MotPresidentSections({
  slug,
  initialTitre,
  initialCitation,
  initialMessageHtml,
  initialSignatureNom,
  initialSignatureTitre,
}: Props) {
  const router = useRouter()

  // ── Section 1 : Titre + Citation ──
  const [titre,    setTitre]    = useState(initialTitre)
  const [citation, setCitation] = useState(initialCitation)
  const committed1 = useRef({ titre: initialTitre, citation: initialCitation })

  async function saveTitreCitation() {
    const fd = new FormData()
    fd.append('titre', titre.trim())
    fd.append('citation', citation)
    await saveSection(slug, fd)
    committed1.current = { titre: titre.trim(), citation }
    setTitre(titre.trim())
    router.refresh()
  }
  function cancelTitreCitation() {
    setTitre(committed1.current.titre)
    setCitation(committed1.current.citation)
  }

  // ── Section 2 : Message (éditeur riche) ──
  const editorRef = useRef<ArticleEditorRef>(null)

  async function saveMessage() {
    const lexical = tiptapToLexical(editorRef.current!.getJSON())
    const fd = new FormData()
    fd.append('contenuJson', JSON.stringify(lexical))
    await saveSection(slug, fd)
    router.refresh()
  }

  // ── Section 3 : Signature ──
  const [signatureNom,   setSignatureNom]   = useState(initialSignatureNom)
  const [signatureTitre, setSignatureTitre] = useState(initialSignatureTitre)
  const committed3 = useRef({ nom: initialSignatureNom, titre: initialSignatureTitre })

  async function saveSignature() {
    const fd = new FormData()
    fd.append('signature_nom', signatureNom)
    fd.append('signature_titre', signatureTitre)
    await saveSection(slug, fd)
    committed3.current = { nom: signatureNom, titre: signatureTitre }
    router.refresh()
  }
  function cancelSignature() {
    setSignatureNom(committed3.current.nom)
    setSignatureTitre(committed3.current.titre)
  }

  return (
    <div className="space-y-5">

      {/* Section 1 : Titre + Citation courte */}
      <EditableSection
        title="Titre & citation"
        onSave={saveTitreCitation}
        onCancel={cancelTitreCitation}
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
              <label className={labelCls}>Citation courte</label>
              <textarea
                rows={2}
                value={citation}
                onChange={e => setCitation(e.target.value)}
                placeholder="Citation mise en avant du Président"
                className={`${inputCls} resize-none`}
              />
            </div>
          </>
        }
      >
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#062812]">{titre || <span className="text-[#14110B]/40">Aucun titre</span>}</p>
          <p className="text-sm italic text-[#14110B]/70">
            {citation || <span className="not-italic text-[#14110B]/40">Aucune citation</span>}
          </p>
        </div>
      </EditableSection>

      {/* Section 2 : Message complet */}
      <EditableSection
        title="Message du Président"
        onSave={saveMessage}
        editor={
          <div>
            <label className={labelCls}>Contenu du message</label>
            <ArticleEditor
              ref={editorRef}
              initialContent={initialMessageHtml}
              placeholder="Rédigez le message du Président…"
            />
          </div>
        }
      >
        {initialMessageHtml && initialMessageHtml.replace(/<[^>]*>/g, '').trim() ? (
          <div
            className="text-sm leading-relaxed text-[#14110B]/70 [&_p]:mb-3 [&_h2]:mt-4 [&_h2]:font-serif [&_h2]:text-base [&_h2]:font-bold [&_h3]:mt-3 [&_h3]:font-serif [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-[#C8A24A] [&_blockquote]:pl-3 [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: initialMessageHtml }}
          />
        ) : (
          <p className="text-sm text-[#14110B]/40">Aucun message.</p>
        )}
      </EditableSection>

      {/* Section 3 : Signature */}
      <EditableSection
        title="Signature"
        onSave={saveSignature}
        onCancel={cancelSignature}
        editor={
          <>
            <div>
              <label className={labelCls}>Nom</label>
              <input
                type="text"
                value={signatureNom}
                onChange={e => setSignatureNom(e.target.value)}
                placeholder="Nom du Président"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Titre / fonction</label>
              <input
                type="text"
                value={signatureTitre}
                onChange={e => setSignatureTitre(e.target.value)}
                placeholder="Ex. Président du CAP"
                className={inputCls}
              />
            </div>
          </>
        }
      >
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#062812]">{signatureNom || <span className="font-normal text-[#14110B]/40">Aucun nom</span>}</p>
          <p className="text-sm text-[#C8A24A] font-semibold">{signatureTitre || <span className="font-normal text-[#14110B]/40">Aucun titre</span>}</p>
        </div>
      </EditableSection>
    </div>
  )
}
