import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/hooks/use-language";

export default function RevenueServices() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle={t('revenueServicesPage.title')}
      seoDescription={t('revenueServicesPage.description')}
      seoKeywords="dealership revenue, F&I services, digital marketing, parts management, service support"
      canonical="/revenue-services"
    >
      <PageHero
        badge={t('revenueServicesPage.badge')}
        title={t('revenueServicesPage.title')}
        description={t('revenueServicesPage.description')}
      />
      
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('revenueServicesPage.finance.title')}</h3>
              <p className="text-muted-foreground mb-4">{t('revenueServicesPage.finance.description')}</p>
              <div className="text-2xl font-bold text-primary">+20% Revenue</div>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('revenueServicesPage.marketing.title')}</h3>
              <p className="text-muted-foreground mb-4">{t('revenueServicesPage.marketing.description')}</p>
              <div className="text-2xl font-bold text-primary">+50% Revenue</div>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('revenueServicesPage.parts.title')}</h3>
              <p className="text-muted-foreground mb-4">{t('revenueServicesPage.parts.description')}</p>
              <div className="text-2xl font-bold text-primary">+30% Revenue</div>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('revenueServicesPage.service.title')}</h3>
              <p className="text-muted-foreground mb-4">{t('revenueServicesPage.service.description')}</p>
              <div className="text-2xl font-bold text-primary">+40% Revenue</div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}