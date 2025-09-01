import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/hooks/use-language";

export default function About() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle={t('aboutPage.title')}
      seoDescription={t('aboutPage.description')}
      seoKeywords="RV claims processing, Canadian RV dealers, warranty claims, 15 years experience, claims management"
      canonical="/about"
    >
      <PageHero
        badge={t('aboutPage.badge')}
        title={t('aboutPage.title')}
        description={t('aboutPage.description')}
      />
      
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('aboutPage.storyTitle')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('aboutPage.storyDescription')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-2xl font-semibold mb-6">{t('aboutPage.experienceTitle')}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t('aboutPage.experienceDescription')}
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">15+</div>
                  <div className="text-sm text-muted-foreground">{t('aboutPage.yearsExperience')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">{t('aboutPage.approvalRate')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">30%</div>
                  <div className="text-sm text-muted-foreground">{t('aboutPage.revenueIncrease')}</div>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-8">
              <h4 className="text-xl font-semibold mb-4">{t('aboutPage.locationTitle')}</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium">{t('aboutPage.headquarters')}</h5>
                  <p className="text-muted-foreground">Toronto, Ontario, Canada</p>
                </div>
                <div>
                  <h5 className="font-medium">{t('aboutPage.development')}</h5>
                  <p className="text-muted-foreground">Montreal, Quebec, Canada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}