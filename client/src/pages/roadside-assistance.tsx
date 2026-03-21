import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/hooks/use-language";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function RoadsideAssistance() {
  const { t } = useLanguage();

  const features = [
    'dispatch',
    'towing',
    'tireBattery',
    'lockout',
    'fuelDelivery',
    'tripInterruption',
  ];

  return (
    <PageLayout
      seoTitle={t('roadsideAssistancePage.title')}
      seoDescription={t('roadsideAssistancePage.description')}
      seoKeywords="RV roadside assistance, emergency towing, RV breakdown, 24/7 roadside support, dealership network"
      canonical="/roadside-assistance"
    >
      <PageHero
        badgeType="Q4"
        title={t('roadsideAssistancePage.subtitle')}
        description={t('roadsideAssistancePage.description')}
      />

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature}
                className="bg-card rounded-xl p-8 border-2 border-primary/20 hover:border-primary/40 hover-lift transition-all duration-300"
                data-testid={`card-${feature}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="text-primary w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                      {t(`roadsideAssistancePage.${feature}.title`)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(`roadsideAssistancePage.${feature}.description`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            {t('roadsideAssistancePage.ctaTitle')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('roadsideAssistancePage.ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto" data-testid="button-signup-roadside-assistance">
                {t('roadsideAssistancePage.cta')}
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-contact-roadside-assistance">
                {t('roadsideAssistancePage.ctaSecondary')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
