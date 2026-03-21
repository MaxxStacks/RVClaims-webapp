import { useState, useEffect } from "react";
import { Cookie, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";

export function CookieNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookies-accepted');
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookies-accepted', 'true');
    setIsVisible(false);
    // TODO: Implement enterprise cookie tracking
  };

  const dismissCookies = () => {
    localStorage.setItem('cookies-accepted', 'essential');
    setIsVisible(false);
    // TODO: Implement minimal cookie policy
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-notice" data-testid="notice-cookies">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Cookie className="text-primary" size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-base mb-2 flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              {t('cookies.title')}
            </h4>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {t('cookies.description')}
            </p>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed border-l-2 border-primary/20 pl-3">
              {t('cookies.types')}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Button 
          onClick={acceptCookies} 
          size="default"
          className="flex-1 sm:flex-initial"
          data-testid="button-accept-cookies"
        >
          {t('cookies.accept')}
        </Button>
        <Button 
          onClick={dismissCookies}
          variant="outline" 
          size="default"
          className="flex-1 sm:flex-initial"
          data-testid="button-decline-cookies"
        >
          {t('cookies.decline')}
        </Button>
        <Link href="/privacy-policy">
          <Button
            variant="ghost"
            size="default"
            className="w-full sm:w-auto"
            data-testid="button-cookie-learn-more"
          >
            {t('footer.privacyPolicy')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
