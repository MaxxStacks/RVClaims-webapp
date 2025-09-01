import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/hooks/use-language";

export default function Technology() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle={t('technologyPage.title')}
      seoDescription={t('technologyPage.description')}
      seoKeywords="patent pending technology, claims automation, manufacturer integration, AI claims processing"
      canonical="/technology"
    >
      <PageHero
        badge={t('technologyPage.badge')}
        title={t('technologyPage.title')}
        description={t('technologyPage.description')}
      />
      
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('technologyPage.automation.title')}</h3>
              <p className="text-muted-foreground">{t('technologyPage.automation.description')}</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('technologyPage.integration.title')}</h3>
              <p className="text-muted-foreground">{t('technologyPage.integration.description')}</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('technologyPage.analytics.title')}</h3>
              <p className="text-muted-foreground">{t('technologyPage.analytics.description')}</p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}