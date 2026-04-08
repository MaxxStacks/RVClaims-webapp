import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, Globe, Palette, Shield, MessageSquare, FileText, Wrench } from "lucide-react";

const clientViews = [
  { icon: Shield, title: "My Unit", desc: "VIN, specs, warranty expiry countdown, coverage status, and all documentation in one place." },
  { icon: FileText, title: "Claim Status", desc: "Real-time claim updates — what's been submitted, what's been approved, and what's pending. No phone calls required." },
  { icon: Wrench, title: "Warranty & Coverage", desc: "OEM warranty, extended warranty, and all DS360 protection products in one view with progress bars and expiry dates." },
  { icon: MessageSquare, title: "Support Tickets", desc: "The client submits questions, requests, and issues directly through the portal. Your team responds in-platform." },
  { icon: Globe, title: "Documents", desc: "All certificates, policies, inspection reports, and invoices stored and accessible forever." },
  { icon: Palette, title: "Protection Plans", desc: "Active protection products with coverage details, claim history, and renewal options." },
];

const faqs = [
  { q: "Is the Client Portal really white-labeled?", a: "Yes — completely. Your logo is uploaded through your dealer dashboard. Your brand colors are applied instantly. Your custom domain (e.g., portal.yourdealership.com) is configured via CNAME. DS360 does not appear anywhere the client can see." },
  { q: "How does the client get access?", a: "When a dealer creates a customer record in the Dealer Portal, they can send an invitation email from within the platform. The client clicks the link, sets their password, and they are in. The login experience is branded to your dealership." },
  { q: "Can the client file a warranty claim through the portal?", a: "Clients can report issues and submit support tickets through the portal. Actual warranty claim processing is initiated by the dealership — not the client — since the dealer is the party with the manufacturer relationship. The portal gives clients visibility into the claim that their dealer has filed on their behalf." },
  { q: "What happens to the client portal when a dealer cancels DS360?", a: "Client access is suspended when the dealer subscription ends. Data is retained for 90 days. Dealers can export client records before cancellation. We recommend dealers communicate any subscription changes to their client base." },
  { q: "Does the client portal work on mobile?", a: "Yes — the Client Portal is fully responsive. Clients can access all features from any mobile browser. The DS360 Mobile App also provides native access with push notifications for claim updates and ticket responses." },
];

export default function ClientPortalPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "DS360 Client Portal",
    "description": "White-label dealer-branded customer portal for RV owners. Custom logo, custom domain, and custom colors — DS360 is invisible. Your brand, your portal.",
    "url": "https://dealersuite360.com/client-portal"
  };

  return (
    <PageLayout
      seoTitle="DS360 Client Portal — White-Label Branded Customer Experience"
      seoDescription="Give your clients a branded digital experience with the DS360 Client Portal. Your logo, your colors, your domain — DS360 is invisible. Warranty info, claim status, documents, and tickets."
      seoKeywords="RV dealer customer portal, white label customer portal, RV warranty portal, dealer branded portal, customer experience RV"
      canonical="/client-portal"
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
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Client Portal</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Your Brand. Your Portal.<br />
                <span className="text-primary">Your Client's Experience.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                The DS360 Client Portal is a white-label, dealer-branded digital experience that puts your client in control of their vehicle information. Your logo, your colors, your custom domain — DS360 is invisible. As far as your client is concerned, the portal is yours.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/sign-up"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Get the Client Portal</button></Link>
                <Link href="/book-demo"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">Book a Demo</button></Link>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="bg-primary p-4 text-white">
                <h3 className="font-bold text-sm">White-Label Branding</h3>
                <p className="text-xs text-white/80 mt-0.5">Your Logo. Your Colors. Your Domain. Zero DS360 Branding.</p>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { icon: Palette, title: "Logo & Colors", desc: "Uploaded and managed from your dealer dashboard — changes apply immediately" },
                  { icon: Globe, title: "Custom Domain via CNAME", desc: "Point your own subdomain (e.g., portal.yourdealership.com) to the Client Portal" },
                  { icon: Shield, title: "Operator Invisible", desc: "The 3-layer model ensures the client only sees the dealer. DS360 operates behind the scenes." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div><div className="font-semibold text-sm text-foreground">{title}</div><div className="text-xs text-muted-foreground mt-0.5">{desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What clients see */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Client Experience</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">What Your Clients See When They Log In</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">14 pages. Everything a client needs to understand their coverage, track their claim, and communicate with your dealership.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {clientViews.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl border border-border p-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
              <h3 className="font-bold text-foreground mb-6">Without the Client Portal</h3>
              <div className="space-y-3 mb-8">
                {["Client calls to ask about their claim status", "Your staff stops what they're doing to check", "Client calls again two days later", "No record of the conversation", "Client feels underserviced"].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-red-400 flex-shrink-0">✗</span>
                    {item}
                  </div>
                ))}
              </div>
              <h3 className="font-bold text-foreground mb-4">With the Client Portal</h3>
              <div className="space-y-3">
                {["Client logs in. Sees their claim status immediately.", "No call. No interruption. No staff time consumed.", "Client sends a message through the portal if they have questions.", "Your team responds in-platform when convenient.", "Client feels like they're being taken care of."].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">A Better Client Experience Is a Competitive Advantage</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">Most dealerships offer zero digital experience to their clients after the sale. A white-label portal branded to your dealership signals professionalism, builds trust, and reduces post-sale support burden on your staff.</p>
              <div className="space-y-4">
                {[
                  ["Reduced Inbound Calls", "Clients self-serve on status, coverage, and documents — your phone rings less"],
                  ["Professional Brand Image", "A branded portal signals that you run a modern, organized dealership"],
                  ["Client Retention", "Clients who feel connected to their dealership buy again"],
                  ["Support Ticket System", "All client questions flow through the portal — organized, tracked, and resolved"],
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

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">FAQ</span>
            <h2 className="text-3xl font-bold text-foreground">Client Portal Questions</h2>
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
            <h2>Give Your Clients <span className="accent">a Portal That Looks Like Yours.</span></h2>
            <p>White-label branding, custom domain, real-time claim visibility, and a built-in support ticket system — included with every DS360 subscription.</p>
            <div className="cta-h2-btns">
              <Link href="/sign-up"><button className="btn-solid">Get Started</button></Link>
              <Link href="/book-demo"><button className="btn-outline">Book a Demo</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
