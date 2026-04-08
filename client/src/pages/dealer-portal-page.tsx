import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, LayoutDashboard, FileText, DollarSign, Users, Package, BarChart3 } from "lucide-react";

const daySteps = [
  { time: "8:00 AM", title: "Morning Dashboard", desc: "Log in. See every active claim with status, next action, and deadline. Filter by urgency. Nothing slips." },
  { time: "9:30 AM", title: "New Claim Submission", desc: "Customer calls. Unit issue logged. VIN retrieved, claim created, photos uploaded. Submitted to operator for processing in under 10 minutes." },
  { time: "11:00 AM", title: "Manufacturer Update", desc: "Operator logs manufacturer response. You see the update in real time — no phone call required. Approved lines trigger parts ordering." },
  { time: "2:00 PM", title: "Parts Arrive", desc: "Parts arrival logged. TechFlow automatically queues the repair work order. Technician gets their assignment without you making a call." },
  { time: "4:30 PM", title: "Invoice Review", desc: "Completed claims generate invoices. Review, approve, and pay through Stripe or wallet — all in-portal. No paper trail to chase." },
];

const portalFeatures = [
  { icon: FileText, title: "Claim Creation & Tracking", desc: "Submit new claims, track status in real time, view manufacturer responses, and manage the full lifecycle." },
  { icon: Package, title: "Unit Management", desc: "Every unit organized by VIN with warranty info, claim history, photos, documents, and service records." },
  { icon: BarChart3, title: "Photo & Document Upload", desc: "Upload claim photos, warranty certificates, invoices, and inspection reports — AI scans and auto-populates fields." },
  { icon: DollarSign, title: "Billing & Payments", desc: "Track invoices, view payment history, monitor F&I product revenue, and check cashback tier progress." },
  { icon: Users, title: "Staff Management", desc: "Add staff, assign roles (Owner or Staff), and control who sees what — all from the portal settings." },
  { icon: LayoutDashboard, title: "Marketplace & F&I Access", desc: "List units on the Dealer Exchange, push to Live Auctions, access F&I products, and send AI F&I Presenter links — all in-portal." },
];

const faqs = [
  { q: "How long does it take to set up the Dealer Portal?", a: "After operator approval (typically 1-2 business days), you receive login credentials. The onboarding wizard walks you through your first unit, your first claim, and your billing setup. Most dealers are fully operational within the first session." },
  { q: "Can I add my service manager and service advisors?", a: "Yes. Dealer Owner accounts can create unlimited Dealer Staff accounts. Staff members see claims and units only — no billing, no invoices, no admin configuration. Role separation is clean and enforced at the platform level." },
  { q: "What happens when the operator updates a claim?", a: "You see the update in real time. No phone call required. The claim status changes, the notification appears in your portal, and the next required action is surfaced automatically." },
  { q: "Can I manage multiple dealership locations from one account?", a: "Each DS360 account covers one dealership location. Multi-location dealers are set up with separate dealership accounts, each with their own Dealer Owner credentials. The operator portal has visibility across all locations." },
  { q: "Does the portal work on mobile?", a: "Yes — the Dealer Portal is fully responsive. The DS360 mobile app also provides native iOS and Android access with camera integration for claim photo uploads directly from the service bay." },
];

export default function DealerPortalPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "DS360 Dealer Portal",
    "description": "The DS360 Dealer Portal gives RV dealers complete operational control — claims, units, billing, F&I, marketplace, TechFlow, and staff management in one login.",
    "url": "https://dealersuite360.com/dealer-portal"
  };

  return (
    <PageLayout
      seoTitle="DS360 Dealer Portal — Your RV Dealership's Operating Interface"
      seoDescription="The DS360 Dealer Portal is your complete operational dashboard — claims, units, billing, F&I products, marketplace, and staff management. One login. Everything in one place."
      seoKeywords="RV dealer portal, dealer management software, RV claims portal, dealership dashboard, DS360 dealer login"
      canonical="/dealer-portal"
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
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Portal</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                See What Your<br />
                <span className="text-primary">Day Looks Like on DS360.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                This is not a feature list. This is a walkthrough of what you see when you log in, how the portal supports your daily operations, and what changes between your morning coffee and your end-of-day close. If you are evaluating DS360, this page shows you exactly how it fits into your day.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/sign-up"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Get Portal Access</button></Link>
                <Link href="/book-demo"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">Book a Live Demo</button></Link>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground">Your Dashboard</span>
              </div>
              <h3 className="font-bold text-foreground text-lg mb-3">One Login. Everything in One Place.</h3>
              <div className="space-y-3">
                {[
                  ["Claims at a Glance", "Every active claim with status, deadline, and next action required — sorted by urgency"],
                  ["Unit Management", "VIN-based dashboards with warranty info, claim history, photos, documents, and service records"],
                  ["Financial Overview", "Billing, payment tracking, F&I product revenue, and cashback tier status"],
                ].map(([h, p]) => (
                  <div key={h} className="flex gap-2.5">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <div><div className="font-semibold text-sm text-foreground">{h}</div><div className="text-xs text-muted-foreground mt-0.5">{p}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your Day */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Your Day on DS360</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">Morning to Close — What Happens at Each Step</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">This is a typical day for a dealer running their operation through the DS360 portal.</p>
          </div>
          <div className="space-y-4">
            {daySteps.map(({ time, title, desc }) => (
              <div key={time} className="flex gap-4">
                <div className="flex-shrink-0 text-right w-20 pt-4">
                  <span className="text-xs font-bold text-primary">{time}</span>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full mt-4.5 mt-[18px]" />
                  <div className="w-0.5 bg-border flex-1 my-1" />
                </div>
                <div className="bg-card rounded-xl border border-border p-4 flex-1 mb-2">
                  <h3 className="font-bold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Views */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Role-Based Views</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">Dealer Owner vs. Dealer Staff — Different Views, Same Portal</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">Two roles. One portal. Every user sees exactly what they need and nothing they shouldn't.</p>
              <div className="space-y-4">
                {[
                  ["Dealer Owner Sees", "Claims, units, billing, invoices, payment history, staff management, F&I product access, marketplace listings, TechFlow, reporting, and cashback tier status"],
                  ["Dealer Staff Sees", "Claims and units for their dealership — operational access only. No billing, no invoices, no staff management, no admin configuration"],
                  ["Same Login, Different Experience", "Staff members are added through the owner's dashboard with their role assigned. No separate portal, no separate URL — just filtered access"],
                ].map(([h, p]) => (
                  <div key={h} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle className="w-3.5 h-3.5 text-primary" /></div>
                    <div><div className="font-semibold text-sm text-foreground">{h}</div><div className="text-sm text-muted-foreground mt-0.5">{p}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Portal Features</span>
              <h2 className="text-2xl font-bold text-foreground mb-4">Everything Runs Through One Portal</h2>
              <div className="grid grid-cols-2 gap-3">
                {portalFeatures.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="bg-card rounded-xl border border-border p-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mb-2">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-xs text-foreground mb-1">{title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
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
            <h2 className="text-3xl font-bold text-foreground">Dealer Portal Questions</h2>
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
              <h2>See It in Action. <span className="accent">Book a Live Demo.</span></h2>
              <p>A DS360 specialist will walk you through the portal live — from claim creation to invoice payment — using your own dealership's scenarios.</p>
            </div>
            <div className="cta-h1-btns">
              <Link href="/book-demo"><button className="btn-solid">Book a Demo</button></Link>
              <Link href="/sign-up"><button className="btn-ghost">Sign Up Now</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
