import { Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function FIServicesSection() {
  const { t } = useLanguage();

  const features = [
    {
      title: t('fiServicesPage.outsourcing.title'),
      description: t('fiServicesPage.outsourcing.description'),
      testId: 'feature-outsourcing'
    },
    {
      title: t('fiServicesPage.productPortfolio.title'),
      description: t('fiServicesPage.productPortfolio.description'),
      testId: 'feature-product-portfolio'
    },
    {
      title: t('fiServicesPage.compliance.title'),
      description: t('fiServicesPage.compliance.description'),
      testId: 'feature-compliance'
    }
  ];

  return (
    <section id="fi-services" className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl px-6 py-16 sm:px-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <span data-testid="text-fi-badge">{t('fiServicesPage.badge')}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-fi-title">
              {t('fiServicesPage.subtitle')}
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-fi-description">
              {t('fiServicesPage.description')}
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

            <Link href="/fi-services">
              <Button size="lg" className="mt-4" data-testid="button-fi-learn-more">
                {t('fiServicesPage.cta')}
              </Button>
            </Link>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="F&I services and compliance" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="img-fi"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
