import type { Access } from 'payload'
import type { User } from '@/payload-types'

/** Réservé à l'administrateur. */
export const isAdmin: Access = ({ req: { user } }) =>
  (user as User)?.role === 'admin'

/** Admin ou gestionnaire de contenu. */
export const isAdminOrGestionnaire: Access = ({ req: { user } }) => {
  const role = (user as User)?.role
  return role === 'admin' || role === 'gestionnaire'
}

/** Tout utilisateur connecté. */
export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)
