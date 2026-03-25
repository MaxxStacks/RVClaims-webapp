import { lazy, Suspense } from "react";
import { SeoMeta } from "@/components/seo-meta";
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
import { Footer } from "@/components/footer";

const ContactSection = lazy(() => import("@/components/contact-section").then(m => ({ default: m.ContactSection })));
const LatestNewsSection = lazy(() => import("@/components/latest-news-section").then(m => ({ default: m.LatestNewsSection })));
import { LanguageToggle } from "@/components/language-toggle";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { CookieNotice } from "@/components/cookie-notice";
import { NotificationBar } from "@/components/notification-bar";
import { BackToTop } from "@/components/back-to-top";

const homepageSchema = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://dealersuite360.com/#software",
    "name": "Dealer Suite 360",
    "alternateName": "DS360",
    "url": "https://dealersuite360.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "description": "The all-in-one dealership operating system for RV dealers. Manage warranty claims, PDI inspections, DAF reports, parts tracking, and customer portals from one platform.",
    "offers": { "@type": "Offer", "category": "SaaS", "availability": "https://schema.org/InStock" },
    "featureList": [
      "Warranty Claims Tracking", "PDI Inspection Management", "DAF Claims",
      "Extended Warranty Management", "Parts Tracking & Ordering",
      "Customer Self-Service Portal", "Multi-Dealer Management",
      "AI Document Scanner", "Dealer Marketplace & Auctions",
      "FRC Code Management", "Photo Documentation System",
      "Role-Based Access Control", "White-Label Customer Portal"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Dealer Suite 360?",
        "acceptedAnswer": { "@type": "Answer", "text": "Dealer Suite 360 is a cloud-based dealership operating system designed for RV dealers. It centralizes warranty claims processing, PDI inspections, DAF reports, parts tracking, customer portals, and dealer-to-dealer marketplace operations into one platform." }
      },
      {
        "@type": "Question",
        "name": "Which RV manufacturers does Dealer Suite 360 support?",
        "acceptedAnswer": { "@type": "Answer", "text": "Dealer Suite 360 supports Jayco, Forest River, Heartland, Columbia Northwest, Keystone, and Midwest Auto — each with their manufacturer-specific FRC (Failure Reason Code) systems built in." }
      },
      {
        "@type": "Question",
        "name": "How does warranty claims tracking work?",
        "acceptedAnswer": { "@type": "Answer", "text": "Dealer Suite 360 tracks the full lifecycle of warranty claims from inspection through FRC line entry, submission, manufacturer approval or denial, parts ordering, repair completion, invoicing, and payment. Each claim is tracked by VIN with full photo documentation." }
      },
      {
        "@type": "Question",
        "name": "Can my customers see their claim status?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. Dealer Suite 360 includes a white-label customer portal branded with your dealership logo, colors, and custom domain. Customers can view unit and warranty information, track claims, submit issues with photos, and communicate with your team." }
      },
      {
        "@type": "Question",
        "name": "Is Dealer Suite 360 a DMS replacement?",
        "acceptedAnswer": { "@type": "Answer", "text": "No. Dealer Suite 360 is a dealership services platform focused on claims, warranty, and customer experience. It complements your existing DMS by handling the claims workflow, document management, customer portal, and dealer marketplace that most DMS platforms don't cover." }
      }
    ]
  }
];

export default function Home() {
  return (
    <>
    <SeoMeta
      title="The Dealership Operating System"
      description="Dealer Suite 360 is the all-in-one dealership operating system for RV dealers. AI-powered warranty claims processing, F&I, financing, parts management, marketplace, and live auctions."
      keywords="RV dealership software, RV warranty claims software, dealership management system, PDI inspection software, RV claims tracking, dealer operating system, RV service management, Canadian dealer software, warranty claims processing, DAF claims, extended warranty tracking"
      canonical="/"
      schema={homepageSchema}
    />
    <div className="min-h-screen w-full overflow-x-hidden">
      <NotificationBar />
      <Navigation />
      <HeroSection />
      <MainServicesSection />
      <ClaimsSection />
      <RvTypesSection />
      <TechnologySection />
      <FinancingSection />
      <ExperienceSection />
      <FIServicesSection />
      <SupportingServicesSection />
      <PrivacyAssuranceSection />
      <WarrantySection />
      <ConsumerServicesSection />
      <PartsSection />
      <Suspense fallback={null}>
        <ContactSection />
        <LatestNewsSection />
      </Suspense>
      <Footer />
      <BackToTop />
      <ChatbotWidget />
      <CookieNotice />
    </div>
    </>
  );
}
