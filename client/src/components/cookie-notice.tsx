import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";

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
    localStorage.setItem('cookies-accepted', 'false');
    setIsVisible(false);
    // TODO: Implement minimal cookie policy
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-notice" data-testid="notice-cookies">
      <div className="flex items-start space-x-3 mb-3">
        <Cookie className="text-primary mt-1" size={16} />
        <div>
          <h4 className="font-semibold text-sm mb-1">
            {t('cookies.title')}
          </h4>
          <p className="text-xs text-muted-foreground">
            {t('cookies.description')}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          onClick={acceptCookies} 
          size="sm"
          className="text-xs"
          data-testid="button-accept-cookies"
        >
          {t('cookies.accept')}
        </Button>
        <Button 
          onClick={dismissCookies}
          variant="outline" 
          size="sm"
          className="text-xs"
          data-testid="button-decline-cookies"
        >
          {t('cookies.decline')}
        </Button>
      </div>
    </div>
  );
}
