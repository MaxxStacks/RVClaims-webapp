import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ServiceBadge } from "@/components/service-badge";
import {
  ShieldCheck,
  Bell,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Wrench,
  BarChart3,
  RefreshCw,
  CircleDollarSign,
} from "lucide-react";

const warrantySchema = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Warranty & Extended Service Plans",
    description:
      "Manage manufacturer warranties and sell extended service plans through one platform. Track coverage, process claims, and maximize warranty revenue for your RV dealership.",
    provider: {
      "@type": "Organization",
      name: "DealerSuite360",
      url: "https://dealersuite360.com",
    },
    serviceType: "RV Warranty Management",
    areaServed: "North America",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does manufacturer warranty tracking work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "When a unit is added to the platform by VIN, the system records the manufacturer warranty start date and coverage period. Coverage expiry is tracked automatically per unit, and you receive alerts before warranties expire so you can proactively offer extended service plans.",
        },
      },
      {
        "@type": "Question",
        name: "Can warranty claims be submitted through the platform?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Warranty claims flow directly into the claims processing module. You create the claim inside the platform, add photos and line items, and the operator team handles submission on manufacturer portals. Approval status is tracked per line and reported back into your dealer dashboard.",
        },
      },
      {
        "@type": "Question",
        name: "What extended service plans can I sell?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The platform supports Basic, Plus, and Premium extended service plan tiers covering mechanical, electrical, plumbing, structural, and appliance components. Coverage terms and deductible options are configurable per plan.",
        },
      },
      {
        "@type": "Question",
        name: "How does warranty plan revenue work for my dealership?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each extended service plan sold generates a commission for your dealership. Plans are sold at deal closing or post-sale through the customer portal, and revenue is reported in your dealer dashboard with full per-deal and monthly summaries.",
        },
      },
    ],
  },
];

const planFeatures = [
  { feature: "Mechanical Coverage", basic: true, plus: true, premium: true },
  { feature: "Electrical Coverage", basic: false, plus: true, premium: true },
  { feature: "Plumbing", basic: false, plus: true, premium: true },
  { feature: "Structural", basic: false, plus: false, premium: true },
  { feature: "Appliances", basic: false, plus: true, premium: true },
  { feature: "Claims Support", basic: "Basic", plus: "Priority", premium: "Dedicated" },
  { feature: "Response Time", basic: "5 days", plus: "48 hours", premium: "Same day" },
];

const faqs = [
  {
    q: "How does manufacturer warranty tracking work?",
    a: "When a unit is added to the platform by VIN, the system records the manufacturer warranty start date and coverage period. Coverage expiry is tracked automatically per unit, and you receive alerts before warranties expire so you can proactively offer extended service plans.",
  },
  {
    q: "Can warranty claims be submitted through the platform?",
    a: "Warranty claims flow directly into the claims processing module. You create the claim inside the platform, add photos and line items, and the operator team handles submission on manufacturer portals. Approval status is tracked per line and reported back into your dealer dashboard.",
  },
  {
    q: "What extended service plans can I sell?",
    a: "The platform supports Basic, Plus, and Premium extended service plan tiers covering mechanical, electrical, plumbing, structural, and appliance components. Coverage terms and deductible options are configurable per plan.",
  },
  {
    q: "How does warranty plan revenue work for my dealership?",
    a: "Each extended service plan sold generates a commission for your dealership. Plans are sold at deal closing or post-sale through the customer portal, and revenue is reported in your dealer dashboard with full per-deal and monthly summaries.",
  },
];

function PlanCell({
  value,
}: {
  value: boolean | string;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
    ) : (
      <span className="text-muted-foreground/40 text-lg font-light">–</span>
    );
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
}

export default function WarrantyExtendedService() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageLayout
      seoTitle="Warranty & Extended Service Plans | RV Dealer Solutions | DealerSuite360"
      seoDescription="Manage manufacturer warranties and sell extended service plans through one platform. Track coverage, process claims, and maximize warranty revenue for your RV dealership."
      seoKeywords="RV warranty, extended service plans, warranty management, protection plans, warranty sales, manufacturer warranty tracking"
      canonical="/warranty-plans"
      schema={warrantySchema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <ServiceBadge quarter="Q2" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Warranty Management &amp; Extended Service Plans
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Track manufacturer warranties per VIN, sell extended service plans
            at deal closing, and connect warranty claims directly to your
            claims processing module — all inside one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start Selling Warranty Plans</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Talk to Our Team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Plan comparison table */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Extended Service Plan Tiers
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three tiers designed to match every customer's needs and budget.
              Sell them at deal closing or post-sale through the customer
              portal.
            </p>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="text-center p-4 font-semibold text-foreground">
                    Basic
                    <div className="text-sm font-normal text-muted-foreground mt-0.5">
                      $799 / unit
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-foreground bg-primary/5 border-x border-primary/20">
                    Plus ⭐
                    <div className="text-sm font-normal text-muted-foreground mt-0.5">
                      $1,299 / unit
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-foreground">
                    Premium
                    <div className="text-sm font-normal text-muted-foreground mt-0.5">
                      $1,899 / unit
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {planFeatures.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-4 font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td className="p-4 text-center">
                      <PlanCell value={row.basic} />
                    </td>
                    <td className="p-4 text-center bg-primary/5 border-x border-primary/20">
                      <PlanCell value={row.plus} />
                    </td>
                    <td className="p-4 text-center">
                      <PlanCell value={row.premium} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" asChild data-testid="button-signup-warranty">
              <Link href="/sign-up">Start Selling Warranty Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Manufacturer warranty tracking — alternating layout */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                OEM Warranty Tracking
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Manufacturer Warranty Tracking Per VIN
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every unit added to the platform by VIN gets a warranty record.
                The system tracks the manufacturer warranty start date, coverage
                period, and expiry date — across all supported manufacturers
                including Jayco, Forest River, Heartland, Columbia NW, Keystone,
                and Midwest Auto.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Coverage expiry is tracked in real time. As a unit approaches
                the end of its manufacturer warranty, the platform automatically
                triggers alerts so your team can proactively reach out and offer
                an extended service plan — turning a potential support call into
                a revenue opportunity.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                All warranty data is visible inside the Unit Detail view in your
                dealer dashboard, alongside claim history, inspection records,
                and parts orders.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "Per-VIN warranty records",
                  desc: "Coverage start, expiry, and remaining duration tracked automatically for every unit.",
                },
                {
                  icon: Bell,
                  title: "Automatic renewal alerts",
                  desc: "Platform alerts your team before coverage expires — so no unit falls through the cracks.",
                },
                {
                  icon: RefreshCw,
                  title: "Cross-manufacturer coverage",
                  desc: "Supports all major RV manufacturers with consistent tracking regardless of brand.",
                },
                {
                  icon: BarChart3,
                  title: "Coverage visibility in dealer dashboard",
                  desc: "All warranty data, claim history, and plan details visible in a single Unit Detail view.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 bg-card rounded-lg p-4 border border-border"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-sm">
                        {item.title}
                      </div>
                      <div className="text-muted-foreground text-sm mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Claims integration */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Warranty Claims Flow Directly Into Claims Processing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No duplicate data entry. Warranty claims created in the platform
              automatically appear in the operator processing queue.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                step: "1",
                title: "Create Warranty Claim",
                desc: "Dealer creates a warranty claim in the platform, adding FRC line items, descriptions, and photos per line.",
              },
              {
                icon: Wrench,
                step: "2",
                title: "Operator Processes Claim",
                desc: "The operator team reviews, optimizes FRC codes, and submits the claim on the manufacturer portal — tracking approval per line.",
              },
              {
                icon: CheckCircle2,
                step: "3",
                title: "Approvals Reported Back",
                desc: "Approval and denial decisions per line are logged in the platform and visible in the dealer's claim detail view.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-5">
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Revenue section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Warranty Plans as a Revenue Stream
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Extended service plans generate recurring dealer revenue on every
              unit — at deal closing and post-sale through the customer portal.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: CircleDollarSign,
                stat: "$500–$1,100",
                label: "Average dealer commission per plan sold",
              },
              {
                icon: TrendingUp,
                stat: "68%",
                label: "Of customers offered a plan at closing buy one",
              },
              {
                icon: RefreshCw,
                stat: "Post-sale",
                label: "Plans also sold through customer portal after delivery",
              },
              {
                icon: BarChart3,
                stat: "Per-deal",
                label: "Revenue reported per deal and monthly in your dashboard",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {item.stat}
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-12 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-1">3 Tiers</div>
              <div className="text-primary-foreground/80 text-sm">
                Plan Options for Every Customer
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">All Brands</div>
              <div className="text-primary-foreground/80 text-sm">
                Major RV Manufacturers Supported
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">Auto</div>
              <div className="text-primary-foreground/80 text-sm">
                Coverage Expiry Alerts
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">Integrated</div>
              <div className="text-primary-foreground/80 text-sm">
                Directly Into Claims Module
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <button
                  className="w-full text-left p-6 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-foreground">
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Start Selling Warranty Plans
          </h2>
          <p className="text-xl text-muted-foreground">
            Add a new revenue stream to every deal. Warranty plan management is
            available on all DealerSuite360 plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-contact-warranty">
              <Link href="/sign-up">Create Your Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              data-testid="button-call-warranty"
            >
              <Link href="/contact">Talk to Our Team</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
