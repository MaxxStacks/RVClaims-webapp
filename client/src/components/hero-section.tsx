import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

export function HeroSection() {
  const { t } = useLanguage();

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToProcess = () => {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 hero-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 slide-in-up">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <span data-testid="text-hero-badge">{t('hero.badge')}</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                <span data-testid="text-hero-title">{t('hero.title')}</span>
                <span className="gradient-text block" data-testid="text-hero-highlight">
                  {t('hero.titleHighlight')}
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-hero-description">
                {t('hero.description')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={scrollToContact}
                size="lg"
                className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                data-testid="button-get-started"
              >
                {t('hero.ctaPrimary')}
              </Button>
              <Button 
                onClick={scrollToProcess}
                size="lg"
                variant="outline"
                className="border border-border text-foreground font-semibold hover:bg-accent transition-colors"
                data-testid="button-view-process"
              >
                {t('hero.ctaSecondary')}
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary stat-counter" data-testid="stat-years">15+</div>
                <div className="text-sm text-muted-foreground">
                  {t('hero.statsYears')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary stat-counter" data-testid="stat-manufacturers">15</div>
                <div className="text-sm text-muted-foreground">
                  {t('hero.statsManufacturers')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary stat-counter" data-testid="stat-focus">100%</div>
                <div className="text-sm text-muted-foreground">
                  {t('hero.statsFocus')}
                </div>
              </div>
            </div>
          </div>
          <div className="fade-in">
            <svg
              viewBox="0 0 584 438"
              xmlns="http://www.w3.org/2000/svg"
              className="rounded-2xl shadow-2xl w-full h-auto block"
              aria-label="Claims management portal dashboard"
              data-testid="img-hero"
            >
              <rect width="584" height="438" fill="#eef2ff"/>
              <rect x="0" y="0" width="148" height="438" fill="#1e3a8a"/>
              <rect x="16" y="16" width="116" height="34" rx="8" fill="#2563eb"/>
              <rect x="28" y="25" width="76" height="16" rx="4" fill="white"/>
              <rect x="12" y="68" width="124" height="36" rx="8" fill="#2563eb"/>
              <rect x="26" y="80" width="14" height="12" rx="3" fill="white" opacity="0.8"/>
              <rect x="46" y="82" width="60" height="8" rx="4" fill="white"/>
              <rect x="26" y="120" width="14" height="12" rx="3" fill="white" opacity="0.35"/>
              <rect x="46" y="122" width="50" height="8" rx="4" fill="white" opacity="0.35"/>
              <rect x="26" y="148" width="14" height="12" rx="3" fill="white" opacity="0.35"/>
              <rect x="46" y="150" width="38" height="8" rx="4" fill="white" opacity="0.35"/>
              <rect x="26" y="176" width="14" height="12" rx="3" fill="white" opacity="0.35"/>
              <rect x="46" y="178" width="54" height="8" rx="4" fill="white" opacity="0.35"/>
              <rect x="26" y="204" width="14" height="12" rx="3" fill="white" opacity="0.35"/>
              <rect x="46" y="206" width="44" height="8" rx="4" fill="white" opacity="0.35"/>
              <circle cx="74" cy="408" r="18" fill="#2563eb" opacity="0.4"/>
              <rect x="148" y="0" width="436" height="438" fill="#f1f5f9"/>
              <rect x="148" y="0" width="436" height="52" fill="white"/>
              <rect x="168" y="16" width="152" height="20" rx="8" fill="#f1f5f9"/>
              <circle cx="556" cy="26" r="14" fill="#dbeafe"/>
              <circle cx="526" cy="26" r="12" fill="#f1f5f9"/>
              <rect x="164" y="68" width="118" height="72" rx="12" fill="white"/>
              <rect x="180" y="82" width="60" height="8" rx="4" fill="#94a3b8"/>
              <rect x="180" y="100" width="46" height="22" rx="6" fill="#1e3a8a"/>
              <rect x="180" y="130" width="74" height="6" rx="3" fill="#dbeafe"/>
              <rect x="298" y="68" width="118" height="72" rx="12" fill="white"/>
              <rect x="314" y="82" width="60" height="8" rx="4" fill="#94a3b8"/>
              <rect x="314" y="100" width="46" height="22" rx="6" fill="#16a34a"/>
              <rect x="314" y="130" width="74" height="6" rx="3" fill="#dcfce7"/>
              <rect x="432" y="68" width="118" height="72" rx="12" fill="white"/>
              <rect x="448" y="82" width="60" height="8" rx="4" fill="#94a3b8"/>
              <rect x="448" y="100" width="46" height="22" rx="6" fill="#d97706"/>
              <rect x="448" y="130" width="74" height="6" rx="3" fill="#fef3c7"/>
              <rect x="164" y="156" width="100" height="12" rx="4" fill="#1e293b"/>
              <rect x="464" y="158" width="72" height="8" rx="4" fill="#dbeafe"/>
              <rect x="164" y="180" width="392" height="64" rx="10" fill="white"/>
              <circle cx="194" cy="212" r="14" fill="#f1f5f9"/>
              <rect x="216" y="202" width="100" height="12" rx="4" fill="#1e293b"/>
              <rect x="216" y="222" width="152" height="8" rx="4" fill="#94a3b8"/>
              <rect x="460" y="200" width="76" height="24" rx="12" fill="#dcfce7"/>
              <rect x="472" y="206" width="52" height="12" rx="6" fill="#16a34a"/>
              <rect x="164" y="256" width="392" height="64" rx="10" fill="white"/>
              <circle cx="194" cy="288" r="14" fill="#f1f5f9"/>
              <rect x="216" y="278" width="82" height="12" rx="4" fill="#1e293b"/>
              <rect x="216" y="298" width="132" height="8" rx="4" fill="#94a3b8"/>
              <rect x="460" y="276" width="76" height="24" rx="12" fill="#fef3c7"/>
              <rect x="471" y="282" width="54" height="12" rx="6" fill="#d97706"/>
              <rect x="164" y="332" width="392" height="64" rx="10" fill="white"/>
              <circle cx="194" cy="364" r="14" fill="#f1f5f9"/>
              <rect x="216" y="354" width="114" height="12" rx="4" fill="#1e293b"/>
              <rect x="216" y="374" width="124" height="8" rx="4" fill="#94a3b8"/>
              <rect x="460" y="352" width="76" height="24" rx="12" fill="#dbeafe"/>
              <rect x="472" y="358" width="52" height="12" rx="6" fill="#2563eb"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
