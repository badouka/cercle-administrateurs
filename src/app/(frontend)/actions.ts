'use server'

import { sendContactMessage } from '@/lib/email'

export interface ContactData {
  nom:     string
  email:   string
  message: string
}

export async function envoyerMessageContact(
  data: ContactData,
): Promise<{ success: true } | { error: string }> {
  const { nom, email, message } = data

  if (!nom.trim() || !email.trim() || !message.trim()) {
    return { error: 'Veuillez remplir tous les champs.' }
  }

  try {
    await sendContactMessage(nom.trim(), email.toLowerCase().trim(), message.trim())
    return { success: true }
  } catch (err) {
    console.error('[envoyerMessageContact]', err)
    return { error: "Une erreur est survenue lors de l'envoi du message." }
  }
}
