import { Zap } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";

export function NotificationBar() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-primary text-white py-2 overflow-hidden relative z-50 w-full" data-testid="notification-bar">
      <div className="whitespace-nowrap animate-scroll w-full">
        <span className="text-sm font-medium px-4 inline-flex items-center">
          <Zap className="w-4 h-4 mr-2 text-white animate-pulse" fill="white" />
          {t('notificationBar.message')} <Link href="/contact" className="ml-1 underline hover:text-gray-200 transition-colors" data-testid="link-learn-more" aria-label="Learn more about our 2026 season special offer">{t('notificationBar.learnMore')}</Link>
          <Zap className="w-4 h-4 ml-2 text-white animate-pulse" fill="white" />
        </span>
        <span className="text-sm font-medium px-4 inline-flex items-center" aria-hidden="true">
          <Zap className="w-4 h-4 mr-2 text-white animate-pulse" fill="white" />
          {t('notificationBar.message')} <span className="ml-1 underline">{t('notificationBar.learnMore')}</span>
          <Zap className="w-4 h-4 ml-2 text-white animate-pulse" fill="white" />
        </span>
        <span className="text-sm font-medium px-4 inline-flex items-center" aria-hidden="true">
          <Zap className="w-4 h-4 mr-2 text-white animate-pulse" fill="white" />
          {t('notificationBar.message')} <span className="ml-1 underline">{t('notificationBar.learnMore')}</span>
          <Zap className="w-4 h-4 ml-2 text-white animate-pulse" fill="white" />
        </span>
        <span className="text-sm font-medium px-4 inline-flex items-center" aria-hidden="true">
          <Zap className="w-4 h-4 mr-2 text-white animate-pulse" fill="white" />
          {t('notificationBar.message')} <span className="ml-1 underline">{t('notificationBar.learnMore')}</span>
          <Zap className="w-4 h-4 ml-2 text-white animate-pulse" fill="white" />
        </span>
      </div>
    </div>
  );
}