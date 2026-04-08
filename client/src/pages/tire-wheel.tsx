import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, AlertTriangle } from "lucide-react";

const covered = [
  { scenario: "Tire Blowout (Road Hazard)", cost: "$400–$800", covered: true },
  { scenario: "Wheel / Rim Damage", cost: "$250–$600", covered: true },
  { scenario: "Sidewall Damage from Debris", cost: "$500–$900", covered: true },
  { scenario: "Fender/Undercarriage from Blowout", cost: "$1,500–$4,000", covered: true },
  { scenario: "Flat Tire (Standard)", cost: "$150–$300", covered: false },
  { scenario: "Wear and Tear", cost: "N/A", covered: false },
];

const faqs = [
  { q: "What is a road hazard — what triggers a Tire & Wheel claim?", a: "A road hazard is any object or condition on a paved public road that causes tire or wheel damage — potholes, nails, glass, metal debris, curb impacts. Coverage requires that the damage occurs while driving on a public road, not off-road or on private property." },
  { q: "Does coverage apply to all tires on an RV?", a: "Yes — Tire & Wheel Protection applies to all tires on the covered unit, including all axles. On a Class A motorhome, that means up to 6 tires. On a towable, coverage applies to all trailer tires." },
  { q: "What happens if the blowout damages the fender or undercarriage?", a: "When a blowout causes secondary damage — fender, undercarriage, wheel well — DS360 assesses the full repair cost as part of the claim. Coverage limits apply per claim, so we recommend dealers explain the policy limits at time of sale." },
  { q: "How does a client file a claim?", a: "The client contacts their dealership or DS360 directly. We coordinate with the repair facility, process the claim, and issue payment. The client does not have to navigate the process independently." },
  { q: "Can Tire & Wheel be sold standalone or only as part of a bundle?", a: "Tire & Wheel Protection can be sold as a standalone product or as part of the full DS360 Protection Suite. Bundle pricing is available and increases the per-unit cashback tier for the dealership." },
];

export default function TireWheel() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DS360 Tire & Wheel Protection",
    "description": "RV tire and wheel road hazard protection — repair or replacement from blowouts, pothole damage, and debris strikes that standard warranties don't cover.",
    "brand": { "@type": "Brand", "name": "Dealer Suite 360" },
    "url": "https://dealersuite360.com/tire-wheel"
  };

  return (
    <PageLayout
      seoTitle="Tire & Wheel Protection for RVs | Road Hazard Coverage | DS360"
      seoDescription="A single RV tire costs $400–$800 to replace. DS360 Tire & Wheel Protection covers repair or replacement from road hazards that standard warranties never touch."
      seoKeywords="RV tire protection, tire wheel coverage, road hazard RV, RV tire insurance, F&I RV products"
      canonical="/tire-wheel"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                <Link href="/protection-plans" className="hover:text-primary transition-colors">← Protection Plans</Link>
              </div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Product · Road Hazard Coverage</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                A Single RV Tire Costs<br />
                <span className="text-primary">$400 to $800 to Replace.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                RV tires are not car tires. They are larger, heavier, more expensive, and more exposed to road hazards. A blowout on a Class A motorhome can damage the wheel, the fender, and the undercarriage — turning a $600 tire into a $3,000 repair. Tire &amp; Wheel Protection covers repair or replacement from road hazards that standard warranties and insurance do not.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Start Selling Tire &amp; Wheel</button></Link>
                <Link href="/protection-plans"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">See All Plans</button></Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-border">
                {[["$400-$800", "Per Tire Replacement"], ["Up to 6", "Tires Covered"], ["DS360", "Claims Managed"]].map(([val, label]) => (
                  <div key={label}><div className="text-xl font-bold text-primary">{val}</div><div className="text-xs text-muted-foreground mt-1">{label}</div></div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 bg-muted/30 border-b border-border">
                <h3 className="font-bold text-foreground text-sm">Coverage at a Glance</h3>
              </div>
              <div className="divide-y divide-border">
                {covered.map(({ scenario, cost, covered: isCovered }) => (
                  <div key={scenario} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-foreground">{scenario}</div>
                      <div className="text-xs text-muted-foreground">{cost}</div>
                    </div>
                    <div className={`text-xs font-bold px-2 py-1 rounded-full ${isCovered ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {isCovered ? '✓ Covered' : '✗ Not Covered'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Cost Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">The Real Cost</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">RV Tires Are Not a $150 Problem</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { type: "Travel Trailer / 5th Wheel", tire: "$350–$500", wheel: "$200–$400", note: "4-6 tires per unit" },
              { type: "Class C / Van Camper", tire: "$400–$650", wheel: "$250–$500", note: "6 tires, limited spare access" },
              { type: "Class A Motorhome", tire: "$500–$900", wheel: "$400–$800", note: "6 tires + drive axle exposure" },
            ].map(({ type, tire, wheel, note }) => (
              <div key={type} className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-bold text-foreground mb-4">{type}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tire replacement</span><span className="font-semibold text-foreground">{tire}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Wheel/rim damage</span><span className="font-semibold text-foreground">{wheel}</span></div>
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">{note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DS360 Managed */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Managed</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">You Sell It. DS360 Handles Claims.</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">When a client has a blowout on the highway, the last thing they need is paperwork. DS360 manages the entire claim — from the first call to the repair shop payment — so your dealership stays focused on selling.</p>
              <div className="space-y-4">
                {[
                  ["Co-Branded Certificate", "Your dealership name on every Tire & Wheel policy"],
                  ["DS360 Claims Workflow", "Same A-Z process as every other DS360 product"],
                  ["Your Margin to Keep", "Wholesale cost from DS360 — you set the retail price"],
                ].map(([h, p]) => (
                  <div key={h} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
                    <div><div className="font-semibold text-sm text-foreground">{h}</div><div className="text-sm text-muted-foreground mt-0.5">{p}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="font-bold text-lg text-foreground mb-2">Without Tire &amp; Wheel Protection</h3>
                <p className="text-sm text-muted-foreground mb-6">Client gets a blowout. $600 tire. Wheel damage adds $400. Fender damage adds $1,200. Client pays $2,200 out of pocket — and calls your dealership to complain.</p>
                <div className="bg-white rounded-xl p-4 border border-primary/20">
                  <h3 className="font-bold text-primary mb-2">With Tire &amp; Wheel Protection</h3>
                  <p className="text-sm text-muted-foreground">Client calls DS360. We dispatch, manage the repair, pay the shop, and send the client a certificate of completion. Your dealership gets a thank-you call instead of a complaint.</p>
                </div>
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
            <h2 className="text-3xl font-bold text-foreground">Tire &amp; Wheel Questions</h2>
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
            <h2>A $600 Tire. A $2,000 Blowout. <span className="accent">A $0 Problem — With Protection.</span></h2>
            <p>Add Tire &amp; Wheel Protection to your F&I menu and give clients real-world coverage for the real-world hazards they will face.</p>
            <div className="cta-h2-btns">
              <Link href="/sign-up"><button className="btn-solid">Get Started</button></Link>
              <Link href="/protection-plans"><button className="btn-outline">See All Plans</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
