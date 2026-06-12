'use client'

import { useState, type FormEvent } from 'react'
import { envoyerMessageContact } from './actions'

export function ContactForm() {
  const [nom, setNom]         = useState('')
  const [email, setEmail]     = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [erreur, setErreur]   = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErreur('')

    const result = await envoyerMessageContact({ nom, email, message })

    if ('error' in result) {
      setStatus('error')
      setErreur(result.error)
      return
    }

    setStatus('success')
    setNom('')
    setEmail('')
    setMessage('')
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-cream/15 bg-cream/5 p-6 text-center">
        <p className="font-serif text-lg text-cream">Merci, votre message a bien été envoyé.</p>
        <p className="mt-1 text-sm text-cream/60">Nous vous répondrons dans les plus brefs délais.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="contact-nom" className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-cream/50">
          Nom
        </label>
        <input
          id="contact-nom"
          type="text"
          required
          value={nom}
          onChange={e => setNom(e.target.value)}
          className="w-full rounded-lg border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-bordeaux focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-cream/50">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-lg border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-bordeaux focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-cream/50">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full resize-none rounded-lg border border-cream/15 bg-cream/5 px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-bordeaux focus:outline-none"
        />
      </div>

      {status === 'error' && (
        <p className="text-sm text-bordeaux">{erreur}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-bordeaux px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-bordeaux/90 disabled:opacity-50"
      >
        {status === 'loading' ? 'Envoi…' : 'Envoyer le message'}
      </button>
    </form>
  )
}
