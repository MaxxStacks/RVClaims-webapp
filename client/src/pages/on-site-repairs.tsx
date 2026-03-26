import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { ServiceBadge } from "@/components/service-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import {
  Wrench, Zap, Droplets, Wind, ThumbsUp, Clock,
  DollarSign, Star, LayoutGrid, ChevronDown,
  CheckCircle, ArrowRight, Settings, Home
} from "lucide-react";

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "On-Site RV Repair Services",
  "provider": { "@type": "Organization", "name": "Dealer Suite 360", "url": "https://dealersuite360.com" },
  "areaServed": { "@type": "Place", "name": "North America" },
  "description": "Coordinate on-site and mobile repair services for warranty claims. Reduce downtime, improve customer satisfaction, and streamline the repair process.",
  "url": "https://dealersuite360.com/on-site-repairs"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How are on-site repairs coordinated through DealerSuite360?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When a warranty claim is filed, dealers can flag it for on-site service. The platform dispatches a qualified technician based on location and RV type, and every step — from dispatch to verification — is tracked directly in the dealer dashboard."
      }
    },
    {
      "@type": "Question",
      name: "What types of repairs can be completed on-site?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On-site technicians can handle mechanical repairs, slide and awning issues, water infiltration, appliance servicing, electrical diagnostics and repairs, and minor structural fixes. Complex structural or frame work may require shop transport."
      }
    },
    {
      "@type": "Question",
      name: "How does on-site repair affect warranty claim processing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On-site repairs are fully integrated with the claims module. Work orders, technician notes, photos, and parts used are all linked to the underlying claim record. This ensures accurate documentation for manufacturer reimbursement."
      }
    },
    {
      "@type": "Question",
      name: "Is on-site repair service available across all of Canada and the US?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Coverage is expanding across North America. High-density RV markets (Ontario, BC, Alberta, the US Sunbelt) have the highest technician availability. Rural coverage is coordinated through dealer network partnerships."
      }
    }
  ]
};

const processSteps = [
  { number: "01", title: "Claim Filed", description: "Dealer creates a warranty claim in DealerSuite360 and flags it for on-site service coordination." },
  { number: "02", title: "Repair Type Determined", description: "Operator reviews the claim, confirms scope of work, and identifies the required technician skill set." },
  { number: "03", title: "Technician Dispatched", description: "A qualified mobile technician is assigned based on location, RV type, and availability — typically within 48 hours." },
  { number: "04", title: "On-Site Repair", description: "The technician arrives at the customer's location — campground, storage, or home — and completes the approved repairs." },
  { number: "05", title: "Work Verified", description: "Technician submits completion photos, parts documentation, and labor log through the platform." },
  { number: "06", title: "Claim Updated & Closed", description: "The claim is automatically updated with repair records. Manufacturer reimbursement is processed through normal claim channels." },
];

const benefits = [
  {
    icon: Clock,
    title: "Reduced Customer Wait Times",
    description: "Customers don't need to transport their RV to a shop and wait days or weeks for a bay opening. Mobile service can often begin within 48 hours of dispatch, dramatically cutting the time from complaint to resolution — improving the customer experience and your dealership's reputation."
  },
  {
    icon: DollarSign,
    title: "Lower Transport Costs",
    description: "Moving a 40-foot fifth wheel or a Class A motorhome to a service facility is expensive. On-site service eliminates towing and transport fees entirely. For minor repairs, the cost savings are significant — and those savings flow back to both the dealer and the customer."
  },
  {
    icon: ThumbsUp,
    title: "Faster Claim Resolution",
    description: "When repairs happen on-site, documentation is captured in real time. Photos, technician notes, and parts data upload directly to the claim record. This means faster submission to the manufacturer, fewer back-and-forth requests, and quicker reimbursement cycles."
  },
  {
    icon: Star,
    title: "Improved Dealer Reputation",
    description: "Dealerships that offer on-site repair as part of their warranty service stand out in a competitive market. Customers remember who made the process easy. Positive experiences translate directly into reviews, referrals, and repeat business — all tracked through your DealerSuite360 CRM."
  },
];

const serviceCards = [
  {
    icon: Settings,
    title: "Mechanical Repairs",
    description: "Engine, drivetrain, leveling systems, and chassis components. Technicians arrive with diagnostic tools and common parts for same-visit resolution."
  },
  {
    icon: Wind,
    title: "Slide & Awning Repairs",
    description: "Slide-out motor replacements, awning fabric and arm repairs, and room seal adjustments. Most slide and awning jobs are completed in a single visit."
  },
  {
    icon: Droplets,
    title: "Water Infiltration",
    description: "Roof seal inspection and repair, window resealing, and moisture damage assessment. Early intervention prevents costly interior damage."
  },
  {
    icon: Home,
    title: "Appliance Service",
    description: "Refrigerator, furnace, water heater, and air conditioner diagnostics and repair. All major RV appliance brands supported."
  },
  {
    icon: Zap,
    title: "Electrical Repairs",
    description: "Shore power connections, inverter issues, solar panel faults, lighting, and 12V system diagnostics. Full electrical testing on-site."
  },
  {
    icon: LayoutGrid,
    title: "Structural Fixes",
    description: "Interior cabinetry, flooring, door hardware, and minor exterior panel repairs. Larger structural work is escalated with full claim documentation."
  },
];

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
        <ChevronDown className={`text-primary flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} size={20} />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 bg-card text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function OnSiteRepairs() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle="On-Site RV Repair Services | Mobile Warranty Repairs | DealerSuite360"
      seoDescription="Coordinate on-site and mobile repair services for warranty claims. Reduce downtime, improve customer satisfaction, and streamline the repair process."
      seoKeywords="RV on-site repairs, mobile RV technician, campground repairs, RV service dispatch, dealership network, mobile warranty repairs"
      canonical="/on-site-repairs"
      schema={[serviceSchema, faqSchema]}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <ServiceBadge quarter="Q3" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
            On-Site Repairs — Minimize Downtime, Maximize Satisfaction
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Mobile repair coordination built directly into the DealerSuite360 platform. Dispatch qualified technicians to campgrounds, storage facilities, or customer driveways — and keep every repair tied to the underlying warranty claim.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">Get Early Access</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/contact">Talk to Our Team</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How On-Site Repair Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Six steps from claim creation to closed — fully tracked in your dashboard.
            </p>
          </div>
          <div className="relative">
            {/* Connecting line — visible on md+ */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-border" style={{ marginLeft: '8.33%', marginRight: '8.33%' }} />
            <div className="grid md:grid-cols-6 gap-6">
              {processSteps.map((step) => (
                <div key={step.number} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold mb-4 z-10 flex-shrink-0">
                    {step.number}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-sm">{step.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits — 2-column alternating */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why On-Site Repair Changes Everything</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four measurable benefits for your dealership and your customers.
            </p>
          </div>
          <div className="space-y-16">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const isEven = index % 2 === 1;
              return (
                <div
                  key={benefit.title}
                  className={`grid md:grid-cols-2 gap-12 items-center ${isEven ? "md:flex-row-reverse" : ""}`}
                >
                  <div className={isEven ? "md:order-2" : ""}>
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">{benefit.description}</p>
                  </div>
                  <div className={`bg-card rounded-2xl p-8 border border-border ${isEven ? "md:order-1" : ""}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground font-medium">Tracked in your DealerSuite360 dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground font-medium">Linked directly to the underlying warranty claim</span>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground font-medium">Automatic documentation capture for reimbursement</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground font-medium">Real-time status updates for dealer and customer</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-12 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">48hr</div>
              <div className="text-white/75 text-sm">Average Response Time</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">Lower</div>
              <div className="text-white/75 text-sm">Transport Costs vs. Shop Towing</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">Claim</div>
              <div className="text-white/75 text-sm">Integrated — Zero Manual Entry</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">North America</div>
              <div className="text-white/75 text-sm">Coverage Network</div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage & Services Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Technicians Fix On-Site</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Six categories of repair — all fully coordinated through your dealer dashboard.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Claims Integration Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 border border-primary/20 px-3 py-1 text-xs" variant="outline">
                Platform Integration
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Every Repair Lives Inside Your Claim
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
                On-site repairs are tracked directly in your DealerSuite360 platform. There's no separate system to manage, no manual data entry, and no risk of documentation getting lost between your repair team and your claims team.
              </p>
              <div className="space-y-4">
                {[
                  "Repair orders auto-link to the associated warranty claim",
                  "Technician photos upload directly to claim photo gallery",
                  "Parts used are captured and tied to FRC line items",
                  "Labor hours populate the claim for manufacturer submission",
                  "Customer sign-off recorded digitally at point of completion",
                  "Claim status updates automatically when repair is verified",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-10 border border-border">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">No Duplicate Data Entry</p>
                    <p className="text-muted-foreground text-sm">Everything captured on-site flows directly to the claim record.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Real-Time Status Visibility</p>
                    <p className="text-muted-foreground text-sm">Dealer, operator, and customer all see live repair status.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Audit-Ready Documentation</p>
                    <p className="text-muted-foreground text-sm">Every repair creates a complete audit trail for manufacturer review.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Faster Reimbursement</p>
                    <p className="text-muted-foreground text-sm">Complete documentation means fewer revision requests and faster payment.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FaqItem
              question="How are on-site repairs coordinated through DealerSuite360?"
              answer="When a warranty claim is filed, dealers can flag it for on-site service. The platform dispatches a qualified technician based on location and RV type, and every step — from dispatch to verification — is tracked directly in the dealer dashboard."
            />
            <FaqItem
              question="What types of repairs can be completed on-site?"
              answer="On-site technicians can handle mechanical repairs, slide and awning issues, water infiltration, appliance servicing, electrical diagnostics and repairs, and minor structural fixes. Complex structural or frame work may require shop transport."
            />
            <FaqItem
              question="How does on-site repair affect warranty claim processing?"
              answer="On-site repairs are fully integrated with the claims module. Work orders, technician notes, photos, and parts data upload directly to the claim record. This ensures accurate documentation for manufacturer reimbursement."
            />
            <FaqItem
              question="Is on-site repair service available across all of Canada and the US?"
              answer="Coverage is expanding across North America. High-density RV markets (Ontario, BC, Alberta, the US Sunbelt) have the highest technician availability. Rural coverage is coordinated through dealer network partnerships."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Coordinate Your First On-Site Repair
          </h2>
          <p className="text-xl text-muted-foreground">
            Talk to our team about integrating mobile repair into your warranty claims workflow. Available Q3 2026 — get on the early access list today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/contact">Contact Our Team</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-up">Get Early Access</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
