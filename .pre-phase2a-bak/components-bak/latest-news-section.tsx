import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { newsArticles, NewsCategory } from "@/data/newsData";

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

function CategoryLabel({ cat, language }: { cat: NewsCategory; language: 'en' | 'fr' }) {
  const labels: Record<NewsCategory, { en: string; fr: string }> = {
    company: { en: 'Company', fr: 'Entreprise' },
    product: { en: 'Product', fr: 'Produit' },
    industry: { en: 'Industry', fr: 'Industrie' },
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColor(cat)}`}>
      {labels[cat][language]}
    </span>
  );
}

function ArticleImagePlaceholder({ category }: { category: NewsCategory }) {
  const gradients: Record<NewsCategory, string> = {
    company: 'from-blue-600 to-primary',
    product: 'from-emerald-500 to-teal-700',
    industry: 'from-amber-500 to-orange-600',
  };
  return (
    <div className={`w-full h-44 bg-gradient-to-br ${gradients[category]} rounded-t-xl`} />
  );
}

export function LatestNewsSection() {
  const { t, language } = useLanguage();

  // 3 most recent — already sorted newest-first in source; take first 3
  const latest = [...newsArticles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const newsBase = language === 'fr' ? '/actualites' : '/news';
  const featuredId = 'ds360-secures-11-million-funding';

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            DealerSuite 360
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            {t('news.latestHeading')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('news.latestSubheading')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latest.map((article) => {
            const isFeatured = article.id === featuredId;
            const articleData = language === 'fr' ? article.fr : article.en;
            return (
              <Link
                key={article.id}
                href={`${newsBase}/${article.id}`}
                className={`group flex flex-col bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden ${
                  isFeatured ? 'ring-2 ring-primary/40 md:scale-[1.02] md:shadow-md' : 'border border-border'
                }`}
              >
                {/* Image area */}
                <div className="relative">
                  <ArticleImagePlaceholder category={article.category} />
                  {isFeatured && (
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow">
                        {t('news.featured')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <CategoryLabel cat={article.category} language={language as 'en' | 'fr'} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(article.date, language as 'en' | 'fr')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-3">
                    {articleData.title}
                  </h3>

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

        {/* View all link */}
        <div className="text-center mt-10">
          <Link
            href={newsBase}
            className="inline-flex items-center px-6 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors"
          >
            {language === 'fr' ? 'Voir toutes les nouvelles' : 'View All News'}
          </Link>
        </div>
      </div>
    </section>
  );
}
