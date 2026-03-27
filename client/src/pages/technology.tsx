import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Zap, Camera, BarChart3, FileText, FileSearch, Receipt, Monitor, MessageSquare, Users, Building2, User, Gavel, CheckCircle, Smartphone, ChevronDown } from "lucide-react";

const aiIcons = [Zap, Camera, BarChart3, FileSearch, FileText, Receipt, Monitor, MessageSquare];
const portalIcons = [Building2, Users, User, Gavel];

export default function Technology() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);

  const aiComponents = [
    { icon: aiIcons[0], title: t('technologyPage.ai1Title'), body: t('technologyPage.ai1Body') },
    { icon: aiIcons[1], title: t('technologyPage.ai2Title'), body: t('technologyPage.ai2Body') },
    { icon: aiIcons[2], title: t('technologyPage.ai3Title'), body: t('technologyPage.ai3Body') },
    { icon: aiIcons[3], title: t('technologyPage.ai4Title'), body: t('technologyPage.ai4Body') },
    { icon: aiIcons[4], title: t('technologyPage.ai5Title'), body: t('technologyPage.ai5Body') },
    { icon: aiIcons[5], title: t('technologyPage.ai6Title'), body: t('technologyPage.ai6Body') },
    { icon: aiIcons[6], title: t('technologyPage.ai7Title'), body: t('technologyPage.ai7Body') },
    { icon: aiIcons[7], title: t('technologyPage.ai8Title'), body: t('technologyPage.ai8Body') },
  ];

  const portals = [
    { icon: portalIcons[0], title: t('technologyPage.portal1Title'), body: t('technologyPage.portal1Body') },
    { icon: portalIcons[1], title: t('technologyPage.portal2Title'), body: t('technologyPage.portal2Body') },
    { icon: portalIcons[2], title: t('technologyPage.portal3Title'), body: t('technologyPage.portal3Body') },
    { icon: portalIcons[3], title: t('technologyPage.portal4Title'), body: t('technologyPage.portal4Body') },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Dealer Suite 360",
    "applicationCategory": "BusinessApplication",
    "description": "Patent-pending AI-powered dealership operating system for RV dealers. Includes FRC code lookup, photo quality AI, claim readiness scoring, and denial prediction.",
    "operatingSystem": "Web",
    "url": "https://dealersuite360.com/technology"
  };

  return (
    <PageLayout
      seoTitle="Dealer Suite 360 Platform Technology | Patent-Pending AI | Dealer Suite 360"
      seoDescription="The patent-pending Dealer Suite 360 platform powers Dealer Suite 360. 8 AI modules including FRC lookup, photo quality scoring, claim readiness, and denial prediction."
      seoKeywords="RV claims technology, Dealer Suite 360, patent pending AI, FRC lookup engine, claim readiness score, denial prediction, RV dealer software"
      canonical="/technology"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 border border-primary/20 px-3 py-1 text-xs" variant="outline">
            {t('technologyPage.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
            {t('technologyPage.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {t('technologyPage.description')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">{t('technologyPage.ctaButton')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">{t('technologyPage.ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 8 AI Modules — Tabbed */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">{t('technologyPage.aiTitle')}</h2>
          </div>

          {/* Tab Buttons — Desktop */}
          <div className="hidden md:flex flex-wrap gap-2 justify-center mb-8">
            {aiComponents.map((comp, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === i
                    ? 'bg-primary text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {comp.title}
              </button>
            ))}
          </div>

          {/* Active Tab Content — Desktop */}
          <div className="hidden md:grid grid-cols-2 gap-12 items-center">
            <div>
              {(() => {
                const ActiveIcon = aiComponents[activeTab].icon;
                return (
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <ActiveIcon className="w-7 h-7 text-primary" />
                  </div>
                );
              })()}
              <h3 className="text-2xl font-bold mb-4">{aiComponents[activeTab].title}</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">{aiComponents[activeTab].body}</p>
            </div>
            <div className="bg-muted/30 rounded-2xl border border-border h-72 flex items-center justify-center">
              {(() => {
                const PreviewIcon = aiComponents[activeTab].icon;
                return (
                  <div className="text-center text-muted-foreground">
                    <PreviewIcon className="w-16 h-16 mx-auto mb-3 text-primary/30" />
                    <p className="text-sm font-medium mt-3">Platform Feature</p>
                    <p className="text-xs mt-1">Patent-Pending Technology</p>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Mobile Accordion */}
          <div className="md:hidden space-y-3">
            {aiComponents.map((comp, i) => {
              const AccordionIcon = comp.icon;
              return (
                <div key={i} className="border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setActiveTab(activeTab === i ? -1 : i)}
                    className="w-full flex items-center justify-between p-4 bg-card text-left hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <AccordionIcon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-semibold">{comp.title}</span>
                    </div>
                    <ChevronDown
                      className={`text-muted-foreground transition-transform duration-200 ${activeTab === i ? 'rotate-180' : ''}`}
                      size={16}
                    />
                  </button>
                  {activeTab === i && (
                    <div className="px-4 pb-4 pt-2 bg-card text-muted-foreground text-sm leading-relaxed">
                      {comp.body}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Patent Pending Banner */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 px-3 py-1 text-xs">
            {t('technologyPage.patentTitle')}
          </Badge>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            {t('technologyPage.patentBody')}
          </p>
        </div>
      </section>

      {/* 4 Portals */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">{t('technologyPage.portalTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {portals.map(({ icon: Icon, title, body }, i) => (
              <div key={i} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Security</h2>
              <p className="text-muted-foreground mb-6">Your dealership data is protected with bank-level security and Canadian compliance standards.</p>
              <ul className="space-y-3">
                {[
                  'Data Encryption — 256-bit AES at rest and TLS in transit',
                  'PIPEDA Compliance — Full alignment with Canadian federal privacy law',
                  'Role-Based Access Control — Four distinct permission tiers',
                  'Multi-Tenant Data Isolation — Absolute separation between dealer accounts',
                  'JWT Authentication — 15-minute access tokens with 7-day refresh rotation',
                  'SOC 2 Ready Infrastructure — Hosted on certified Canadian cloud providers',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: '256-bit', label: 'AES Encryption', sub: 'Bank-level protection' },
                { stat: 'PIPEDA', label: 'Compliant', sub: 'Canadian privacy law' },
                { stat: '99.9%', label: 'Uptime SLA', sub: 'Mission-critical reliability' },
                { stat: 'Zero', label: 'Data Breaches', sub: 'Since platform launch' },
              ].map((card, i) => (
                <div key={i} className="bg-card rounded-xl p-6 border border-border text-center hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="text-2xl font-bold text-primary mb-1">{card.stat}</div>
                  <div className="font-semibold text-sm mb-1">{card.label}</div>
                  <div className="text-xs text-muted-foreground">{card.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-card rounded-2xl border border-border h-72 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Smartphone className="w-12 h-12 mx-auto mb-3 text-primary/40" />
                  <p className="text-sm">Mobile App Preview</p>
                  <p className="text-xs mt-1">iOS &amp; Android — Coming Q3 2026</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the Shop Floor</h2>
              <p className="text-muted-foreground mb-6">Process claims, upload photos, and track units right from your phone — on the lot or in the service bay.</p>
              <ul className="space-y-3">
                {[
                  'VIN barcode scanner — Instantly pull up any unit by scanning the plate',
                  'Push-to-claim photo workflow — Capture and attach photos without leaving the bay',
                  'Real-time claim status notifications — Know the moment a line is approved or denied',
                  'Offline mode — Keep working in poor connectivity areas; syncs when reconnected',
                  'Bilingual interface (EN/FR) — Full French support for Quebec dealerships',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('technologyPage.ctaHeading')}</h2>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Button size="lg" asChild>
              <Link href="/contact">{t('technologyPage.ctaButton')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">{t('technologyPage.ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
