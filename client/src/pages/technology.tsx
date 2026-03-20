import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Zap, Camera, BarChart3, FileText, FileSearch, Receipt, Monitor, MessageSquare, Users, Building2, User, Gavel } from "lucide-react";

const aiIcons = [Zap, Camera, BarChart3, FileSearch, FileText, Receipt, Monitor, MessageSquare];
const portalIcons = [Building2, Users, User, Gavel];

export default function Technology() {
  const { t } = useLanguage();

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
    "description": "Patent-pending AI-powered dealership operating system for Canadian RV dealers. Includes FRC code lookup, photo quality AI, claim readiness scoring, and denial prediction.",
    "operatingSystem": "Web",
    "url": "https://rvclaims.ca/technology"
  };

  return (
    <PageLayout
      seoTitle="Dealer Suite 360 Platform Technology | Patent-Pending AI | RV Claims Canada"
      seoDescription="The patent-pending Dealer Suite 360 platform powers RV Claims Canada. 8 AI modules including FRC lookup, photo quality scoring, claim readiness, and denial prediction."
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

      {/* 8 AI Modules */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">{t('technologyPage.aiTitle')}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiComponents.map(({ icon: Icon, title, body }, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
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
