import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { CheckCircle, Shield, Zap, TrendingUp, Users, Globe, Award } from "lucide-react";

const pillarIcons = [Shield, TrendingUp, Zap, Award, Users];

export default function About() {
  const { t } = useLanguage();

  const stats = [
    { value: t('aboutPage.statValue1'), label: t('aboutPage.statLabel1') },
    { value: t('aboutPage.statValue2'), label: t('aboutPage.statLabel2') },
    { value: t('aboutPage.statValue3'), label: t('aboutPage.statLabel3') },
    { value: t('aboutPage.statValue4'), label: t('aboutPage.statLabel4') },
  ];

  const pillars = [
    { title: t('aboutPage.pillar1Title'), body: t('aboutPage.pillar1Body') },
    { title: t('aboutPage.pillar2Title'), body: t('aboutPage.pillar2Body') },
    { title: t('aboutPage.pillar3Title'), body: t('aboutPage.pillar3Body') },
    { title: t('aboutPage.pillar4Title'), body: t('aboutPage.pillar4Body') },
    { title: t('aboutPage.pillar5Title'), body: t('aboutPage.pillar5Body') },
  ];

  const whyPoints = [
    t('aboutPage.why1'),
    t('aboutPage.why2'),
    t('aboutPage.why3'),
    t('aboutPage.why4'),
    t('aboutPage.why5'),
    t('aboutPage.why6'),
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About Dealer Suite 360",
    "description": "Dealer Suite 360 is the all-in-one dealership operating system — combining AI-powered claims processing with financing, F&I, marketplace, and revenue growth services.",
    "url": "https://dealersuite360.com/about"
  };

  return (
    <PageLayout
      seoTitle="About Dealer Suite 360 | The Dealership Operating System"
      seoDescription="Dealer Suite 360 is the all-in-one platform for RV dealerships. 15+ years of claims expertise, patent-pending AI technology, bilingual service across North America."
      seoKeywords="about Dealer Suite 360, RV dealers, warranty claims platform, dealer operating system, Dealer Suite 360"
      canonical="/about"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 border border-primary/20 px-3 py-1 text-xs" variant="outline">
              {t('aboutPage.missionBadge')}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('aboutPage.missionTitle')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              {t('aboutPage.missionBody')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">{t('aboutPage.ctaButton')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">{t('aboutPage.ctaSecondary')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-12 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-white/75 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('aboutPage.platformTitle')}</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{t('aboutPage.platformBody')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar, i) => {
              const Icon = pillarIcons[i];
              return (
                <div key={i} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{pillar.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{pillar.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">{t('aboutPage.whyTitle')}</h2>
              <div className="space-y-4">
                {whyPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-10 border border-border">
              <blockquote className="text-lg md:text-xl font-semibold italic text-foreground mb-6 leading-relaxed">
                "{t('aboutPage.founderQuote')}"
              </blockquote>
              <p className="text-muted-foreground font-medium">— {t('aboutPage.founderAttribution')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <Globe className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">{t('aboutPage.teamTitle')}</h2>
            <p className="text-lg text-muted-foreground mb-10">{t('aboutPage.teamBody')}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <p className="font-semibold">{t('aboutPage.headquarters')}</p>
                <p className="text-muted-foreground text-sm mt-1">Toronto, Ontario, Canada</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border text-center">
                <p className="font-semibold">{t('aboutPage.development')}</p>
                <p className="text-muted-foreground text-sm mt-1">Montreal, Quebec, Canada</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('aboutPage.ctaHeading')}</h2>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">{t('aboutPage.ctaButton')}</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link href="/pricing">{t('aboutPage.ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
