import Link from 'next/link'

type BreadcrumbItem = { label: string; href: string }

interface PageHeroProps {
  title: string
  subtitle?: string
  breadcrumb?: BreadcrumbItem[]
}

export function PageHero({ title, subtitle, breadcrumb }: PageHeroProps) {
  return (
    <section
      className="relative min-h-[380px] pt-24 pb-12"
      style={{
        backgroundImage: "url('/banner.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 pl-10 pr-6">
        <nav className="font-mono text-xs uppercase tracking-widest text-white/60">
          {breadcrumb ? (
            breadcrumb.map((item, i) => (
              <span key={item.href}>
                {i > 0 && ' / '}
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
              </span>
            ))
          ) : (
            <>
              <Link href="/" className="transition-colors hover:text-white">
                Accueil
              </Link>
              {` / ${title}`}
            </>
          )}
        </nav>

        <h1 className="mt-4 font-serif text-4xl font-bold text-white sm:text-5xl">{title}</h1>

        {subtitle && <p className="mt-2 text-sm text-white/70">{subtitle}</p>}
      </div>

      {/* Filet tricolore en bas */}
      <div className="absolute bottom-0 left-0 right-0 flex h-1.5">
        <div className="flex-1" style={{ background: '#14b53a' }}></div>
        <div className="flex-1 relative flex items-center justify-center" style={{ background: '#fcd116' }}>
          <span className="absolute text-[8px] leading-none" style={{ color: '#14b53a' }}>★</span>
        </div>
        <div className="flex-1" style={{ background: '#ce0726' }}></div>
      </div>
    </section>
  )
}
