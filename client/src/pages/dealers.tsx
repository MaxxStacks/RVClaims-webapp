import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PageLayout } from '@/components/page-layout';
import { useLanguage } from '@/hooks/use-language';

const RV_BRANDS = ['Jayco', 'Forest River', 'Heartland', 'Keystone', 'Columbia NW', 'Keystone', 'Coachmen', 'Grand Design', 'Thor', 'Winnebago', 'Airstream', 'Outdoors RV'];

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">({count})</span>
    </div>
  );
}

function DealerCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-full mb-2" />
      <div className="h-3 bg-gray-100 rounded w-4/5" />
    </div>
  );
}

export default function DealersPage() {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('');
  const [country, setCountry] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { data, isLoading } = useQuery<any>({
    queryKey: ['/api/dealers', page, search, brand, country],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '24' });
      if (search) params.set('search', search);
      if (brand) params.set('brand', brand);
      if (country) params.set('country', country);
      const res = await fetch(`/api/dealers?${params}`);
      return res.json();
    },
  });

  const { data: brandsData } = useQuery<string[]>({
    queryKey: ['/api/dealers/brands'],
    queryFn: async () => {
      const res = await fetch('/api/dealers/brands');
      return res.json();
    },
  });

  const { data: provincesData } = useQuery<any[]>({
    queryKey: ['/api/dealers/provinces', country],
    queryFn: async () => {
      const params = country ? `?country=${country}` : '';
      const res = await fetch(`/api/dealers/provinces${params}`);
      return res.json();
    },
  });

  const dealers = data?.dealers ?? [];
  const pagination = data?.pagination;
  const allBrands = brandsData ?? RV_BRANDS;

  const totalLabel = pagination
    ? language === 'fr'
      ? `${pagination.total.toLocaleString()} concessionnaires`
      : `${pagination.total.toLocaleString()} dealers`
    : '';

  const dealerSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: language === 'fr' ? 'Répertoire de concessionnaires VR' : 'RV Dealer Directory',
    description: language === 'fr' ? 'Trouvez des concessionnaires VR au Canada et aux États-Unis' : 'Find RV dealers across Canada and the United States',
    numberOfItems: pagination?.total,
  };

  return (
    <PageLayout
      seoTitle={language === 'fr' ? 'Répertoire de concessionnaires VR — Dealer Suite 360' : 'RV Dealer Directory — Dealer Suite 360'}
      seoDescription={language === 'fr'
        ? `Trouvez des concessionnaires VR au Canada et aux États-Unis. ${totalLabel}.`
        : `Find RV dealers across North America. Browse ${totalLabel} with brands, services, and contact info.`}
      canonical="/dealers"
      schema={[dealerSchema]}
    >
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-blue-800 text-white pt-24 pb-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            {language === 'fr' ? 'Répertoire' : 'Directory'}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {language === 'fr' ? 'Trouvez un concessionnaire VR' : 'Find an RV Dealer'}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
            {language === 'fr'
              ? 'Parcourez notre répertoire de concessionnaires VR vérifiés au Canada et aux États-Unis.'
              : 'Browse our directory of RV dealers across Canada and the United States.'}
          </p>
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder={language === 'fr' ? 'Ville, province ou nom…' : 'City, province, or name…'}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <select
              value={brand}
              onChange={e => { setBrand(e.target.value); setPage(1); }}
              className="px-4 py-3 rounded-lg text-gray-900 text-sm focus:outline-none bg-white"
            >
              <option value="">{language === 'fr' ? 'Toutes les marques' : 'All brands'}</option>
              {allBrands.slice(0, 20).map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Filters + count row */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500 flex-1">{totalLabel}</span>
          <div className="flex gap-2">
            {[['', language === 'fr' ? 'Tous' : 'All'], ['CA', '🇨🇦 CA'], ['US', '🇺🇸 US']].map(([val, label]) => (
              <button key={val}
                onClick={() => { setCountry(val); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${country === val ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >{label}</button>
            ))}
          </div>
          <div className="flex gap-1 border border-gray-200 rounded-lg p-0.5">
            <button onClick={() => setView('grid')} className={`p-1.5 rounded ${view === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded ${view === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </section>

      {/* Province quick-filters */}
      {provincesData && provincesData.length > 0 && (
        <section className="bg-gray-50 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            {provincesData.slice(0, 12).map((p: any) => (
              <button key={p.stateProvince}
                onClick={() => { setSearch(p.stateProvince); setPage(1); }}
                className="px-3 py-1 rounded-full text-xs whitespace-nowrap bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary transition-colors"
              >
                {p.stateProvince} ({Number(p.count)})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Dealer grid/list */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className={view === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
            {Array.from({ length: 12 }).map((_, i) => <DealerCardSkeleton key={i} />)}
          </div>
        ) : dealers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <svg className="mx-auto mb-4 opacity-30" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p className="text-lg">{language === 'fr' ? 'Aucun concessionnaire trouvé.' : 'No dealers found.'}</p>
            <button onClick={() => { setSearch(''); setBrand(''); setCountry(''); setPage(1); }} className="mt-4 text-primary underline text-sm">
              {language === 'fr' ? 'Réinitialiser les filtres' : 'Clear filters'}
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dealers.map((dealer: any) => (
              <Link key={dealer.id} href={`/dealers/listing/${dealer.slug}`}>
                <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full flex flex-col">
                  {/* Card header */}
                  <div className="bg-gradient-to-br from-primary/10 to-blue-50 p-5 flex items-start gap-3">
                    {dealer.logoUrl ? (
                      <img src={dealer.logoUrl} alt={dealer.name} className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-100 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                          <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/>
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <h2 className="font-semibold text-gray-900 text-sm leading-snug truncate">{dealer.name}</h2>
                        {dealer.isVerified && (
                          <span className="flex-shrink-0 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-medium">DS360</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{dealer.city}{dealer.stateProvince ? `, ${dealer.stateProvince}` : ''} · {dealer.country}</p>
                    </div>
                  </div>
                  {/* Card body */}
                  <div className="p-4 flex flex-col flex-1">
                    {dealer.brandsCarried && dealer.brandsCarried.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {dealer.brandsCarried.slice(0, 4).map((b: string) => (
                          <span key={b} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{b}</span>
                        ))}
                        {dealer.brandsCarried.length > 4 && (
                          <span className="text-xs text-gray-400">+{dealer.brandsCarried.length - 4}</span>
                        )}
                      </div>
                    )}
                    <div className="mt-auto flex items-center justify-between">
                      {dealer.isClaimed ? (
                        <span className="text-xs text-emerald-600 flex items-center gap-1">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          {language === 'fr' ? 'Réclamé' : 'Claimed'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">{language === 'fr' ? 'Non réclamé' : 'Unclaimed'}</span>
                      )}
                      <span className="text-xs text-primary font-medium">
                        {language === 'fr' ? 'Voir →' : 'View →'}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {dealers.map((dealer: any) => (
              <Link key={dealer.id} href={`/dealers/listing/${dealer.slug}`}>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md cursor-pointer transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                      <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm truncate">{dealer.name}</span>
                      {dealer.isVerified && <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded font-medium">DS360</span>}
                      {dealer.isClaimed && <span className="bg-emerald-50 text-emerald-600 text-xs px-1.5 py-0.5 rounded">Claimed</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{dealer.city}{dealer.stateProvince ? `, ${dealer.stateProvince}` : ''} · {dealer.country}</p>
                  </div>
                  {dealer.brandsCarried && dealer.brandsCarried.length > 0 && (
                    <div className="hidden sm:flex gap-1">
                      {dealer.brandsCarried.slice(0, 3).map((b: string) => (
                        <span key={b} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{b}</span>
                      ))}
                    </div>
                  )}
                  <svg className="flex-shrink-0 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">
              {language === 'fr' ? '← Précédent' : '← Previous'}
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">{page} / {pagination.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50">
              {language === 'fr' ? 'Suivant →' : 'Next →'}
            </button>
          </div>
        )}
      </section>

      {/* CTA for dealers */}
      <section className="bg-gradient-to-r from-primary to-blue-800 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {language === 'fr' ? 'Êtes-vous un concessionnaire VR?' : 'Are you an RV dealer?'}
          </h2>
          <p className="text-blue-100 mb-6">
            {language === 'fr'
              ? 'Réclamez votre page gratuitement et rejoignez les concessionnaires qui utilisent Dealer Suite 360 pour gérer leurs réclamations de garantie, financement, et plus.'
              : 'Claim your free listing and join dealers using Dealer Suite 360 to manage warranty claims, financing, F&I, and more — all in one platform.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book-demo">
              <button className="bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                {language === 'fr' ? 'Demander une démo' : 'Request a Demo'}
              </button>
            </Link>
            <Link href="/signup">
              <button className="border border-white/40 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
                {language === 'fr' ? 'Créer un compte' : 'Create Account'}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
