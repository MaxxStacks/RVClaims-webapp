import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Package, CheckCircle, Truck, ShieldCheck, Clock, DollarSign, ArrowRight } from "lucide-react";

export default function PartsComponents() {
  return (
    <PageLayout
      seoTitle="Parts & Components Supply for RV Dealerships | Dealer Suite 360"
      seoDescription="Sourced, tracked, and delivered. Parts and components management integrated directly into your warranty claims workflow."
      canonical="/parts-components"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Parts & Components —<br />Sourced, Supplied, Simplified
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            When a claim gets approved, your parts need to arrive fast. Dealer Suite 360 tracks every part order connected to every claim line — so repairs move forward without waiting on lost paperwork.
          </p>
          <Link href="/contact">
            <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
              Streamline Your Parts Supply →
            </button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How Parts Tracking Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Parts management is built into the claims workflow — not bolted on as an afterthought.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: CheckCircle,
                title: "Claim Approved",
                body: "When a manufacturer approves a claim line requiring parts, the platform automatically creates a parts order entry linked to that specific claim line and FRC code.",
              },
              {
                step: "02",
                icon: Package,
                title: "Parts Sourced",
                body: "Our team identifies the correct OEM or approved aftermarket part based on the manufacturer's specifications. Source options are documented — manufacturer direct, authorized distributor, or local supply.",
              },
              {
                step: "03",
                icon: Truck,
                title: "Parts Delivered & Tracked",
                body: "Order status, tracking numbers, expected delivery dates, and received confirmations are all logged in the platform. Dealers see part status directly on their claim detail view.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="text-5xl font-bold text-primary/10 mb-4">{item.step}</div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OEM vs Aftermarket */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">OEM vs. Approved Aftermarket</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We source based on manufacturer requirements and claim type — protecting your warranty compliance while finding cost-effective options where approved.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">OEM Parts</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For warranty and PDI claims, OEM parts are typically required by the manufacturer. We source directly through manufacturer parts channels or authorized distributors, ensuring claim compliance and avoiding denials for incorrect part usage.
              </p>
              <ul className="space-y-2">
                {["Manufacturer-authorized supply chain", "Correct part numbers logged per claim line", "Warranty compliance guaranteed", "Manufacturer part invoices retained for audit"].map((p, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />{p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-4">Approved Aftermarket</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For insurance claims and customer-pay repairs where manufacturer parts aren't required, approved aftermarket options can reduce costs significantly. We verify compatibility and maintain quality standards that protect your reputation.
              </p>
              <ul className="space-y-2">
                {["Cost-effective for non-warranty repairs", "Quality-vetted supplier network", "Availability for discontinued OEM parts", "Customer-pay and insurance claim support"].map((p, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />{p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Integrated Parts Management Matters</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: "Reduce Repair Delays",
                body: "Parts delays are the #1 reason warranty repairs extend beyond customer expectations. Integrated tracking gives your service team advance visibility into delivery timelines so they can schedule repairs accurately.",
              },
              {
                icon: DollarSign,
                title: "Competitive Pricing",
                body: "Our purchasing volume across the dealer network gives us negotiated pricing on common RV parts. Savings are passed to your dealership — directly improving parts margin on customer-pay work.",
              },
              {
                icon: ShieldCheck,
                title: "Quality Assurance",
                body: "Every part order is linked to the specific claim line it supports. If a part causes a future issue, the audit trail is complete — protecting your dealership in manufacturer disputes and customer warranty conversations.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Can I still use my existing parts suppliers?", a: "Yes. Parts management in Dealer Suite 360 can track orders from any supplier — your existing accounts, manufacturer direct orders, or our network. You're not locked into using our supply chain." },
              { q: "How are parts linked to specific claim lines?", a: "When our operator team processes a claim line that requires parts, they create a parts order entry directly linked to that FRC line. Part number, description, source, cost, and status are all tracked. Dealers see this in their claim detail view." },
              { q: "Does parts ordering integrate with my DMS?", a: "Direct DMS integration is on our roadmap for Q3 2026. Currently, parts data is managed within the Dealer Suite 360 portal. Export functionality is available for reconciliation with your existing DMS." },
              { q: "What happens when a part arrives and the repair is complete?", a: "The dealer or operator marks the part as received in the portal, which updates the claim line status. Completed repairs trigger the billing workflow — the claim moves to invoicing and the dealer receives a billing summary." },
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
