import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { MainServicesSection } from "@/components/main-services-section";
import { ClaimsSection } from "@/components/claims-section";
import { FinancingSection } from "@/components/financing-section";
import { WarrantySection } from "@/components/warranty-section";
import { FIServicesSection } from "@/components/fi-services-section";
import { SupportingServicesSection } from "@/components/supporting-services-section";
import { RvTypesSection } from "@/components/rv-types-section";
import { TechnologySection } from "@/components/technology-section";
import { ExperienceSection } from "@/components/experience-section";
import { PrivacyAssuranceSection } from "@/components/privacy-assurance-section";
import { ConsumerServicesSection } from "@/components/consumer-services-section";
import { PartsSection } from "@/components/parts-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { LanguageToggle } from "@/components/language-toggle";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { CookieNotice } from "@/components/cookie-notice";
import { NotificationBar } from "@/components/notification-bar";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <NotificationBar />
      <Navigation />
      <HeroSection />
      <MainServicesSection />
      <ClaimsSection />
      <RvTypesSection />
      <FinancingSection />
      <TechnologySection />
      <WarrantySection />
      <ExperienceSection />
      <FIServicesSection />
      <SupportingServicesSection />
      <PrivacyAssuranceSection />
      <ConsumerServicesSection />
      <PartsSection />
      <ContactSection />
      <Footer />
      <ChatbotWidget />
      <CookieNotice />
    </div>
  );
}
