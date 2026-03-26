import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Shield, CheckCircle, XCircle, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Basic",
    price: "From $1,299",
    term: "2 years / 20,000 km",
    description: "Essential mechanical and electrical coverage for RV owners who want protection on core systems.",
    features: {
      mechanical: true,
      electrical: true,
      plumbing: false,
      structural: false,
      appliances: false,
    },
    popular: false,
  },
  {
    name: "Plus",
    price: "From $2,199",
    term: "3 years / 36,000 km",
    description: "Comprehensive coverage including plumbing and appliances — the most popular choice for full-season RV owners.",
    features: {
      mechanical: true,
      electrical: true,
      plumbing: true,
      structural: false,
      appliances: true,
    },
    popular: true,
  },
  {
    name: "Premium",
    price: "From $3,499",
    term: "5 years / 60,000 km",
    description: "Complete coverage including structural components. Maximum protection for full-time and frequent travelers.",
    features: {
      mechanical: true,
      electrical: true,
      plumbing: true,
      structural: true,
      appliances: true,
    },
    popular: false,
  },
];

const coverageCategories = [
  { key: "mechanical", label: "Mechanical Systems", description: "Engine, transmission, drive systems, slide-out mechanisms, leveling jacks" },
  { key: "electrical", label: "Electrical Systems", description: "12V and 120V systems, converter, inverter, wiring, circuit boards, slide-out motors" },
  { key: "plumbing", label: "Plumbing & Water Systems", description: "Fresh water, grey water, holding tanks, water pump, water heater, faucets, toilet" },
  { key: "structural", label: "Structural Components", description: "Roof, walls, floor structure, frame components, delamination coverage" },
  { key: "appliances", label: "Appliances", description: "Refrigerator, range/oven, microwave, A/C units, furnace, washer/dryer" },
];

export default function ExtendedWarranty() {
  return (
    <PageLayout
      seoTitle="RV Extended Warranty Protection Plans | Dealer Suite 360"
      seoDescription="Extended warranty protection plans for RV owners. Basic, Plus, and Premium coverage from licensed insurers. Get a quote today."
      canonical="/extended-warranty"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" />
            Coverage backed by licensed insurers
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Extended Warranty<br />Protection for Your RV
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Your manufacturer warranty has an end date. Your RV doesn't. Extended warranty protection keeps you covered long after the factory warranty expires — so one repair bill doesn't ruin your season.
          </p>
          <Link href="/contact">
            <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
              Get a Quote →
            </button>
          </Link>
        </div>
      </section>

      {/* Plan Comparison */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Coverage Level</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three plans designed for different usage levels and budgets. All plans are underwritten by licensed Canadian and US insurance carriers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`bg-card rounded-xl border-2 ${plan.popular ? "border-primary shadow-lg" : "border-border hover:border-primary/40"} transition-all duration-300 relative`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-white px-6 py-1.5 rounded-full text-sm font-semibold">Most Popular</div>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                  <div className="text-2xl font-bold text-primary mb-1">{plan.price}</div>
                  <div className="text-sm text-muted-foreground mb-4">{plan.term}</div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  <div className="space-y-3 mb-8">
                    {coverageCategories.map((cat) => (
                      <div key={cat.key} className="flex items-center gap-3">
                        {(plan.features as any)[cat.key] ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-muted-foreground/40 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${(plan.features as any)[cat.key] ? "text-foreground" : "text-muted-foreground/50"}`}>
                          {cat.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link href="/contact">
                    <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${plan.popular ? "bg-primary text-white hover:bg-primary/90" : "bg-muted text-foreground hover:bg-muted/80"}`}>
                      Get a Quote
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Details */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What's Covered</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every plan covers components most critical to your RV's functionality. Coverage details vary by plan and are confirmed in your policy documentation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coverageCategories.map((cat, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-2">{cat.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claims Process */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Making a Claim is Simple</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Call or Submit Online", body: "When a covered issue occurs, contact our claims team by phone or submit a claim through your customer portal. No need to call the manufacturer directly." },
              { step: "2", title: "Authorization", body: "Our claims team reviews coverage and issues a repair authorization to the service facility of your choice. Most authorizations are completed within 24 hours." },
              { step: "3", title: "Repair & Reimburse", body: "Covered repairs are completed by the service facility. Payment goes directly to the shop for authorized work. You pay only any applicable deductible." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-primary/5 border-y border-primary/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Coverage Backed by Licensed Insurers</h2>
          <p className="text-muted-foreground leading-relaxed">
            All Dealer Suite 360 extended warranty plans are underwritten by licensed Canadian and US insurance carriers. Your coverage is backed by the financial strength of regulated insurance companies — not just a dealer promise.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Can I purchase extended warranty coverage for any RV?", a: "Coverage is available for RVs in good mechanical condition with no pre-existing issues. Units are subject to a qualifying inspection or review of service history before coverage is bound. Coverage is available for travel trailers, fifth wheels, Class A, Class C, and most specialty RV types." },
              { q: "Is there a deductible?", a: "Yes. Deductibles vary by plan. The Basic plan has a $250 per-claim deductible. Plus and Premium plans offer $100 deductible options. Zero-deductible upgrades are available on Plus and Premium plans for an additional premium." },
              { q: "Can I cancel my extended warranty?", a: "Plans can be cancelled within 30 days of purchase for a full refund. After 30 days, pro-rated refunds are available on unused coverage. Cancellation terms are detailed in your policy agreement." },
              { q: "Does coverage follow the RV or the owner?", a: "Extended warranty coverage is attached to the RV's VIN. If you sell your RV, the remaining coverage can be transferred to the new owner, which can be used as a selling feature that enhances trade-in value." },
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
