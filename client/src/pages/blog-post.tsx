import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";

function formatDate(dateStr: string, language: 'en' | 'fr'): string {
  const date = new Date(dateStr);
  if (language === 'fr') {
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPostPage() {
  const { language } = useLanguage();
  const [, params] = useRoute('/blog/:slug');
  const slug = params?.slug;

  const { data: post, isLoading, isError } = useQuery<any>({
    queryKey: ['/api/blog', slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/${slug}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <PageLayout seoTitle="Loading… — Dealer Suite 360" seoDescription="">
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="space-y-2 mt-8">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded" />)}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isError || !post) {
    return (
      <PageLayout seoTitle="Post not found — Dealer Suite 360" seoDescription="">
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {language === 'fr' ? 'Article introuvable' : 'Post not found'}
          </h1>
          <Link href="/blog">
            <button className="text-primary underline">
              {language === 'fr' ? '← Retour au blogue' : '← Back to blog'}
            </button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: 'DealerSuite360' },
    publisher: { '@type': 'Organization', name: 'DealerSuite360', url: 'https://dealersuite360.com' },
    mainEntityOfPage: `https://dealersuite360.com/blog/${post.slug}`,
    keywords: post.metaKeywords || '',
  };

  return (
    <PageLayout
      seoTitle={post.metaTitle || post.title}
      seoDescription={post.metaDescription || post.excerpt}
      canonical={`/blog/${post.slug}`}
      schema={[articleSchema]}
    >

      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-blue-800 text-white pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog">
            <button className="text-blue-200 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {language === 'fr' ? 'Retour au blogue' : 'Back to blog'}
            </button>
          </Link>
          {post.category && (
            <span className="inline-block bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
              {post.category}
            </span>
          )}
          <h1 className="text-2xl md:text-4xl font-bold leading-snug mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-blue-200 text-sm">
            {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, language as 'en' | 'fr')}</time>}
            {post.readTimeMinutes && <span>{post.readTimeMinutes} min read</span>}
            {post.wordCount && <span>{post.wordCount.toLocaleString()} words</span>}
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        <div
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-a:text-primary prose-li:text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-blue-800 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">
            {language === 'fr' ? 'Prêt à optimiser vos réclamations?' : 'Ready to streamline your warranty claims?'}
          </h2>
          <p className="text-blue-100 mb-6 text-sm">
            {language === 'fr'
              ? 'Découvrez comment Dealer Suite 360 automatise le traitement des réclamations pour les concessionnaires VR.'
              : 'See how Dealer Suite 360 automates claims processing for RV dealerships across North America.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/book-demo">
              <button className="bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                {language === 'fr' ? 'Demander une démo' : 'Request a Demo'}
              </button>
            </Link>
            <Link href="/blog">
              <button className="border border-white/40 text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
                {language === 'fr' ? 'Lire plus d\'articles' : 'Read more articles'}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
