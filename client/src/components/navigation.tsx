import { useLanguage } from "@/hooks/use-language";
import { LanguageToggle } from "@/components/language-toggle";
import { Link, useLocation } from "wouter";

export function Navigation() {
  const { t } = useLanguage();
  const [location] = useLocation();

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold gradient-text hover:opacity-90 transition-opacity" data-testid="text-logo">
                RVClaimTrack
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-8">
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/about"
                className={`transition-colors ${location === '/about' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="link-about"
              >
                {t('navigation.about')}
              </Link>
              <Link 
                href="/services"
                className={`transition-colors ${location === '/services' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="link-services"
              >
                {t('navigation.services')}
              </Link>
              <Link 
                href="/claims-processing"
                className={`transition-colors ${location === '/claims-processing' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="link-claims"
              >
                {t('navigation.claims')}
              </Link>
              <Link 
                href="/technology"
                className={`transition-colors ${location === '/technology' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="link-technology"
              >
                {t('navigation.technology')}
              </Link>
              <Link 
                href="/revenue-services"
                className={`transition-colors ${location === '/revenue-services' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="link-revenue-services"
              >
                {t('navigation.revenueServices')}
              </Link>
              <Link 
                href="/contact"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors h-10"
                data-testid="button-contact"
              >
                {t('navigation.contact')}
              </Link>
            </div>
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
