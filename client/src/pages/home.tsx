import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { ClaimsSection } from "@/components/claims-section";
import { RvTypesSection } from "@/components/rv-types-section";
import { TechnologySection } from "@/components/technology-section";
import { ExperienceSection } from "@/components/experience-section";
import { PrivacyAssuranceSection } from "@/components/privacy-assurance-section";
import { ConsumerServicesSection } from "@/components/consumer-services-section";
import { UpsellServicesSection } from "@/components/upsell-services-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { LanguageToggle } from "@/components/language-toggle";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { CookieNotice } from "@/components/cookie-notice";

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <Navigation />
      <HeroSection />
      <ServicesSection />
      <ClaimsSection />
      <RvTypesSection />
      <TechnologySection />
      <ExperienceSection />
      <PrivacyAssuranceSection />
      <ConsumerServicesSection />
      <UpsellServicesSection />
      <ContactSection />
      <Footer />
      <ChatbotWidget />
      <CookieNotice />
    </div>
  );
}
