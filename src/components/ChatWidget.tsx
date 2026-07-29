'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

interface Message {
  role:    'user' | 'assistant'
  content: string
}

const ACCUEIL =
  "Bonjour, je suis l'assistant du Cercle des Administrateurs Publics du Sénégal. " +
  'Je suis à votre disposition pour répondre à vos questions sur le CAP, ses activités, ' +
  'ses membres et ses services. Comment puis-je vous aider ?'

const SUGGESTIONS = [
  'Comment devenir membre du CAP ?',
  'Quelles sont les missions du CAP ?',
  'Comment contacter le CAP ?',
  'Quels documents sont disponibles ?',
]

// Historique envoyé à l'API : borne haute côté client, doublée côté serveur.
const MAX_HISTORIQUE = 20

const VERT = '#1a7a3a'

export function ChatWidget() {
  const [ouvert,     setOuvert]     = useState(false)
  const [messages,   setMessages]   = useState<Message[]>([{ role: 'assistant', content: ACCUEIL }])
  const [saisie,     setSaisie]     = useState('')
  const [chargement, setChargement] = useState(false)
  const [nonLus,     setNonLus]     = useState(0)

  const zoneMessages = useRef<HTMLDivElement>(null)
  const textareaRef  = useRef<HTMLTextAreaElement>(null)

  // Suggestions visibles tant que l'utilisateur n'a rien envoyé.
  const premierEchange = messages.length === 1

  // Une conversation = ACCUEIL + N échanges. On plafonne les envois.
  const quotaAtteint = messages.length >= MAX_HISTORIQUE

  useEffect(() => {
    zoneMessages.current?.scrollTo({ top: zoneMessages.current.scrollHeight, behavior: 'smooth' })
  }, [messages, chargement])

  function ouvrir() {
    setOuvert(true)
    setNonLus(0)
  }

  function ajusterHauteur() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    // 1 à 3 lignes environ (~24px par ligne).
    el.style.height = `${Math.min(el.scrollHeight, 72)}px`
  }

  async function envoyer(texte: string) {
    const contenu = texte.trim()
    if (!contenu || chargement || quotaAtteint) return

    const historique = [...messages, { role: 'user' as const, content: contenu }]
    setMessages(historique)
    setSaisie('')
    setChargement(true)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    try {
      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        // Le message d'accueil est purement visuel : on ne l'envoie pas au modèle.
        body: JSON.stringify({ messages: historique.slice(1).slice(-MAX_HISTORIQUE) }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok || !data?.reply) {
        const message =
          typeof data?.error === 'string'
            ? data.error
            : 'Une erreur est survenue. Veuillez réessayer.'
        setMessages(prev => [...prev, { role: 'assistant', content: message }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Une erreur est survenue. Veuillez réessayer.' },
      ])
    } finally {
      setChargement(false)
      if (!ouvert) setNonLus(n => n + 1)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      envoyer(saisie)
    }
  }

  return (
    <>
      {/* ── Bouton flottant ── */}
      {!ouvert && (
        <button
          type="button"
          onClick={ouvrir}
          aria-label="Ouvrir l'assistant du CAP"
          className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: VERT }}
        >
          <MessageCircle size={24} />
          {nonLus > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
              {nonLus}
            </span>
          )}
        </button>
      )}

      {/* ── Fenêtre de conversation ── */}
      {ouvert && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-white sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[520px] sm:w-[380px] sm:rounded-2xl sm:border sm:border-[#14110B]/10 sm:shadow-2xl">

          {/* En-tête */}
          <div
            className="flex items-center gap-3 px-4 py-3 text-white sm:rounded-t-2xl"
            style={{ backgroundColor: VERT }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-black">
              CAP
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">Assistant CAP</p>
              <p className="text-[11px] text-white/70 leading-tight">Cercle des Administrateurs Publics</p>
            </div>
            <button
              type="button"
              onClick={() => setOuvert(false)}
              aria-label="Fermer l'assistant"
              className="rounded-md p-1 transition-colors hover:bg-white/15"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={zoneMessages} className="flex-1 space-y-3 overflow-y-auto bg-[#FAF8F3] px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'text-white'
                      : 'border border-[#14110B]/10 bg-white text-[#14110B]'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: VERT } : undefined}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Suggestions */}
            {premierEchange && !chargement && (
              <div className="flex flex-col items-start gap-2 pt-1">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => envoyer(s)}
                    className="rounded-full border border-[#1a7a3a]/30 bg-white px-3 py-1.5 text-left text-xs font-medium text-[#1a7a3a] transition-colors hover:bg-[#1a7a3a] hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Indicateur de frappe */}
            {chargement && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl border border-[#14110B]/10 bg-white px-4 py-3">
                  {[0, 150, 300].map(delai => (
                    <span
                      key={delai}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#14110B]/30"
                      style={{ animationDelay: `${delai}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Saisie */}
          <div className="border-t border-[#14110B]/10 bg-white px-3 py-3 sm:rounded-b-2xl">
            {quotaAtteint ? (
              <p className="px-1 text-center text-xs text-[#14110B]/50">
                Cette conversation a atteint sa limite. Pour poursuivre, écrivez-nous à{' '}
                <a href="mailto:contact@cercle-administrateurs.sn" className="font-semibold text-[#1a7a3a] underline">
                  contact@cercle-administrateurs.sn
                </a>
                .
              </p>
            ) : (
              <div className="flex items-end gap-2">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={saisie}
                  disabled={chargement}
                  onChange={e => { setSaisie(e.target.value); ajusterHauteur() }}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre question…"
                  aria-label="Votre message"
                  className="max-h-[72px] flex-1 resize-none rounded-xl border border-[#14110B]/20 px-3 py-2 text-sm text-[#14110B] placeholder:text-[#14110B]/40 focus:border-[#1a7a3a] focus:outline-none focus:ring-1 focus:ring-[#1a7a3a] disabled:bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => envoyer(saisie)}
                  disabled={chargement || !saisie.trim()}
                  aria-label="Envoyer"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: VERT }}
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
