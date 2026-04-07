import { Zap } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";

export function NotificationBar() {
  const { t } = useLanguage();
  
  const item = (ariaHidden: boolean, withLink: boolean) => (
    <span className="text-sm font-medium px-8 inline-flex items-center shrink-0" aria-hidden={ariaHidden || undefined}>
      <Zap className="w-4 h-4 mr-2 text-white animate-pulse" fill="white" />
      {t('notificationBar.message')}{' '}
      {withLink
        ? <Link href="/contact" className="ml-1 underline hover:text-gray-200 transition-colors" data-testid="link-learn-more" aria-label="Learn more about our 2026 season special offer">{t('notificationBar.learnMore')}</Link>
        : <span className="ml-1 underline">{t('notificationBar.learnMore')}</span>
      }
      <Zap className="w-4 h-4 ml-2 text-white animate-pulse" fill="white" />
    </span>
  );

  return (
    <div className="bg-primary text-white py-2 overflow-hidden relative z-50 w-full" data-testid="notification-bar">
      <div className="animate-scroll">
        {/* First set — 6 items */}
        {item(false, true)}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
        {/* Exact duplicate — seamless loop */}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
        {item(true, false)}
      </div>
    </div>
  );
}