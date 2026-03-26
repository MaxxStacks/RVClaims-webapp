import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ServiceBadge } from "@/components/service-badge";
import {
  FileText,
  GitMerge,
  ThumbsUp,
  Handshake,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Globe,
  Clock,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  Users,
  Zap,
} from "lucide-react";

const financingSchema = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "RV Financing Solutions for Dealers",
    description:
      "Streamline RV financing with integrated lender connections, approval optimization, and compliance tools. Help your customers secure the best financing while maximizing dealer revenue.",
    provider: {
      "@type": "Organization",
      name: "DealerSuite360",
      url: "https://dealersuite360.com",
    },
    serviceType: "RV Dealer Financing Integration",
    areaServed: "North America",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does lender integration work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Customer applications submitted through your DealerSuite360 dealer portal are automatically routed to our integrated lender network. The system matches the applicant profile to the lenders most likely to approve and returns results in real time.",
        },
      },
      {
        "@type": "Question",
        name: "Which lenders are in the network?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We integrate with a curated network of RV-specialist lenders across Canada and the US. Lender availability varies by province and state. Contact our team for a current list of active lenders in your market.",
        },
      },
      {
        "@type": "Question",
        name: "Is bilingual compliance documentation available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. All financing disclosure documents, credit agreements, and compliance forms are available in both English and French to meet Canadian federal and provincial requirements.",
        },
      },
      {
        "@type": "Question",
        name: "How much does the financing module cost?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The financing module is included with the Professional plan or available as a standalone add-on at $99/month. Visit our pricing page for full details.",
        },
      },
    ],
  },
];

const steps = [
  {
    number: "1",
    icon: FileText,
    title: "Customer Application",
    description:
      "Customer submits a financing application directly through your branded dealer portal. All required fields are validated instantly.",
    testId: "step-application",
  },
  {
    number: "2",
    icon: GitMerge,
    title: "Lender Matching",
    description:
      "The system automatically routes the application to the lenders in our network that best match the customer's credit and vehicle profile.",
    testId: "step-matching",
  },
  {
    number: "3",
    icon: ThumbsUp,
    title: "Approval Optimization",
    description:
      "Our engine analyzes responses across lenders and surfaces the best available rate and terms for your customer.",
    testId: "step-optimization",
  },
  {
    number: "4",
    icon: Handshake,
    title: "Deal Closing",
    description:
      "Approved terms flow into the deal record. Compliance documents are generated automatically, bilingual if required.",
    testId: "step-closing",
  },
];

const dealerBenefits = [
  "Higher close rates with same-day funding availability across multiple lenders",
  "Automated lender routing eliminates manual submission and follow-up",
  "Full deal and funding status visible inside your dealer dashboard in real time",
  "Compliance documentation generated automatically — no manual form prep",
];

const customerBenefits = [
  "Fast, simple application through your branded dealer portal",
  "Best available rate returned from multiple lenders — not just one",
  "Clear status tracking from application to funding",
  "Bilingual experience for francophone customers across Canada",
];

const faqs = [
  {
    q: "How does lender integration work?",
    a: "Customer applications submitted through your DealerSuite360 dealer portal are automatically routed to our integrated lender network. The system matches the applicant profile to the lenders most likely to approve and returns results in real time.",
  },
  {
    q: "Which lenders are in the network?",
    a: "We integrate with a curated network of RV-specialist lenders across Canada and the US. Lender availability varies by province and state. Contact our team for a current list of active lenders in your market.",
  },
  {
    q: "Is bilingual compliance documentation available?",
    a: "Yes. All financing disclosure documents, credit agreements, and compliance forms are available in both English and French to meet Canadian federal and provincial requirements.",
  },
  {
    q: "How much does the financing module cost?",
    a: "The financing module is included with the Professional plan or available as a standalone add-on at $99/month. Visit our pricing page for full details.",
  },
];

export default function Financing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PageLayout
      seoTitle="RV Financing Solutions for Dealers | Lender Integration | DealerSuite360"
      seoDescription="Streamline RV financing with integrated lender connections, approval optimization, and compliance tools. Help your customers secure the best financing while maximizing dealer revenue."
      seoKeywords="RV financing, dealership financing, loan approvals, lender integration, financing optimization, bilingual compliance"
      canonical="/financing"
      schema={financingSchema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <ServiceBadge quarter="Q2" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Financing Solutions That Close More Deals
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Integrated lender connections, approval optimization, and bilingual
            compliance tools — all inside your DealerSuite360 platform. Help
            your customers secure the best financing while you maximize
            per-deal revenue.
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

      {/* 4-step process flow */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How Financing Works on the Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From application to funded deal — a streamlined four-step process
              that runs inside your existing workflow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.testId}
                  data-testid={step.testId}
                  className="relative text-center"
                >
                  {/* Connector line (hidden on last item) */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] right-0 h-px bg-border z-0" />
                  )}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mx-auto mb-5">
                    {step.number}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Split benefits section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Benefits for Dealers & Customers
            </h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Dealer benefits */}
            <div
              className="bg-card rounded-xl p-8 border border-border"
              data-testid="card-dealerIntegration"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  For Dealers
                </h3>
              </div>
              <ul className="space-y-4">
                {dealerBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer benefits */}
            <div
              className="bg-card rounded-xl p-8 border border-border"
              data-testid="card-customerExperience"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  For Customers
                </h3>
              </div>
              <ul className="space-y-4">
                {customerBenefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-relaxed">
                      {benefit}
                    </span>
                  </li>
                ))}
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
              <div className="text-3xl font-bold mb-1">35%+</div>
              <div className="text-primary-foreground/80 text-sm">
                Higher Approval Rates
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">Same Day</div>
              <div className="text-primary-foreground/80 text-sm">
                Funding Available
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">Multiple</div>
              <div className="text-primary-foreground/80 text-sm">
                Integrated Lenders
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">EN/FR</div>
              <div className="text-primary-foreground/80 text-sm">
                Bilingual Compliance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How lender integration works — alternating layout */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                Lender Integration
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                One Platform. Multiple Lenders.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Our financing module connects your dealership to a curated
                network of RV-specialist lenders across Canada and the United
                States. Rather than submitting one application to one lender
                and waiting, the platform routes applications to multiple
                lenders simultaneously — returning the best available approval
                in real time.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Each lender connection is purpose-built for RV deals — not
                retrofitted from automotive. Lenders in the network understand
                RV collateral, seasonal buying patterns, and the unique
                financing requirements of towable and motorized units.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As the network grows, your approval rates and available terms
                improve automatically — no configuration required on your end.
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: RefreshCw,
                  title: "Real-time multi-lender routing",
                  desc: "Applications go to multiple lenders at once. Best approval surfaces automatically.",
                },
                {
                  icon: ShieldCheck,
                  title: "RV-specific lender network",
                  desc: "Every lender in the network specializes in RV financing — not automotive.",
                },
                {
                  icon: Clock,
                  title: "Same-day funding available",
                  desc: "Fast approval and funding pipelines mean you can close deals without waiting.",
                },
                {
                  icon: Globe,
                  title: "Canadian & US coverage",
                  desc: "Active lender relationships in both markets, with province and state-specific compliance.",
                },
                {
                  icon: Zap,
                  title: "Automatic compliance documents",
                  desc: "All required forms generated automatically based on deal jurisdiction and lender.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 bg-card rounded-lg p-4 border border-border"
                    data-testid={`card-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
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

      {/* Pricing mention */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card rounded-xl p-8 border border-border">
            <h3 className="text-xl font-bold text-foreground mb-3">
              Financing Module Pricing
            </h3>
            <p className="text-muted-foreground mb-4">
              Financing module — included with the Professional plan or
              available as an add-on at{" "}
              <span className="font-semibold text-foreground">$99/month</span>.
            </p>
            <Button variant="outline" asChild data-testid="button-pricing-financing">
              <Link href="/pricing">View Full Pricing</Link>
            </Button>
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
            Optimize Your Financing Today
          </h2>
          <p className="text-xl text-muted-foreground">
            Connect your dealership to our lender network and start closing more
            deals with better rates for your customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-contact-financing">
              <Link href="/contact">Contact Our Team</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              data-testid="button-signup-financing"
            >
              <Link href="/sign-up">Create Your Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
