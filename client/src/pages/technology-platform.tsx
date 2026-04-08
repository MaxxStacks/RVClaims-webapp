import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Shield, Database, Lock, Server, CheckCircle, Users } from "lucide-react";

const portals = [
  { name: "Dealer Portal", desc: "25 pages. Claims, units, billing, F&I, marketplace, TechFlow, staff management, and reporting — everything a dealer needs to run their operation.", link: "/dealer-portal", role: "Dealer Owner / Dealer Staff" },
  { name: "Operator Portal", desc: "36 pages. Full platform access — every dealer, every claim, every dollar. Operator admin and staff manage the platform from here.", link: "/client-portal", role: "Operator Admin / Operator Staff" },
  { name: "Customer Portal", desc: "14 pages. White-label dealer-branded portal for end customers. Warranty info, claim status, tickets, and protection plans.", link: "/client-portal", role: "Customer / RV Owner" },
  { name: "Bidder Portal", desc: "Live auction participation — browse units, place bids, manage deposits, and complete purchases through Stripe escrow.", link: "/bidder-portal", role: "Public Buyers" },
];

const security = [
  { title: "JWT Authentication", desc: "15-minute access tokens + 7-day refresh tokens. No persistent sessions exposed." },
  { title: "bcrypt Password Hashing", desc: "Industry-standard hashing with salting — plaintext passwords are never stored." },
  { title: "Multi-Tenant Isolation", desc: "Database-level tenant separation. Dealers cannot access each other's data — not through filtering, through architecture." },
  { title: "HTTPS / TLS Everywhere", desc: "All data in transit encrypted. No unencrypted endpoints." },
  { title: "PIPEDA Compliance", desc: "Canadian privacy law compliance built into data handling, consent flows, and retention policies." },
  { title: "Audit Logging", desc: "Every action logged with user, timestamp, IP, and context — full compliance trail." },
];

const faqs = [
  { q: "What tech stack does DS360 run on?", a: "React 18 + TypeScript + Vite on the frontend. Express.js + TypeScript + Node.js on the backend. PostgreSQL (Neon Serverless) + Drizzle ORM for the database. Cloudflare R2 for file storage with per-dealer isolation. Stripe for payments. WebSocket for real-time features." },
  { q: "How does multi-tenant isolation actually work?", a: "Tenant boundaries are enforced at the database level — not through application-level filtering. Each dealer's data is logically isolated. The 3-layer model (Operator → Dealer → Client) means each layer can only see its own data and the data its children generate. Operators can see all dealer data. Dealers can only see their own." },
  { q: "Where are files stored?", a: "All uploaded files (claim photos, invoices, inspection reports, documents) are stored in Cloudflare R2 with per-dealer folder isolation. Signed URLs are used for all file access — no public buckets, no shared paths." },
  { q: "Is the platform available on mobile?", a: "Yes. The DS360 Progressive Web App is available for iOS and Android. All portals are mobile-responsive. The dedicated Mobile App extends platform capabilities with native device features including camera access for claim photo uploads." },
  { q: "What happens to my data if we cancel?", a: "Your dealership data is yours. Upon cancellation, DS360 provides a data export in standard formats within 30 days. Data is retained for 90 days after cancellation, then securely deleted per our data retention policy." },
];

export default function TechnologyPlatform() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Dealer Suite 360 Platform",
    "description": "Four-portal SaaS platform for RV dealerships. Dealer Portal, Operator Portal, Customer Portal, and Bidder Portal — all connected through a single multi-tenant data layer.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://dealersuite360.com/technology-platform"
  };

  return (
    <PageLayout
      seoTitle="Technology Platform — Four Portals, One Operating System | DS360"
      seoDescription="DealerSuite360 is a unified multi-tenant SaaS platform built for RV dealer operations. Four portals, enterprise security, PostgreSQL backend, and real-time WebSocket sync."
      seoKeywords="RV dealer software, RV dealership platform, dealer management software, SaaS RV, multi-tenant dealer platform"
      canonical="/technology-platform"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                <Link href="/technology" className="hover:text-primary transition-colors">← Technology</Link>
              </div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Platform</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Not a Collection of Tools.<br />
                <span className="text-primary">A Complete Operating System.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                DealerSuite360 is a unified platform built from the ground up for RV dealer operations. Four portals serve four audiences — dealers, operators, clients, and bidders — all running on the same MSIL engine with shared data, real-time sync, and enterprise-grade security.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/sign-up"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Get Platform Access</button></Link>
                <Link href="/book-demo"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">Book a Live Demo</button></Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Database, title: "PostgreSQL", desc: "Neon Serverless + Drizzle ORM" },
                { icon: Lock, title: "JWT Auth", desc: "15-min tokens + 7-day refresh" },
                { icon: Server, title: "Real-Time", desc: "WebSocket sync across portals" },
                { icon: Shield, title: "PIPEDA", desc: "Canadian privacy compliance" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card rounded-xl border border-border p-5">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-bold text-sm text-foreground">{title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portals */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Portal Architecture</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">Four Audiences. Four Experiences. One Platform.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Each portal is tailored to its audience — different views, different permissions, different workflows — all connected through a single shared data layer.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {portals.map(({ name, desc, link, role }) => (
              <div key={name} className="bg-card rounded-xl border border-border p-6 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{name}</h3>
                    <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full mt-1">{role}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                <Link href={link} className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors">
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Control */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Access Control</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">Four Permission Tiers. Zero Data Leakage.</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">Role-based access is not just a setting — it is the architecture. The 3-layer model ensures that every user can see exactly what they are supposed to see, and nothing more.</p>
              <div className="space-y-4">
                {[
                  ["Operator Admin", "Full platform access — all dealers, all claims, all configuration, billing, invoicing, and system administration"],
                  ["Operator Staff", "Full claims access across all dealers — no billing, invoicing, or admin configuration"],
                  ["Dealer Owner", "Full dealership control — claims, units, billing, staff management for their dealership only"],
                  ["Dealer Staff", "Operational access only — claims and units for their dealership. No billing, no admin"],
                ].map(([role, desc]) => (
                  <div key={role} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><Users className="w-3.5 h-3.5 text-primary" /></div>
                    <div><div className="font-semibold text-sm text-foreground">{role}</div><div className="text-sm text-muted-foreground mt-0.5">{desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Data Architecture</span>
              <h2 className="text-2xl font-bold text-foreground mb-4">Multi-Tenant Isolation — Your Data Is Yours</h2>
              <div className="space-y-4">
                {[
                  ["Database-Level Isolation", "Tenant boundaries enforced at the data layer — not through application-level filtering"],
                  ["3-Layer Model", "Operator → Dealer → Client. Each layer sees only its own data and the data its children generate"],
                  ["Operator Is Invisible", "The client sees only the dealer's brand. DS360 operates behind the scenes — the operator layer is never exposed to the end user"],
                ].map(([h, p]) => (
                  <div key={h} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
                    <div><div className="font-semibold text-sm text-foreground">{h}</div><div className="text-sm text-muted-foreground mt-0.5">{p}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Enterprise Security</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">Built for Trust. Verified for Compliance.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">DS360 is built on enterprise-grade infrastructure designed to protect dealer and client data at every layer.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {security.map(({ title, desc }) => (
              <div key={title} className="bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">FAQ</span>
            <h2 className="text-3xl font-bold text-foreground">Platform Questions</h2>
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
            <h2>One Platform. Four Portals. <span className="accent">Enterprise Security. Zero Compromises.</span></h2>
            <p>The only RV-specific operating system built for dealers, operators, customers, and buyers — all connected through a single multi-tenant data layer.</p>
            <div className="cta-h2-btns">
              <Link href="/sign-up"><button className="btn-solid">Get Platform Access</button></Link>
              <Link href="/book-demo"><button className="btn-outline">Book a Demo</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
