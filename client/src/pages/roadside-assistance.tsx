import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { ServiceBadge } from "@/components/service-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import {
  Truck, Wrench, Battery, Key, Fuel, AlertCircle,
  CheckCircle, ChevronDown, DollarSign, Shield,
  Phone, MapPin, Clock, Users
} from "lucide-react";

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "24/7 RV Roadside Assistance",
  "provider": { "@type": "Organization", "name": "Dealer Suite 360", "url": "https://dealersuite360.com" },
  "areaServed": { "@type": "Place", "name": "North America" },
  "description": "Offer your customers 24/7 roadside assistance coverage. Towing, emergency repairs, tire service, and lockout assistance for RVs across North America.",
  "url": "https://dealersuite360.com/roadside-assistance"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do dealers add roadside assistance to their product offerings?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Dealers enroll through DealerSuite360 and can offer roadside assistance plans at point of sale or as a standalone add-on. Plans are sold per unit at an annual rate, and management is handled entirely through the dealer portal."
      }
    },
    {
      "@type": "Question",
      name: "What is the response time for emergency roadside calls?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our dispatch center targets a 30-minute response to first contact. Actual on-site arrival times vary by location, but the 24/7 dispatch center is operational at all times to coordinate service and communicate ETAs."
      }
    },
    {
      "@type": "Question",
      name: "Does roadside assistance coverage apply across the entire RV?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Coverage applies to the RV unit itself regardless of tow vehicle. This includes Class A, B, and C motorhomes as well as towable units. Tow vehicle-specific breakdowns are not covered under the RV plan."
      }
    },
    {
      "@type": "Question",
      name: "How is roadside assistance pricing structured for dealers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Plans are priced per unit per year. Dealers purchase plans at a wholesale rate and sell at retail, retaining the margin. Pricing is tiered based on RV class and coverage level. Contact our team for a dealer pricing sheet."
      }
    }
  ]
};

const coverageCards = [
  {
    icon: Truck,
    title: "Emergency Towing",
    description: "Full RV towing to the nearest qualified service facility when the unit cannot be safely operated.",
    included: ["Up to 100 miles per incident", "All RV types and sizes", "Flatbed and specialized equipment", "Destination of owner's choice (within limit)"]
  },
  {
    icon: AlertCircle,
    title: "Flat Tire Service",
    description: "On-site tire change using the RV's spare or emergency inflation for drivable flats.",
    included: ["Spare tire mounting", "Tire inflation service", "Referral to tire shop if needed", "All axle positions covered"]
  },
  {
    icon: Battery,
    title: "Battery Jump Start",
    description: "Emergency battery boost to get motorhomes and self-contained units running again.",
    included: ["12V and 24V systems", "Coach and chassis battery", "Generator battery service", "Replacement referral if needed"]
  },
  {
    icon: Key,
    title: "Lockout Assistance",
    description: "Professional lockout service when keys are locked inside the unit — day or night.",
    included: ["Entry door lockouts", "Compartment access", "Key replacement referral", "No damage guarantee"]
  },
  {
    icon: Fuel,
    title: "Fuel Delivery",
    description: "Emergency fuel or DEF delivery when the tank runs dry — to get you to the nearest station.",
    included: ["Up to 5 gallons delivered", "Diesel, gasoline, DEF", "Propane referral service", "Cost of fuel charged separately"]
  },
  {
    icon: Wrench,
    title: "Emergency Repairs",
    description: "Minor on-site mechanical assistance when the issue is safe to repair roadside.",
    included: ["Minor mechanical adjustments", "Hitch and connection help", "Slide-out manual override", "Escalation to tow when needed"]
  },
];

const dealerBullets = [
  "Add a premium revenue line with zero operational overhead — DealerSuite360 handles dispatch, fulfillment, and customer service",
  "Offer plans at point of sale during unit delivery — highest conversion rate when the customer is most engaged",
  "Earn margin on every plan sold: purchase wholesale, sell at retail through your branded portal",
  "Increase customer lifetime value and return visits — customers with active coverage plans return to your service department first",
];

const ownerBullets = [
  "Peace of mind for every trip — one number to call from anywhere in North America, 24 hours a day",
  "Coverage area spans all 50 US states and all Canadian provinces — no geographic exclusions for plan holders",
  "30-minute response target from dispatch — you'll know help is on the way within minutes of calling",
  "All RV types covered: motorhomes, travel trailers, fifth wheels, toy haulers, and all specialty formats",
];

const howItWorksSteps = [
  {
    number: "01",
    icon: Phone,
    title: "Customer Calls",
    description: "Customer dials the 24/7 dispatch number on their coverage card. A live dispatcher answers within minutes — no automated menus."
  },
  {
    number: "02",
    icon: MapPin,
    title: "Service Assigned",
    description: "Dispatch locates the nearest qualified service provider for the issue type and dispatches them with full details."
  },
  {
    number: "03",
    icon: Truck,
    title: "Service Arrives",
    description: "The service provider arrives and resolves the issue on-site or arranges safe transport to a service facility."
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Claim Logged",
    description: "The incident is automatically logged in DealerSuite360. The dealer is notified and the record is available for review."
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

export default function RoadsideAssistance() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle="24/7 RV Roadside Assistance | Emergency Coverage | DealerSuite360"
      seoDescription="Offer your customers 24/7 roadside assistance coverage. Towing, emergency repairs, tire service, and lockout assistance for RVs across North America."
      seoKeywords="RV roadside assistance, emergency towing, RV breakdown, 24/7 roadside support, dealership roadside program, RV lockout service"
      canonical="/roadside-assistance"
      schema={[serviceSchema, faqSchema]}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <ServiceBadge quarter="Q4" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
            24/7 Roadside Assistance for RV Owners
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Give your customers confidence on every trip. Sell roadside assistance plans directly through DealerSuite360 — we handle dispatch, fulfillment, and customer service. You keep the margin.
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

      {/* Coverage Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Roadside Coverage</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Six essential services — all available 24 hours a day, seven days a week, anywhere in North America.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coverageCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">{card.description}</p>
                  <ul className="space-y-2">
                    {card.included.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Dealers */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 border border-primary/20 px-3 py-1 text-xs" variant="outline">
                For Dealers
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                A New Revenue Line With Zero Overhead
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
                Roadside assistance is one of the highest-margin add-ons a dealership can offer. Customers who experience a breakdown without coverage remember it — and so do customers who get fast, professional help when they need it most.
              </p>
              <div className="space-y-4">
                {dealerBullets.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-10 border border-border">
              <DollarSign className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">Revenue Opportunity at Point of Sale</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Roadside assistance plans are sold at unit delivery — the highest-intent moment in the customer relationship. When bundled with extended warranty and protection packages, attachment rates exceed 60%.
              </p>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <p className="text-sm font-medium text-foreground">
                  Dealers who offer roadside plans at delivery report higher CSI scores, more service appointments, and stronger unit repurchase rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Owners */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="bg-card rounded-2xl p-10 border border-border md:order-1">
              <Shield className="w-12 h-12 text-primary mb-6" />
              <h3 className="text-xl font-bold mb-4">True Peace of Mind on Every Trip</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                RV travel takes people to some of the most remote and beautiful places on the continent. When something goes wrong — and it eventually does — having a 24/7 dispatch number on hand makes all the difference between a minor inconvenience and a ruined trip.
              </p>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                <p className="text-sm font-medium text-foreground">
                  One phone call connects customers to a live dispatcher who coordinates everything — no searching for local tow companies in an unfamiliar area.
                </p>
              </div>
            </div>
            <div className="md:order-2">
              <Badge className="mb-4 border border-primary/20 px-3 py-1 text-xs" variant="outline">
                For RV Owners
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Help Is Always One Call Away
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 text-lg">
                Coverage travels with the RV — not with the owner. Wherever the trip takes them, customers have access to immediate assistance from a live dispatch team.
              </p>
              <div className="space-y-4">
                {ownerBullets.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-12 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-white/75 text-sm">Live Dispatch — Always On</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">North America</div>
              <div className="text-white/75 text-sm">Coverage Area</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">30-Min</div>
              <div className="text-white/75 text-sm">Response Target</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">All RV Types</div>
              <div className="text-white/75 text-sm">Motorhome to Trailer</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From the moment a customer calls to the moment the issue is resolved — four steps, completely managed.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorksSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="text-xs font-semibold text-primary mb-1">{step.number}</div>
                  <h3 className="font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Simple Per-Unit Pricing</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Roadside assistance plans are sold on a per-unit, per-year basis. Dealers purchase at wholesale and earn margin on every plan sold at delivery.
          </p>
          <div className="bg-card rounded-2xl p-10 border border-border max-w-md mx-auto">
            <div className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Annual Plan</div>
            <div className="text-5xl font-bold mb-2">Starting at <span className="text-primary">$X</span></div>
            <div className="text-muted-foreground mb-6">per unit per year</div>
            <div className="space-y-3 text-left mb-8">
              {[
                "All 6 coverage categories included",
                "No per-call fees for covered incidents",
                "Transferable if unit is sold",
                "Managed through dealer portal",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{point}</span>
                </div>
              ))}
            </div>
            <Button className="w-full" size="lg" asChild>
              <Link href="/contact">Get Dealer Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <FaqItem
              question="How do dealers add roadside assistance to their product offerings?"
              answer="Dealers enroll through DealerSuite360 and can offer roadside assistance plans at point of sale or as a standalone add-on. Plans are sold per unit at an annual rate, and management is handled entirely through the dealer portal."
            />
            <FaqItem
              question="What is the response time for emergency roadside calls?"
              answer="Our dispatch center targets a 30-minute response to first contact. Actual on-site arrival times vary by location, but the 24/7 dispatch center is operational at all times to coordinate service and communicate ETAs."
            />
            <FaqItem
              question="Does roadside assistance coverage apply across the entire RV?"
              answer="Yes. Coverage applies to the RV unit itself regardless of tow vehicle. This includes Class A, B, and C motorhomes as well as towable units. Tow vehicle-specific breakdowns are not covered under the RV plan."
            />
            <FaqItem
              question="How is roadside assistance pricing structured for dealers?"
              answer="Plans are priced per unit per year. Dealers purchase plans at a wholesale rate and sell at retail, retaining the margin. Pricing is tiered based on RV class and coverage level. Contact our team for a dealer pricing sheet."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
            Add Roadside Assistance to Your Offerings
          </h2>
          <p className="text-xl text-muted-foreground">
            Launch roadside assistance as part of your DealerSuite360 platform. Available Q4 2026 — contact us to get on the dealer early access list.
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
