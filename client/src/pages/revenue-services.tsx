import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { CheckCircle, DollarSign, Megaphone, Package, Wrench, Users, RefreshCw } from "lucide-react";

const serviceIcons = [DollarSign, Megaphone, Package, Wrench, Users, RefreshCw];

type ServiceKey = 'finance' | 'marketing' | 'parts' | 'service' | 'crm' | 'trade';

export default function RevenueServices() {
  const { t } = useLanguage();

  const services: { key: ServiceKey; icon: typeof DollarSign }[] = [
    { key: 'finance', icon: serviceIcons[0] },
    { key: 'marketing', icon: serviceIcons[1] },
    { key: 'parts', icon: serviceIcons[2] },
    { key: 'service', icon: serviceIcons[3] },
    { key: 'crm', icon: serviceIcons[4] },
    { key: 'trade', icon: serviceIcons[5] },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "RV Dealership Revenue Growth Services",
    "provider": {
      "@type": "Organization",
      "name": "Dealer Suite 360"
    },
    "description": "Five outsourced revenue growth services for RV dealerships: F&I, digital marketing, parts management, service support, CRM, and trade-in programs.",
    "url": "https://dealersuite360.com/revenue-services"
  };

  return (
    <PageLayout
      seoTitle="RV Dealership Revenue Services | F&I, Marketing, Parts & More | Dealer Suite 360"
      seoDescription="Five proven revenue growth services for RV dealerships — F&I outsourcing, digital marketing, parts management, service support, CRM, and trade-in programs. Launching Q3 2026."
      seoKeywords="RV dealership revenue services, F&I outsourcing, digital marketing RV dealers, parts management, service department support, CRM, trade-in programs"
      canonical="/revenue-services"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 border border-primary/20 px-3 py-1 text-xs" variant="outline">
            {t('revenueServicesPage.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
            {t('revenueServicesPage.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {t('revenueServicesPage.description')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">{t('revenueServicesPage.ctaButton')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">{t('revenueServicesPage.ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map(({ key, icon: Icon }) => {
              const features = ['f1', 'f2', 'f3', 'f4'] as const;
              return (
                <div key={key} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{t(`revenueServicesPage.${key}.title`)}</h3>
                  </div>
                  <p className="text-muted-foreground mb-5">{t(`revenueServicesPage.${key}.description`)}</p>
                  <ul className="space-y-2">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{t(`revenueServicesPage.${key}.${f}`)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform link */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground mb-2 text-sm uppercase tracking-wide font-medium">These services are delivered through</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">The Dealer Suite 360 Platform</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            All revenue growth services are managed through the same dealer portal where you process claims — one platform, one login, all your services.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">{t('revenueServicesPage.ctaButton')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/services">See All Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
