import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

// Modèle utilisé par l'assistant. Un seul endroit à changer pour monter de
// version (voir la note dans le README de la route ci-dessous).
const MODEL = 'claude-sonnet-4-6'

const MAX_TOKENS = 1024

// Nombre maximum de messages d'historique acceptés par requête (garde-fou
// serveur : le client limite déjà, mais la route est publique).
const MAX_MESSAGES = 20

const SYSTEM_PROMPT = `Vous êtes l'assistant officiel du Cercle des Administrateurs Publics (CAP) du Sénégal.
Votre rôle est d'informer les visiteurs sur le CAP, ses activités et ses services.

À propos du CAP :
- Association fondée en octobre 2024 regroupant les présidents des organes de gouvernance
  (CA, CS, CO) des entités du secteur parapublic sénégalais
- Mission : cadre de réflexion, d'échanges et de mobilisation pour la modernisation
  de l'administration sénégalaise
- Site : cercle-administrateurs.sn

Fonctions disponibles :
- Informer sur la mission, les activités et les membres du CAP
- Expliquer comment devenir membre (via le formulaire d'inscription sur le site)
- Orienter vers les documents publics disponibles dans la médiathèque
- Indiquer comment contacter le CAP (page Contact)
- Présenter les actualités et événements récents

Règles de conduite :
- Ton formel et institutionnel, représentant une organisation publique sénégalaise
- Répondre en français uniquement
- Si vous ne connaissez pas une information précise, orienter vers contact@cercle-administrateurs.sn
- Ne jamais inventer des noms de membres, des dates ou des données chiffrées non confirmées
- Limiter les réponses à 3-4 paragraphes maximum
- Toujours proposer une action concrète en fin de réponse (lien, contact, document)`

// Le client lit ANTHROPIC_API_KEY dans l'environnement. Cette route s'exécute
// uniquement côté serveur : la clé n'est jamais transmise au navigateur.
// timeout en millisecondes dans le SDK TypeScript.
const client = new Anthropic({ timeout: 30_000 })

interface MessageEntrant {
  role:    'user' | 'assistant'
  content: string
}

function messagesValides(value: unknown): value is MessageEntrant[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      m =>
        m &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    )
  )
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[api/chat] ANTHROPIC_API_KEY manquante')
    return NextResponse.json(
      { error: "L'assistant n'est pas configuré." },
      { status: 503 },
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  if (!messagesValides(body?.messages)) {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  if (body.messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: 'Conversation trop longue. Veuillez la recommencer.' },
      { status: 400 },
    )
  }

  // Contexte optionnel (page courante par exemple) : ajouté au prompt système
  // plutôt qu'aux messages, pour ne pas être confondu avec une saisie utilisateur.
  const contexte =
    typeof body.context === 'string' && body.context.trim()
      ? `\n\nContexte de navigation fourni par le site : ${body.context.trim().slice(0, 500)}`
      : ''

  try {
    const response = await client.messages.create({
      model:      MODEL,
      max_tokens: MAX_TOKENS,
      system:     SYSTEM_PROMPT + contexte,
      // Assistant conversationnel : pas de réflexion étendue, effort bas —
      // c'est le réglage recommandé pour ce type de charge (latence et coût).
      thinking:      { type: 'disabled' },
      output_config: { effort: 'low' },
      messages: body.messages.map((m: MessageEntrant) => ({
        role:    m.role,
        content: m.content,
      })),
    })

    // response.content est une union discriminée : on ne lit .text qu'après
    // avoir vérifié le type du bloc.
    const reply = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n\n')
      .trim()

    if (!reply) {
      return NextResponse.json(
        { error: "L'assistant n'a pas pu formuler de réponse. Veuillez reformuler." },
        { status: 502 },
      )
    }

    return NextResponse.json({ reply })
  } catch (err) {
    // Exceptions typées du SDK, de la plus spécifique à la plus générale.
    // APIConnectionError avant APIError : c'en est une sous-classe en TypeScript.
    if (err instanceof Anthropic.RateLimitError) {
      console.error('[api/chat] Limite de débit atteinte')
      return NextResponse.json(
        { error: "L'assistant est très sollicité. Veuillez réessayer dans un instant." },
        { status: 429 },
      )
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('[api/chat] Clé API invalide')
      return NextResponse.json(
        { error: "L'assistant n'est pas configuré." },
        { status: 503 },
      )
    }
    if (err instanceof Anthropic.APIConnectionError) {
      console.error('[api/chat] Connexion impossible', err.message)
      return NextResponse.json(
        { error: "L'assistant est momentanément injoignable. Veuillez réessayer." },
        { status: 504 },
      )
    }
    if (err instanceof Anthropic.APIError) {
      console.error(`[api/chat] Erreur API ${err.status}`, err.message)
      return NextResponse.json(
        { error: 'Une erreur est survenue. Veuillez réessayer.' },
        { status: 502 },
      )
    }

    console.error('[api/chat] Erreur inattendue', err)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 },
    )
  }
}
