import { Check, Monitor, Users } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function TechnologySection() {
  const { t } = useLanguage();

  const features = [
    {
      title: t('technologySection.automation.title'),
      description: t('technologySection.automation.description'),
      testId: 'feature-automation'
    },
    {
      title: t('technologySection.integration.title'),
      description: t('technologySection.integration.description'),
      testId: 'feature-integration'
    },
    {
      title: t('technologySection.analytics.title'),
      description: t('technologySection.analytics.description'),
      testId: 'feature-analytics'
    }
  ];

  const portalFeatures = [
    {
      title: t('technologySection.portals.dealerPortal.title'),
      description: t('technologySection.portals.dealerPortal.description'),
      icon: Monitor,
      testId: 'feature-dealer-portal'
    },
    {
      title: t('technologySection.portals.clientPortal.title'),
      description: t('technologySection.portals.clientPortal.description'),
      icon: Users,
      testId: 'feature-client-portal'
    },
    {
      title: t('technologySection.portals.commitment.title'),
      description: t('technologySection.portals.commitment.description'),
      icon: Check,
      testId: 'feature-commitment'
    }
  ];

  return (
    <section id="technology" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Technology Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <span data-testid="text-technology-badge">{t('technologySection.badge')}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-technology-title">
              {t('technologySection.title')}
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-technology-description">
              {t('technologySection.description')}
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
          </div>
          
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Professional business analytics and claims management dashboard" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="img-technology"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
          </div>
        </div>

        {/* Portal Section */}
        <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4" data-testid="text-portals-title">
              {t('technologySection.portals.title')}
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="text-portals-description">
              {t('technologySection.portals.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {portalFeatures.map((feature, index) => (
              <div key={index} className="bg-card rounded-xl p-6 border border-border" data-testid={feature.testId}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <h4 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
