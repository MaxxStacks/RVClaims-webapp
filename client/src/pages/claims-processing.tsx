import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/hooks/use-language";

export default function ClaimsProcessing() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle={t('claimsPage.title')}
      seoDescription={t('claimsPage.description')}
      seoKeywords="DAF claims, PDI claims, warranty claims, extended warranty, insurance claims, RV dealers"
      canonical="/claims-processing"
    >
      <PageHero
        badge={t('claimsPage.badge')}
        title={t('claimsPage.title')}
        description={t('claimsPage.description')}
      />
      
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('claimsPage.daf.title')}</h3>
              <p className="text-muted-foreground">{t('claimsPage.daf.description')}</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('claimsPage.pdi.title')}</h3>
              <p className="text-muted-foreground">{t('claimsPage.pdi.description')}</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('claimsPage.warranty.title')}</h3>
              <p className="text-muted-foreground">{t('claimsPage.warranty.description')}</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('claimsPage.extended.title')}</h3>
              <p className="text-muted-foreground">{t('claimsPage.extended.description')}</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-4">{t('claimsPage.insurance.title')}</h3>
              <p className="text-muted-foreground">{t('claimsPage.insurance.description')}</p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}