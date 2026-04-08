import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, TrendingUp, FileText, DollarSign } from "lucide-react";

export default function FreeDealerAnalysis() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", dealership: "", email: "", phone: "", province: "", units: "", revenue: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Free Dealer Analysis — DS360",
    "description": "No-cost performance audit for RV dealerships. We review your current claims process, identify revenue leakage, and present a custom DS360 implementation plan.",
    "provider": { "@type": "Organization", "name": "Dealer Suite 360" },
    "url": "https://dealersuite360.com/free-dealer-analysis"
  };

  return (
    <PageLayout
      seoTitle="Free Dealer Analysis — No-Cost RV Claims Audit | DS360"
      seoDescription="Let DS360 review your dealership's current claims process at no cost. We identify denial patterns, revenue leakage, and present a custom implementation plan — no commitment required."
      seoKeywords="free RV dealer analysis, RV claims audit, dealer performance review, RV warranty revenue, dealership analysis"
      canonical="/free-dealer-analysis"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Free — No Commitment</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Let's Talk
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Book a free 30-minute analysis call with a DS360 specialist. We review your current claims volume, identify denial patterns, estimate your recoverable revenue, and present a custom DS360 implementation plan — with no obligation to subscribe.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: FileText, title: "Claims Process Review", desc: "We analyze your current submission process and identify structural weaknesses that cause denials." },
                  { icon: DollarSign, title: "Revenue Leakage Estimate", desc: "We calculate how much you are leaving on the table through under-documented claims and missed FRC lines." },
                  { icon: TrendingUp, title: "Custom DS360 Plan", desc: "We present a tailored implementation plan showing how DS360 addresses your specific gaps." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{title}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-muted/30 rounded-xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-3">What DS360 Offers Your Dealership</h3>
                <div className="space-y-2">
                  {[
                    "A-Z warranty claims processing handled by our expert team",
                    "AI-assisted FRC code matching and photo quality review",
                    "F&I products, financing, and protection plans at dealer margin",
                    "Dealer Exchange and Live Auctions for inventory optimization",
                    "White-label customer portal branded to your dealership",
                    "TechFlow for service department workflow automation",
                  ].map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Request Received</h2>
                  <p className="text-muted-foreground">A DS360 specialist will contact you within one business day to schedule your free analysis call.</p>
                  <Link href="/" className="mt-6 inline-block">
                    <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">Back to Home</button>
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-6">Book Your Free Analysis</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Your Name *</label>
                        <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="John Smith" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Dealership Name *</label>
                        <input required type="text" value={form.dealership} onChange={e => setForm({...form, dealership: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="Smith RV" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Email Address *</label>
                      <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="john@smithrv.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                        <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="(888) 000-0000" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Province / State</label>
                        <select value={form.province} onChange={e => setForm({...form, province: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-background">
                          <option value="">Select...</option>
                          {["Ontario","Quebec","British Columbia","Alberta","Manitoba","Saskatchewan","Nova Scotia","New Brunswick","PEI","Newfoundland","Territories","US — Other"].map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Monthly Claims Volume</label>
                        <select value={form.units} onChange={e => setForm({...form, units: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-background">
                          <option value="">Select...</option>
                          {["1–5 claims/month","6–15 claims/month","16–30 claims/month","30+ claims/month"].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Current Processing</label>
                        <select value={form.revenue} onChange={e => setForm({...form, revenue: e.target.value})} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-background">
                          <option value="">Select...</option>
                          {["In-house staff","Manual / no system","Another service","Not processing claims"].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Anything specific you want reviewed?</label>
                      <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" placeholder="Denial rates, FRC codes, specific manufacturers..." />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                      Book My Free Analysis →
                    </button>
                    <p className="text-xs text-muted-foreground text-center">No commitment required. We'll contact you within one business day.</p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[["15+", "Years of claims expertise"], ["6", "Supported manufacturers"], ["10", "RV types covered"], ["A-Z", "Full service processing"]].map(([val, label]) => (
              <div key={label}>
                <div className="text-3xl font-bold text-primary">{val}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
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
              <h2>See Exactly <span className="accent">What You're Leaving on the Table.</span></h2>
              <p>The free analysis takes 30 minutes and costs nothing. Most dealers discover recoverable revenue they didn't know existed.</p>
            </div>
            <div className="cta-h1-btns">
              <Link href="/contact"><button className="btn-solid">Book Your Analysis</button></Link>
              <Link href="/sign-up"><button className="btn-ghost">Sign Up Instead</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
