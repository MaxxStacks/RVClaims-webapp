import { Package, Wrench, Clock, ShoppingCart } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";

export function PartsSection() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Package,
      title: t('partsSection.features.claimsParts.title'),
      description: t('partsSection.features.claimsParts.description'),
      testId: 'feature-claims-parts'
    },
    {
      icon: ShoppingCart,
      title: t('partsSection.features.directPurchase.title'),
      description: t('partsSection.features.directPurchase.description'),
      testId: 'feature-direct-purchase'
    },
    {
      icon: Wrench,
      title: t('partsSection.features.quality.title'),
      description: t('partsSection.features.quality.description'),
      testId: 'feature-quality'
    },
    {
      icon: Clock,
      title: t('partsSection.features.fastShipping.title'),
      description: t('partsSection.features.fastShipping.description'),
      testId: 'feature-fast-shipping'
    }
  ];

  return (
    <section id="parts" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4" data-testid="badge-parts">
            {t('partsSection.badge')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-parts-title">
            {t('partsSection.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-parts-description">
            {t('partsSection.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-card rounded-xl p-6 border border-border hover-lift" data-testid={feature.testId}>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <h3 className="text-2xl font-semibold mb-4" data-testid="text-parts-cta-title">
            {t('partsSection.cta.title')}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto" data-testid="text-parts-cta-description">
            {t('partsSection.cta.description')}
          </p>
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-buy-parts"
          >
            <ShoppingCart className="mr-2" size={20} />
            {t('partsSection.cta.button')}
          </Button>
        </div>
      </div>
    </section>
  );
}
