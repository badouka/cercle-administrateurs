'use client'

import { useState, type FormEvent } from 'react'
import { envoyerMessageContact } from './actions'

export function ContactForm() {
  const [prenom, setPrenom]       = useState('')
  const [nom, setNom]             = useState('')
  const [email, setEmail]         = useState('')
  const [telephone, setTelephone] = useState('')
  const [message, setMessage]     = useState('')
  const [status, setStatus]       = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [erreur, setErreur]       = useState('')

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
    setPrenom('')
    setNom('')
    setEmail('')
    setTelephone('')
    setMessage('')
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-ink/10 bg-cream p-6 text-center">
        <p className="font-serif text-lg text-ink">Merci, votre message a bien été envoyé.</p>
        <p className="mt-1 text-sm text-ink/60">Nous vous répondrons dans les plus brefs délais.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-prenom" className="mb-1.5 block text-sm font-medium text-ink">
            Prénom <span className="text-bordeaux">*</span>
          </label>
          <input
            id="contact-prenom"
            type="text"
            required
            placeholder="Prénom"
            value={prenom}
            onChange={e => setPrenom(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-bordeaux focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="contact-nom" className="mb-1.5 block text-sm font-medium text-ink">
            Nom <span className="text-bordeaux">*</span>
          </label>
          <input
            id="contact-nom"
            type="text"
            required
            placeholder="Nom"
            value={nom}
            onChange={e => setNom(e.target.value)}
            className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-bordeaux focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-ink">
          Email <span className="text-bordeaux">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          required
          placeholder="prenom.nom@organisme.sn"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-bordeaux focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="contact-telephone" className="mb-1.5 block text-sm font-medium text-ink">
          Téléphone
        </label>
        <input
          id="contact-telephone"
          type="tel"
          placeholder="+221 77 000 00 00"
          value={telephone}
          onChange={e => setTelephone(e.target.value)}
          className="w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-bordeaux focus:outline-none"
        />
        <p className="mt-1 text-xs text-ink/40">Optionnel</p>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
          Message <span className="text-bordeaux">*</span>
        </label>
        <textarea
          id="contact-message"
          required
          rows={4}
          placeholder="Votre message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full resize-none rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-bordeaux focus:outline-none"
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