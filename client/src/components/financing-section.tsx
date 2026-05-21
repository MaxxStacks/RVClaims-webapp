import { Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ServiceBadge } from "@/components/service-badge";
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
            <ServiceBadge quarter="Q2" />
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

            <Link href="/financing">
              <Button size="lg" className="mt-4" data-testid="button-financing-learn-more">
                {t('financingPage.cta')}
              </Button>
            </Link>
          </div>
          
          <div className="relative">
            <svg
              viewBox="0 0 576 432"
              xmlns="http://www.w3.org/2000/svg"
              className="rounded-2xl shadow-2xl w-full h-auto block"
              aria-label="RV dealership financing approval flow"
              data-testid="img-financing"
            >
              <rect width="576" height="432" fill="#f0f7ff"/>
              <ellipse cx="80" cy="80" rx="120" ry="120" fill="#dbeafe" opacity="0.45"/>
              <ellipse cx="520" cy="380" rx="100" ry="100" fill="#dbeafe" opacity="0.3"/>
              <rect x="36" y="36" width="504" height="360" rx="24" fill="white"/>
              <rect x="36" y="36" width="504" height="80" rx="24" fill="#1e3a8a"/>
              <rect x="36" y="92" width="504" height="24" fill="#1e3a8a"/>
              <rect x="64" y="52" width="136" height="16" rx="5" fill="white" opacity="0.9"/>
              <rect x="64" y="75" width="220" height="10" rx="4" fill="white" opacity="0.4"/>
              <rect x="432" y="56" width="88" height="32" rx="16" fill="#2563eb"/>
              <rect x="448" y="65" width="56" height="14" rx="4" fill="white"/>
              <rect x="68" y="148" width="136" height="148" rx="16" fill="#f0f7ff"/>
              <circle cx="136" cy="196" r="32" fill="#dbeafe"/>
              <rect x="126" y="182" width="20" height="28" rx="4" fill="#2563eb" opacity="0.9"/>
              <rect x="121" y="190" width="30" height="5" rx="2" fill="white"/>
              <rect x="121" y="200" width="30" height="5" rx="2" fill="white"/>
              <rect x="80" y="240" width="112" height="14" rx="5" fill="#1e3a8a"/>
              <rect x="86" y="262" width="100" height="9" rx="4" fill="#94a3b8"/>
              <rect x="90" y="277" width="80" height="9" rx="4" fill="#94a3b8"/>
              <rect x="224" y="214" width="40" height="4" rx="2" fill="#bfdbfe"/>
              <polygon points="264,208 278,218 264,228" fill="#2563eb"/>
              <rect x="220" y="148" width="136" height="148" rx="16" fill="#f0f7ff"/>
              <circle cx="288" cy="196" r="32" fill="#dcfce7"/>
              <path d="M272 196 L282 208 L308 184" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <rect x="232" y="240" width="112" height="14" rx="5" fill="#1e3a8a"/>
              <rect x="238" y="262" width="100" height="9" rx="4" fill="#94a3b8"/>
              <rect x="244" y="277" width="80" height="9" rx="4" fill="#94a3b8"/>
              <rect x="376" y="214" width="40" height="4" rx="2" fill="#bfdbfe"/>
              <polygon points="416,208 430,218 416,228" fill="#2563eb"/>
              <rect x="372" y="148" width="136" height="148" rx="16" fill="#f0f7ff"/>
              <circle cx="440" cy="196" r="32" fill="#dbeafe"/>
              <circle cx="440" cy="190" r="10" fill="none" stroke="#2563eb" strokeWidth="3"/>
              <rect x="446" y="193" width="14" height="4" rx="2" fill="#2563eb"/>
              <rect x="455" y="197" width="4" height="7" rx="2" fill="#2563eb"/>
              <rect x="449" y="197" width="4" height="7" rx="2" fill="#2563eb"/>
              <rect x="384" y="240" width="112" height="14" rx="5" fill="#1e3a8a"/>
              <rect x="392" y="262" width="100" height="9" rx="4" fill="#94a3b8"/>
              <rect x="396" y="277" width="80" height="9" rx="4" fill="#94a3b8"/>
              <rect x="68" y="316" width="90" height="56" rx="12" fill="#f8fafc"/>
              <rect x="80" y="328" width="56" height="10" rx="4" fill="#cbd5e1"/>
              <rect x="80" y="344" width="44" height="8" rx="3" fill="#e2e8f0"/>
              <rect x="172" y="316" width="90" height="56" rx="12" fill="#f8fafc"/>
              <rect x="184" y="328" width="56" height="10" rx="4" fill="#cbd5e1"/>
              <rect x="184" y="344" width="44" height="8" rx="3" fill="#e2e8f0"/>
              <rect x="276" y="316" width="90" height="56" rx="12" fill="#f8fafc"/>
              <rect x="288" y="328" width="56" height="10" rx="4" fill="#cbd5e1"/>
              <rect x="288" y="344" width="44" height="8" rx="3" fill="#e2e8f0"/>
              <rect x="380" y="316" width="90" height="56" rx="12" fill="#f8fafc"/>
              <rect x="392" y="328" width="56" height="10" rx="4" fill="#cbd5e1"/>
              <rect x="392" y="344" width="44" height="8" rx="3" fill="#e2e8f0"/>
              <rect x="482" y="316" width="54" height="56" rx="12" fill="#f8fafc"/>
              <rect x="490" y="334" width="38" height="20" rx="8" fill="#e2e8f0"/>
            </svg>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
