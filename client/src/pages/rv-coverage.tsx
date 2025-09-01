import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/hooks/use-language";

export default function RvCoverage() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle={t('rvCoveragePage.title')}
      seoDescription={t('rvCoveragePage.description')}
      seoKeywords="travel trailers, fifth wheels, class A motorhomes, class C motorhomes, RV coverage"
      canonical="/rv-coverage"
    >
      <PageHero
        badge={t('rvCoveragePage.badge')}
        title={t('rvCoveragePage.title')}
        description={t('rvCoveragePage.description')}
      />
      
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <h3 className="text-xl font-semibold mb-4">{t('rvCoveragePage.travelTrailers.title')}</h3>
              <p className="text-muted-foreground">{t('rvCoveragePage.travelTrailers.description')}</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <h3 className="text-xl font-semibold mb-4">{t('rvCoveragePage.fifthWheels.title')}</h3>
              <p className="text-muted-foreground">{t('rvCoveragePage.fifthWheels.description')}</p>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <h3 className="text-xl font-semibold mb-4">{t('rvCoveragePage.classAC.title')}</h3>
              <p className="text-muted-foreground">{t('rvCoveragePage.classAC.description')}</p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}