import { useState, useEffect } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Network, ShieldCheck, DollarSign, Search, ArrowRight, CheckCircle } from "lucide-react";

const faqs = [
  { q: "Who can access the Dealer Exchange?", a: "The Dealer Exchange is available exclusively to verified DS360 dealers. Your dealership identity is confirmed during onboarding. Non-dealers — including the public and auction bidders — cannot view or participate in exchange listings." },
  { q: "How does the anonymous listing work?", a: "When you list a unit, other dealers see the unit details, photos, and specs but not your dealership name. Your identity is revealed only after both parties commit to the transaction and DS360 facilitates the handoff." },
  { q: "What does the $250 flat commission cover?", a: "The $250 commission covers DS360's role as the transaction facilitator — escrow management, identity verification, documentation, and dispute resolution. There are no additional fees, percentages, or surprises." },
  { q: "How does escrow work?", a: "DS360 acts as the escrow agent. The buyer deposits funds through Stripe. Funds are held securely by DS360 until both parties confirm the transfer is complete. Only then are funds released to the seller." },
  { q: "How long does a listing stay active?", a: "Listings remain active for 30 days from the date of submission. You can renew, edit, or remove a listing at any time from your dealer portal. There is no charge for listing — only a commission on completed sales." },
];

export default function DealerExchange() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const els = document.querySelectorAll('.anim-up');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('anim-visible'); });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "DS360 Dealer Exchange",
    "provider": { "@type": "Organization", "name": "Dealer Suite 360" },
    "description": "Private dealer-to-dealer RV inventory network with escrow-protected transactions and $250 flat commission per sale.",
    "url": "https://dealersuite360.com/dealer-exchange"
  };

  return (
    <PageLayout
      seoTitle="Dealer Exchange — Private Dealer-to-Dealer RV Inventory Network | DS360"
      seoDescription="The Dealer Exchange connects every DS360 dealership into a private inventory network. Offload slow-moving units and source specific models — anonymous listings, escrow-protected, $250 flat commission."
      seoKeywords="dealer exchange, RV dealer network, dealer-to-dealer inventory, RV wholesale, private dealer marketplace"
      canonical="/dealer-exchange"
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
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Marketplace · Channel 1</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Never Lose a Sale<br />
                <span className="text-primary">to Inventory Again.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                The Dealer Exchange connects every DS360 dealership into a single private inventory network. Offload units that are not selling locally. Source specific models for walk-in clients who need them now. Every trade is anonymous, escrow-protected, and facilitated by DS360 — with a flat $250 commission instead of the 5–10% traditional auction houses charge.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Join the Dealer Exchange</button></Link>
                <Link href="#how-it-works"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">How It Works</button></Link>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-border">
                {[["$499", "Annual Membership"], ["$250", "Flat Commission"], ["Private", "Dealer Identity Hidden"]].map(([val, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-bold text-primary">{val}</div>
                    <div className="text-xs text-muted-foreground mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 p-8">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Network, title: "Private Network", desc: "Only verified DS360 dealers" },
                  { icon: ShieldCheck, title: "Stripe Escrow", desc: "Funds held until transfer confirmed" },
                  { icon: DollarSign, title: "$250 Flat", desc: "No percentages, no surprises" },
                  { icon: Search, title: "Search Inventory", desc: "Real-time across all dealers" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-white rounded-xl p-4 border border-border">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="font-semibold text-sm text-foreground">{title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-6 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[["Network", "Private Dealer Pool"], ["Stripe", "Secured Escrow"], ["$250", "Flat Per Sale"], ["Verified", "Staff-Approved Dealers"]].map(([num, label]) => (
              <div key={label}>
                <div className="text-2xl font-bold text-primary">{num}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offload */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center anim-up" style={{ opacity: 0, transform: 'translateY(20px)', transition: 'opacity .6s ease, transform .6s ease' }}>
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Offload</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">A Unit Sits on Your Lot for 90 Days. Floor Plan Interest Adds Up. Nobody Local Is Buying.</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">Every day a unit sits unsold, it costs you money — floor plan interest, insurance, lot space, opportunity cost. The Dealer Exchange puts that unit in front of every DS360 dealer in the network. A dealer 500KM away might have a client looking for exactly that model. The unit moves. Your lot opens up. You stop bleeding carrying costs.</p>
              <div className="space-y-4">
                {[["List in Minutes", "Photos, specs, and pricing from your DS360 dashboard — one submission, network-wide visibility"], ["Anonymous Until Close", "Your dealership name is hidden in all listings — no competitive intelligence, no poaching"]].map(([h, p]) => (
                  <div key={h} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{h}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{p}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-5xl font-black text-primary mb-2">90</div>
                <div className="text-sm text-muted-foreground">Days of carrying costs on an unsold unit</div>
                <div className="mt-6 pt-6 border-t border-primary/20">
                  <div className="text-2xl font-bold text-foreground">vs.</div>
                  <div className="mt-3 text-lg font-semibold text-primary">Listed today. Sold this week.</div>
                  <div className="text-sm text-muted-foreground mt-1">The Dealer Exchange puts your unit in front of qualified buyers immediately</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-12 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-6" />
          <blockquote className="text-xl font-semibold text-foreground italic leading-relaxed">
            "A walk-in client asks for a 2024 Fifth Wheel you don't have. Without the Dealer Exchange, they leave. With it, you source one from the network and close the deal today."
          </blockquote>
        </div>
      </section>

      {/* Source */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
              <div className="space-y-4">
                {["Immediate Possession", "Save the Sale", "Client Gets Exactly What They Want"].map((item) => (
                  <div key={item} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-border">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Source</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">A Client Walks In Looking for a Specific Unit. You Don't Have It. The Sale Walks Out.</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">Without network access, your only option is a 4 to 6 week manufacturer order — and the client is not waiting. The Dealer Exchange lets you search the entire DS360 inventory in real time. Find the unit, initiate the transaction, and close the sale with a unit available for immediate possession.</p>
              <div className="space-y-4">
                {[["Immediate Possession", "Source units already built and available — no 4-6 week factory wait"], ["Save the Sale", "The client who was about to walk is now signing — because you had access to the right unit"]].map(([h, p]) => (
                  <div key={h} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{h}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{p}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">The Process</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">List to Close — Four Steps</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Every transaction goes through DS360. You never deal directly with the other dealer until both sides have committed.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              ["1", "List or Search", "List a unit for sale from your dealer portal, or search the network for a specific model, year, or price range."],
              ["2", "Express Interest", "The buying dealer expresses interest. DS360 notifies the listing dealer. Identities remain anonymous at this stage."],
              ["3", "DS360 Facilitates", "Both parties commit. DS360 discloses identities, manages escrow via Stripe, and coordinates the transaction details."],
              ["4", "Transfer & Close", "Unit transfers. Buyer confirms receipt. DS360 releases escrow funds to seller. $250 commission deducted automatically."],
            ].map(([num, title, desc]) => (
              <div key={num} className="bg-card rounded-xl p-6 border border-border">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mb-4">{num}</div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
          <div className="bg-card rounded-2xl border border-border p-8 mt-8">
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <div className="text-4xl font-black text-primary">$499</div>
                <div className="text-sm text-muted-foreground mt-2">Annual Membership</div>
                <div className="text-xs text-muted-foreground mt-1">Unlimited listings + searches</div>
              </div>
              <div>
                <div className="text-4xl font-black text-primary">$250</div>
                <div className="text-sm text-muted-foreground mt-2">Per Completed Sale</div>
                <div className="text-xs text-muted-foreground mt-1">Flat fee — no percentages</div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-border">
              <Link href="/sign-up"><button className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors">Join the Dealer Exchange →</button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">FAQ</span>
            <h2 className="text-3xl font-bold text-foreground">Dealer Exchange Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`bg-card rounded-xl border transition-colors ${openFaq === i ? 'border-primary/40' : 'border-border'}`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-sm text-foreground pr-4">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${openFaq === i ? 'bg-primary' : 'bg-primary/10'}`}>
                    <span className={`text-lg font-bold transition-transform inline-block ${openFaq === i ? 'text-white rotate-45' : 'text-primary'}`}>+</span>
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Hybrid 2 */}
      <section className="cta-h2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-h2-inner">
            <h2>Your Inventory. Their Network. <span className="accent">DS360 Manages Everything in Between.</span></h2>
            <p>Stop losing sales to inventory gaps. Join the Dealer Exchange and connect to every DS360 dealership in the country.</p>
            <div className="cta-h2-btns">
              <Link href="/sign-up"><button className="btn-solid">Join the Exchange</button></Link>
              <Link href="/contact"><button className="btn-outline">Talk to Sales</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
