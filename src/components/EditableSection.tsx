"use client"

import { useState, type ReactNode } from 'react'
import { Pencil, Save, X, AlertCircle } from 'lucide-react'

interface Props {
  title:     string
  children:  ReactNode                    // affichage lecture seule
  editor:    ReactNode                    // champs éditables (affichés en mode édition)
  onSave:    () => Promise<void> | void
  onCancel?: () => void
}

export function EditableSection({ title, children, editor, onSave, onCancel }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  async function handleSave() {
    setLoading(true)
    setError(null)
    try {
      await onSave()
      setIsEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement.")
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    onCancel?.()
    setError(null)
    setIsEditing(false)
  }

  return (
    <section className="rounded-2xl border border-[#14110B]/10 bg-white p-6 sm:p-7">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="font-serif text-lg font-bold text-[#062812]">{title}</h2>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#14110B]/15 px-3 py-1.5 text-xs font-semibold text-[#14110B]/60 transition-colors hover:border-[#C8A24A] hover:text-[#14110B]"
          >
            <Pencil size={13} /> Modifier
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isEditing ? (
        <div>
          <div className="space-y-4">{editor}</div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a7a3a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#166a33] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <Save size={15} />
              }
              Enregistrer
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-[#14110B]/15 px-4 py-2.5 text-sm font-semibold text-[#14110B]/60 transition-colors hover:text-[#14110B] disabled:opacity-50"
            >
              <X size={15} /> Annuler
            </button>
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </section>
  )
}
