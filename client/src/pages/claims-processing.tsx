import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Shield, Camera, FileSearch, TrendingUp, CheckCircle, Zap, ClipboardCheck, Truck } from "lucide-react";

const claimTypeIcons = [Truck, ClipboardCheck, Shield, FileSearch, Shield];

export default function ClaimsProcessing() {
  const { t } = useLanguage();

  const claimTypes = ['daf', 'pdi', 'warranty', 'extended', 'insurance'] as const;

  const processSteps = [
    { title: t('claimsPage.step1Title'), body: t('claimsPage.step1Body'), num: '01' },
    { title: t('claimsPage.step2Title'), body: t('claimsPage.step2Body'), num: '02' },
    { title: t('claimsPage.step3Title'), body: t('claimsPage.step3Body'), num: '03' },
    { title: t('claimsPage.step4Title'), body: t('claimsPage.step4Body'), num: '04' },
    { title: t('claimsPage.step5Title'), body: t('claimsPage.step5Body'), num: '05' },
    { title: t('claimsPage.step6Title'), body: t('claimsPage.step6Body'), num: '06' },
  ];

  const techPoints = [
    t('claimsPage.tech1'),
    t('claimsPage.tech2'),
    t('claimsPage.tech3'),
    t('claimsPage.tech4'),
  ];

  const stats = [
    { value: t('claimsPage.statValue1'), label: t('claimsPage.statLabel1') },
    { value: t('claimsPage.statValue2'), label: t('claimsPage.statLabel2') },
    { value: t('claimsPage.statValue3'), label: t('claimsPage.statLabel3') },
    { value: t('claimsPage.statValue4'), label: t('claimsPage.statLabel4') },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "A-Z Warranty Claims Processing",
    "provider": {
      "@type": "Organization",
      "name": "Dealer Suite 360"
    },
    "description": "Complete end-to-end warranty claims processing for RV dealerships — DAF, PDI, Warranty, Extended Warranty, and Insurance claims.",
    "serviceType": "Warranty Claims Processing",
    "areaServed": "North America",
    "url": "https://dealersuite360.com/claims-processing"
  };

  return (
    <PageLayout
      seoTitle="RV Warranty Claims Processing | DAF, PDI, Warranty & More | Dealer Suite 360"
      seoDescription="Expert A-Z warranty claims processing for RV dealers. DAF, PDI, Warranty, Extended Warranty, and Insurance claims handled by our team using patent-pending AI technology."
      seoKeywords="RV warranty claims processing, DAF claims, PDI claims, warranty claims, extended warranty claims, insurance claims, RV dealers, FRC codes"
      canonical="/claims-processing"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 border border-primary/20 px-3 py-1 text-xs" variant="outline">
            {t('claimsPage.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
            {t('claimsPage.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            {t('claimsPage.description')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">{t('claimsPage.ctaButton')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">{t('claimsPage.ctaSecondary')}</Link>
            </Button>
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

      {/* 5 Claim Types */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">{t('claimsPage.typesTitle') || 'Five Claim Types. One Expert Team.'}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {claimTypes.map((type, i) => {
              const Icon = claimTypeIcons[i] || Shield;
              return (
                <div key={type} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{t(`claimsPage.${type}.title`)}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t(`claimsPage.${type}.description`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Claim Lifecycle Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">{t('claimsPage.processTitle')}</h2>
          </div>
          <div className="relative">
            {/* Horizontal connecting line — desktop only */}
            <div className="hidden lg:block absolute top-6 left-0 right-0 h-0.5 bg-primary/30 mx-[40px]" />
            <div className="grid lg:grid-cols-6 gap-4">
              {processSteps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center relative">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm mb-3 z-10 relative">
                    {i + 1}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Supported Manufacturers */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('claimsPage.mfrTitle')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('claimsPage.mfrBody')}</p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {['Jayco', 'Forest River', 'Heartland', 'Columbia NW', 'Keystone', 'Midwest Auto'].map((mfr) => (
              <Badge key={mfr} variant="outline" className="px-4 py-2 text-sm border-primary/30 text-foreground">
                {mfr}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Before & After Comparison Table */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Claims Processing: Before vs. After</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">See how RV dealers transform their claims workflow when they switch to DealerSuite360.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Metric</th>
                  <th className="text-center p-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Without DealerSuite360</th>
                  <th className="text-center p-4 text-sm font-semibold text-primary uppercase tracking-wide bg-primary/5 rounded-t-lg">With DealerSuite360</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { metric: "Time spent on claims per week", before: "12–18 hours", after: "2–3 hours" },
                  { metric: "Average claim approval rate", before: "68–74%", after: "90–96%" },
                  { metric: "FRC code accuracy", before: "Manual / inconsistent", after: "AI-assisted lookup" },
                  { metric: "Photo quality issues", before: "Discovered after denial", after: "Flagged before submission" },
                  { metric: "Denial rate", before: "22–30%", after: "4–8%" },
                  { metric: "Time to first payout", before: "6–10 weeks", after: "2–4 weeks" },
                  { metric: "Billing & reconciliation", before: "Manual spreadsheets", after: "Automated platform" },
                ].map((row, i) => (
                  <tr key={row.metric} className={`border-b border-border ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                    <td className="p-4 font-medium text-foreground text-sm">{row.metric}</td>
                    <td className="p-4 text-center text-muted-foreground text-sm">{row.before}</td>
                    <td className="p-4 text-center font-semibold text-primary bg-primary/5 text-sm">{row.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">* Representative figures based on platform data. Results vary by dealership volume and manufacturer.</p>
        </div>
      </section>

      {/* AI Tech Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 border border-primary/20 px-3 py-1 text-xs" variant="outline">
                {t('claimsPage.techBadge')}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('claimsPage.techTitle')}</h2>
              <p className="text-muted-foreground mb-6">{t('claimsPage.techBody')}</p>
              <div className="space-y-3">
                {techPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground">{point}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/technology">Learn About the Technology →</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, label: "FRC Lookup Engine" },
                { icon: Camera, label: "Photo Quality AI" },
                { icon: TrendingUp, label: "Claim Readiness Score" },
                { icon: FileSearch, label: "Denial Prediction" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="bg-card rounded-xl p-6 border border-border text-center">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-sm font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('claimsPage.ctaHeading')}</h2>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/sign-up">{t('claimsPage.ctaButton')}</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link href="/contact">{t('claimsPage.ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
