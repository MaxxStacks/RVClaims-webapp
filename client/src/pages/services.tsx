import { Link } from "wouter";
import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { ServiceBadge } from "@/components/service-badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import {
  Shield, TrendingUp, CheckCircle, Plug,
  DollarSign, FileText, ShieldCheck,
  Megaphone, Package, Wrench, Users, RefreshCw,
  Store, Gavel,
  MapPin, Star, Sparkles,
  ChevronDown, ArrowRight
} from "lucide-react";
import { useState } from "react";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Do I need to subscribe to all services, or can I start with just claims?", acceptedAnswer: { "@type": "Answer", text: "You can start with claims processing alone — it's Module 1 and available right now. Additional service modules activate as they launch, and you choose which ones to add based on your dealership's needs." } },
    { "@type": "Question", name: "Which RV manufacturers does Dealer Suite 360 support for warranty claims?", acceptedAnswer: { "@type": "Answer", text: "We currently support Jayco, Forest River, Heartland, Columbia NW, Keystone, and Midwest Auto — covering the majority of RV inventory. Additional manufacturers are added regularly." } },
    { "@type": "Question", name: "Is Dealer Suite 360 available in French?", acceptedAnswer: { "@type": "Answer", text: "Yes. The entire platform — dealer portal, operator communications, and all documentation — is fully bilingual in English and French to serve dealerships across all provinces and states." } },
    { "@type": "Question", name: "What is the difference between the Network Marketplace and Live Auctions?", acceptedAnswer: { "@type": "Answer", text: "The Network Marketplace is a private, subscription-only platform for verified RV dealers to buy and sell inventory 24/7 at negotiated prices. Live Auctions are monthly 48-hour public events open to the general public with competitive bidding." } },
    { "@type": "Question", name: "How does the escrow service work on the Network Marketplace?", acceptedAnswer: { "@type": "Answer", text: "Dealer Suite 360 acts as a neutral escrow agent on every marketplace transaction. Funds are held securely until both parties confirm the transfer is complete. A flat $250 commission is charged per completed sale." } },
    { "@type": "Question", name: "What happens to my $250 deposit if I don't win a Live Auction bid?", acceptedAnswer: { "@type": "Answer", text: "If you do not win the bid, the full $250 deposit is returned to your original payment method. If you win, the $250 is applied directly toward the purchase price of the unit." } },
    { "@type": "Question", name: "When are the Financial Services and Revenue Growth modules launching?", acceptedAnswer: { "@type": "Answer", text: "Financial Services (Financing, F&I, Warranty Plans) are scheduled for Q2 2026. Revenue Growth Services (Marketing, Parts, Service Support, CRM, Trade-In) are scheduled for Q3 2026. All subscribers will be notified before each module launches." } },
  ]
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Dealer Suite 360 — Dealership Operating System",
  "provider": { "@type": "Organization", "name": "Dealer Suite 360", "url": "https://dealersuite360.com" },
  "areaServed": { "@type": "Place", "name": "North America" },
  "description": "16+ services for RV dealerships including AI-powered warranty claims processing, F&I outsourcing, financing, parts management, dealer-to-dealer marketplace, and monthly live auctions.",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Dealer Suite 360 Services",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "A-Z Warranty Claims Processing" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Financing Services" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "F&I Outsourcing" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Network Marketplace" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Live Auctions" } },
    ]
  }
};

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-6 text-left bg-card hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-semibold text-foreground pr-4">{question}</span>
        <ChevronDown className={`text-primary flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} size={20} />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 bg-card text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Services() {
  const { t } = useLanguage();

  const cat1Cards = [
    { icon: Shield,      title: t('servicesPage.azTitle'),      desc: t('servicesPage.azDescription'),      features: [t('servicesPage.azF1'), t('servicesPage.azF2'), t('servicesPage.azF3'), t('servicesPage.azF4')], link: '/claims-processing' },
    { icon: TrendingUp,  title: t('servicesPage.revOptTitle'),  desc: t('servicesPage.revOptDescription'),  features: [t('servicesPage.revOptF1'), t('servicesPage.revOptF2'), t('servicesPage.revOptF3'), t('servicesPage.revOptF4')], link: '/claims-processing' },
    { icon: CheckCircle, title: t('servicesPage.denialTitle'),  desc: t('servicesPage.denialDescription'),  features: [t('servicesPage.denialF1'), t('servicesPage.denialF2'), t('servicesPage.denialF3'), t('servicesPage.denialF4')], link: '/claims-processing' },
    { icon: Plug,        title: t('servicesPage.integTitle'),   desc: t('servicesPage.integDescription'),   features: [t('servicesPage.integF1'), t('servicesPage.integF2'), t('servicesPage.integF3'), t('servicesPage.integF4')], link: '/claims-processing' },
  ];

  const stats = [
    { value: t('servicesPage.stat1Value'), label: t('servicesPage.stat1Label') },
    { value: t('servicesPage.stat2Value'), label: t('servicesPage.stat2Label') },
    { value: t('servicesPage.stat3Value'), label: t('servicesPage.stat3Label') },
    { value: t('servicesPage.stat4Value'), label: t('servicesPage.stat4Label') },
  ];

  const faqs = [
    { q: t('servicesPage.faq1Q'), a: t('servicesPage.faq1A') },
    { q: t('servicesPage.faq2Q'), a: t('servicesPage.faq2A') },
    { q: t('servicesPage.faq3Q'), a: t('servicesPage.faq3A') },
    { q: t('servicesPage.faq4Q'), a: t('servicesPage.faq4A') },
    { q: t('servicesPage.faq5Q'), a: t('servicesPage.faq5A') },
    { q: t('servicesPage.faq6Q'), a: t('servicesPage.faq6A') },
    { q: t('servicesPage.faq7Q'), a: t('servicesPage.faq7A') },
  ];

  const howItWorksSteps = [
    {
      title: "Sign Up & Onboard",
      desc: "Create your dealership account. Our team verifies your information and activates your portal within one business day.",
    },
    {
      title: "Submit Your First Claims",
      desc: "Add your units by VIN, attach photos per FRC line, and push claims to our operator team for manufacturer submission.",
    },
    {
      title: "Track & Optimize Revenue",
      desc: "Monitor claim status in real time. Our specialists maximize approved labor hours and minimize denials on every submission.",
    },
    {
      title: "Add Modules as You Grow",
      desc: "Activate Financing, F&I, Marketplace, and more as each module launches — one subscription, the entire platform.",
    },
  ];

  const revenueGrowthServices = [
    { icon: Megaphone, title: "Digital Marketing", desc: "SEO, PPC, social campaigns & lead generation" },
    { icon: Package,   title: "Parts & Accessories", desc: "Inventory optimization & upgrade programs" },
    { icon: Wrench,    title: "Service Support", desc: "Mobile service, scheduling & tech training" },
    { icon: Users,     title: "CRM & Customer Tech", desc: "Advanced CRM & automated follow-up" },
    { icon: RefreshCw, title: "Trade-In & Consignment", desc: "Appraisal, consignment & trade optimization" },
  ];

  const cat5Cards = [
    { icon: MapPin,   title: t('servicesPage.roadsideTitle'), desc: t('servicesPage.roadsideDescription') },
    { icon: Star,     title: t('servicesPage.extWTitle'),     desc: t('servicesPage.extWDescription') },
    { icon: Sparkles, title: t('servicesPage.protTitle'),     desc: t('servicesPage.protDescription') },
  ];

  return (
    <PageLayout
      seoTitle="RV Dealer Services | Claims, F&I, Financing, Marketplace & More"
      seoDescription="Dealer Suite 360 provides 16+ services for RV dealerships — AI-powered warranty claims processing, F&I outsourcing, financing, parts management, dealer-to-dealer marketplace, and monthly live auctions."
      seoKeywords="RV dealer services, RV warranty claims processing, F&I outsourcing RV, RV financing, dealer-to-dealer marketplace, live RV auctions, RV dealership platform, Dealer Suite 360"
      canonical="/services"
      schema={[faqSchema, serviceSchema]}
    >
      <PageHero
        badge={t('servicesPage.badge')}
        title={t('servicesPage.title')}
        description={t('servicesPage.description')}
      />

      {/* Platform Intro */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {t('servicesPage.introHeading')}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('servicesPage.introBody')}
          </p>
        </div>
      </section>

      {/* How It Works — 4-step process */}
      <section className="py-20 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From sign-up to full dealership automation — four simple steps to get started.
            </p>
          </div>
          <div className="relative">
            {/* Connecting line — desktop only */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-primary/20" />
            <div className="grid md:grid-cols-4 gap-8">
              {howItWorksSteps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 z-10 shadow-sm">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-12">
            <Link href="/sign-up">
              <Button size="lg">
                Get Started Today
                <ArrowRight className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category 1 — Core Claims Services (2-col card grid — live module) */}
      <section className="py-20 bg-gray-50" id="claims-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold border border-green-200 mb-4">
              {t('servicesPage.cat1Badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('servicesPage.cat1Title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('servicesPage.cat1Description')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {cat1Cards.map(({ icon: Icon, title, desc, features, link }) => (
              <div key={title} className="bg-card rounded-xl p-8 border border-border hover-lift h-full transition-all hover:border-primary/40">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{desc}</p>
                <ul className="space-y-2 mb-6">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start text-sm text-muted-foreground">
                      <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={link}>
                  <span className="inline-flex items-center text-sm font-semibold text-primary hover:underline cursor-pointer">
                    Learn More <ArrowRight className="ml-1" size={14} />
                  </span>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/claims-processing">
              <Button variant="outline" size="lg">
                Explore Claims Processing in Depth
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category 2 — Financial Services — alternating left-right layout */}
      <section className="py-20 bg-white" id="financial-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4"><ServiceBadge quarter="Q2" /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('servicesPage.cat2Title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('servicesPage.cat2Description')}
            </p>
          </div>

          {/* Row 1 — Financing: text left, placeholder right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Financing Services</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Connect your dealership to a network of verified lenders. Streamline pre-approvals,
                track application status in real time, and close more deals with expert compliance
                support for both English and French markets.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Multi-lender integration for maximum approval rates",
                  "Real-time application status tracking in your portal",
                  "Bilingual compliance documentation",
                  "Revenue reporting per deal",
                ].map((f, i) => (
                  <li key={i} className="flex items-start text-sm text-muted-foreground">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={15} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/contact">
                <span className="inline-flex items-center text-sm font-semibold text-primary hover:underline cursor-pointer">
                  Notify Me When Live <ArrowRight className="ml-1" size={14} />
                </span>
              </Link>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border h-64 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-primary/40" />
                <p className="text-sm font-medium">Financing Dashboard Preview</p>
                <p className="text-xs mt-1">Q2 2026</p>
              </div>
            </div>
          </div>

          {/* Row 2 — F&I: placeholder left, text right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="bg-card rounded-2xl p-8 border border-border h-64 flex items-center justify-center order-2 lg:order-1">
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 text-primary/40" />
                <p className="text-sm font-medium">F&I Management Preview</p>
                <p className="text-xs mt-1">Q2 2026</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <FileText className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">F&I Outsourcing</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Outsource your entire Finance & Insurance office. From loan origination to GAP
                insurance, extended warranty sales, and premium product presentations — our F&I
                specialists handle the paperwork and compliance so your team can focus on selling.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Complete F&I management: loans, GAP, extended warranty",
                  "Premium product portfolio with proven upsell scripts",
                  "Compliance documentation for every province and state",
                  "Staff training and ongoing performance reporting",
                ].map((f, i) => (
                  <li key={i} className="flex items-start text-sm text-muted-foreground">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={15} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/contact">
                <span className="inline-flex items-center text-sm font-semibold text-primary hover:underline cursor-pointer">
                  Notify Me When Live <ArrowRight className="ml-1" size={14} />
                </span>
              </Link>
            </div>
          </div>

          {/* Row 3 — Warranty Plans: centered feature strip */}
          <div className="bg-gray-50 rounded-2xl border border-border p-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck className="text-primary" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Warranty & Extended Service Plans</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Manage OEM and aftermarket warranty plans from a single dashboard. Dynamic pricing
                  models, automated claims linkage, and built-in upsell programs help you protect
                  customers and grow recurring revenue at the same time.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "OEM + aftermarket plan management in one place",
                    "Dynamic pricing models per unit type and age",
                    "Automated link between warranty sales and claims",
                    "Retention programs to reduce customer churn",
                  ].map((f, i) => (
                    <li key={i} className="flex items-start text-sm text-muted-foreground">
                      <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={15} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/contact">
                  <span className="inline-flex items-center text-sm font-semibold text-primary hover:underline cursor-pointer">
                    Notify Me When Live <ArrowRight className="ml-1" size={14} />
                  </span>
                </Link>
              </div>
              <div className="bg-card rounded-2xl p-8 border border-border h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-primary/40" />
                  <p className="text-sm font-medium">Warranty Plans Preview</p>
                  <p className="text-xs mt-1">Q2 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category 3 — Revenue Growth Services — 5-col icon strip */}
      <section className="py-20 bg-gray-50" id="revenue-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="mb-4"><ServiceBadge quarter="Q3" /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('servicesPage.cat3Title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('servicesPage.cat3Description')}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {revenueGrowthServices.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl p-6 border border-border text-center hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-primary" size={22} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2 leading-tight">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/contact">
              <Button variant="outline" size="lg">
                Notify Me When Revenue Services Launch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Category 4 — Marketplace & Auctions — alternating split */}
      <section className="py-20 bg-white" id="marketplace">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4"><ServiceBadge quarter="Q3" /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('servicesPage.cat4Title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('servicesPage.cat4Description')}
            </p>
          </div>

          {/* Network Marketplace — text left, placeholder right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Store className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Network Marketplace</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                A private, subscription-only platform where verified RV dealers buy and sell
                inventory 24/7. Every listing is dealer-verified, every transaction is escrowed,
                and every vehicle history is confirmed before the deal closes.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Dealer-to-dealer listings with verified vehicle history",
                  "Secure escrow on every transaction — $250 flat commission",
                  "Direct dealer-to-dealer messaging and negotiation",
                  "Subscription access — exclusive to verified dealer network",
                ].map((f, i) => (
                  <li key={i} className="flex items-start text-sm text-muted-foreground">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={15} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/network-marketplace">
                <span className="inline-flex items-center text-sm font-semibold text-primary hover:underline cursor-pointer">
                  Learn About the Marketplace <ArrowRight className="ml-1" size={14} />
                </span>
              </Link>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-border h-64 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Store className="w-12 h-12 mx-auto mb-3 text-primary/40" />
                <p className="text-sm font-medium">Marketplace Preview</p>
                <p className="text-xs mt-1">Q3 2026</p>
              </div>
            </div>
          </div>

          {/* Live Auctions — placeholder left, text right */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="bg-card rounded-2xl p-8 border border-border h-64 flex items-center justify-center order-2 lg:order-1">
              <div className="text-center text-muted-foreground">
                <Gavel className="w-12 h-12 mx-auto mb-3 text-primary/40" />
                <p className="text-sm font-medium">Live Auction Preview</p>
                <p className="text-xs mt-1">Q3–Q4 2026</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Gavel className="text-primary" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Live Auctions</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Monthly 48-hour live auction events open to the public. Bid on new, used, and
                overstock RV units at wholesale pricing. A $250 refundable deposit secures your
                bid — applied to the purchase price if you win.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Monthly 48-hour events — new, used, and overstock units",
                  "Real-time competitive bidding at wholesale pricing",
                  "$250 refundable deposit — applied to purchase if you win",
                  "Open to dealers and qualified members of the public",
                ].map((f, i) => (
                  <li key={i} className="flex items-start text-sm text-muted-foreground">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={15} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/live-auctions">
                <span className="inline-flex items-center text-sm font-semibold text-primary hover:underline cursor-pointer">
                  Learn About Live Auctions <ArrowRight className="ml-1" size={14} />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category 5 — Consumer Direct — compact 3-col cards */}
      <section className="py-20 bg-gray-50" id="consumer-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="mb-4"><ServiceBadge quarter="Q4" /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('servicesPage.cat5Title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('servicesPage.cat5Description')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {cat5Cards.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl p-8 border border-border text-center h-full">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon className="text-primary" size={26} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
            {t('servicesPage.statsHeading')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{value}</div>
                <div className="text-primary-foreground/80 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Dealers Switch to DealerSuite360</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide w-1/3">Feature</th>
                  <th className="text-center p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Traditional Methods</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary uppercase tracking-wide bg-primary/5 rounded-t-lg">DealerSuite360</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Claims Processing", traditional: "Manual / Paper", ds360: "AI-Assisted" },
                  { feature: "Processing Time", traditional: "Weeks", ds360: "Days" },
                  { feature: "Manufacturer Expertise", traditional: "Generalist", ds360: "Specialized" },
                  { feature: "Platform Access", traditional: "Phone / Email", ds360: "Real-Time Portal" },
                  { feature: "Bilingual Support", traditional: "No", ds360: "Yes" },
                  { feature: "Revenue Optimization", traditional: "None", ds360: "Built-In" },
                ].map((row, i) => (
                  <tr key={row.feature} className={`border-b border-border ${i % 2 === 0 ? "bg-background" : "bg-transparent"}`}>
                    <td className="p-4 font-medium text-foreground">{row.feature}</td>
                    <td className="p-4 text-center text-muted-foreground">{row.traditional}</td>
                    <td className="p-4 text-center font-semibold text-primary bg-primary/5">{row.ds360}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white" id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            {t('servicesPage.faqHeading')}
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <FaqItem key={q} question={q} answer={a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            {t('servicesPage.ctaHeading')}
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            {t('servicesPage.ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                {t('servicesPage.ctaButton')}
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t('servicesPage.ctaSecondary')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
