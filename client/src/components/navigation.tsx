import { useLanguage } from "@/hooks/use-language";

export function Navigation() {
  const { t } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold gradient-text" data-testid="text-logo">
                RVClaimTrack
              </h1>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => scrollToSection('services')}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-services"
              >
                {t('services')}
              </button>
              <button 
                onClick={() => scrollToSection('experience')}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-experience"
              >
                {t('experience')}
              </button>
              <button 
                onClick={() => scrollToSection('technology')}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-technology"
              >
                {t('technology')}
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                data-testid="button-contact"
              >
                {t('contact')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
