import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, Zap, Sun, Settings } from "lucide-react";

const components = [
  { name: "Generator", repairCost: "$800–$3,000", covered: true },
  { name: "Solar Panel System", repairCost: "$400–$1,500", covered: true },
  { name: "Slide-Out Mechanism", repairCost: "$600–$2,500", covered: true },
  { name: "Powered Awning", repairCost: "$300–$1,200", covered: true },
  { name: "Leveling / Stabilizer System", repairCost: "$400–$1,800", covered: true },
  { name: "Satellite Dish / Antenna", repairCost: "$200–$800", covered: true },
  { name: "Aftermarket Accessories", repairCost: "Varies", covered: true },
  { name: "Engine (Motorhome)", repairCost: "Not included", covered: false },
  { name: "Collision Damage", repairCost: "Not included", covered: false },
];

const faqs = [
  { q: "What makes Specialty Protection different from Extended Warranty?", a: "Extended Warranty covers mechanical systems — engine, drivetrain, major appliances. Specialty Protection covers the RV-specific components that Extended Warranty typically excludes or limits: generators, solar, slide-outs, awnings, leveling systems, and aftermarket accessories. They are complementary, not competing products." },
  { q: "Does coverage apply to aftermarket accessories installed after purchase?", a: "Yes — aftermarket accessories installed at or before the time of Specialty Protection purchase are eligible for coverage. Accessories added after purchase must be registered through the DS360 platform to be eligible." },
  { q: "How does a slide-out claim work?", a: "The client contacts their dealership or DS360 directly. DS360 assesses the repair requirement, authorizes a qualified technician, and pays the repair shop. The client does not have to navigate the claim independently." },
  { q: "Can Specialty Protection be bundled with other DS360 products?", a: "Yes — Specialty Protection is the sixth product in the DS360 Protection Suite. When all six products are active on a single deal, the dealership unlocks the highest cashback tier — the strongest financial incentive for selling the complete suite." },
  { q: "Is there a deductible per claim?", a: "Standard plans carry a $100 per-claim deductible. Premium plans can be structured with $0 deductible at slightly higher wholesale cost. Dealers choose the structure that best fits their market." },
];

export default function SpecialtyProtection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DS360 Specialty Protection",
    "description": "RV specialty component protection — generators, solar panels, slide-outs, powered awnings, leveling systems, and aftermarket accessories that standard plans exclude.",
    "brand": { "@type": "Brand", "name": "Dealer Suite 360" },
    "url": "https://dealersuite360.com/specialty-protection"
  };

  return (
    <PageLayout
      seoTitle="Specialty Protection for RVs | Generators, Slide-Outs & More | DS360"
      seoDescription="Cover the RV-specific components that standard warranties always exclude. DS360 Specialty Protection protects generators, solar, slide-outs, awnings, leveling systems, and aftermarket accessories."
      seoKeywords="RV specialty protection, generator coverage RV, slide-out protection, RV awning coverage, F&I products RV"
      canonical="/specialty-protection"
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
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Product · The Coverage Gap Filler</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                An RV Has Components<br />
                <span className="text-primary">No Other Vehicle Has.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Generators, solar panels, leveling systems, slide-out mechanisms, powered awnings, satellite dishes, and aftermarket accessories — these are the components that make an RV livable, and they are the exact components that standard warranties and Extended Warranty plans often exclude or limit. Specialty Protection fills the gap.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Start Selling Specialty Protection</button></Link>
                <Link href="/protection-plans"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">See All Plans</button></Link>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: Settings, title: "The Components That Matter Most", desc: "A broken slide-out mechanism strands an entire travel setup. A failed generator on a remote campsite is a $3,000 emergency. These are real scenarios that happen to real clients." },
                { icon: Zap, title: "The Sixth Product", desc: "Specialty Protection completes the DS360 Protection Suite. All six products sold = highest dealer cashback tier." },
                { icon: Sun, title: "Covers Aftermarket Too", desc: "Solar additions, exterior upgrades, and accessories your client installed after purchase are eligible when registered through DS360." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card rounded-xl border border-border p-5 flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div><h3 className="font-bold text-sm text-foreground">{title}</h3><p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Table */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Covered Components</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">What Specialty Protection Covers — and What It Costs to Fix Without It</h2>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-3 bg-muted/50 p-3">
              <div className="text-xs font-bold text-muted-foreground uppercase">Component</div>
              <div className="text-xs font-bold text-muted-foreground uppercase text-center">Repair Cost</div>
              <div className="text-xs font-bold text-muted-foreground uppercase text-center">Status</div>
            </div>
            <div className="divide-y divide-border">
              {components.map(({ name, repairCost, covered }) => (
                <div key={name} className="grid grid-cols-3 items-center px-3 py-3">
                  <div className="text-sm font-medium text-foreground">{name}</div>
                  <div className="text-sm text-muted-foreground text-center">{repairCost}</div>
                  <div className={`text-xs font-bold px-2 py-1 rounded-full text-center mx-auto ${covered ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {covered ? '✓ Covered' : '✗ Excluded'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sixth Product */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">The Sixth Product</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">The Product That Completes the Suite</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">The DS360 Protection Suite has six products. The more products you sell per unit, the higher your cashback tier. Specialty Protection is product #6 — the one that closes the suite and unlocks the highest tier.</p>
              <div className="space-y-4">
                {[
                  ["Fills the Gap", "Covers components that Extended Warranty and standard plans exclude"],
                  ["Completes the Bundle", "Product #6 in the suite — unlocks the highest cashback tier"],
                  ["DS360 Claims", "Same A-Z workflow — co-branded, dealer margin, platform-processed"],
                ].map(([h, p]) => (
                  <div key={h} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
                    <div><div className="font-semibold text-sm text-foreground">{h}</div><div className="text-sm text-muted-foreground mt-0.5">{p}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
              <h3 className="font-bold text-foreground mb-4 text-center">The Complete Protection Suite</h3>
              <div className="space-y-2">
                {[
                  ["/extended-warranty", "Extended Warranty", "1"],
                  ["/gap-insurance", "GAP Insurance", "2"],
                  ["/appearance-protection", "Appearance Protection", "3"],
                  ["/tire-wheel", "Tire & Wheel", "4"],
                  ["/roadside-travel-protection", "Roadside & Travel Protection", "5"],
                  ["/specialty-protection", "Specialty Protection", "6"],
                ].map(([href, name, num], i) => (
                  <Link key={href as string} href={href as string}>
                    <div className={`flex items-center gap-3 bg-white rounded-lg px-4 py-3 border cursor-pointer hover:border-primary/40 transition-colors ${i === 5 ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 5 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>{num}</div>
                      <span className={`text-sm font-medium ${i === 5 ? 'text-primary' : 'text-foreground'}`}>{name}</span>
                      {i === 5 && <span className="ml-auto text-xs text-primary font-bold">← You are here</span>}
                    </div>
                  </Link>
                ))}
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
            <h2 className="text-3xl font-bold text-foreground">Specialty Protection Questions</h2>
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
            <h2>Complete the Suite. Cover Every Component. <span className="accent">Earn the Highest Tier.</span></h2>
            <p>Specialty Protection is the final piece of the DS360 Protection Suite — the product that covers what everything else leaves out, and unlocks your dealership's highest cashback tier.</p>
            <div className="cta-h2-btns">
              <Link href="/sign-up"><button className="btn-solid">Get Started</button></Link>
              <Link href="/protection-plans"><button className="btn-outline">See All 6 Products</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
