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
  ChevronDown
} from "lucide-react";
import { useState } from "react";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Do I need to subscribe to all services, or can I start with just claims?", acceptedAnswer: { "@type": "Answer", text: "You can start with claims processing alone — it's Module 1 and available right now. Additional service modules activate as they launch, and you choose which ones to add based on your dealership's needs." } },
    { "@type": "Question", name: "Which RV manufacturers does Dealer Suite 360 support for warranty claims?", acceptedAnswer: { "@type": "Answer", text: "We currently support Jayco, Forest River, Heartland, Columbia NW, Keystone, and Midwest Auto — covering the majority of Canadian RV inventory. Additional manufacturers are added regularly." } },
    { "@type": "Question", name: "Is Dealer Suite 360 available in French?", acceptedAnswer: { "@type": "Answer", text: "Yes. The entire platform — dealer portal, operator communications, and all documentation — is fully bilingual in English and French to serve dealerships across all Canadian provinces." } },
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
  "areaServed": { "@type": "Country", "name": "Canada" },
  "description": "16+ services for Canadian RV dealerships including AI-powered warranty claims processing, F&I outsourcing, financing, parts management, dealer-to-dealer marketplace, and monthly live auctions.",
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

  const cat2Cards = [
    { icon: DollarSign,  title: t('servicesPage.finTitle'),  desc: t('servicesPage.finDescription'),  features: [t('servicesPage.finF1'), t('servicesPage.finF2'), t('servicesPage.finF3')], link: '/financing' },
    { icon: FileText,    title: t('servicesPage.fiTitle'),   desc: t('servicesPage.fiDescription'),   features: [t('servicesPage.fiF1'), t('servicesPage.fiF2'), t('servicesPage.fiF3')], link: '/fi-services' },
    { icon: ShieldCheck, title: t('servicesPage.wpTitle'),   desc: t('servicesPage.wpDescription'),   features: [t('servicesPage.wpF1'), t('servicesPage.wpF2'), t('servicesPage.wpF3')], link: '/warranty-plans' },
  ];

  const cat3Cards = [
    { icon: Megaphone, title: t('servicesPage.mktTitle'),   desc: t('servicesPage.mktDescription') },
    { icon: Package,   title: t('servicesPage.partsTitle'), desc: t('servicesPage.partsDescription') },
    { icon: Wrench,    title: t('servicesPage.svcTitle'),   desc: t('servicesPage.svcDescription') },
    { icon: Users,     title: t('servicesPage.crmTitle'),   desc: t('servicesPage.crmDescription') },
    { icon: RefreshCw, title: t('servicesPage.tradeTitle'), desc: t('servicesPage.tradeDescription') },
  ];

  const cat4Cards = [
    { icon: Store, title: t('servicesPage.mktplaceTitle'), desc: t('servicesPage.mktplaceDescription'), features: [t('servicesPage.mktplaceF1'), t('servicesPage.mktplaceF2'), t('servicesPage.mktplaceF3'), t('servicesPage.mktplaceF4')], link: '/network-marketplace' },
    { icon: Gavel, title: t('servicesPage.auctTitle'),     desc: t('servicesPage.auctDescription'),     features: [t('servicesPage.auctF1'), t('servicesPage.auctF2'), t('servicesPage.auctF3'), t('servicesPage.auctF4')], link: '/live-auctions' },
  ];

  const cat5Cards = [
    { icon: MapPin,    title: t('servicesPage.roadsideTitle'), desc: t('servicesPage.roadsideDescription') },
    { icon: Star,      title: t('servicesPage.extWTitle'),     desc: t('servicesPage.extWDescription') },
    { icon: Sparkles,  title: t('servicesPage.protTitle'),     desc: t('servicesPage.protDescription') },
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

  return (
    <PageLayout
      seoTitle="RV Dealer Services | Claims, F&I, Financing, Marketplace & More"
      seoDescription="Dealer Suite 360 provides 16+ services for Canadian RV dealerships — AI-powered warranty claims processing, F&I outsourcing, financing, parts management, dealer-to-dealer marketplace, and monthly live auctions."
      seoKeywords="RV dealer services Canada, RV warranty claims processing, F&I outsourcing RV, RV financing Canada, dealer-to-dealer marketplace, live RV auctions Canada, Canadian RV dealership platform, Dealer Suite 360"
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

      {/* Category 1 — Core Claims */}
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
              <Link key={title} href={link}>
                <div className="bg-card rounded-xl p-8 border border-border hover-lift cursor-pointer h-full transition-all hover:border-primary/40">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
                  <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{desc}</p>
                  <ul className="space-y-2">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start text-sm text-muted-foreground">
                        <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={14} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category 2 — Financial Services */}
      <section className="py-20 bg-white" id="financial-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="mb-4"><ServiceBadge quarter="Q2" /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('servicesPage.cat2Title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('servicesPage.cat2Description')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {cat2Cards.map(({ icon: Icon, title, desc, features, link }) => (
              <Link key={title} href={link}>
                <div className="bg-card rounded-xl p-8 border border-border hover-lift cursor-pointer h-full transition-all hover:border-primary/40">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
                  <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{desc}</p>
                  <ul className="space-y-2">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start text-sm text-muted-foreground">
                        <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={14} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category 3 — Revenue Growth */}
      <section className="py-20 bg-gray-50" id="revenue-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="mb-4"><ServiceBadge quarter="Q3" /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('servicesPage.cat3Title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('servicesPage.cat3Description')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cat3Cards.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl p-8 border border-border h-full">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
            <Link href="/revenue-services">
              <div className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary/10 transition-colors h-full min-h-[200px]">
                <TrendingUp className="text-primary mb-3" size={32} />
                <p className="font-semibold text-primary">View All Revenue Services</p>
                <p className="text-sm text-muted-foreground mt-2">Learn how each module boosts your bottom line</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Category 4 — Marketplace & Auctions */}
      <section className="py-20 bg-white" id="marketplace">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="mb-4"><ServiceBadge quarter="Q3" /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('servicesPage.cat4Title')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('servicesPage.cat4Description')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {cat4Cards.map(({ icon: Icon, title, desc, features, link }) => (
              <Link key={title} href={link}>
                <div className="bg-card rounded-xl p-8 border border-border hover-lift cursor-pointer h-full transition-all hover:border-primary/40">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                    <Icon className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
                  <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{desc}</p>
                  <ul className="space-y-2">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start text-sm text-muted-foreground">
                        <CheckCircle className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={14} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Category 5 — Consumer Direct */}
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
            <Link href="/signup">
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
