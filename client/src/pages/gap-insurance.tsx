import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, AlertTriangle, DollarSign, ShieldCheck } from "lucide-react";

const faqs = [
  { q: "What is the GAP — how does it happen?", a: "When a client finances an RV, they borrow what it is worth today. The moment it is driven off the lot, it depreciates. If the unit is totaled or stolen, insurance pays current market value — not the loan balance. The difference between those two numbers is the GAP. On a new Class A motorhome, this gap can easily exceed $30,000." },
  { q: "Does every financed RV create a GAP exposure?", a: "Not always — but often. GAP exposure is highest in the first 2–3 years of ownership when depreciation is steepest relative to the loan balance. Any client who financed more than 80% of the purchase price is at meaningful risk. This is most financed buyers." },
  { q: "What does the DS360 GAP policy actually cover?", a: "DS360 GAP Insurance covers the difference between the insurance settlement (actual cash value of the unit) and the remaining loan balance at the time of total loss or theft. The client pays $0 in the gap — the policy covers it entirely." },
  { q: "How is the GAP policy issued?", a: "DS360 issues the GAP policy under the Dealer Suite 360 platform. Your dealership appears as the co-issuing dealer on the certificate. You set the retail price. DS360 provides the wholesale cost, and the margin is yours to keep." },
  { q: "How do claims work when a client has a total loss?", a: "The client contacts your dealership. DS360 manages the entire claim process — coordinating with the lender, the insurance company, and the GAP policy. Your dealership is kept informed. The client gets resolution without navigating the process themselves." },
];

export default function GapInsurance() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loanAmt, setLoanAmt] = useState(65000);
  const [year, setYear] = useState(2);

  const depreciation = [0, 0.22, 0.32, 0.40, 0.46, 0.52];
  const insValue = Math.round(loanAmt * (1 - depreciation[year]));
  const loanBalance = Math.round(loanAmt * (1 - year * 0.08));
  const gap = Math.max(0, loanBalance - insValue);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "DS360 GAP Insurance",
    "description": "Guaranteed Asset Protection insurance for RV dealers. Covers the difference between insurance payout and remaining loan balance on total loss or theft.",
    "brand": { "@type": "Brand", "name": "Dealer Suite 360" },
    "url": "https://dealersuite360.com/gap-insurance"
  };

  return (
    <PageLayout
      seoTitle="GAP Insurance for RV Dealers | Guaranteed Asset Protection | DS360"
      seoDescription="Offer GAP Insurance at the point of sale and protect your clients from owing thousands on a totaled or stolen RV. DS360 issues, manages, and pays — you earn the margin."
      seoKeywords="GAP insurance RV, guaranteed asset protection, RV dealer GAP, total loss coverage, RV financing protection"
      canonical="/gap-insurance"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                <Link href="/fi-services" className="hover:text-primary transition-colors">← All Products</Link>
              </div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Product · High Demand</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Your Client's RV Is Totaled.<br />
                <span className="text-primary">They Still Owe $18,000 on the Loan.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Insurance pays what the unit is worth today — not what the client owes on it. The difference between those two numbers is called the GAP. Without GAP Insurance, your client writes a check for thousands of dollars on a vehicle they no longer have. DS360 GAP Insurance eliminates that risk entirely.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Start Selling GAP</button></Link>
                <Link href="#how-it-works"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">See the Math</button></Link>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t border-border">
                {[["$18K+", "Avg GAP Exposure"], ["High", "Client Demand"], ["Your", "Brand on the Policy"]].map(([val, label]) => (
                  <div key={label}>
                    <div className="text-2xl font-bold text-primary">{val}</div>
                    <div className="text-xs text-muted-foreground mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-4">
              <div className="bg-white border-2 border-primary rounded-xl p-6 text-center">
                <div className="text-xs font-bold text-primary uppercase tracking-wide mb-2">What Client Owes</div>
                <div className="text-4xl font-black text-primary">${loanBalance.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Remaining loan balance</div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xl font-bold text-muted-foreground">−</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="bg-white border-2 border-green-500 rounded-xl p-6 text-center">
                <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Insurance Pays</div>
                <div className="text-4xl font-black text-green-600">${insValue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground mt-1">Current market value</div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xl font-bold text-red-500">=</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 text-center">
                <div className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">The GAP</div>
                <div className="text-4xl font-black text-red-600">${gap.toLocaleString()}</div>
                <div className="text-sm text-red-500 mt-1">Client owes this — without GAP Insurance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="py-6 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[["Day 1", "Depreciation Starts"], ["20-30%", "Year 1 Value Loss"], ["$0", "Client Owes with GAP"], ["DS360", "Issued & Managed"]].map(([num, label]) => (
              <div key={label}>
                <div className="text-2xl font-bold text-primary">{num}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GAP Calculator */}
      <section className="py-20 bg-background" id="how-it-works">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">The Math</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">What the GAP Actually Looks Like</h2>
            <p className="text-muted-foreground">RVs depreciate faster than most vehicles — especially in the first two years.</p>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border text-center">
              <h3 className="font-bold text-foreground">GAP Exposure Calculator</h3>
              <p className="text-sm text-muted-foreground mt-1">Adjust to match your client's situation</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span>Purchase Price</span>
                  <span className="text-primary">${loanAmt.toLocaleString()}</span>
                </div>
                <input type="range" min={30000} max={250000} step={5000} value={loanAmt} onChange={e => setLoanAmt(+e.target.value)} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>$30K</span><span>$250K</span></div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span>Years After Purchase</span>
                  <span className="text-primary">Year {year}</span>
                </div>
                <input type="range" min={1} max={5} step={1} value={year} onChange={e => setYear(+e.target.value)} className="w-full accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Year 1</span><span>Year 5</span></div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">Estimated GAP Exposure</div>
                <div className="text-3xl font-black text-red-600">${gap.toLocaleString()}</div>
                <div className="text-xs text-red-500 mt-1">Client owes this on top of the insurance payout</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">With DS360 GAP Insurance</div>
                <div className="text-3xl font-black text-green-700">$0</div>
                <div className="text-xs text-green-600 mt-1">Client owes nothing. Policy covers the gap.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How dealer benefits */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">The Dealer Opportunity</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">Every Financed Deal Is a GAP Opportunity</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                GAP Insurance is not a hard sell — it is a genuine client benefit that your F&I desk should present on every financed deal. DS360 provides you with the product at wholesale. You set the retail price. The margin on every GAP policy sold is yours to keep.
              </p>
              <div className="space-y-4">
                {[
                  ["Wholesale Cost from DS360", "You know the cost. You set the retail. The margin is yours."],
                  ["Co-Branded Certificate", "Your dealership name on every policy issued."],
                  ["DS360 Manages Claims", "When a client has a total loss, DS360 handles the process — not your front desk."],
                  ["No Per-Dealer Fee", "GAP is part of the F&I product suite — included with the DS360 platform."],
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
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, title: "Client Protection", desc: "GAP Insurance is one of the few F&I products that clients genuinely appreciate when they need it. A client saved from a $15,000 shortfall is a client who comes back." },
                { icon: DollarSign, title: "Dealer Revenue", desc: "At typical margins, a single GAP policy contributes meaningfully to your F&I revenue per deal. Present it on every financed transaction." },
                { icon: AlertTriangle, title: "Risk Without It", desc: "A client who totals their unit and still owes the lender thousands of dollars is a client who blames the dealership that didn't offer protection." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card rounded-xl p-6 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">FAQ</span>
            <h2 className="text-3xl font-bold text-foreground">GAP Insurance Questions</h2>
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

      {/* CTA Hybrid 2 */}
      <section className="cta-h2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-h2-inner">
            <h2>Offer <span className="accent">GAP Insurance</span> on Every Financed Deal.</h2>
            <p>Protect your clients, strengthen your F&I revenue, and eliminate the nightmare scenario of a client who owes thousands on a totaled unit.</p>
            <div className="cta-h2-btns">
              <Link href="/sign-up"><button className="btn-solid">Start Selling GAP</button></Link>
              <Link href="/fi-services"><button className="btn-outline">See All F&I Products</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
