import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Shield, CheckCircle, Sparkles } from "lucide-react";

const products = [
  {
    title: "Paint Protection",
    subtitle: "Exterior Shield",
    price: "$399 – $699",
    duration: "5 years",
    description: "Professional-grade ceramic coating and paint protection film application that guards your RV's exterior against UV fading, oxidation, acid rain, bird droppings, and minor scratches.",
    covers: [
      "UV fading and oxidation protection",
      "Environmental contaminant resistance",
      "Hydrophobic coating reduces cleaning time",
      "Minor surface scratch resistance",
      "Colour depth enhancement",
    ],
    color: "bg-blue-50 border-blue-100",
    badge: "Most Popular",
  },
  {
    title: "Fabric Guard",
    subtitle: "Upholstery Protection",
    price: "$199 – $349",
    duration: "3 years",
    description: "Stain-resistant treatment for all interior fabrics including cushions, curtains, carpeting, and upholstery. Liquid repellent barrier prevents stains from bonding to fibers.",
    covers: [
      "Liquid spill repellency",
      "Food and beverage stain prevention",
      "UV fade reduction for fabrics",
      "Easy cleanup — wipe rather than scrub",
      "Odour resistance treatment",
    ],
    color: "bg-green-50 border-green-100",
    badge: null,
  },
  {
    title: "Interior Shield",
    subtitle: "Hard Surface Protection",
    price: "$249 – $449",
    duration: "5 years",
    description: "Protective coatings for all hard interior surfaces including countertops, cabinetry, flooring, and bathroom surfaces. Scratch and stain resistant formulations for high-use areas.",
    covers: [
      "Countertop scratch and stain resistance",
      "Cabinetry surface protection",
      "Vinyl and laminate floor coating",
      "Bathroom surface anti-mould treatment",
      "Easy-clean surface maintenance",
    ],
    color: "bg-purple-50 border-purple-100",
    badge: null,
  },
  {
    title: "Tire & Wheel",
    subtitle: "Rolling Protection",
    price: "$149 – $299",
    duration: "2 years",
    description: "Tire condition coverage and wheel protection plan. Covers road hazard damage, sidewall failures, and includes roadside tire service for covered incidents.",
    covers: [
      "Road hazard tire damage",
      "Sidewall and tread failure coverage",
      "Rim and wheel damage protection",
      "Roadside flat tire service included",
      "Replacement tire sourcing assistance",
    ],
    color: "bg-orange-50 border-orange-100",
    badge: null,
  },
  {
    title: "Key Replacement",
    subtitle: "Access Protection",
    price: "$99",
    duration: "Unlimited / 5 years",
    description: "Lost or damaged key replacement coverage for your RV's ignition, entry door, storage, and hitch lock keys. Includes programming for smart key systems.",
    covers: [
      "All key types — standard and smart/fob",
      "Unlimited replacements during coverage term",
      "Programming included for push-start systems",
      "Storage compartment and deadbolt keys",
      "Emergency lockout service",
    ],
    color: "bg-gray-50 border-gray-200",
    badge: null,
  },
];

export default function ProtectionPlans() {
  return (
    <PageLayout
      seoTitle="RV Protection Plans — Paint, Fabric & Interior | Dealer Suite 360"
      seoDescription="Protect your RV investment inside and out. Paint protection, fabric guard, interior shield, tire coverage, and key replacement plans for RV owners."
      canonical="/protection-plans"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Protect Your RV<br />Inside and Out
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Your RV is a significant investment. Protection plans preserve its condition, maintain resale value, and eliminate the sting of everyday damage — from UV fade to spilled coffee.
          </p>
          <Link href="/contact">
            <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
              Choose Your Protection →
            </button>
          </Link>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Protection Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Five specialized protection products available individually or bundled for maximum savings.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 relative">
                {product.badge && (
                  <div className="absolute -top-3 left-6">
                    <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">{product.badge}</span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground">{product.title}</h3>
                  <div className="text-sm text-muted-foreground">{product.subtitle}</div>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold text-primary">{product.price}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-4">Coverage term: {product.duration}</div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{product.description}</p>
                <ul className="space-y-2">
                  {product.covers.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl p-10 border border-primary/20 text-center shadow-lg">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Complete Protection Bundle</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Combine Paint Protection + Fabric Guard + Interior Shield for maximum coverage and maximum savings. The Complete Bundle saves you up to 30% compared to purchasing each product individually.
            </p>
            <div className="inline-flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-primary">From $749</span>
            </div>
            <div className="text-muted-foreground text-sm mb-8">vs. $847+ purchased separately</div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                  Get Bundle Pricing →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Can I purchase protection plans after buying my RV?", a: "Yes. Protection plans can be purchased at any time, though some products (especially paint protection) are ideally applied before the RV is placed into service. Contact us for availability based on your unit's current condition and age." },
              { q: "Are protection plan claims easy to make?", a: "Absolutely. Claims for covered incidents are submitted through your customer portal or by calling our claims team. For paint and fabric claims, we connect you with an authorized applicator in your region. Most claims are authorized and resolved within 5–7 business days." },
              { q: "Do protection plans transfer if I sell my RV?", a: "Yes. All protection plans are VIN-attached and fully transferable to a new owner. Transferable coverage is a valuable selling feature that can increase your RV's resale price." },
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
