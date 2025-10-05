import { Zap } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function NotificationBar() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-primary text-white py-2 overflow-hidden relative z-50 w-full" data-testid="notification-bar">
      <div className="whitespace-nowrap animate-scroll w-full">
        <span className="text-sm font-medium px-4 flex items-center inline-flex">
          <Zap className="w-4 h-4 mr-2 text-white animate-pulse" fill="white" />
          {t('notificationBar.message')}
          <Zap className="w-4 h-4 ml-2 text-white animate-pulse" fill="white" />
        </span>
        <span className="text-sm font-medium px-4 flex items-center inline-flex">
          <Zap className="w-4 h-4 mr-2 text-white animate-pulse" fill="white" />
          {t('notificationBar.message')}
          <Zap className="w-4 h-4 ml-2 text-white animate-pulse" fill="white" />
        </span>
        <span className="text-sm font-medium px-4 flex items-center inline-flex">
          <Zap className="w-4 h-4 mr-2 text-white animate-pulse" fill="white" />
          {t('notificationBar.message')}
          <Zap className="w-4 h-4 ml-2 text-white animate-pulse" fill="white" />
        </span>
        <span className="text-sm font-medium px-4 flex items-center inline-flex">
          <Zap className="w-4 h-4 mr-2 text-white animate-pulse" fill="white" />
          {t('notificationBar.message')}
          <Zap className="w-4 h-4 ml-2 text-white animate-pulse" fill="white" />
        </span>
      </div>
    </div>
  );
}