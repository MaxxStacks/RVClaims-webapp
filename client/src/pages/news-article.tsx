import { Link, useParams } from "wouter";
import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { newsArticles, NewsCategory } from "@/data/newsData";
import NotFound from "@/pages/not-found";

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
    <div className={`w-full h-56 md:h-72 bg-gradient-to-br ${gradients[category]} rounded-xl`} />
  );
}

export default function NewsArticlePage() {
  const { t, language } = useLanguage();
  const params = useParams<{ id: string }>();
  const lang = language as 'en' | 'fr';
  const newsBase = lang === 'fr' ? '/actualites' : '/news';

  const article = newsArticles.find((a) => a.id === params.id);
  if (!article) return <NotFound />;

  const articleData = lang === 'fr' ? article.fr : article.en;

  const categoryLabel: Record<NewsCategory, string> = {
    company: t('news.categoryCompany'),
    product: t('news.categoryProduct'),
    industry: t('news.categoryIndustry'),
  };

  // Related: same category, excluding current, up to 3
  const related = newsArticles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .concat(newsArticles.filter((a) => a.id !== article.id && a.category !== article.category))
    .slice(0, 3);

  return (
    <PageLayout
      seoTitle={`${articleData.title} | DealerSuite 360`}
      seoDescription={articleData.summary}
      canonical={`${newsBase}/${article.id}`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link
          href={newsBase}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8 font-medium"
        >
          {t('news.backToNews')}
        </Link>

        {/* Hero image */}
        <ArticleImagePlaceholder category={article.category} />

        {/* Article header */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${categoryColor(article.category)}`}>
              {categoryLabel[article.category]}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDate(article.date, lang)}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
            {articleData.title}
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-4">
            {articleData.summary}
          </p>
        </div>

        {/* Divider */}
        <hr className="my-8 border-border" />

        {/* Article body */}
        <div
          className="prose prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-foreground
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
            prose-ul:text-muted-foreground prose-li:mb-1
            prose-strong:text-foreground prose-strong:font-semibold"
          dangerouslySetInnerHTML={{ __html: articleData.content }}
        />
      </div>

      {/* More Articles */}
      {related.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {t('news.moreArticles')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => {
                const relData = lang === 'fr' ? rel.fr : rel.en;
                return (
                  <Link
                    key={rel.id}
                    href={`${newsBase}/${rel.id}`}
                    className="group flex flex-col bg-white rounded-xl border border-border shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
                  >
                    <div className={`w-full h-32 bg-gradient-to-br ${
                      rel.category === 'company' ? 'from-blue-600 to-primary' :
                      rel.category === 'product' ? 'from-emerald-500 to-teal-700' :
                      'from-amber-500 to-orange-600'
                    } rounded-t-xl`} />
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${categoryColor(rel.category)}`}>
                          {categoryLabel[rel.category]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(rel.date, lang)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {relData.title}
                      </h3>
                      <span className="text-xs font-semibold text-primary group-hover:underline">
                        {t('news.readMore')}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
