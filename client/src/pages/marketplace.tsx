import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Store, Gavel, Shield, UserCheck, Scale, TrendingUp, CheckCircle } from "lucide-react";

export default function Marketplace() {
  return (
    <PageLayout
      seoTitle="Dealer Marketplace & Live Auctions | Dealer Suite 360"
      seoDescription="Buy, sell, and auction RV inventory through the only dealer-to-dealer marketplace built specifically for North American RV dealerships."
      canonical="/marketplace"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Store className="w-4 h-4" />
            Launching Q3 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            The Dealer-to-Dealer<br />RV Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Move inventory faster. Access wholesale pricing. Connect directly with verified dealers across North America — all inside your Dealer Suite 360 platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                Join the Marketplace
              </button>
            </Link>
            <Link href="/contact">
              <button className="border-2 border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:border-primary/40 transition-colors">
                Request Demo
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Network Marketplace */}
            <div className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Store className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Network Marketplace</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Post and browse new, used, and trade-in RV inventory across our verified dealer network. Every listing includes VIN verification, unit history, and direct dealer contact — no middlemen, no auction fees for direct sales.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Dealer-to-dealer listings with verified VIN history",
                  "Search by type, manufacturer, year, and region",
                  "Direct messaging between verified dealers",
                  "Integrated with your existing inventory data",
                  "Showcase listings to the public with add-on",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-lg font-bold text-foreground">$499 <span className="text-sm font-normal text-muted-foreground">/year</span></div>
                <div className="text-sm text-muted-foreground">Marketplace Membership</div>
                <div className="text-xs text-muted-foreground mt-1">+ $299/year for Public Showcase listings</div>
              </div>
            </div>

            {/* Live Auctions */}
            <div className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Gavel className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Live Auctions</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Bid on and sell RV inventory in real-time through our live auction platform. Access wholesale pricing on new overstock, used units, and fleet liquidations — all from verified, licensed dealerships.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Real-time bidding on new, used, and overstock units",
                  "Scheduled auction events with advance catalogues",
                  "Reserve pricing and instant buy options",
                  "Transport coordination through our partner network",
                  "Post-auction inspection reports available",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-lg font-bold text-foreground">$99 <span className="text-sm font-normal text-muted-foreground">/month</span></div>
                <div className="text-sm text-muted-foreground">Auction Access Module</div>
                <div className="text-xs text-muted-foreground mt-1">Transaction fees apply per successful auction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Built on Trust and Verification</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every dealer on the marketplace is verified. Every transaction is protected. Every dispute has a resolution path.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: UserCheck,
                title: "Dealer Verification",
                body: "Every marketplace participant goes through our dealer verification process — business license, manufacturer agreements, and platform history reviewed before approval.",
              },
              {
                icon: Shield,
                title: "Transaction Escrow",
                body: "Large transactions are protected through our escrow process. Funds are held securely until both parties confirm inspection and delivery terms are met.",
              },
              {
                icon: Scale,
                title: "Dispute Resolution",
                body: "Our dedicated marketplace team handles disputes between dealers. Clear rules of engagement and rapid resolution keep transactions moving smoothly.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "7,400+", label: "RV Dealerships in North America" },
              { value: "$56B", label: "Combined Industry Revenue" },
              { value: "6+", label: "Manufacturer Partners" },
              { value: "Q3 2026", label: "Platform Launch" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
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
              {
                q: "Who can join the marketplace?",
                a: "The marketplace is open to all licensed RV dealerships in Canada and the United States. Dealers must be active Dealer Suite 360 subscribers and pass our verification process to participate.",
              },
              {
                q: "Is there a transaction fee for direct sales?",
                a: "Direct dealer-to-dealer sales through the Network Marketplace do not carry a per-transaction fee beyond your annual membership. Auction transactions include a small success fee, which is disclosed in the auction terms before you bid.",
              },
              {
                q: "Can customers (non-dealers) see the listings?",
                a: "The dealer-to-dealer marketplace is private by default. Dealers can add the Public Showcase add-on ($299/year) to list units publicly on their branded storefront.",
              },
              {
                q: "When does the marketplace launch?",
                a: "The Marketplace and Live Auctions modules are scheduled for Q3 2026. Join our waitlist today and receive founding member pricing when it goes live.",
              },
            ].map((item, i) => (
              <details key={i} className="border border-border rounded-lg bg-card">
                <summary className="p-4 cursor-pointer font-medium hover:text-primary list-none flex justify-between items-center">
                  {item.q}
                  <span className="text-muted-foreground text-lg">+</span>
                </summary>
                <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Be First on the Marketplace</h2>
          <p className="text-white/80 mb-8 text-lg">
            Join the waitlist today and lock in founding member pricing when the marketplace launches in Q3 2026.
          </p>
          <Link href="/sign-up">
            <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-lg">
              Join the Marketplace →
            </button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
