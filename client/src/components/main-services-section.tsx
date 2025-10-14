import { Shield, DollarSign, FileText, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";

export function MainServicesSection() {
  const { t } = useLanguage();

  const services = [
    {
      key: 'claims',
      icon: Shield,
      href: '/claims-processing',
      gradient: 'from-primary/10 to-primary/5',
      testId: 'card-claims-main'
    },
    {
      key: 'financing',
      icon: DollarSign,
      href: '/financing',
      gradient: 'from-blue-500/10 to-blue-500/5',
      testId: 'card-financing-main'
    },
    {
      key: 'warranty',
      icon: FileText,
      href: '/warranty-extended-service',
      gradient: 'from-indigo-500/10 to-indigo-500/5',
      testId: 'card-warranty-main'
    },
    {
      key: 'fiServices',
      icon: TrendingUp,
      href: '/fi-services',
      gradient: 'from-violet-500/10 to-violet-500/5',
      testId: 'card-fi-main'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase">
              {t('mainServices.badge')}
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="text-main-services-title">
            {t('mainServices.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-main-services-description">
            {t('mainServices.description')}
          </p>
        </div>

        {/* Services Grid - 2x2 on desktop, 1 column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {services.map(({ key, icon: Icon, href, gradient, testId }) => (
            <div
              key={key}
              className="group relative bg-card rounded-2xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 overflow-hidden hover-lift"
              data-testid={testId}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative p-8 lg:p-10 space-y-6">
                {/* Icon */}
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="text-primary" size={32} />
                </div>

                {/* Title & Description */}
                <div className="space-y-3">
                  <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                    {t(`mainServices.${key}.title`)}
                  </h3>
                  <p className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                    {t(`mainServices.${key}.description`)}
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm text-muted-foreground">
                      {t(`mainServices.${key}.feature1`)}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm text-muted-foreground">
                      {t(`mainServices.${key}.feature2`)}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm text-muted-foreground">
                      {t(`mainServices.${key}.feature3`)}
                    </span>
                  </li>
                </ul>

                {/* CTA Button */}
                <Link href={href}>
                  <Button 
                    className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid={`button-${key}-cta`}
                  >
                    {t(`mainServices.${key}.cta`)}
                  </Button>
                </Link>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
