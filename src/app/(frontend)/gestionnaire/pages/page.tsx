import Link from 'next/link'
import { Pencil } from 'lucide-react'

export default function PagesListPage() {
  const pages = [
    { slug: 'a-propos',         label: 'Qui sommes-nous ?',  desc: 'Histoire, mission et valeurs' },
    { slug: 'mot-du-president', label: 'Mot du Président',   desc: 'Message du Président' },
    { slug: 'partenaires',      label: 'Nos partenaires',    desc: 'Partenaires institutionnels' },
  ]
  return (
    <div className="mx-auto max-w-5xl px-4 pt-24 pb-10 sm:px-6 lg:px-8 space-y-8">
      <div>
        <Link href="/gestionnaire" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-4">
          ← Tableau de bord
        </Link>
        <h1 className="text-2xl font-bold text-black">Pages du site</h1>
      </div>
      <div className="rounded-xl border border-[#E5E5E5] bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-[#F9F9F9]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Page</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pages.map(p => (
              <tr key={p.slug} className="hover:bg-gray-50">
                <td className="px-5 py-3.5 font-medium text-black">{p.label}</td>
                <td className="px-5 py-3.5 text-sm text-gray-500">{p.desc}</td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/gestionnaire/pages/${p.slug}`}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-black hover:text-black transition-colors">
                    <Pencil size={12} /> Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
