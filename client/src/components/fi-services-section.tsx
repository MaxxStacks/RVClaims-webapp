import { Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ServiceBadge } from "@/components/service-badge";
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
    <section id="fi-services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <ServiceBadge quarter="Q2" />
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
                    <h3 className="font-semibold">
                      {feature.title}
                    </h3>
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
            <svg
              viewBox="0 0 576 432"
              xmlns="http://www.w3.org/2000/svg"
              className="rounded-2xl shadow-2xl w-full h-auto block"
              aria-label="Finance and Insurance product suite including GAP, extended warranty, and compliance"
              data-testid="img-fi"
            >
              <rect width="576" height="432" fill="#f8fafc"/>
              <ellipse cx="500" cy="60" rx="160" ry="160" fill="#dbeafe" opacity="0.35"/>
              <rect x="24" y="24" width="528" height="76" rx="16" fill="#1e3a8a"/>
              <rect x="44" y="38" width="124" height="16" rx="5" fill="white" opacity="0.9"/>
              <rect x="44" y="61" width="260" height="10" rx="4" fill="white" opacity="0.4"/>
              <rect x="452" y="42" width="84" height="34" rx="17" fill="#2563eb"/>
              <rect x="464" y="53" width="60" height="12" rx="6" fill="white"/>
              <rect x="24" y="116" width="252" height="144" rx="16" fill="white"/>
              <rect x="44" y="132" width="52" height="52" rx="12" fill="#dbeafe"/>
              <path d="M70 140 L90 148 L90 162 Q90 172 70 178 Q50 172 50 162 L50 148 Z" fill="#2563eb" opacity="0.85"/>
              <rect x="66" y="156" width="8" height="3" rx="1" fill="white"/>
              <rect x="66" y="162" width="8" height="5" rx="2" fill="white"/>
              <rect x="44" y="194" width="104" height="14" rx="5" fill="#1e3a8a"/>
              <rect x="44" y="216" width="200" height="9" rx="4" fill="#94a3b8"/>
              <rect x="44" y="231" width="176" height="9" rx="4" fill="#94a3b8"/>
              <rect x="44" y="246" width="76" height="6" rx="3" fill="#2563eb"/>
              <rect x="300" y="116" width="252" height="144" rx="16" fill="white"/>
              <rect x="320" y="132" width="52" height="52" rx="12" fill="#dcfce7"/>
              <rect x="332" y="140" width="28" height="36" rx="4" fill="#16a34a" opacity="0.85"/>
              <rect x="338" y="148" width="16" height="3" rx="1" fill="white"/>
              <rect x="338" y="154" width="16" height="3" rx="1" fill="white"/>
              <rect x="338" y="160" width="12" height="3" rx="1" fill="white"/>
              <rect x="320" y="194" width="144" height="14" rx="5" fill="#1e3a8a"/>
              <rect x="320" y="216" width="200" height="9" rx="4" fill="#94a3b8"/>
              <rect x="320" y="231" width="180" height="9" rx="4" fill="#94a3b8"/>
              <rect x="320" y="246" width="76" height="6" rx="3" fill="#16a34a"/>
              <rect x="24" y="276" width="252" height="132" rx="16" fill="white"/>
              <rect x="44" y="292" width="52" height="52" rx="12" fill="#fef3c7"/>
              <polygon points="70,300 74,311 86,311 77,318 80,329 70,322 60,329 63,318 54,311 66,311" fill="#d97706" opacity="0.9"/>
              <rect x="44" y="352" width="124" height="14" rx="5" fill="#1e3a8a"/>
              <rect x="44" y="372" width="200" height="9" rx="4" fill="#94a3b8"/>
              <rect x="44" y="387" width="76" height="6" rx="3" fill="#d97706"/>
              <rect x="300" y="276" width="252" height="132" rx="16" fill="white"/>
              <rect x="320" y="292" width="52" height="52" rx="12" fill="#ede9fe"/>
              <rect x="332" y="300" width="28" height="36" rx="4" fill="#7c3aed" opacity="0.85"/>
              <rect x="338" y="308" width="16" height="3" rx="1" fill="white"/>
              <rect x="338" y="314" width="12" height="3" rx="1" fill="white"/>
              <rect x="338" y="320" width="14" height="3" rx="1" fill="white"/>
              <rect x="320" y="352" width="144" height="14" rx="5" fill="#1e3a8a"/>
              <rect x="320" y="372" width="200" height="9" rx="4" fill="#94a3b8"/>
              <rect x="320" y="387" width="76" height="6" rx="3" fill="#7c3aed"/>
            </svg>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
