"use client"
import { useState } from 'react'

export function ContactFormClient() {
  const [form, setForm] = useState({ nom: '', email: '', objet: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') return (
    <div className="bg-[#EEF6F1] border border-[#1a7a3a] rounded-xl p-8 text-center">
      <p className="text-2xl mb-2">✅</p>
      <p className="font-serif text-xl font-bold text-[#14110B]">Message envoyé !</p>
      <p className="text-[#14110B]/60 mt-2 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-8">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#14110B]/50 mb-1 block">Nom complet *</label>
        <input required value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
          className="border border-[#14110B]/20 rounded-lg px-4 py-3 w-full focus:border-[#C8A24A] focus:outline-none text-sm bg-white" placeholder="Votre nom complet" />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#14110B]/50 mb-1 block">Email *</label>
        <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          className="border border-[#14110B]/20 rounded-lg px-4 py-3 w-full focus:border-[#C8A24A] focus:outline-none text-sm bg-white" placeholder="votre@email.com" />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#14110B]/50 mb-1 block">Objet *</label>
        <input required value={form.objet} onChange={e => setForm({...form, objet: e.target.value})}
          className="border border-[#14110B]/20 rounded-lg px-4 py-3 w-full focus:border-[#C8A24A] focus:outline-none text-sm bg-white" placeholder="Objet de votre message" />
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-[#14110B]/50 mb-1 block">Message *</label>
        <textarea required rows={6} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
          className="border border-[#14110B]/20 rounded-lg px-4 py-3 w-full focus:border-[#C8A24A] focus:outline-none text-sm bg-white resize-none" placeholder="Votre message..." />
      </div>
      {status === 'error' && <p className="text-red-500 text-sm">Une erreur est survenue. Veuillez réessayer.</p>}
      <button type="submit" disabled={status === 'loading'}
        className="bg-[#1a7a3a] text-white w-full py-3 rounded-lg font-semibold hover:bg-[#C8A24A] hover:text-[#14110B] transition-colors disabled:opacity-50">
        {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message →'}
      </button>
    </form>
  )
}
