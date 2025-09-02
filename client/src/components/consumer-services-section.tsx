import { Shield, Wrench, Car } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function ConsumerServicesSection() {
  const { t } = useLanguage();

  const services = [
    {
      key: 'roadside',
      icon: Car,
      price: '$149/year'
    },
    {
      key: 'extended',
      icon: Shield,
      price: '$299/year'
    },
    {
      key: 'protection',
      icon: Wrench,
      price: '$199/year'
    }
  ];

  const handlePurchase = (serviceKey: string) => {
    // This will eventually integrate with payment processing
    console.log(`Initiating purchase for ${serviceKey}`);
    // For now, show an alert
    alert(t(`consumerServices.services.${serviceKey}.purchaseMessage`));
  };

  return (
    <section className="py-24 bg-gray-50" id="consumer-services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            {t('consumerServices.badge')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-consumer-services-title">
            {t('consumerServices.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-consumer-services-description">
            {t('consumerServices.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {services.map(({ key, icon: Icon, price }) => (
            <div
              key={key}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100 flex flex-col h-full"
              data-testid={`card-consumer-service-${key}`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="text-primary w-6 h-6" />
                </div>
                <div className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {price}
                </div>
              </div>
              
              <h3 className="font-semibold text-xl mb-3 text-foreground min-h-[3.5rem] flex items-center" data-testid={`text-consumer-service-title-${key}`}>
                {t(`consumerServices.services.${key}.title`)}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow" data-testid={`text-consumer-service-description-${key}`}>
                {t(`consumerServices.services.${key}.description`)}
              </p>

              <ul className="space-y-2 text-sm text-muted-foreground mb-8">
                <li className="flex items-center" data-testid={`text-consumer-service-feature-${key}-0`}>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                  {t(`consumerServices.services.${key}.feature1`)}
                </li>
                <li className="flex items-center" data-testid={`text-consumer-service-feature-${key}-1`}>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                  {t(`consumerServices.services.${key}.feature2`)}
                </li>
                <li className="flex items-center" data-testid={`text-consumer-service-feature-${key}-2`}>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                  {t(`consumerServices.services.${key}.feature3`)}
                </li>
                <li className="flex items-center" data-testid={`text-consumer-service-feature-${key}-3`}>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0"></div>
                  {t(`consumerServices.services.${key}.feature4`)}
                </li>
              </ul>

              <button
                onClick={() => handlePurchase(key)}
                className="w-full bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors mt-auto"
                data-testid={`button-purchase-${key}`}
              >
                {t(`consumerServices.services.${key}.shortPurchaseButton`)}
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-8 lg:p-12 text-center border border-gray-100">
          <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4" data-testid="text-consumer-services-cta-title">
            {t('consumerServices.cta.title')}
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-consumer-services-cta-description">
            {t('consumerServices.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#contact" 
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="button-consumer-services-contact"
            >
              {t('consumerServices.cta.contactButton')}
            </a>
            <a 
              href="tel:1-800-RV-CLAIM" 
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors"
              data-testid="button-consumer-services-call"
            >
              {t('consumerServices.cta.callButton')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}