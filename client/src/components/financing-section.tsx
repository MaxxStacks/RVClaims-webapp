import { Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function FinancingSection() {
  const { t } = useLanguage();

  const features = [
    {
      title: t('financingPage.dealerIntegration.title'),
      description: t('financingPage.dealerIntegration.description'),
      testId: 'feature-dealer-integration'
    },
    {
      title: t('financingPage.approvalOptimization.title'),
      description: t('financingPage.approvalOptimization.description'),
      testId: 'feature-approval-optimization'
    },
    {
      title: t('financingPage.statusTracking.title'),
      description: t('financingPage.statusTracking.description'),
      testId: 'feature-status-tracking'
    }
  ];

  return (
    <section id="financing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1">
              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-semibold">NEW</span>
              <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-semibold" data-testid="text-financing-badge">Q2 2026</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-financing-title">
              {t('financingPage.subtitle')}
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-financing-description">
              {t('financingPage.description')}
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

            <Link href="/financing">
              <Button size="lg" className="mt-4" data-testid="button-financing-learn-more">
                {t('financingPage.cta')}
              </Button>
            </Link>
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1554224154-26032ffc0d07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Financing solutions for RV dealerships" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="img-financing"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
