import { Shield, DollarSign, FileText, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";

export function MainServicesSection() {
  const { t } = useLanguage();

  const services = [
    {
      icon: Shield,
      key: 'claims',
      href: '/claims-processing',
      testId: 'card-main-claims'
    },
    {
      icon: DollarSign,
      key: 'financing',
      href: '/financing',
      testId: 'card-main-financing'
    },
    {
      icon: FileText,
      key: 'warranty',
      href: '/warranty-extended-service',
      testId: 'card-main-warranty'
    },
    {
      icon: TrendingUp,
      key: 'fiServices',
      href: '/fi-services',
      testId: 'card-main-fi'
    }
  ];

  return (
    <section id="main-services" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 mb-4" data-testid="badge-main-services">
            {t('mainServices.badge')}
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-main-services-title">
            {t('mainServices.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-main-services-description">
            {t('mainServices.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <Link key={service.key} href={service.href}>
              <div className="bg-card rounded-xl p-6 border border-border hover-lift h-full cursor-pointer transition-all hover:border-primary/40" data-testid={service.testId}>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="text-primary" size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {t(`mainServices.${service.key}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t(`mainServices.${service.key}.description`)}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t(`mainServices.${service.key}.feature1`)}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t(`mainServices.${service.key}.feature2`)}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{t(`mainServices.${service.key}.feature3`)}</span>
                  </li>
                </ul>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
