import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { CookieNotice } from "@/components/cookie-notice";
import { BackToTop } from "@/components/back-to-top";
import { SeoMeta } from "@/components/seo-meta";
import { NotificationBar } from "@/components/notification-bar";

interface PageLayoutProps {
  children: React.ReactNode;
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  canonical?: string;
}

export function PageLayout({ children, seoTitle, seoDescription, seoKeywords, canonical }: PageLayoutProps) {
  return (
    <>
      <SeoMeta
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={canonical}
      />
      <div className="min-h-screen w-full overflow-x-hidden">
        <NotificationBar />
        <Navigation />
        {children}
        <Footer />
        <ChatbotWidget />
        <CookieNotice />
        <BackToTop />
      </div>
    </>
  );
}