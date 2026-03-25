import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";

const CATEGORIES = ['All', 'Warranty Guides', 'Inspections', 'Dealership Operations', 'Industry', 'Guides'];

const CATEGORY_COLORS: Record<string, string> = {
  'Warranty Guides': 'bg-blue-100 text-blue-700',
  'Inspections': 'bg-emerald-100 text-emerald-700',
  'Dealership Operations': 'bg-amber-100 text-amber-700',
  'Industry': 'bg-purple-100 text-purple-700',
  'Guides': 'bg-sky-100 text-sky-700',
};

function formatDate(dateStr: string, language: 'en' | 'fr'): string {
  const date = new Date(dateStr);
  if (language === 'fr') {
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="w-full h-40 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
      </div>
    </div>
  );
}

export default function BlogPage() {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);

  const categoryParam = activeCategory === 'All' ? '' : activeCategory;
  const { data, isLoading } = useQuery<any>({
    queryKey: ['/api/blog', page, categoryParam],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '9' });
      if (categoryParam) params.set('category', categoryParam);
      const res = await fetch(`/api/blog?${params}`);
      return res.json();
    },
  });

  const posts = data?.posts ?? [];
  const pagination = data?.pagination;

  return (
    <PageLayout
      seoTitle={language === 'fr' ? 'Blogue — Dealer Suite 360' : 'Blog — Dealer Suite 360'}
      seoDescription={language === 'fr'
        ? "Guides pratiques, tendances de l'industrie et meilleures pratiques pour les concessionnaires VR."
        : 'Practical guides, industry trends, and best practices for RV dealerships.'}
      canonical="/blog"
    >

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-blue-800 text-white pt-24 pb-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
            {language === 'fr' ? 'Blogue' : 'Blog'}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {language === 'fr' ? 'Ressources pour concessionnaires VR' : 'Resources for RV Dealers'}
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            {language === 'fr'
              ? "Guides pratiques, analyses du secteur et conseils d'experts pour maximiser vos réclamations et vos revenus."
              : 'Practical guides, industry insights, and expert tips to maximize your claims and revenue.'}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Posts grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">
              {language === 'fr' ? 'Aucun article pour l\'instant.' : 'No posts yet — check back soon.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full flex flex-col">
                    <div className="w-full h-40 bg-gradient-to-br from-primary/80 to-blue-700 flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'}`}>
                          {post.category}
                        </span>
                        {post.readTimeMinutes && (
                          <span className="text-xs text-gray-400">{post.readTimeMinutes} min read</span>
                        )}
                      </div>
                      <h2 className="font-semibold text-gray-900 text-base leading-snug mb-2 line-clamp-2">{post.title}</h2>
                      <p className="text-sm text-gray-500 line-clamp-3 flex-1">{post.excerpt}</p>
                      {post.publishedAt && (
                        <p className="text-xs text-gray-400 mt-3">{formatDate(post.publishedAt, language as 'en' | 'fr')}</p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  {language === 'fr' ? 'Précédent' : 'Previous'}
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">
                  {page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-40 hover:bg-gray-50"
                >
                  {language === 'fr' ? 'Suivant' : 'Next'}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-blue-800 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {language === 'fr' ? 'Prêt à optimiser vos réclamations?' : 'Ready to streamline your claims?'}
          </h2>
          <p className="text-blue-100 mb-6">
            {language === 'fr'
              ? "Rejoignez les concessionnaires VR qui utilisent Dealer Suite 360 pour maximiser leurs revenus."
              : 'Join RV dealers using Dealer Suite 360 to maximize warranty revenue and reduce denials.'}
          </p>
          <Link href="/book-demo">
            <button className="bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              {language === 'fr' ? 'Demander une démo' : 'Request a Demo'}
            </button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
