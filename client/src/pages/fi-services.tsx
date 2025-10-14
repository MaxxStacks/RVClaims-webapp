import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/hooks/use-language";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FIServices() {
  const { t } = useLanguage();

  const features = [
    'outsourcing',
    'productPortfolio',
    'compliance',
    'training',
    'reports'
  ];

  return (
    <PageLayout
      seoTitle={t('fiServicesPage.title')}
      seoDescription={t('fiServicesPage.description')}
      seoKeywords="F&I services, finance and insurance, dealership F&I, F&I outsourcing, GAP insurance, extended warranty"
      canonical="/fi-services"
    >
      <PageHero
        badge={t('fiServicesPage.badge')}
        title={t('fiServicesPage.subtitle')}
        description={t('fiServicesPage.description')}
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
                      {t(`fiServicesPage.${feature}.title`)}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t(`fiServicesPage.${feature}.description`)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-2xl lg:text-3xl font-semibold text-foreground italic">
            "{t('fiServicesPage.quote')}"
          </blockquote>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Elevate Your F&I Performance
          </h2>
          <p className="text-xl text-muted-foreground">
            Connect with our F&I specialists to boost dealership profits by 20% on average.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto" data-testid="button-contact-fi">
                {t('fiServicesPage.cta')}
              </Button>
            </Link>
            <a href="tel:1-800-RV-CLAIM">
              <Button size="lg" variant="outline" className="w-full sm:w-auto" data-testid="button-call-fi">
                Call 1-800-RV-CLAIM
              </Button>
            </a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
