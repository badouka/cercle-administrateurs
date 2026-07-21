import { NextRequest, NextResponse } from 'next/server'
import { sendContactMessage } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { nom, email, objet, message } = await req.json()
    if (!nom || !email || !objet || !message) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }
    await sendContactMessage({ nom, email, objet, message })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
