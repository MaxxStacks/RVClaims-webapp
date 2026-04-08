import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, Users, Shield, MessageSquare, Mail, Video, Zap } from "lucide-react";

const howItWorks = [
  { icon: Users, title: "1. Client Is Credit-Approved", desc: "The sale closes. Financing is confirmed. DS360 automatically sends the client a personalized link to their AI F&I session — via email, text, or through the Client Portal." },
  { icon: Video, title: "2. AI Avatar Greets by Name", desc: "The client opens the link. A live video avatar greets them by name, congratulates them on their purchase, and references their specific unit — make, model, year, and key features. It feels personal because it is." },
  { icon: Shield, title: "3. Product Walkthrough", desc: "The AI walks through every available F&I product — Extended Warranty, GAP Insurance, Appearance Protection, Tire & Wheel, Roadside & Travel, Specialty Protection. Each product is explained in plain language with pricing relevant to their specific deal." },
  { icon: MessageSquare, title: "4. Real-Time Q&A", desc: "The client asks questions. The AI answers in real time — drawing from the Anthropic-powered knowledge base. \"What does GAP cover?\" \"Do I need extended warranty if I have manufacturer coverage?\" Handled live." },
  { icon: CheckCircle, title: "5. Selections Sync to Portal", desc: "The client selects the products they want. Accepted products are confirmed and automatically synced to the DS360 operator portal for processing. No paperwork. No manual entry. The deal data is already there." },
  { icon: Mail, title: "6. Automated Email Follow-Up", desc: "The AI sends and receives emails on behalf of your dealership — follow-up on pending product decisions, contract delivery, outstanding questions, and session summaries. If a client left products undecided, the AI follows up automatically." },
];

const productSuite = [
  { title: "Extended Warranty", desc: "Coverage beyond the manufacturer's standard warranty. Protects major systems — drivetrain, electrical, plumbing, appliances.", href: "/products/warranty-extended-service" },
  { title: "GAP Insurance", desc: "Covers the difference between what insurance pays and what the client owes if the unit is totaled or stolen.", href: "/products/gap-insurance" },
  { title: "Appearance Protection", desc: "Interior and exterior surface protection — paint, upholstery, carpet, vinyl, leather against stains, fading, and damage.", href: "/products/appearance-protection" },
  { title: "Tire & Wheel Protection", desc: "Covers repair or replacement from road hazards — blowouts, punctures, bent wheels, curb damage.", href: "/products/tire-wheel-protection" },
  { title: "Roadside & Travel Protection", desc: "Titanium-tier coverage — 160KM+, trip interruption, emergency lodging and meals, vehicle return service.", href: "/products/roadside-travel-protection" },
  { title: "Specialty Protection", desc: "Coverage for unique RV components — generators, solar systems, slide-outs, leveling systems, awnings, and accessories.", href: "/products/specialty-protection" },
];

const techChecks = [
  { title: "Anthropic Claude AI", desc: "Powers the brain — product knowledge, objection responses, pricing logic, conversation flow" },
  { title: "Live Video Avatar", desc: "Creates a realistic face-to-face experience — not a chatbot, not a text box, a person" },
  { title: "Deal-Aware", desc: "Knows the client's name, unit, financing terms — personalizes every session" },
  { title: "Email Follow-Up Engine", desc: "Sends and receives emails — contract delivery, pending decisions, session summaries, and automated follow-up sequences" },
  { title: "Patent-Pending", desc: "The integration of AI-powered F&I with live video avatar technology is under active patent application" },
];

const faqs = [
  { q: "When does the AI F&I Presenter launch?", a: "The AI F&I Presenter is currently in active development and is scheduled for beta launch in Q4 2026. Dealers on the waitlist will receive early access and priority onboarding. Each dealership requires a one-time setup and customization process — the AI must be configured with your specific product lineup, pricing, branding, and dealer data before it can present on your behalf." },
  { q: "Does this replace my F&I manager?", a: "It can. For dealers who cannot afford, find, or retain a dedicated F&I person, the AI Presenter handles the full presentation workflow after a one-time setup. For dealers who have F&I staff, it supplements them — handling overflow, after-hours clients, and ensuring 100% presentation coverage." },
  { q: "How does the AI know my client's details?", a: "When a client is credit-approved in the DS360 system, the platform already has their name, unit details, and financing terms. The AI Presenter draws from this data to personalize the session — the client's name, their specific unit make and model, and the products available for their deal." },
  { q: "Can the client ask questions?", a: "Yes. The AI responds in real time using Anthropic's Claude AI. Clients can ask about coverage details, pricing, comparisons between products, and common objections. The AI handles these naturally — the way a well-trained F&I manager would, but consistently and without fatigue." },
  { q: "What products does it present?", a: "Every DS360 F&I product available for the client's deal: Extended Warranty, GAP Insurance, Appearance Protection, Tire & Wheel Protection, Roadside & Travel Protection, and Specialty Protection. The product lineup is configurable per dealer." },
];

export default function AiFiPresenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "DS360 AI F&I Presenter",
    "provider": { "@type": "Organization", "name": "Dealer Suite 360" },
    "description": "The industry's first AI-powered F&I presentation tool. A live video avatar greets every credit-approved client by name, presents products, answers questions in real time, and syncs accepted selections to the DS360 portal.",
    "url": "https://dealersuite360.com/ai-fi-presenter"
  };

  return (
    <PageLayout
      seoTitle="AI F&I Presenter — The F&I Desk That Never Closes | DS360"
      seoDescription="The industry's first AI-powered F&I presentation tool. A live video avatar greets every credit-approved client by name, presents every product, answers questions, and processes contracts — without staffing an F&I desk."
      seoKeywords="AI F&I presenter, RV dealer F&I software, automated F&I presentation, AI finance insurance, DS360 F&I"
      canonical="/ai-fi-presenter"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-0 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center pb-12">
            <div className="text-sm text-muted-foreground mb-4">
              <Link href="/services" className="hover:text-primary transition-colors">← All Services</Link>
            </div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2 bg-green-100 border border-green-300 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                Active Development — Beta Launch Q4 2026
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 leading-tight tracking-tight">
              The F&I Desk That<br />
              <span className="text-primary">Never Closes</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
              The industry's first AI-powered F&I presentation tool. A live video avatar greets every credit-approved client by name, walks through every product, answers questions in real time, handles objections, and processes accepted selections — without a single F&I employee on staff. Every client. Every product. Every time.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Link href="/contact"><button className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg">Join the Waitlist</button></Link>
              <Link href="#how-it-works"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">See How It Works</button></Link>
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                ["100%", "Client Presentation Rate"],
                ["0", "F&I Staff Required"],
                ["24/7", "Always Available"],
                ["$0", "Commission Paid Out"],
              ].map(([val, label]) => (
                <div key={label} className="text-center py-8 border-r border-border last:border-r-0 odd:border-r [&:nth-child(2)]:border-r-0 md:[&:nth-child(2)]:border-r">
                  <div className="text-3xl font-black text-primary">{val}</div>
                  <div className="text-xs text-muted-foreground mt-1 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">The Problem</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">The F&I Desk Is the Biggest Bottleneck in Your Dealership</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">F&I managers are expensive, inconsistent, and unavailable after hours. Some days they pitch every product with conviction. Other days they rush through. Some clients get a thorough presentation. Others get a checkbox. The revenue lost to inconsistent F&I delivery — across nights, weekends, holidays, sick days, and employee turnover — is staggering.</p>
              <p className="text-muted-foreground leading-relaxed">And the clients who never get an F&I presentation at all? Those are the ones where the revenue loss is invisible — because nobody knows what they would have bought if someone had asked.</p>
            </div>
            <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border">
              <div className="bg-muted/30 p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-4">Traditional F&I</div>
                <div className="space-y-2">
                  {["Depends on who is working", "Inconsistent presentations", "Closed evenings and weekends", "Salary + commission + benefits", "Follow-ups depend on who remembers"].map(item => (
                    <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-primary/5 p-6">
                <div className="text-xs font-bold uppercase tracking-wider text-green-600 mb-4">AI F&I Presenter</div>
                <div className="space-y-2">
                  {["100% of clients presented", "Same quality every time", "Available 24/7/365", "Flat monthly cost", "Auto email follow-up & contracts"].map(item => (
                    <div key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commission Savings */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">The Real Cost of F&I</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">What a Human F&I Desk Actually Costs You</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">The salary is just the beginning. Commission on every product sold, benefits, training, turnover costs, and the revenue lost on days they are absent — the true cost of a traditional F&I desk is far higher than most dealers realize.</p>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] overflow-hidden rounded-xl border border-border">
            <div className="bg-muted/50 p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-4">Traditional F&I Manager</div>
              {[["Base salary", "$65,000/yr"], ["F&I commission (avg 25%)", "$37,500/yr"], ["Benefits & payroll", "$18,000/yr"], ["Training & certs", "$3,500/yr"], ["Turnover cost (avg 2yr cycle)", "$8,000/yr"], ["Sick days & vacation gaps", "$4,500/yr"]].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-border/50 text-sm last:border-b-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-red-600">{val}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-2 border-t-2 border-border font-bold text-sm">
                <span>Total Annual Cost</span>
                <span className="text-red-600">$136,500</span>
              </div>
            </div>
            <div className="bg-primary flex items-center justify-center px-3">
              <span className="text-white font-black text-sm tracking-widest [writing-mode:vertical-rl]">VERSUS</span>
            </div>
            <div className="bg-primary/5 p-6">
              <div className="text-xs font-bold uppercase tracking-wider text-green-600 mb-4">AI F&I Presenter</div>
              {[["Monthly subscription", "Flat fee"], ["Setup & customization", "One-time fee"], ["F&I commission", "$0"], ["Benefits & payroll", "$0"], ["Training & certs", "$0"], ["Turnover & replacement", "$0"]].map(([label, val]) => (
                <div key={label} className="flex justify-between py-2 border-b border-border/50 text-sm last:border-b-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold text-green-600">{val}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-2 border-t-2 border-border font-bold text-sm">
                <span>Total Annual Cost</span>
                <span className="text-green-600">Fraction of human</span>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-primary rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-primary-foreground/70 text-sm">The commission alone on a traditional F&I desk can exceed $37,000 per year — money your dealership earned but gave away. With the AI Presenter:</p>
              <p className="text-white font-bold text-lg mt-1">You keep <span className="text-green-400">100%</span> of your F&I product margins.</p>
            </div>
            <Link href="/contact"><button className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors flex-shrink-0">Join the Waitlist →</button></Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">How It Works</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">One Session. Every Product. Zero Staff.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">From the moment a client is credit-approved to the moment their product selections sync to your portal — fully automated.</p>
          </div>
          <div className="space-y-4">
            {howItWorks.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl border border-border p-5 flex gap-4 items-start hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Did You Know */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[8rem] font-black leading-none pointer-events-none select-none" style={{ color: 'rgba(3,50,128,0.06)' }}>?</div>
            <div className="relative">
              <div className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Did You Know<span style={{ color: '#033280' }}>?</span></div>
              <p className="text-lg text-foreground leading-relaxed">Studies show that <strong className="text-primary font-bold">F&I product penetration rates increase by 20% to 35%</strong> when every client receives a complete, consistent product presentation — regardless of who is working, what time it is, or how busy the dealership is. The AI F&I Presenter ensures that 100% of your credit-approved clients see every product, every time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Suite */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">The DS360 F&I Product Suite</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">Every Product the AI Presents — Issued by DS360</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">The AI F&I Presenter walks your clients through a complete suite of protection products. Every product is issued by DS360, sold under your dealer branding, and claims are processed through the DS360 platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {productSuite.map(({ title, desc, href }) => (
              <Link key={title} href={href}>
                <div className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group">
                  <h3 className="font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{desc}</p>
                  <div className="text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Learn More →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Powered By */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-64">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-green-500 flex items-center justify-center shadow-xl mb-4">
                <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="text-white font-bold text-sm text-center mt-2 bg-primary rounded-lg px-4 py-2">DS360 AI F&I Presenter</div>
              <div className="text-primary/70 text-xs text-center mt-2">Powered by Anthropic Claude + Live Video Avatar</div>
              <div className="grid grid-cols-3 gap-3 mt-6 w-full">
                {[["100%", "Presentation Rate"], ["24/7", "Available"], ["$0", "Commission"]].map(([val, label]) => (
                  <div key={label} className="text-center">
                    <div className="text-xl font-black text-primary">{val}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">The Technology</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">Powered by Anthropic AI and Live Video</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">The AI F&I Presenter combines two technologies: a live video avatar platform that creates a realistic, conversational video presence, and Anthropic's Claude AI that powers the intelligence behind every interaction — product knowledge, objection handling, pricing calculations, and real-time conversation.</p>
              <div className="space-y-4">
                {techChecks.map(({ title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{title}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connected to DS360 */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Connected to the DS360 Ecosystem</h2>
            <p className="text-muted-foreground">The AI F&I Presenter does not operate in isolation. Accepted products sync directly into the DS360 platform.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: "F&I Products", desc: "Every product the AI presents is issued by DS360 and managed through the platform", href: "/products/fi-services" },
              { title: "Claims Processing", desc: "When a client uses an F&I product, the claim flows through DS360 automatically", href: "/services/claims-processing" },
              { title: "Client Portal", desc: "Clients can access their F&I session link through the white-label portal", href: "/client-portal" },
              { title: "All Services", desc: "View the full DS360 service suite", href: "/services" },
            ].map(({ title, desc, href }) => (
              <Link key={title} href={href}>
                <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between gap-3 hover:border-primary/30 hover:shadow-sm transition-all group cursor-pointer">
                  <div>
                    <div className="font-semibold text-sm text-foreground">{title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                  </div>
                  <span className="text-primary text-lg group-hover:translate-x-1 transition-transform flex-shrink-0">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">FAQ</span>
            <h2 className="text-3xl font-bold text-foreground">AI F&I Presenter Questions</h2>
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
              <h2>Be First. <span className="accent">The Waitlist Is Open.</span></h2>
              <p>The AI F&I Presenter enters beta Q4 2026. Dealers on the waitlist get early access, priority onboarding, and founding partner pricing.</p>
            </div>
            <div className="cta-h1-btns">
              <Link href="/contact"><button className="btn-solid">Join the Waitlist</button></Link>
              <Link href="/services"><button className="btn-ghost">View All Services</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
