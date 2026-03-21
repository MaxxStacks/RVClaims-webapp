import { useState } from "react";
import { Link, useLocation } from "wouter";
import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { newsArticles, NewsCategory } from "@/data/newsData";

type Filter = 'all' | NewsCategory;

function formatDate(dateStr: string, language: 'en' | 'fr'): string {
  const date = new Date(dateStr + 'T00:00:00');
  if (language === 'fr') {
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function categoryColor(cat: NewsCategory): string {
  switch (cat) {
    case 'company': return 'bg-blue-100 text-blue-700';
    case 'product': return 'bg-emerald-100 text-emerald-700';
    case 'industry': return 'bg-amber-100 text-amber-700';
  }
}

function ArticleImagePlaceholder({ category }: { category: NewsCategory }) {
  const gradients: Record<NewsCategory, string> = {
    company: 'from-blue-600 to-primary',
    product: 'from-emerald-500 to-teal-700',
    industry: 'from-amber-500 to-orange-600',
  };
  return (
    <div className={`w-full h-40 bg-gradient-to-br ${gradients[category]} rounded-t-xl`} />
  );
}

export default function NewsPage() {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const [filter, setFilter] = useState<Filter>('all');

  const lang = language as 'en' | 'fr';
  const newsBase = lang === 'fr' ? '/actualites' : '/news';

  const sorted = [...newsArticles].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const filtered = filter === 'all' ? sorted : sorted.filter((a) => a.category === filter);

  const filterTabs: { key: Filter; label: string }[] = [
    { key: 'all', label: t('news.filterAll') },
    { key: 'company', label: t('news.filterCompany') },
    { key: 'product', label: t('news.filterProduct') },
    { key: 'industry', label: t('news.filterIndustry') },
  ];

  const categoryLabels: Record<NewsCategory, string> = {
    company: t('news.categoryCompany'),
    product: t('news.categoryProduct'),
    industry: t('news.categoryIndustry'),
  };

  return (
    <PageLayout
      seoTitle={`${t('news.pageTitle')} | DealerSuite 360`}
      seoDescription={t('news.pageDescription')}
      canonical={location}
    >
      {/* Page Hero */}
      <section className="relative bg-gradient-to-br from-primary/5 via-white to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              DealerSuite 360
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              {t('news.pageTitle')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('news.pageDescription')}
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="border-b border-border bg-white sticky top-[var(--header-height,64px)] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-3 hide-scrollbar">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <section className="py-12 bg-gray-50 min-h-[400px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => {
              const articleData = lang === 'fr' ? article.fr : article.en;
              return (
                <Link
                  key={article.id}
                  href={`${newsBase}/${article.id}`}
                  className="group flex flex-col bg-white rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                >
                  <ArticleImagePlaceholder category={article.category} />
                  <div className="flex flex-col flex-1 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColor(article.category)}`}>
                        {categoryLabels[article.category]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(article.date, lang)}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-3">
                      {articleData.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                      {articleData.summary}
                    </p>
                    <span className="text-sm font-semibold text-primary group-hover:underline mt-auto">
                      {t('news.readMore')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              {lang === 'fr' ? 'Aucun article trouvé.' : 'No articles found.'}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
