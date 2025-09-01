import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { ServicesSection } from "@/components/services-section";
import { RvTypesSection } from "@/components/rv-types-section";
import { TechnologySection } from "@/components/technology-section";
import { ExperienceSection } from "@/components/experience-section";
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
      <RvTypesSection />
      <TechnologySection />
      <ExperienceSection />
      <ContactSection />
      <Footer />
      <ChatbotWidget />
      <CookieNotice />
    </div>
  );
}
