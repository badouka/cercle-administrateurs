import { ContactForm } from '../ContactForm'

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 font-serif text-3xl text-ink">Contactez-nous</h1>
      <p className="mb-8 text-sm text-ink/60">
        Une question, une suggestion ? Écrivez-nous.
      </p>
      <ContactForm />
    </div>
  )
}