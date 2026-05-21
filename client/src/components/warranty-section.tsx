import { Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function WarrantySection() {
  const { t } = useLanguage();

  const features = [
    {
      title: t('warrantyExtendedPage.manufacturerIntegration.title'),
      description: t('warrantyExtendedPage.manufacturerIntegration.description'),
      testId: 'feature-manufacturer-integration'
    },
    {
      title: t('warrantyExtendedPage.dynamicPricing.title'),
      description: t('warrantyExtendedPage.dynamicPricing.description'),
      testId: 'feature-dynamic-pricing'
    },
    {
      title: t('warrantyExtendedPage.automatedClaims.title'),
      description: t('warrantyExtendedPage.automatedClaims.description'),
      testId: 'feature-automated-claims'
    }
  ];

  return (
    <section id="warranty" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <svg
              viewBox="0 0 576 432"
              xmlns="http://www.w3.org/2000/svg"
              className="rounded-2xl shadow-2xl w-full h-auto block"
              aria-label="Warranty and extended service plan coverage shield"
              data-testid="img-warranty"
            >
              <rect width="576" height="432" fill="#f0f7ff"/>
              <path d="M288 20 L488 80 L488 244 Q488 364 288 416 Q88 364 88 244 L88 80 Z" fill="#dbeafe" opacity="0.55"/>
              <path d="M288 44 L464 96 L464 244 Q464 348 288 392 Q112 348 112 244 L112 96 Z" fill="#2563eb" opacity="0.12"/>
              <path d="M288 68 L440 112 L440 244 Q440 332 288 368 Q136 332 136 244 L136 112 Z" fill="white"/>
              <path d="M288 68 L440 112 L440 244 Q440 332 288 368 Q136 332 136 244 L136 112 Z" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.25"/>
              <circle cx="288" cy="222" r="60" fill="#f0f7ff"/>
              <path d="M260 222 L278 242 L320 198" stroke="#16a34a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <rect x="16" y="114" width="144" height="48" rx="12" fill="white"/>
              <rect x="28" y="126" width="64" height="12" rx="4" fill="#1e3a8a"/>
              <rect x="28" y="144" width="104" height="8" rx="4" fill="#94a3b8"/>
              <circle cx="140" cy="138" r="13" fill="#dcfce7"/>
              <path d="M134 138 L138 143 L147 132" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="16" y="174" width="144" height="48" rx="12" fill="white"/>
              <rect x="28" y="186" width="80" height="12" rx="4" fill="#1e3a8a"/>
              <rect x="28" y="204" width="88" height="8" rx="4" fill="#94a3b8"/>
              <circle cx="140" cy="198" r="13" fill="#dcfce7"/>
              <path d="M134 198 L138 203 L147 192" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="16" y="234" width="144" height="48" rx="12" fill="white"/>
              <rect x="28" y="246" width="96" height="12" rx="4" fill="#1e3a8a"/>
              <rect x="28" y="264" width="80" height="8" rx="4" fill="#94a3b8"/>
              <circle cx="140" cy="258" r="13" fill="#dcfce7"/>
              <path d="M134 258 L138 263 L147 252" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="416" y="114" width="144" height="48" rx="12" fill="white"/>
              <rect x="428" y="126" width="72" height="12" rx="4" fill="#1e3a8a"/>
              <rect x="428" y="144" width="100" height="8" rx="4" fill="#94a3b8"/>
              <circle cx="432" cy="138" r="13" fill="#dcfce7"/>
              <path d="M426 138 L430 143 L439 132" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="416" y="174" width="144" height="48" rx="12" fill="white"/>
              <rect x="428" y="186" width="60" height="12" rx="4" fill="#1e3a8a"/>
              <rect x="428" y="204" width="96" height="8" rx="4" fill="#94a3b8"/>
              <circle cx="432" cy="198" r="13" fill="#dcfce7"/>
              <path d="M426 198 L430 203 L439 192" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="416" y="234" width="144" height="48" rx="12" fill="white"/>
              <rect x="428" y="246" width="88" height="12" rx="4" fill="#1e3a8a"/>
              <rect x="428" y="264" width="76" height="8" rx="4" fill="#94a3b8"/>
              <circle cx="432" cy="258" r="13" fill="#dcfce7"/>
              <path d="M426 258 L430 263 L439 252" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="44" y="356" width="148" height="56" rx="12" fill="white"/>
              <rect x="64" y="372" width="68" height="14" rx="5" fill="#94a3b8"/>
              <rect x="64" y="392" width="84" height="10" rx="5" fill="#f1f5f9"/>
              <rect x="212" y="348" width="152" height="64" rx="12" fill="#1e3a8a"/>
              <rect x="232" y="360" width="36" height="8" rx="4" fill="#60a5fa"/>
              <rect x="224" y="374" width="108" height="18" rx="5" fill="white"/>
              <rect x="236" y="398" width="80" height="8" rx="4" fill="#93c5fd" opacity="0.6"/>
              <rect x="384" y="356" width="148" height="56" rx="12" fill="white"/>
              <rect x="404" y="372" width="88" height="14" rx="5" fill="#94a3b8"/>
              <rect x="404" y="392" width="72" height="10" rx="5" fill="#f1f5f9"/>
            </svg>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl"></div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <span data-testid="text-warranty-badge">{t('warrantyExtendedPage.badge')}</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-warranty-title">
              {t('warrantyExtendedPage.subtitle')}
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-warranty-description">
              {t('warrantyExtendedPage.description')}
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

            <Link href="/warranty-extended-service">
              <Button size="lg" className="mt-4" data-testid="button-warranty-learn-more">
                {t('warrantyExtendedPage.cta')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
