import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ServiceBadge } from "@/components/service-badge";
import {
  Video,
  ShieldCheck,
  Zap,
  Clock,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Key,
  Paintbrush,
  Layers,
  CircleDollarSign,
  Umbrella,
  Disc,
  ArrowRight,
  Users,
  BarChart3,
} from "lucide-react";

const fiSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "F&I Services & AI Presenter",
    description:
      "Outsource your F&I department or enhance it with our AI-powered F&I Presenter. Increase product penetration, customer satisfaction, and per-deal revenue.",
    provider: {
      "@type": "Organization",
      name: "DealerSuite360",
      url: "https://dealersuite360.com",
    },
    serviceType: "Finance and Insurance Outsourcing",
    areaServed: "North America",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the AI F&I Presenter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The AI F&I Presenter is a video avatar that delivers a personalized F&I product presentation to your customer after a deal is closed. The customer receives a private link, the avatar greets them by name, knows their unit and deal details, and walks them through available protection products. Accepted products automatically sync back into the platform.",
        },
      },
      {
        "@type": "Question",
        name: "Does this replace my F&I manager?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The AI Presenter is a supplemental tool that ensures every customer receives a complete, consistent presentation — even when your F&I manager is unavailable. Many dealers use it for after-hours follow-up or remote delivery customers.",
        },
      },
      {
        "@type": "Question",
        name: "What F&I products can be presented?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The platform supports Extended Warranty, GAP Insurance, Tire & Wheel Protection, Paint Protection, Fabric Protection, and Key Replacement. Additional products can be added based on your dealership's portfolio.",
        },
      },
      {
        "@type": "Question",
        name: "How does the traditional F&I outsourcing option work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our certified F&I specialists handle the complete F&I process on behalf of your dealership — loan origination, product presentation, compliance documentation, and reporting. You get expert F&I management without the overhead of an in-house department.",
        },
      },
    ],
  },
];

const products = [
  {
    icon: ShieldCheck,
    name: "Extended Warranty",
    description:
      "Comprehensive mechanical and electrical coverage beyond the manufacturer period. Multiple term and deductible options.",
    testId: "card-extended-warranty",
  },
  {
    icon: Umbrella,
    name: "GAP Insurance",
    description:
      "Covers the difference between the loan balance and actual cash value if the unit is totalled or stolen.",
    testId: "card-gap-insurance",
  },
  {
    icon: Disc,
    name: "Tire & Wheel Protection",
    description:
      "Road hazard coverage for tire and wheel damage including blowouts, potholes, and curb impact.",
    testId: "card-tire-wheel",
  },
  {
    icon: Paintbrush,
    name: "Paint Protection",
    description:
      "Professional-grade paint sealant with guaranteed finish protection against oxidation, fading, and surface damage.",
    testId: "card-paint-protection",
  },
  {
    icon: Layers,
    name: "Fabric Protection",
    description:
      "Interior fabric and leather treatment that repels stains and UV damage, keeping interiors looking new.",
    testId: "card-fabric-protection",
  },
  {
    icon: Key,
    name: "Key Replacement",
    description:
      "Covers the cost of lost, stolen, or broken keys and remotes — including programming and locksmith fees.",
    testId: "card-key-replacement",
  },
];

const faqs = [
  {
    q: "What is the AI F&I Presenter?",
    a: "The AI F&I Presenter is a video avatar that delivers a personalized F&I product presentation to your customer after a deal is closed. The customer receives a private link, the avatar greets them by name, knows their unit and deal details, and walks them through available protection products. Accepted products automatically sync back into the platform.",
  },
  {
    q: "Does this replace my F&I manager?",
    a: "No. The AI Presenter is a supplemental tool that ensures every customer receives a complete, consistent presentation — even when your F&I manager is unavailable. Many dealers use it for after-hours follow-up or remote delivery customers.",
  },
  {
    q: "What F&I products can be presented?",
    a: "The platform supports Extended Warranty, GAP Insurance, Tire & Wheel Protection, Paint Protection, Fabric Protection, and Key Replacement. Additional products can be added based on your dealership's portfolio.",
  },
  {
    q: "How does the traditional F&I outsourcing option work?",
    a: "Our certified F&I specialists handle the complete F&I process on behalf of your dealership — loan origination, product presentation, compliance documentation, and reporting. You get expert F&I management without the overhead of an in-house department.",
  },
];

export default function FIServices() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageLayout
      seoTitle="F&I Services & AI Presenter | RV Dealer F&I Outsourcing | DealerSuite360"
      seoDescription="Outsource your F&I department or enhance it with our AI-powered F&I Presenter. Increase product penetration, customer satisfaction, and per-deal revenue."
      seoKeywords="F&I services, finance and insurance, dealership F&I, F&I outsourcing, GAP insurance, extended warranty, AI F&I presenter"
      canonical="/fi-services"
      schema={fiSchema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <ServiceBadge quarter="Q2" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            F&I Services That Maximize Every Deal
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Increase per-deal revenue with our AI-powered F&I Presenter and full
            outsourcing option. Every customer gets a complete, consistent
            product presentation — automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Talk to Our Team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI F&I Presenter — flagship, alternating layout */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Flagship Feature
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Meet the AI F&I Presenter
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              An AI video avatar that delivers a personalized F&I presentation
              to every customer — automatically, after every deal.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: description */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Personalized. Automated. Consistent.
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The moment a deal closes in the platform, the AI F&I Presenter
                generates a unique, personalized presentation for that customer.
                They receive a private link — no app download required.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The AI avatar greets the customer by name, knows the exact unit
                they purchased and the deal terms, and walks them through each
                available protection product in plain language. It handles
                common objections and answers questions intelligently.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Products the customer accepts automatically sync back into the
                platform and are added to the deal record — no manual data entry,
                no missed products, no follow-up calls required.
              </p>
            </div>

            {/* Right: benefits */}
            <div className="bg-card rounded-xl p-8 border border-border">
              <h4 className="text-lg font-semibold text-foreground mb-6">
                Key Benefits
              </h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">
                      No customer left behind
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Every customer gets a complete presentation — whether the
                      deal closed in-store, remotely, or after hours.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">
                      Greets by name, knows the deal
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      The avatar uses real customer and deal data — not a
                      generic script — for a genuinely personalized experience.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">
                      Handles objections intelligently
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Built-in objection handling trained on thousands of real
                      F&I conversations increases acceptance rates.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground">
                      Auto-syncs accepted products
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">
                      Accepted products flow directly into the deal record and
                      trigger billing — zero manual steps required.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-12 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-1">40%+</div>
              <div className="text-primary-foreground/80 text-sm">
                Increase in F&I Penetration
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">3x</div>
              <div className="text-primary-foreground/80 text-sm">
                More Products Presented
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-primary-foreground/80 text-sm">
                Consistent Presentation
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-primary-foreground/80 text-sm">
                Available to Customers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* F&I Products grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              F&I Products We Present
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Six core protection products, each presented with clear benefit
              language your customers actually understand.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => {
              const Icon = product.icon;
              return (
                <div
                  key={product.testId}
                  data-testid={product.testId}
                  className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Traditional F&I Outsourcing */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                Full Outsourcing Option
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Traditional F&I Outsourcing
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Not ready to keep F&I in-house? Our certified F&I specialists
                handle the complete department on your behalf — from deal
                structuring and product presentation to compliance documentation
                and revenue reporting.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                You get the expertise of a seasoned F&I department without the
                salary, training costs, and management overhead. Everything
                integrates directly into your DealerSuite360 platform so you
                always have full visibility.
              </p>
              <Button size="lg" asChild data-testid="button-contact-fi">
                <Link href="/contact">Discuss Outsourcing</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: Users,
                  title: "Certified F&I specialists",
                  desc: "Experienced professionals who handle every aspect of the F&I process for your dealership.",
                },
                {
                  icon: CircleDollarSign,
                  title: "Loan origination & product sales",
                  desc: "Full loan structuring, lender submission, and F&I product presentation handled end-to-end.",
                },
                {
                  icon: ShieldCheck,
                  title: "Compliance documentation",
                  desc: "All required disclosure forms, product contracts, and regulatory compliance managed for you.",
                },
                {
                  icon: BarChart3,
                  title: "Revenue reporting",
                  desc: "Detailed per-deal and monthly F&I revenue reports available inside your dealer dashboard.",
                },
                {
                  icon: Zap,
                  title: "Staff training included",
                  desc: "Ongoing training for your sales team on how to introduce F&I products effectively.",
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

      {/* Revenue Impact comparison table */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Revenue Impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Dealers using our F&I services see measurable improvement in
              per-deal revenue. Here's what changes.
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left p-5 font-semibold text-foreground">
                    Metric
                  </th>
                  <th className="text-center p-5 font-semibold text-muted-foreground">
                    Without DealerSuite360
                  </th>
                  <th className="text-center p-5 font-semibold text-primary bg-primary/5">
                    With DealerSuite360
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    metric: "Products presented per deal",
                    without: "1–2 (if time allows)",
                    with: "All 6, every time",
                  },
                  {
                    metric: "Customer presentation consistency",
                    without: "Varies by salesperson",
                    with: "100% consistent",
                  },
                  {
                    metric: "After-hours customer follow-up",
                    without: "Missed opportunity",
                    with: "Automatic via AI",
                  },
                  {
                    metric: "Remote delivery F&I",
                    without: "Not possible",
                    with: "Fully supported",
                  },
                  {
                    metric: "Product penetration rate",
                    without: "Industry avg ~35%",
                    with: "40–55% typical",
                  },
                  {
                    metric: "Per-deal F&I revenue",
                    without: "$500–$800 avg",
                    with: "$1,200–$1,800 avg",
                  },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    <td className="p-5 font-medium text-foreground">
                      {row.metric}
                    </td>
                    <td className="p-5 text-center text-muted-foreground">
                      {row.without}
                    </td>
                    <td className="p-5 text-center text-primary font-semibold bg-primary/5">
                      {row.with}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Process flow */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              From deal close to accepted products — fully automated in four
              steps.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Deal Closed",
                desc: "Deal is finalized and recorded in the platform. The system is triggered automatically.",
                icon: CheckCircle2,
              },
              {
                step: "2",
                title: "Customer Receives Link",
                desc: "A personalized, private presentation link is sent to the customer via email or SMS.",
                icon: ArrowRight,
              },
              {
                step: "3",
                title: "AI Presenter Walks Through Products",
                desc: "The AI avatar greets the customer by name and presents each F&I product with clear explanations.",
                icon: Video,
              },
              {
                step: "4",
                title: "Accepted Products Sync Automatically",
                desc: "Products the customer selects instantly appear in the deal record and trigger invoicing.",
                icon: Zap,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
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
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Boost Your F&I Revenue
          </h2>
          <p className="text-xl text-muted-foreground">
            Talk to our team about adding the AI F&I Presenter or full
            outsourcing to your dealership.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-contact-fi-cta">
              <Link href="/contact">Contact Our Team</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              data-testid="button-signup-fi"
            >
              <Link href="/sign-up">Create Your Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
