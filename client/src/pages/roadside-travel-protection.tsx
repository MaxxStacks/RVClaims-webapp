import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, MapPin, Hotel, Truck, Phone } from "lucide-react";

const tierComparison = [
  { feature: "Towing Distance", basic: "50KM", titanium: "160KM+" },
  { feature: "Hotel Coverage", basic: "—", titanium: "Up to 5 nights" },
  { feature: "Meal Allowance", basic: "—", titanium: "$75/day" },
  { feature: "Vehicle Return", basic: "—", titanium: "Included" },
  { feature: "Trip Interruption", basic: "—", titanium: "$500 included" },
  { feature: "24/7 Dispatch", basic: "✓", titanium: "✓" },
];

const faqs = [
  { q: "What is the difference between basic and Titanium roadside?", a: "Basic roadside covers towing within 50KM and simple roadside interventions like flat tire changes and battery boost. Titanium covers 160KM+ towing, hotel accommodation for up to 5 nights, meal allowance, trip interruption benefit, and vehicle return service. Basic is a complimentary benefit. Titanium is a premium F&I product with meaningful dealer margin." },
  { q: "What happens when the tow destination is more than 160KM?", a: "If the nearest qualified repair facility is beyond 160KM, DS360 coordinates the logistics and covers the extended distance at reduced cost. The client is never stranded — DS360 works out the details." },
  { q: "How does hotel coverage work?", a: "When a client's RV is unable to be repaired same-day, DS360 books and pays for accommodation at a qualified hotel near the repair facility. Coverage is up to 5 nights at standard rates. The client does not need to submit receipts — DS360 manages the booking directly." },
  { q: "What is vehicle return service?", a: "If the unit is repaired at a facility far from home and the client cannot drive it back, DS360 arranges and pays for vehicle return — either hiring a transport service or covering the client's travel back to the facility to retrieve the unit." },
  { q: "Is Titanium Roadside only for motorhomes?", a: "No. Titanium Roadside & Travel Protection applies to any towable or motorized RV covered under the DS360 policy. Coverage terms and towing limits are adjusted for the class of unit." },
];

export default function RoadsideTravelProtection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DS360 Titanium Roadside & Travel Protection",
    "description": "Premium roadside and travel protection for RV clients — 160KM+ towing, hotel coverage, meal allowance, and vehicle return. The upgrade from basic roadside.",
    "brand": { "@type": "Brand", "name": "Dealer Suite 360" },
    "url": "https://dealersuite360.com/roadside-travel-protection"
  };

  return (
    <PageLayout
      seoTitle="Titanium Roadside & Travel Protection for RVs | DS360"
      seoDescription="When a client breaks down 300KM from home, basic roadside gets them towed 50KM. Titanium gets them towed 160KM+, puts them in a hotel, covers their meals, and arranges vehicle return."
      seoKeywords="RV roadside protection, RV travel protection, titanium roadside, RV breakdown coverage, emergency RV assistance"
      canonical="/roadside-travel-protection"
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
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Product · Titanium Tier</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Your Client Breaks Down 300KM from Home.<br />
                <span className="text-primary">Now What?</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Basic roadside gets them towed 50KM. Titanium Roadside &amp; Travel Protection gets them towed 160KM+, puts them in a hotel while the repair happens, covers their meals, and arranges vehicle return if the unit cannot be driven home. This is the premium upgrade your clients will thank you for selling them — and a revenue-generating product on every deal.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Start Selling Titanium Roadside</button></Link>
                <Link href="/protection-plans"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">See All Plans</button></Link>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 bg-primary text-white text-center">
                <div className="text-xs font-bold uppercase tracking-wide mb-1">Titanium vs. Basic</div>
                <h3 className="font-bold">Not All Roadside Is Equal</h3>
              </div>
              <div className="divide-y divide-border">
                <div className="grid grid-cols-3 gap-0">
                  <div className="p-3 font-bold text-xs text-muted-foreground uppercase">Feature</div>
                  <div className="p-3 font-bold text-xs text-center text-muted-foreground">Basic</div>
                  <div className="p-3 font-bold text-xs text-center text-primary">Titanium</div>
                </div>
                {tierComparison.map(({ feature, basic, titanium }) => (
                  <div key={feature} className="grid grid-cols-3">
                    <div className="p-3 text-sm text-foreground">{feature}</div>
                    <div className="p-3 text-sm text-center text-muted-foreground">{basic}</div>
                    <div className="p-3 text-sm text-center font-semibold text-primary">{titanium}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Titanium Coverage</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">Everything Your Client Needs When a Trip Goes Wrong</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Titanium is not just towing. It is a complete trip protection package that covers the cascading costs of a breakdown far from home.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "160KM+ Towing", desc: "Tow to any qualified repair facility within 160KM. Extended distance coverage available." },
              { icon: Hotel, title: "Hotel Coverage", desc: "Up to 5 nights accommodation near the repair facility — DS360 books and pays directly." },
              { icon: MapPin, title: "Meal Allowance", desc: "$75/day meal allowance while the unit is being repaired away from home." },
              { icon: Phone, title: "Vehicle Return", desc: "If the unit can't be driven home, DS360 arranges and pays for transport or travel back to retrieve it." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl border border-border p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
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
              <h2 className="text-3xl font-bold text-foreground mb-4">You Sell It. DS360 Dispatches, Coordinates, and Pays.</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">When a client calls for roadside help, DS360 handles everything. Your dealership gets notified, but you don't need to dispatch, book hotels, or manage the claim. We do it all.</p>
              <div className="space-y-4">
                {[
                  ["DS360 Dispatch Center", "Towing and roadside service coordinated by DS360 — not your front desk"],
                  ["Co-Branded with Your Dealership", "Certificate, communications, and claims experience carry your name"],
                  ["Revenue on Every Sale", "Wholesale cost from DS360, you set retail price, margin is yours"],
                ].map(([h, p]) => (
                  <div key={h} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
                    <div><div className="font-semibold text-sm text-foreground">{h}</div><div className="text-sm text-muted-foreground mt-0.5">{p}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-bold text-foreground mb-2">Without Titanium Roadside</h3>
                <p className="text-sm text-muted-foreground">Client breaks down 280KM from home. Basic roadside tows 50KM. Client is still 230KM from home, stuck near a repair shop, paying for a motel out of pocket, eating diner food for three days.</p>
              </div>
              <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
                <h3 className="font-bold text-primary mb-2">With Titanium Roadside</h3>
                <p className="text-sm text-muted-foreground">DS360 arranges towing to the nearest qualified shop. Hotels booked and paid. Meals covered. When the repair is done, vehicle return is arranged. Client calls to say thank you and asks about their next unit.</p>
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
            <h2 className="text-3xl font-bold text-foreground">Roadside &amp; Travel Questions</h2>
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

      {/* CTA Hybrid 1 */}
      <section className="cta-h1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-h1-inner">
            <div>
              <h2>Basic Gets Them Towed. <span className="accent">Titanium Gets Them Home.</span></h2>
              <p>Upgrade your clients from complimentary roadside to real trip protection — and generate meaningful F&I revenue on every deal where you present it.</p>
            </div>
            <div className="cta-h1-btns">
              <Link href="/sign-up"><button className="btn-solid">Get Started</button></Link>
              <Link href="/contact"><button className="btn-ghost">Talk to an Expert</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
