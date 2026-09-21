import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEntreprise(entreprise?: string | null, sigle?: string | null): string {
  const nom = (entreprise ?? '').trim()
  const s = (sigle ?? '').trim()
  if (!nom) return ''
  return s ? `${nom} (${s})` : nom
}
