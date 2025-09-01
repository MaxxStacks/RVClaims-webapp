import { ClipboardCheck, TrendingUp, Handshake, Shield } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function ServicesSection() {
  const { t } = useLanguage();

  const services = [
    {
      icon: ClipboardCheck,
      title: t('servicesSection.processing.title'),
      description: t('servicesSection.processing.description'),
      testId: 'card-processing'
    },
    {
      icon: TrendingUp,
      title: t('servicesSection.optimization.title'),
      description: t('servicesSection.optimization.description'),
      testId: 'card-optimization'
    },
    {
      icon: Handshake,
      title: t('servicesSection.integration.title'),
      description: t('servicesSection.integration.description'),
      testId: 'card-integration'
    },
    {
      icon: Shield,
      title: t('servicesSection.reduction.title'),
      description: t('servicesSection.reduction.description'),
      testId: 'card-reduction'
    }
  ];

  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-services-title">
            {t('servicesSection.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-services-description">
            {t('servicesSection.description')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-card rounded-xl p-6 border border-border hover-lift" data-testid={service.testId}>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
