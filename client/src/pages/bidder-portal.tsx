import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Gavel, ShieldCheck, Eye, CreditCard, CheckCircle, Bell } from "lucide-react";

const features = [
  { icon: Eye, title: "Browse with Full Details", desc: "Every auction listing includes photos, specs, VIN, mileage, condition report, and floor plan. No surprises at pickup." },
  { icon: Bell, title: "Real-Time Bid Tracking", desc: "Live bid updates as they happen. You see your position, the current high bid, and time remaining — without refreshing." },
  { icon: ShieldCheck, title: "Stripe Escrow", desc: "$250 deposit secures your bid position. Funds held by DS360 until transfer is confirmed. Fully refunded if you don't win." },
  { icon: CreditCard, title: "Secure Purchase Flow", desc: "Winner pays through the portal. DS360 manages the paperwork, title, and transfer logistics. No back-and-forth with the seller." },
  { icon: Gavel, title: "Auction History", desc: "View your bid history, past wins, active deposits, and purchase documentation — all in one place." },
  { icon: CheckCircle, title: "Verified Identity", desc: "Every bidder is identity-verified before receiving access. This protects sellers and keeps the auction competitive and legitimate." },
];

const faqs = [
  { q: "Who can use the Bidder Portal?", a: "The Bidder Portal is open to any verified buyer — individuals, dealers, or fleet buyers. You must complete identity verification and submit a $250 deposit per auction cycle to gain bidding access. Verification is completed online in minutes." },
  { q: "How does the $250 deposit work?", a: "The $250 deposit is required to activate your bidding access for a live auction cycle. If you win a unit, the $250 is applied toward the purchase price. If you do not win any bids, the full $250 is refunded to your original payment method within 5 business days." },
  { q: "When are auctions held?", a: "DS360 Live Auctions run monthly over a 48-hour window. You can register and browse upcoming auction inventory ahead of the live window. Email notifications are sent when a new auction cycle opens." },
  { q: "Can I inspect a unit before bidding?", a: "All units include full photo documentation and condition reports in the listing. In-person inspection is not available during the auction — purchase is based on the provided documentation. DS360 quality standards require comprehensive disclosure of any known defects." },
  { q: "What happens after I win a bid?", a: "DS360 contacts you immediately after the auction closes. You complete the purchase through the portal — full payment, documentation, and transfer coordination are all managed by DS360. Unit pickup or delivery is arranged between you and the selling dealer, facilitated by DS360." },
];

export default function BidderPortal() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "DS360 Bidder Portal",
    "description": "Public RV auction portal — browse, bid, and buy through DS360 monthly live auctions. Stripe escrow, verified bidders, and professional transaction management.",
    "url": "https://dealersuite360.com/bidder-portal"
  };

  return (
    <PageLayout
      seoTitle="DS360 Bidder Portal — Browse, Bid & Buy RVs at Live Auction"
      seoDescription="Register for DS360's monthly Live Auctions. Browse RVs with full photos and specs, place real-time bids, and complete purchases through Stripe escrow — fully managed by DS360."
      seoKeywords="RV auction online, bid on RV, live RV auction, buy RV auction, DS360 bidder portal"
      canonical="/bidder-portal"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                <Link href="/marketplace" className="hover:text-primary transition-colors">← Marketplace</Link>
              </div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Bidder Portal</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Browse. Bid. Buy.<br />
                <span className="text-primary">All From One Portal.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                The Bidder Portal is where public buyers access DS360 monthly Live Auctions. Browse available RVs with full photos and specs, place bids in real time, manage deposits, and complete purchases through Stripe escrow — all in a clean, professional interface designed to convert browsers into buyers.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/bidder"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Register to Bid</button></Link>
                <Link href="/live-auctions"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">See Live Auctions</button></Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-border">
                {[["Monthly", "Auction Cycle"], ["48 Hours", "Live Auction Window"], ["$250", "Deposit to Bid"]].map(([val, label]) => (
                  <div key={label}><div className="text-xl font-bold text-primary">{val}</div><div className="text-xs text-muted-foreground mt-1">{label}</div></div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card rounded-xl border border-border p-4">
                  <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-4.5 h-4.5 text-primary w-[18px] h-[18px]" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bidder Journey */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Bidder Journey</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">Register to Purchase — Four Steps</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Every public buyer follows the same verified process. Registration, deposit, bidding, and escrow-secured close.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              ["1", "Register & Verify", "Create your Bidder Portal account. Complete identity verification (takes minutes). You are now eligible to participate."],
              ["2", "Submit Deposit", "Pay your $250 deposit through Stripe. This activates your bidding access for the current auction cycle."],
              ["3", "Browse & Bid", "Browse available inventory during the 48-hour live auction window. Place bids in real time. Track your position."],
              ["4", "Win & Close", "If you win, DS360 manages the transaction — payment, documentation, and transfer coordination. Deposit applied toward purchase."],
            ].map(([num, title, desc]) => (
              <div key={num} className="bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-4">{num}</div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Dealers */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">For Dealers</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">The Portal Sells Your Inventory for You</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                When you submit units to a DS360 Live Auction, the Bidder Portal does the selling work. Verified buyers compete for your inventory in real time — driving prices up, not down.
              </p>
              <div className="space-y-4">
                {[
                  ["Competitive Bidding Drives Prices Up", "Multiple bidders on the same unit can push the sale price above your reserve — something a single-buyer negotiation cannot do"],
                  ["Verified Buyers Only", "Identity verification and deposit requirements filter out tire-kickers — every bidder is qualified before they can bid"],
                  ["DS360 Manages the Close", "You don't negotiate with the buyer, process the payment, or manage the paperwork. DS360 handles the entire transaction."],
                ].map(([h, p]) => (
                  <div key={h} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
                    <div><div className="font-semibold text-sm text-foreground">{h}</div><div className="text-sm text-muted-foreground mt-0.5">{p}</div></div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/live-auctions"><button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">Submit Inventory to Auction →</button></Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <Gavel className="w-12 h-12 text-primary mx-auto mb-2" />
                  <h3 className="font-bold text-foreground">Live Auction — Unit Example</h3>
                </div>
                <div className="bg-white rounded-xl border border-border p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Unit</span><span className="font-semibold">2023 Forest River Georgetown</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Reserve Price</span><span className="font-semibold">$89,000</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Current Bid</span><span className="font-bold text-primary text-lg">$97,500</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Active Bidders</span><span className="font-semibold">7</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Time Remaining</span><span className="font-semibold text-amber-600">4h 23m</span></div>
                </div>
                <p className="text-xs text-muted-foreground text-center">Illustrative example. Actual auction prices vary.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">FAQ</span>
            <h2 className="text-3xl font-bold text-foreground">Bidder Portal Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`bg-card rounded-xl border transition-colors ${openFaq === i ? 'border-primary/40' : 'border-border'}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="font-semibold text-sm text-foreground pr-4">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${openFaq === i ? 'bg-primary' : 'bg-primary/10'}`}>
                    <span className={`text-lg font-bold inline-block ${openFaq === i ? 'text-white rotate-45' : 'text-primary'}`}>+</span>
                  </div>
                </button>
                {openFaq === i && <div className="px-6 pb-4"><p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Hybrid 2 */}
      <section className="cta-h2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-h2-inner">
            <h2>Your Inventory. Their Bids. <span className="accent">DS360 Manages Everything in Between.</span></h2>
            <p>Register as a bidder to access upcoming auctions, or submit inventory as a dealer to let competitive bidding maximize your unit value.</p>
            <div className="cta-h2-btns">
              <Link href="/bidder"><button className="btn-solid">Register to Bid</button></Link>
              <Link href="/live-auctions"><button className="btn-outline">See Live Auctions</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
