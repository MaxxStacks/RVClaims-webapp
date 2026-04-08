import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, Sparkles, TrendingUp, Shield } from "lucide-react";

const coverage = [
  { cat: "Interior", items: ["Fabric and upholstery stain protection", "Carpet fiber sealant and stain barrier", "Vinyl seat and surface treatment", "Leather conditioning and protection", "Interior panel and trim coating"] },
  { cat: "Exterior", items: ["Paint sealant and gloss protection", "UV fade prevention coating", "Oxidation resistance treatment", "Gel coat protection for fiberglass", "Graphics and decal protection"] },
];

const faqs = [
  { q: "What exactly does Appearance Protection cover?", a: "Appearance Protection covers interior and exterior surface damage from normal use — stains on fabric, UV fade on paint, scratches on vinyl, and similar cosmetic damage. It does not cover mechanical failure, collision damage, or wear beyond normal use." },
  { q: "How is the product applied?", a: "DS360 Appearance Protection is a professional-grade sealant applied at the dealership level before delivery. The treatment bonds at the molecular level, creating a protective barrier that repels liquids, resists UV, and prevents surface abrasion." },
  { q: "How long does the protection last?", a: "Standard protection plans cover 5 years from the date of purchase. Premium plans extend coverage to 7 years. Claims are processed through DS360 with the same A-Z workflow as all other DS360 products." },
  { q: "Does the client have to do anything to maintain coverage?", a: "Basic maintenance is required — no harsh chemicals, basic cleaning protocol. DS360 provides the client with a care guide at the time of purchase. Following basic maintenance preserves the protection and any claim eligibility." },
  { q: "What is the dealer margin?", a: "DS360 provides Appearance Protection at wholesale cost. You set the retail price. Typical dealer gross on a single Appearance Protection sale is $200-$400, depending on the trim level and market." },
];

export default function AppearanceProtection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DS360 Appearance Protection",
    "description": "RV interior and exterior appearance protection plan — stain, UV fade, and surface damage coverage that preserves resale value and generates dealer F&I revenue.",
    "brand": { "@type": "Brand", "name": "Dealer Suite 360" },
    "url": "https://dealersuite360.com/appearance-protection"
  };

  return (
    <PageLayout
      seoTitle="RV Appearance Protection | Interior & Exterior Coverage | DS360"
      seoDescription="Protect your clients' RV investment with DS360 Appearance Protection. Interior stain protection, exterior UV coating, and surface coverage that preserves resale value — dealer margin included."
      seoKeywords="RV appearance protection, RV paint protection, interior stain protection, RV resale value, F&I products RV"
      canonical="/appearance-protection"
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
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Product · Resale Value Protector</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                An RV Is a Living Space on Wheels.<br />
                <span className="text-primary">It Gets Lived In.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Coffee spills on the upholstery. UV fades the paint. A kid scratches the vinyl. Mud gets ground into the carpet. These are not defects — they are the reality of using an RV. Appearance Protection covers interior and exterior surface damage that standard warranties never touch. It preserves the unit's condition and protects its resale value for years.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Start Selling Appearance Protection</button></Link>
                <Link href="/protection-plans"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">See All Protection Plans</button></Link>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { icon: Sparkles, title: "Sells on Emotion", desc: "The moment a client sees their brand-new RV, they want to keep it looking that way. Appearance Protection is the product that closes itself." },
                { icon: TrendingUp, title: "Protects Resale Value", desc: "Protected units appraise higher at trade-in. A client who gets strong trade-in value is a client who upgrades through your dealership." },
                { icon: Shield, title: "DS360 Manages Claims", desc: "Same A-Z workflow. Client files a claim, DS360 processes it, you collect the margin without the administrative overhead." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card rounded-xl p-5 border border-border flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">What's Covered</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">Interior and Exterior — Both Protected</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Every surface, every scenario — from the first camping trip to year five of ownership.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {coverage.map(({ cat, items }) => (
              <div key={cat} className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-bold text-foreground text-lg mb-4">{cat} Coverage</h3>
                <ul className="space-y-3">
                  {items.map(item => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resale Angle */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">The Resale Angle</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">Protected Units Are Worth More at Trade-In</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                When a client trades their unit in 3-4 years, the dealership doing the appraisal looks at cosmetic condition. A protected unit consistently appraises higher than an unprotected unit of the same age and mileage. That higher appraisal translates to a stronger down payment on their next unit — from your lot.
              </p>
              <div className="space-y-4">
                {[
                  ["Higher Trade-In Value", "Protected units consistently appraise higher than unprotected ones of the same age"],
                  ["Faster Resale", "Units in better cosmetic condition sell faster — on your lot and through the Marketplace"],
                  ["Repeat Buyer Creation", "A client who gets strong trade-in value is a client who upgrades through your dealership"],
                ].map(([h, p]) => (
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
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4 border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Unprotected Unit — Year 3 Appraisal</div>
                  <div className="text-2xl font-bold text-foreground">$42,000</div>
                  <div className="text-xs text-muted-foreground">Stains, faded paint, worn vinyl</div>
                </div>
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">Protected Unit — Year 3 Appraisal</div>
                  <div className="text-2xl font-bold text-primary">$48,500</div>
                  <div className="text-xs text-muted-foreground">Preserved condition, like-new surfaces</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                  <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">Difference</div>
                  <div className="text-3xl font-black text-green-700">+$6,500</div>
                  <div className="text-xs text-green-600">Higher down payment on their next unit</div>
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
            <h2 className="text-3xl font-bold text-foreground">Appearance Protection Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`bg-card rounded-xl border transition-colors ${openFaq === i ? 'border-primary/40' : 'border-border'}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
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

      {/* Related products */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Complete the Protection Suite</h2>
            <p className="text-muted-foreground mt-2">Appearance covers surfaces. These products cover everything else.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              ["/extended-warranty", "Extended Warranty", "Post-OEM coverage"],
              ["/tire-wheel", "Tire & Wheel", "Road hazard protection"],
              ["/roadside-travel-protection", "Roadside & Travel", "Emergency trip coverage"],
              ["/specialty-protection", "Specialty Protection", "Generators, slideouts & more"],
            ].map(([href, title, desc]) => (
              <Link key={href as string} href={href as string}>
                <div className="bg-card rounded-xl border border-border p-4 hover:border-primary/40 transition-colors cursor-pointer">
                  <h4 className="font-semibold text-sm text-foreground">{title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  <div className="text-primary text-xs font-semibold mt-2">Learn more →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Hybrid 1 */}
      <section className="cta-h1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-h1-inner">
            <div>
              <h2>They Bought It Because They Love It. <span className="accent">Help Them Keep It That Way.</span></h2>
              <p>Add Appearance Protection to every delivery and protect your clients' investment while earning strong F&I margin on every deal.</p>
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
