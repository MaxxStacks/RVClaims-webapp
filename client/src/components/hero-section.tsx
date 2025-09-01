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
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                data-testid="button-get-started"
              >
                {t('hero.ctaPrimary')}
              </Button>
              <Button 
                onClick={scrollToProcess}
                variant="outline"
                className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-accent transition-colors"
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
            <img 
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Modern corporate office with technology displays" 
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="img-hero"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
