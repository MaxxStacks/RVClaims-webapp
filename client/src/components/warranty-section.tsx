import { Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function WarrantySection() {
  const { t } = useLanguage();

  const features = [
    {
      title: t('warrantyExtendedPage.manufacturerIntegration.title'),
      description: t('warrantyExtendedPage.manufacturerIntegration.description'),
      testId: 'feature-manufacturer-integration'
    },
    {
      title: t('warrantyExtendedPage.dynamicPricing.title'),
      description: t('warrantyExtendedPage.dynamicPricing.description'),
      testId: 'feature-dynamic-pricing'
    },
    {
      title: t('warrantyExtendedPage.automatedClaims.title'),
      description: t('warrantyExtendedPage.automatedClaims.description'),
      testId: 'feature-automated-claims'
    }
  ];

  return (
    <section id="warranty" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75"
              alt="Warranty and extended service plans"
              className="rounded-2xl shadow-2xl w-full h-auto"
              width={576}
              height={432}
              loading="lazy"
              data-testid="img-warranty"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <span data-testid="text-warranty-badge">{t('warrantyExtendedPage.badge')}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-warranty-title">
              {t('warrantyExtendedPage.subtitle')}
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-warranty-description">
              {t('warrantyExtendedPage.description')}
            </p>
            
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3" data-testid={feature.testId}>
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-primary" size={12} />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/warranty-extended-service">
              <Button size="lg" className="mt-4" data-testid="button-warranty-learn-more">
                {t('warrantyExtendedPage.cta')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
