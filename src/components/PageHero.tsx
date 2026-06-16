import Link from 'next/link'

type BreadcrumbItem = { label: string; href: string }

interface PageHeroProps {
  title: string
  subtitle?: string
  breadcrumb?: BreadcrumbItem[]
}

export function PageHero({ title, subtitle, breadcrumb }: PageHeroProps) {
  return (
    <section className="relative min-h-[200px] pt-24 bg-[url('/api/media/file/banner-1.png')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="absolute left-0 top-0 bottom-0 w-[5px]"
        style={{ background: 'linear-gradient(180deg, #14B53A 33%, #FCD116 33% 66%, #C0392B 66%)' }}
      />

      <div className="relative z-10 py-12 pl-10 pr-6">
        <nav className="font-mono text-xs uppercase tracking-widest text-white/70">
          <Link href="/" className="transition-colors hover:text-white">
            Accueil
          </Link>
          {breadcrumb
            ? breadcrumb.map(item => (
                <span key={item.href}>
                  {' / '}
                  <Link href={item.href} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </span>
              ))
            : ` / ${title}`}
        </nav>

        <h1 className="mt-2 font-serif text-3xl font-bold text-white sm:text-4xl">{title}</h1>

        {subtitle && <p className="mt-2 text-sm text-white/70">{subtitle}</p>}

        <div className="mt-4 flex gap-0">
          <span className="h-1.5 w-8 rounded-l bg-[#14B53A]" />
          <span className="relative h-1.5 w-8 bg-[#FCD116]">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] text-[#14B53A]">
              ★
            </span>
          </span>
          <span className="h-1.5 w-8 rounded-r bg-[#C0392B]" />
        </div>
      </div>
    </section>
  )
}
