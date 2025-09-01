import { DollarSign, TrendingUp, Users, Wrench, Smartphone, RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function UpsellServicesSection() {
  const { t } = useLanguage();

  const services = [
    {
      key: 'finance',
      icon: DollarSign,
      revenue: '+20%'
    },
    {
      key: 'marketing',
      icon: TrendingUp,
      revenue: '+50%'
    },
    {
      key: 'parts',
      icon: Wrench,
      revenue: '+30%'
    },
    {
      key: 'service',
      icon: Users,
      revenue: '+40%'
    },
    {
      key: 'technology',
      icon: Smartphone,
      revenue: '+25%'
    },
    {
      key: 'consignment',
      icon: RefreshCw,
      revenue: '+35%'
    }
  ];

  return (
    <section className="py-24 bg-white" id="upsell-services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t('upsellServices.badge')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-upsell-title">
            {t('upsellServices.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-upsell-description">
            {t('upsellServices.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map(({ key, icon: Icon, revenue }) => (
            <div
              key={key}
              className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-300 group"
              data-testid={`card-service-${key}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="text-primary w-6 h-6" />
                </div>
                <div className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {revenue}
                </div>
              </div>
              
              <h3 className="font-semibold text-xl mb-3 text-foreground" data-testid={`text-service-title-${key}`}>
                {t(`upsellServices.services.${key}.title`)}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-4" data-testid={`text-service-description-${key}`}>
                {t(`upsellServices.services.${key}.description`)}
              </p>

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center" data-testid={`text-service-feature-${key}-0`}>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                  {t(`upsellServices.services.${key}.feature1`)}
                </li>
                <li className="flex items-center" data-testid={`text-service-feature-${key}-1`}>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                  {t(`upsellServices.services.${key}.feature2`)}
                </li>
                <li className="flex items-center" data-testid={`text-service-feature-${key}-2`}>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                  {t(`upsellServices.services.${key}.feature3`)}
                </li>
                <li className="flex items-center" data-testid={`text-service-feature-${key}-3`}>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                  {t(`upsellServices.services.${key}.feature4`)}
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 lg:p-12 text-center">
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4" data-testid="text-upsell-cta-title">
            {t('upsellServices.cta.title')}
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-upsell-cta-description">
            {t('upsellServices.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="button-upsell-contact"
            >
              {t('upsellServices.cta.contactButton')}
            </a>
            <a 
              href="tel:1-800-RV-CLAIM" 
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors"
              data-testid="button-upsell-call"
            >
              {t('upsellServices.cta.callButton')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}