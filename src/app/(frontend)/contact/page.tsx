import { PageHero } from '@/components/PageHero'
import { ContactFormClient } from '@/components/ContactFormClient'
import { MapPin, Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Contact',
  description: 'Contactez le Cercle des Administrateurs Publics du Sénégal.',
}

export default function ContactPage() {
  return (
    <div>
      <PageHero
        title="Nous contacter"
        subtitle="Une question ? Un partenariat ? Contactez-nous."
        breadcrumb={[{ label: 'Accueil', href: '/' }, { label: 'Contact', href: '/contact' }]}
      />

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_400px] gap-16 items-start">

            {/* Colonne gauche - Formulaire */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="block w-8 h-0.5 bg-[#C8A24A]"></span>
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A24A] font-bold">FORMULAIRE DE CONTACT</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#14110B] mt-2">Envoyez-nous un message</h2>
              <p className="text-[#14110B]/60 mt-3">Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.</p>
              <ContactFormClient />
            </div>

            {/* Colonne droite - Informations */}
            <div className="flex flex-col gap-6">
              {/* Card coordonnées */}
              <div className="bg-[#FAF8F3] rounded-2xl p-8 border border-[#14110B]/10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="block w-8 h-0.5 bg-[#C8A24A]"></span>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A24A] font-bold">COORDONNÉES</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#14110B] mt-2">Cercle des Administrateurs Publics</h3>
                <div className="border-t border-[#14110B]/10 my-6"></div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-[#1a7a3a] flex-none" />
                    <span className="text-sm text-[#14110B]/70">Dakar, Sénégal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-[#1a7a3a] flex-none" />
                    <a href="mailto:contact@cap-senegal.org" className="text-sm text-[#14110B]/70 hover:text-[#1a7a3a]">contact@cap-senegal.org</a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-[#1a7a3a] flex-none" />
                    <a href="tel:+221338000000" className="text-sm text-[#14110B]/70 hover:text-[#1a7a3a]">+221 33 800 00 00</a>
                  </div>
                </div>
                <div className="border-t border-[#14110B]/10 my-6"></div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A24A] font-bold mb-3">RÉSEAUX SOCIAUX</p>
                <div className="flex gap-3">
                  {[
                    { href: '#', icon: 'f', label: 'Facebook' },
                    { href: '#', icon: 'in', label: 'LinkedIn' },
                    { href: '#', icon: 'X', label: 'Twitter' },
                  ].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-[#14110B]/15 flex items-center justify-center text-xs font-bold text-[#14110B]/50 hover:bg-[#1a7a3a] hover:text-white hover:border-[#1a7a3a] transition-colors">
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Card horaires */}
              <div className="bg-[#062812] rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(143,185,168,0.08) 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                <div className="relative">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A24A] font-bold">HORAIRES</p>
                  <h3 className="font-serif text-white text-lg mt-2 font-bold">Disponibilité</h3>
                  <div className="flex flex-col gap-2 mt-4">
                    <p className="text-white/70 text-sm">Lundi - Vendredi : 8h00 - 17h00</p>
                    <p className="text-white/70 text-sm">Samedi : 9h00 - 13h00</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
