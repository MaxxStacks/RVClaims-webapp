import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, ArrowRight, DollarSign, Shield, Users, TrendingUp } from "lucide-react";

export default function ConsignmentServices() {
  return (
    <PageLayout
      seoTitle="RV Consignment Services for Dealers | Dealer Suite 360"
      seoDescription="Expand your used inventory without floor plan risk. Dealer Suite 360 consignment services connect private owners with your dealership's sales team."
      canonical="/consignment-services"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Launching Q3 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Consignment Services —<br />Expand Your Inventory, Minimize Risk
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Grow your used inventory without committing floor plan capital. Accept units on consignment, leverage your sales team and facilities, and earn a commission split on every successful sale.
          </p>
          <Link href="/contact">
            <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
              Explore Consignment →
            </button>
          </Link>
        </div>
      </section>

      {/* Two-Column Benefits */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Benefits for Everyone Involved</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Benefits for Dealers</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Expand used inventory without floor plan risk or capital outlay",
                  "Earn commission on every consigned unit sold (typically 10–15%)",
                  "Leverage existing sales staff, lot space, and customer traffic",
                  "Increase foot traffic with a broader selection of used inventory",
                  "Units managed in the same portal as your owned inventory",
                  "Automated consignment agreements and payout calculation",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Benefits for Unit Owners</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Professional sales team and dealership credibility vs. private sale",
                  "Higher sale price potential than trade-in value",
                  "No upfront costs — commission deducted at sale only",
                  "Detailed listing with professional photography support",
                  "Real-time sale status updates through owner portal",
                  "Secure payment processing at sale completion",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">The Consignment Process</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From submission to sale, the entire consignment workflow is managed inside Dealer Suite 360.
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            {[
              { step: "1", title: "Owner Submits", body: "Owner submits unit details and photos through our consignment intake form. VIN, condition, asking price, and any existing warranty information collected." },
              { step: "2", title: "Inspection", body: "Dealer conducts a walk-around inspection and completes the consignment intake form in the platform. Condition report and photos uploaded to unit record." },
              { step: "3", title: "Listing Created", body: "Dealer reviews and approves the listing. Unit appears in the dealer's inventory portal and, with the Marketplace add-on, on public listings." },
              { step: "4", title: "Dealer Sells", body: "Sales team presents the unit to qualified buyers using standard sales tools. Owner receives real-time status updates through their access link." },
              { step: "5", title: "Commission Split", body: "On sale completion, the platform calculates the agreed commission split. Owner payout is initiated via Stripe or e-Transfer after deal funding." },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="bg-card rounded-xl p-6 border border-border text-center w-44 flex-shrink-0">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">
                    {item.step}
                  </div>
                  <h4 className="font-bold text-foreground text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
                {i < 4 && <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Commission Structure</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Commission rates are flexible and agreed between the dealer and owner at intake. The platform enforces the agreed split and handles payout automatically.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { range: "10%", label: "Dealer Commission", sub: "Minimum rate for standard consignment listings" },
              { range: "15%", label: "Standard Rate", sub: "Most common rate for full-service consignment" },
              { range: "Custom", label: "Negotiated Rate", sub: "For high-value units or special arrangements" },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border text-center">
                <div className="text-3xl font-bold text-primary mb-2">{item.range}</div>
                <div className="font-semibold text-foreground mb-1">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.sub}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Platform fee applies per consignment transaction. Contact us for enterprise and multi-unit arrangements.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Who is responsible if the unit is damaged while on the dealer's lot?", a: "Consignment agreements include clear liability provisions. Dealers are required to carry adequate lot coverage insurance for consigned units. The agreement terms are enforced through the platform and both parties sign digitally at intake." },
              { q: "How long can a unit stay on consignment?", a: "Consignment agreements are typically set for 90-day terms with renewal options. If a unit doesn't sell within the term, both parties can agree to relist, adjust pricing, or return the unit to the owner." },
              { q: "Can owners set a minimum sale price?", a: "Yes. Owners set a minimum acceptable price at intake. The dealer cannot accept an offer below the owner's minimum without written approval. The platform enforces this floor price on all offers logged through the system." },
              { q: "Is consignment available to all Dealer Suite 360 subscribers?", a: "Consignment management is included in the Professional plan. The feature requires dealers to be verified and in good standing with the platform. Owner intake links are provided to dealers for distribution to potential consignment clients." },
            ].map((item, i) => (
              <details key={i} className="border border-border rounded-lg bg-card">
                <summary className="p-4 cursor-pointer font-medium hover:text-primary list-none flex justify-between items-center">
                  {item.q}<span className="text-muted-foreground text-lg">+</span>
                </summary>
                <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
