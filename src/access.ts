import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export const isAdmin = ({ req: { user } }: AccessArgs): boolean =>
  (user as User | null)?.role === 'admin'

export const isAdminOrGestionnaire = ({ req: { user } }: AccessArgs): boolean => {
  const role = (user as User | null)?.role
  return role === 'admin' || role === 'gestionnaire'
}

export const isAuthenticated = ({ req: { user } }: AccessArgs): boolean =>
  Boolean(user)
