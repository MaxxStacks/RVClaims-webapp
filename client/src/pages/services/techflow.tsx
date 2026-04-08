import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, Workflow, Clock, Wrench, BarChart3, FileText } from "lucide-react";

const features = [
  { icon: Workflow, title: "Automatic Work Order Generation", desc: "When a claim line is approved by the manufacturer, TechFlow generates a work order automatically. No manual entry, no duplicate data." },
  { icon: Clock, title: "Labor Hour Tracking", desc: "Every technician's time tracked per work order. Hours sync back to the claim invoice — approved vs. actual, automatically reconciled." },
  { icon: Wrench, title: "Parts-to-Repair Pipeline", desc: "When parts arrive from the DS360 network, TechFlow queues the repair automatically. Technician gets the work order. Nothing falls through the cracks." },
  { icon: FileText, title: "Walk-In Service Intake", desc: "Non-claim service traffic managed through TechFlow — scheduling, intake, labor tracking, and invoicing for standard service work." },
  { icon: BarChart3, title: "Revenue Reporting", desc: "See exactly how much labor revenue you're generating per claim, per technician, and per period. Know what you're billing vs. what you're leaving behind." },
  { icon: CheckCircle, title: "One Portal Integration", desc: "TechFlow lives inside your existing DS360 Dealer Portal. No separate login, no separate system — just a connected service layer." },
];

const faqs = [
  { q: "What problem does TechFlow solve?", a: "TechFlow solves the disconnection between the claims department and the service bay. Right now, a claim gets approved — and then someone has to manually create a work order, assign a technician, and track the labor. TechFlow does all of that automatically when the approval comes through, ensuring every approved line gets billed and no labor hours go unrecorded." },
  { q: "Does TechFlow replace our existing DMS?", a: "No. TechFlow is an add-on service layer within DS360 specifically for the warranty claims workflow. It does not replace a full Dealer Management System. TechFlow handles the bridge between claim approval and repair completion — the piece most DMS systems don't do well for RV-specific warranty work." },
  { q: "Can walk-in service customers be managed through TechFlow?", a: "Yes — TechFlow handles both warranty work orders generated from claims and standard walk-in service appointments. Scheduling, intake, labor tracking, and invoicing for non-claim service work all run through TechFlow." },
  { q: "How does the labor calculator work?", a: "TechFlow tracks hours logged against each work order in real time. At claim close, actual labor hours are compared against manufacturer-approved hours. The gap between those two numbers is the unbilled labor — TechFlow surfaces that number so you can act on it." },
  { q: "Is TechFlow available as a standalone product?", a: "TechFlow is available as an add-on to any DS360 subscription. It requires the DS360 Dealer Portal as the base — it runs inside your existing portal, not as a standalone system." },
];

export default function TechFlow() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [techCount, setTechCount] = useState(4);
  const [claimsPerMonth, setClaimsPerMonth] = useState(20);
  const unbilledHours = Math.round(techCount * claimsPerMonth * 0.4);
  const recoveredRevenue = Math.round(unbilledHours * 95);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "TechFlow — DS360 Service Department Workflow",
    "provider": { "@type": "Organization", "name": "Dealer Suite 360" },
    "description": "TechFlow connects your approved warranty claims to your service bay. Auto-generated work orders, labor tracking, parts pipeline, and walk-in service management.",
    "url": "https://dealersuite360.com/services/techflow"
  };

  return (
    <PageLayout
      seoTitle="TechFlow — Connect Claims to Your Service Bay | DS360"
      seoDescription="TechFlow bridges the gap between approved warranty claims and completed repairs. Work orders generate automatically, labor hours sync to invoices, and walk-in service traffic is managed in one place."
      seoKeywords="RV service department software, warranty work orders, service bay management, RV dealer service workflow, TechFlow DS360"
      canonical="/services/techflow"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                <Link href="/services" className="hover:text-primary transition-colors">← Services</Link>
              </div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Add-On Service</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Your Claims Desk and Service Bay<br />
                <span className="text-primary">Are Finally Connected</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                TechFlow bridges the gap between approved warranty claims and completed repairs. Work orders generate automatically, technicians get assigned, labor hours sync back to the claim invoice — and walk-in service traffic stops flooding your showroom floor. One workflow from approval to payout.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Add TechFlow to Your Plan</button></Link>
                <Link href="/book-demo"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">Book a Demo</button></Link>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-red-50 rounded-xl border border-red-200 p-5">
                <h3 className="font-bold text-red-700 mb-2">Without TechFlow</h3>
                <div className="space-y-1.5">
                  {["Claim approved → someone manually creates a work order", "Technician doesn't know it's waiting", "Parts arrive but repair doesn't start", "Labor hours tracked on paper — then forgotten", "Invoice submitted with unbilled labor"].map(p => (
                    <div key={p} className="flex items-start gap-2 text-xs text-red-600"><span className="flex-shrink-0">✗</span>{p}</div>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 rounded-xl border border-green-200 p-5">
                <h3 className="font-bold text-green-700 mb-2">With TechFlow</h3>
                <div className="space-y-1.5">
                  {["Claim approved → work order created automatically", "Technician notified instantly, job queued", "Parts arrival triggers repair workflow", "Every labor minute tracked and invoiced", "Invoice submitted with full labor captured"].map(p => (
                    <div key={p} className="flex items-start gap-2 text-xs text-green-700"><CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />{p}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What TechFlow Gives Your Service Department</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Beyond the claims connection — TechFlow is a service management layer built for how RV dealers actually operate.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl border border-border p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Calculator */}
      <section className="py-20 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">How Much Unbilled Labor Is Your Dealership Losing<span style={{ color: '#033280' }}>?</span></h2>
            <p className="text-muted-foreground">Adjust the sliders to match your operation. See what TechFlow recovers.</p>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border text-center">
              <h3 className="font-bold text-foreground">Labor Recovery Calculator</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Estimate your monthly revenue recovery with TechFlow</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2"><span>Number of Technicians</span><span className="text-primary">{techCount}</span></div>
                <input type="range" min={1} max={20} value={techCount} onChange={e => setTechCount(+e.target.value)} className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2"><span>Claims Processed / Month</span><span className="text-primary">{claimsPerMonth}</span></div>
                <input type="range" min={5} max={100} value={claimsPerMonth} onChange={e => setClaimsPerMonth(+e.target.value)} className="w-full accent-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-4 text-center">
                  <div className="text-xs text-muted-foreground mb-1">Est. Unbilled Hours/Mo</div>
                  <div className="text-2xl font-black text-foreground">{unbilledHours}</div>
                </div>
                <div className="bg-primary/5 rounded-lg p-4 text-center border border-primary/20">
                  <div className="text-xs text-muted-foreground mb-1">Est. Recovered Revenue/Mo</div>
                  <div className="text-2xl font-black text-primary">${recoveredRevenue.toLocaleString()}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">Based on industry average of 0.4 unbilled hours per claim at $95/hr labor rate. Actual results vary.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">FAQ</span>
            <h2 className="text-3xl font-bold text-foreground">TechFlow Questions</h2>
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
            <h2>Stop Losing Labor Hours. <span className="accent">Start Billing Every Minute.</span></h2>
            <p>TechFlow connects your approved claims to your service bay — automatically. Add it to your DS360 plan and start recovering the revenue you're currently leaving on the floor.</p>
            <div className="cta-h2-btns">
              <Link href="/sign-up"><button className="btn-solid">Add TechFlow</button></Link>
              <Link href="/contact"><button className="btn-outline">Talk to Sales</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
