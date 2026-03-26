import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Building2, Factory, Package, Shield, Wrench, Code, CheckCircle } from "lucide-react";

const partnerTypes = [
  {
    icon: Building2,
    title: "Dealers",
    body: "RV dealerships across North America can join as platform subscribers and gain access to the full service ecosystem — from claims processing to financing, F&I, and marketplace tools.",
    cta: "Become a Dealer Partner",
  },
  {
    icon: Factory,
    title: "Manufacturers",
    body: "RV manufacturers benefit from faster, more accurate warranty claim submissions, reduced disputes, and AI-powered compliance documentation. We currently work with 6 manufacturers.",
    cta: "Manufacturer Partnership",
  },
  {
    icon: Package,
    title: "Parts Suppliers",
    body: "Parts distributors and suppliers can list inventory available to dealers through our platform. When claims are approved, connected suppliers get automatic purchase order notifications.",
    cta: "Parts Supplier Partnership",
  },
  {
    icon: Shield,
    title: "Insurance Providers",
    body: "Insurance carriers can integrate with our claims processing pipeline to streamline RV insurance claim submissions, adjustments, and approvals through our dealer network.",
    cta: "Insurance Partnership",
  },
  {
    icon: Wrench,
    title: "Service Networks",
    body: "Mobile service providers, repair networks, and service technician agencies can join our growing network to receive work orders from platform dealers.",
    cta: "Service Network Partnership",
  },
  {
    icon: Code,
    title: "Technology Integrators",
    body: "DMS vendors, accounting platforms, and other dealership technology providers can integrate via our API to deliver seamless data sync for mutual clients.",
    cta: "Technology Integration",
  },
];

const manufacturers = ["Jayco", "Forest River", "Heartland", "Columbia NW", "Keystone", "Midwest Auto"];

export default function Partnerships() {
  const [formData, setFormData] = useState({
    company: "", contact: "", email: "", partnerType: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout
      seoTitle="Partner with Dealer Suite 360 | Manufacturers, Suppliers & Technology Partners"
      seoDescription="Partner with Dealer Suite 360 to reach North America's RV dealership network. Opportunities for manufacturers, parts suppliers, insurers, and technology integrators."
      canonical="/partnerships"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Partner with Dealer Suite 360<br />— Grow Together
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're building the platform that connects the entire RV dealership ecosystem. Whether you're a manufacturer, supplier, insurer, or technology provider — there's a partnership model that works for both of us.
          </p>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Partnership Opportunities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We work with partners across the entire dealership value chain. Find the model that fits your organization.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerTypes.map((p, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <p.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{p.body}</p>
                <span className="text-xs font-semibold text-primary">{p.cta} →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Current Manufacturer Partners</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We actively process claims for dealers on these manufacturer portals. Deep integration means faster processing and higher approval rates.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {manufacturers.map((m) => (
              <span key={m} className="bg-card border border-border rounded-xl px-6 py-4 text-foreground font-semibold text-base hover:border-primary/40 transition-colors">
                {m}
              </span>
            ))}
            <span className="bg-primary/10 border border-primary/30 rounded-xl px-6 py-4 text-primary font-semibold text-base">
              + More Coming Q2 2026
            </span>
          </div>
        </div>
      </section>

      {/* Partnership Inquiry Form */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Start a Partnership Conversation</h2>
            <p className="text-muted-foreground">
              Tell us about your organization and how you'd like to work together. We respond within 2 business days.
            </p>
          </div>

          {submitted ? (
            <div className="text-center bg-card border border-border rounded-xl p-12">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Inquiry Received</h3>
              <p className="text-muted-foreground">We'll review your submission and reach out within 2 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
                  <input type="text" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                    value={formData.company} onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))} placeholder="Your Company" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contact Name</label>
                  <input type="text" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                    value={formData.contact} onChange={(e) => setFormData(p => ({ ...p, contact: e.target.value }))} placeholder="Your Name" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <input type="email" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                    value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="you@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Partner Type</label>
                  <select required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                    value={formData.partnerType} onChange={(e) => setFormData(p => ({ ...p, partnerType: e.target.value }))}>
                    <option value="">Select type...</option>
                    <option>Dealer</option>
                    <option>Manufacturer</option>
                    <option>Parts Supplier</option>
                    <option>Insurance Provider</option>
                    <option>Service Network</option>
                    <option>Technology Integrator</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tell us about the partnership opportunity</label>
                <textarea required rows={5} className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                  value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))} placeholder="Describe your organization and how you'd like to work with Dealer Suite 360..." />
              </div>
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Submit Partnership Inquiry →
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Partnership FAQ</h2>
          <div className="space-y-4">
            {[
              {
                q: "Is there a cost to become a partner?",
                a: "Most partnership types are integration-based with no upfront cost. Revenue sharing, referral fees, and transaction fees vary by partnership type and are negotiated individually. Contact us to discuss the model that works for your business.",
              },
              {
                q: "How long does the partnership process take?",
                a: "Technical integrations (API, data sync) typically take 4–8 weeks depending on complexity. Commercial partnerships such as manufacturer or insurance integrations may take longer due to compliance reviews. We'll provide a clear timeline after our initial call.",
              },
              {
                q: "Do you have an API for technology integrations?",
                a: "Yes. Our API supports RESTful endpoints for inventory sync, claims data, billing, and user management. API access is available to approved technology partners. Visit our API Access page or contact us to request developer documentation.",
              },
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
