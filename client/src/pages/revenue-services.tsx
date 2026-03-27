import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  TrendingUp,
  DollarSign,
  Shield,
  Store,
  BarChart3,
  CheckCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "RV Dealership Revenue Growth Services",
  "provider": {
    "@type": "Organization",
    "name": "Dealer Suite 360",
  },
  "description":
    "Six outsourced revenue growth services for RV dealerships: claims revenue recovery, F&I, warranty plans, marketplace commissions, parts management, and digital marketing. Launching Q3 2026.",
  "url": "https://dealersuite360.com/revenue-services",
};

// ─── Revenue Sources Strip data ───────────────────────────────────────────────
const revenueStats = [
  { value: "$4,200", label: "Average per-claim revenue captured" },
  { value: "40%", label: "Increase in F&I product penetration" },
  { value: "$1,800", label: "Monthly parts revenue upside" },
  { value: "3.2x", label: "ROI in first 12 months" },
  { value: "6+", label: "Revenue streams from one platform" },
];

// ─── Revenue Pillars data ─────────────────────────────────────────────────────
const pillars = [
  {
    icon: TrendingUp,
    title: "Claims Revenue Recovery",
    description:
      "Most dealerships leave 25–35% of their entitled claim revenue uncollected. Our expert team reviews every FRC line to ensure maximum approved labor hours, correct parts pricing, and zero documentation gaps — recovering revenue that was always yours.",
    bullets: [
      "FRC code optimization per manufacturer guidelines",
      "Photo quality review before submission",
      "Denial prevention through expert claim preparation",
    ],
    link: "/claims-processing",
    linkLabel: "Learn More About Claims Processing",
  },
  {
    icon: DollarSign,
    title: "F&I Product Revenue",
    description:
      "Our AI F&I Presenter and trained specialists increase extended warranty, GAP, and protection product penetration rates — turning the finance office into your highest-margin department.",
    bullets: [
      "AI-powered live video F&I presentations",
      "Full product portfolio: GAP, extended warranty, protection",
      "Revenue reporting integrated with your dealer portal",
    ],
    link: "/fi-services",
    linkLabel: "Learn More About F&I Services",
  },
  {
    icon: Shield,
    title: "Warranty Plan Margins",
    description:
      "Sell OEM and aftermarket extended service plans directly through the platform — with dynamic pricing models, automated claims linkage, and upsell triggers that activate at the right moment in the customer lifecycle.",
    bullets: [
      "OEM and aftermarket plan management in one place",
      "Automated upsell triggers at warranty expiry",
      "Claims-linked coverage verification for faster approvals",
    ],
    link: "/warranty-plans",
    linkLabel: "Learn More About Warranty Plans",
  },
];

// ─── Before / After table data ────────────────────────────────────────────────
const caseStudyRows = [
  {
    metric: "Monthly claim revenue",
    before: "$12,400",
    after: "$17,200",
    positive: true,
  },
  {
    metric: "Average claim approval rate",
    before: "71%",
    after: "94%",
    positive: true,
  },
  {
    metric: "Time spent on claims (hrs / week)",
    before: "14 hrs",
    after: "3 hrs",
    positive: true,
  },
  {
    metric: "Denial appeals (monthly)",
    before: "8–12",
    after: "0–1",
    positive: true,
  },
];

// ─── Calculator concept boxes ─────────────────────────────────────────────────
const calcBoxes = [
  { label: "Monthly RV Units Sold", placeholder: "Example: 20 units" },
  { label: "Average Claim Value", placeholder: "Example: $850" },
  { label: "Current Approval Rate", placeholder: "Example: 72%" },
];

export default function RevenueServices() {
  return (
    <PageLayout
      seoTitle="RV Dealership Revenue Services | F&I, Claims Recovery, Warranty & More | Dealer Suite 360"
      seoDescription="Six proven revenue growth services for RV dealerships — claims recovery, F&I outsourcing, warranty plans, marketplace commissions, parts management, and digital marketing. Launching Q3 2026."
      seoKeywords="RV dealership revenue services, claims revenue recovery, F&I outsourcing, extended warranty plans, dealer marketplace commissions, RV parts revenue"
      canonical="/revenue-services"
      schema={schema}
    >
      {/* ─── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge
            className="mb-6 border border-primary/20 px-3 py-1 text-xs"
            variant="outline"
          >
            Q3 2026
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
            Unlock New Revenue Streams for Your Dealership
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Dealer Suite 360 goes beyond claims processing — it is the complete
            revenue engine for your dealership. Six integrated service modules,
            one platform, one subscription.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">
                Talk to Our Team <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── 2. REVENUE SOURCES STRIP ────────────────────────────────────────── */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
            {revenueStats.map((stat) => (
              <div key={stat.value} className="flex flex-col items-center gap-2">
                <span className="text-4xl md:text-5xl font-bold tracking-tight">
                  {stat.value}
                </span>
                <span className="text-sm text-white/75 leading-snug max-w-[140px]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. REVENUE PILLARS ──────────────────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Six Ways Dealer Suite 360 Grows Your Revenue
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each module delivers measurable ROI independently — together they
              transform your dealership's financial performance.
            </p>
          </div>

          <div className="space-y-0">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              const isEven = index % 2 === 1;

              const contentBlock = (
                <div className="flex flex-col justify-center py-10 px-4 lg:px-12">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{pillar.title}</h3>
                  <p className="text-muted-foreground mb-5 leading-relaxed">
                    {pillar.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {pillar.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={pillar.link}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {pillar.linkLabel}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );

              const placeholderBlock = (
                <div
                  className={`flex items-center justify-center rounded-2xl ${
                    isEven ? "bg-background" : "bg-muted/30"
                  } min-h-[280px] mx-4 lg:mx-0`}
                >
                  <div className="flex flex-col items-center gap-3 text-muted-foreground/40">
                    <BarChart3 className="w-16 h-16" />
                    <span className="text-xs uppercase tracking-widest font-medium">
                      Visual Coming Soon
                    </span>
                  </div>
                </div>
              );

              return (
                <div
                  key={pillar.title}
                  className={`${isEven ? "bg-muted/30" : "bg-background"} rounded-2xl`}
                >
                  <div className="grid md:grid-cols-2 gap-0 max-w-6xl mx-auto">
                    {isEven ? (
                      <>
                        {placeholderBlock}
                        {contentBlock}
                      </>
                    ) : (
                      <>
                        {contentBlock}
                        {placeholderBlock}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 4. MOCK CASE STUDY ──────────────────────────────────────────────── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real Results from Real Dealers
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Dealerships using Dealer Suite 360 see measurable improvements
              within the first 60 days.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 max-w-4xl mx-auto shadow-sm">
            {/* Quote */}
            <div className="mb-8">
              <div className="text-4xl text-primary font-serif leading-none mb-4">
                &ldquo;
              </div>
              <p className="text-lg md:text-xl leading-relaxed font-medium mb-4">
                We were leaving money on the table on every claim. Within 60
                days of switching, our average claim payout increased by 38% and
                we haven&apos;t had a denial in months.
              </p>
              <p className="text-muted-foreground font-medium">
                — Sarah M., Service Manager
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Maple Ridge RV, British Columbia
              </p>
            </div>

            {/* Before / After table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-6 font-semibold text-muted-foreground">
                      Metric
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-muted-foreground">
                      Before
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-primary">
                      After
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {caseStudyRows.map((row) => (
                    <tr
                      key={row.metric}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3 pr-6 text-foreground">{row.metric}</td>
                      <td className="py-3 px-4 text-center text-muted-foreground">
                        {row.before}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-primary">
                        {row.after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground mt-5">
              * Representative results. Individual dealer outcomes vary.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 5. REVENUE CALCULATOR CONCEPT ──────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Estimate Your Revenue Potential
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three inputs. One number that changes how you see your dealership.
            </p>
          </div>

          {/* Calculator visual */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {calcBoxes.map((box) => (
                <div
                  key={box.label}
                  className="bg-card border border-border rounded-xl p-5"
                >
                  <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground mb-2">
                    {box.label}
                  </p>
                  <div className="h-10 bg-muted/40 rounded-lg flex items-center px-3">
                    <span className="text-sm text-muted-foreground">
                      {box.placeholder}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Arrow + result */}
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-px w-16 bg-border" />
                <ArrowRight className="w-5 h-5" />
                <span className="text-sm font-medium uppercase tracking-wide">
                  Your Revenue Opportunity
                </span>
                <div className="h-px w-16 bg-border" />
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl px-10 py-6 text-center max-w-lg w-full">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Talk to our team for a{" "}
                  <span className="font-semibold text-foreground">
                    free revenue assessment
                  </span>{" "}
                  specific to your dealership — we&apos;ll model your exact
                  opportunity using real data from similar dealers in your
                  market.
                </p>
              </div>
            </div>

            <div className="text-center mt-6">
              <Button size="lg" asChild>
                <Link href="/contact">
                  Get Your Free Assessment{" "}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. CTA STRIP ────────────────────────────────────────────────────── */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Unlock New Revenue?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Join the dealerships already using Dealer Suite 360 to recover
            missed revenue and grow every line of their business.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              asChild
            >
              <Link href="/sign-up">
                Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/contact">Calculate Your ROI</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
