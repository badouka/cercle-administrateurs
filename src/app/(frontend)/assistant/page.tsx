import type { Metadata } from 'next'
import { PageHero } from '@/components/PageHero'

export const metadata: Metadata = {
  title: 'Assistant CAP',
  description: 'Posez vos questions sur le Cercle des Administrateurs Publics',
}

export default function AssistantPage() {
  return (
    <div>
      <PageHero
        title="Assistant CAP"
        subtitle="Posez vos questions sur le Cercle des Administrateurs Publics"
      />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-[#14B53A]/15 bg-white p-4 shadow-lg sm:p-6">
          <iframe
            src="https://api.chatlab.com/aichat/iframe?apiKey=56e6942e-b0d2-44ef-b0b0-b60b6a777aa1&iFrameMode=true&aichatbotProviderId=f9e9c5e4-6d1a-4b8c-8d3f-3f9e9c5e46d1"
            title="Assistant CAP"
            width="100%"
            height="600px"
            style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 8px 30px rgba(20, 181, 58, 0.12)',
            }}
          />
        </div>
      </section>
    </div>
  )
}
