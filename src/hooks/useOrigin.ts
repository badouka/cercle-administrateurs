'use client'

import { useSyncExternalStore } from 'react'

// L'origine ne change jamais pendant la vie de la page : on ne s'abonne à rien.
const subscribe = () => () => {}

/**
 * Renvoie `window.location.origin` côté client, et '' pendant le rendu serveur
 * et l'hydratation. Évite le `setState` dans un `useEffect` (qui déclenche un
 * rendu en cascade) tout en gardant un HTML serveur/client identique.
 */
export function useOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => '',
  )
}
