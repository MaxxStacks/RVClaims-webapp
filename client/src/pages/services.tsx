import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/hooks/use-language";

export default function Services() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle={t('servicesPage.title')}
      seoDescription={t('servicesPage.description')}
      seoKeywords="A-Z claims processing, warranty claims services, revenue optimization, Canadian RV dealers"
      canonical="/services"
    >
      <PageHero
        badge={t('servicesPage.badge')}
        title={t('servicesPage.title')}
        description={t('servicesPage.description')}
      />
      
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-semibold mb-4">{t('servicesPage.processing.title')}</h3>
              <p className="text-muted-foreground mb-6">{t('servicesPage.processing.description')}</p>
              <ul className="space-y-3 text-muted-foreground">
                <li>• {t('servicesPage.processing.feature1')}</li>
                <li>• {t('servicesPage.processing.feature2')}</li>
                <li>• {t('servicesPage.processing.feature3')}</li>
                <li>• {t('servicesPage.processing.feature4')}</li>
              </ul>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-semibold mb-4">{t('servicesPage.optimization.title')}</h3>
              <p className="text-muted-foreground mb-6">{t('servicesPage.optimization.description')}</p>
              <ul className="space-y-3 text-muted-foreground">
                <li>• {t('servicesPage.optimization.feature1')}</li>
                <li>• {t('servicesPage.optimization.feature2')}</li>
                <li>• {t('servicesPage.optimization.feature3')}</li>
                <li>• {t('servicesPage.optimization.feature4')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}