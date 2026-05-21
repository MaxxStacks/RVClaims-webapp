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
          </div>
          
          <div className="relative">
            <svg
              viewBox="0 0 576 432"
              xmlns="http://www.w3.org/2000/svg"
              className="rounded-2xl shadow-2xl w-full h-auto block"
              aria-label="AI-powered analytics and claims management platform dashboard"
              data-testid="img-technology"
            >
              <rect width="576" height="432" fill="#0f172a"/>
              <rect width="576" height="52" fill="#1e293b"/>
              <rect x="20" y="14" width="104" height="24" rx="6" fill="#2563eb"/>
              <rect x="32" y="21" width="68" height="10" rx="3" fill="white"/>
              <circle cx="548" cy="26" r="14" fill="#1e3a8a"/>
              <circle cx="520" cy="26" r="12" fill="#334155"/>
              <rect x="16" y="66" width="168" height="88" rx="12" fill="#1e293b"/>
              <rect x="32" y="82" width="72" height="10" rx="4" fill="#94a3b8"/>
              <rect x="32" y="100" width="120" height="28" rx="8" fill="#1e3a8a"/>
              <rect x="44" y="108" width="76" height="12" rx="4" fill="#60a5fa"/>
              <rect x="32" y="136" width="56" height="6" rx="3" fill="#334155"/>
              <rect x="204" y="66" width="168" height="88" rx="12" fill="#1e293b"/>
              <rect x="220" y="82" width="72" height="10" rx="4" fill="#94a3b8"/>
              <rect x="220" y="100" width="120" height="28" rx="8" fill="#064e3b"/>
              <rect x="232" y="108" width="68" height="12" rx="4" fill="#34d399"/>
              <rect x="220" y="136" width="56" height="6" rx="3" fill="#334155"/>
              <rect x="392" y="66" width="168" height="88" rx="12" fill="#1e293b"/>
              <rect x="408" y="82" width="72" height="10" rx="4" fill="#94a3b8"/>
              <rect x="408" y="100" width="120" height="28" rx="8" fill="#4c1d95"/>
              <rect x="420" y="108" width="68" height="12" rx="4" fill="#a78bfa"/>
              <rect x="408" y="136" width="56" height="6" rx="3" fill="#334155"/>
              <rect x="16" y="170" width="344" height="248" rx="12" fill="#1e293b"/>
              <rect x="32" y="186" width="84" height="12" rx="4" fill="#e2e8f0"/>
              <rect x="32" y="204" width="128" height="8" rx="4" fill="#475569"/>
              <rect x="44" y="320" width="22" height="72" rx="4" fill="#2563eb" opacity="0.5"/>
              <rect x="76" y="296" width="22" height="96" rx="4" fill="#2563eb" opacity="0.6"/>
              <rect x="108" y="272" width="22" height="120" rx="4" fill="#2563eb" opacity="0.75"/>
              <rect x="140" y="256" width="22" height="136" rx="4" fill="#2563eb" opacity="0.85"/>
              <rect x="172" y="240" width="22" height="152" rx="4" fill="#2563eb"/>
              <rect x="204" y="224" width="22" height="168" rx="4" fill="#3b82f6"/>
              <rect x="236" y="208" width="22" height="184" rx="4" fill="#60a5fa"/>
              <rect x="268" y="196" width="22" height="196" rx="4" fill="#93c5fd"/>
              <rect x="300" y="186" width="22" height="206" rx="4" fill="#bfdbfe"/>
              <rect x="44" y="398" width="18" height="6" rx="3" fill="#475569"/>
              <rect x="76" y="398" width="18" height="6" rx="3" fill="#475569"/>
              <rect x="108" y="398" width="18" height="6" rx="3" fill="#475569"/>
              <rect x="140" y="398" width="18" height="6" rx="3" fill="#475569"/>
              <rect x="172" y="398" width="18" height="6" rx="3" fill="#475569"/>
              <rect x="204" y="398" width="18" height="6" rx="3" fill="#475569"/>
              <rect x="236" y="398" width="18" height="6" rx="3" fill="#475569"/>
              <rect x="268" y="398" width="18" height="6" rx="3" fill="#475569"/>
              <rect x="300" y="398" width="18" height="6" rx="3" fill="#475569"/>
              <rect x="376" y="170" width="184" height="248" rx="12" fill="#1e293b"/>
              <rect x="392" y="186" width="80" height="12" rx="4" fill="#e2e8f0"/>
              <rect x="392" y="212" width="152" height="44" rx="8" fill="#0f172a"/>
              <rect x="404" y="224" width="80" height="8" rx="4" fill="#94a3b8"/>
              <rect x="496" y="220" width="36" height="20" rx="10" fill="#16a34a" opacity="0.85"/>
              <rect x="392" y="264" width="152" height="44" rx="8" fill="#0f172a"/>
              <rect x="404" y="276" width="100" height="8" rx="4" fill="#94a3b8"/>
              <rect x="496" y="272" width="36" height="20" rx="10" fill="#2563eb" opacity="0.85"/>
              <rect x="392" y="316" width="152" height="44" rx="8" fill="#0f172a"/>
              <rect x="404" y="328" width="60" height="8" rx="4" fill="#94a3b8"/>
              <circle cx="500" cy="338" r="5" fill="#f59e0b"/>
              <circle cx="516" cy="338" r="5" fill="#f59e0b" opacity="0.55"/>
              <circle cx="532" cy="338" r="5" fill="#f59e0b" opacity="0.25"/>
              <rect x="392" y="368" width="152" height="36" rx="8" fill="#0f172a"/>
              <rect x="404" y="380" width="120" height="8" rx="4" fill="#334155"/>
            </svg>
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
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
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
