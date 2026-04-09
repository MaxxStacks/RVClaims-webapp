import { useState, useEffect } from "react";
import { PageLayout } from "@/components/page-layout";

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I use my own preferred suppliers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. DS360 is built to integrate with your existing supplier relationships. Your vendor accounts, pricing, and relationships stay intact. DS360 adds tracking and automation on top.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if a part is back-ordered?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DS360 automatically searches for alternative suppliers. Approved aftermarket options are presented when available. Your team is notified before any substitution is made.",
      },
    },
    {
      "@type": "Question",
      name: "How does the V2 override work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When V2 launches, you set rules — price, ETA, or location. If the DS360 network finds a better option based on your rules, the order is flagged with the recommendation and exact savings. Nothing changes without your approval.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need TechFlow for parts to work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Parts sourcing works independently. TechFlow extends the workflow by generating work orders when parts arrive — but parts management is fully functional without it.",
      },
    },
    {
      "@type": "Question",
      name: "How are parts costs reflected on the invoice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Parts costs are captured automatically and flow directly into the claim invoice alongside labor charges. Everything is itemized and documented for manufacturer payout.",
      },
    },
  ],
};

const stages = [
  {
    id: "approve",
    num: "01",
    label: "Claim Approved",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
    ),
    title: "The manufacturer approves the claim",
    body: "DS360 captures the repair scope, required parts, Flat Rate Code details, and labor authorization. The parts process begins immediately — no manual handoff.",
    details: [
      { label: "Trigger", val: "Manufacturer claim approval" },
      { label: "Captured", val: "Repair scope, part specs, FRC lines, labor hours" },
      { label: "Next", val: "Automatic parts identification" },
    ],
  },
  {
    id: "identify",
    num: "02",
    label: "Parts Identified",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    ),
    title: "DS360 identifies the exact parts needed",
    body: "Based on the approved Flat Rate Code lines, the unit's VIN, and manufacturer specs, DS360 determines exactly which parts are required — part number, quantity, and compatibility verified.",
    details: [
      { label: "Data used", val: "VIN, FRC codes, manufacturer specifications" },
      { label: "Output", val: "Exact part numbers, quantities, compatibility confirmed" },
      { label: "Your involvement", val: "None — fully automated" },
    ],
  },
  {
    id: "source",
    num: "03",
    label: "Sourced & Ordered",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
    ),
    title: "Sourced and ordered automatically",
    body: "The platform searches your integrated suppliers — OEM first, approved aftermarket when OEM is unavailable. Your team receives confirmation with supplier details and estimated delivery.",
    details: [
      { label: "Priority", val: "OEM first, aftermarket fallback" },
      { label: "Selection", val: "Availability, proximity, cost" },
      { label: "You receive", val: "Supplier name, ETA, tracking info" },
    ],
  },
  {
    id: "track",
    num: "04",
    label: "Tracked In Transit",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 9H12"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
    ),
    title: "Real-time tracking in your dashboard",
    body: "Every order tracked in the dealer portal. Status updates flow automatically — ordered, shipped, in transit, delivered. No manual check-ins with suppliers.",
    details: [
      { label: "Statuses", val: "Ordered → Shipped → In Transit → Delivered" },
      { label: "Updates", val: "Automatic — no supplier follow-ups" },
      { label: "Visible to", val: "Dealer Owner + Staff in portal" },
    ],
  },
  {
    id: "complete",
    num: "05",
    label: "Received & Repaired",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" width="28" height="28"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
    ),
    iconBg: "hsl(140,50%,92%)",
    title: "Part received. Repair complete. Invoice closed.",
    body: "Your team confirms receipt. DS360 verifies the part matches the approved scope. The repair proceeds — if TechFlow is enabled, the work order is already queued. Parts and labor costs flow directly into the claim invoice.",
    details: [
      { label: "Verification", val: "Part matched against approved scope" },
      { label: "If TechFlow", val: "Work order already waiting" },
      { label: "Invoice", val: "Parts + labor auto-itemized for payout" },
    ],
  },
];

export default function PartsComponents() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeStage, setActiveStage] = useState("approve");

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("v");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(".anim").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);
  const currentStage = stages.find((s) => s.id === activeStage)!;

  return (
    <PageLayout
      seoTitle="Parts & Components — RV Parts Sourcing & Tracking"
      seoDescription="DS360 connects approved warranty claims to parts sourcing — your suppliers today, intelligent network sourcing tomorrow. Automated ordering, real-time tracking, and full claims integration."
      schema={schema}
    >
      {/* 1. HERO */}
      <section className="phero">
        <div className="wrap">
          <div className="phero-grid">
            <div className="phero-text">
              <div><a href="/services" style={{fontSize:'.82rem',color:'var(--muted)'}}>← All Services</a></div>
              <div><div className="badge">DS360 Service · Included in All Plans</div></div>
              <h1>An Approved Claim Only Becomes Revenue<span className="gradient">When the Repair Is Complete</span></h1>
              <p className="phero-desc">The bottleneck between a claim approval and a closed invoice is almost always parts. DS360 connects your approved claims to parts sourcing with automated ordering, real-time tracking, and full integration into the claims workflow so nothing stalls between approval and repair.</p>
              <div className="phero-btns">
                <a href="/contact" className="btn btn-lg btn-primary">Get Started</a>
                <a href="#how-it-works" className="btn btn-lg btn-outline">How It Works</a>
              </div>
              <div className="phero-stats">
                <div className="phero-stat"><div className="phero-stat-val">100s</div><div className="phero-stat-label">Suppliers in Network</div></div>
                <div className="phero-stat"><div className="phero-stat-val">Auto</div><div className="phero-stat-label">Triggered on Approval</div></div>
                <div className="phero-stat"><div className="phero-stat-val">Full</div><div className="phero-stat-label">Order-to-Install Tracking</div></div>
              </div>
            </div>
            <div className="phero-img">
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=584&h=438&fm=webp&q=75" alt="Parts management" width="584" height="438" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. METRIC BAR */}
      <section className="sec-g" style={{padding:'2.5rem 0'}}>
        <div className="wrap">
          <div className="metric-bar">
            <div className="metric-item"><div className="metric-num">100s</div><div className="metric-label">Suppliers Across NA</div></div>
            <div className="metric-item"><div className="metric-num">0</div><div className="metric-label">Manual Ordering Steps</div></div>
            <div className="metric-item"><div className="metric-num">100%</div><div className="metric-label">Order Visibility</div></div>
            <div className="metric-item"><div className="metric-num">Auto</div><div className="metric-label">Invoice Integration</div></div>
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM + BEFORE/AFTER */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">The Problem</div>
              <h2>Approved Claims That Sit Waiting Are Revenue You Cannot Bill</h2>
              <p>A warranty claim can be approved in 48 hours. But if the right part takes two weeks to source, the repair sits open, the bay stays occupied, the invoice stays unbilled, and the client stays frustrated. Every day a repair waits for a part is a day your dealership is not getting paid for work already authorized.</p>
              <p>DS360 eliminates this gap. The moment a claim is approved, parts ordering begins — automatically. No phone calls to distributors, no spreadsheets, no guessing.</p>
            </div>
            <div>
              <div className="ba">
                <div className="ba-col ba-before">
                  <div className="ba-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Without DS360
                  </div>
                  <ul className="ba-list">
                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Claim approved — then silence</li>
                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Phone calls to 3-4 distributors</li>
                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Wrong part arrives — delayed again</li>
                    <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Manual invoice entry</li>
                  </ul>
                </div>
                <div className="ba-col ba-after">
                  <div className="ba-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><path d="M5 13l4 4L19 7"/></svg>
                    With DS360
                  </div>
                  <ul className="ba-list">
                    <li><svg viewBox="0 0 24 24" fill="none" stroke="#0cb22c" strokeWidth="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>Auto-order on approval</li>
                    <li><svg viewBox="0 0 24 24" fill="none" stroke="#0cb22c" strokeWidth="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>Hundreds of suppliers searched</li>
                    <li><svg viewBox="0 0 24 24" fill="none" stroke="#0cb22c" strokeWidth="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>VIN-verified — right part first</li>
                    <li><svg viewBox="0 0 24 24" fill="none" stroke="#0cb22c" strokeWidth="2.5" width="16" height="16"><path d="M5 13l4 4L19 7"/></svg>Costs auto-flow to invoice</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS — TABBED */}
      <section className="sec-g" id="how-it-works">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">How It Works</div>
            <h2>From Approval to Installation</h2>
            <p>Parts sourcing is built directly into the claims workflow. Click each stage.</p>
          </div>
          <div className="stages anim">
            <div className="stage-nav">
              {stages.map((s) => (
                <button
                  key={s.id}
                  className={`stage-btn${activeStage === s.id ? ' active' : ''}`}
                  onClick={() => setActiveStage(s.id)}
                >
                  <span className="stage-btn-num">{s.num}</span>
                  <span className="stage-btn-label">{s.label}</span>
                </button>
              ))}
            </div>
            <div className="stage-panels">
              <div className="stage-panel active">
                <div className="stage-content">
                  <div className="stage-icon" style={currentStage.iconBg ? {background:currentStage.iconBg} : undefined}>
                    {currentStage.icon}
                  </div>
                  <h3>{currentStage.title}</h3>
                  <p>{currentStage.body}</p>
                  <div className="stage-detail">
                    {currentStage.details.map((d, i) => (
                      <div key={i} className="stage-detail-item"><strong>{d.label}:</strong> {d.val}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TECHFLOW CROSS-SELL */}
      <section className="sec-w" style={{padding:'2.5rem 0'}}>
        <div className="wrap">
          <div className="bcs">
            <div className="bcs-dot"></div>
            <div className="bcs-text"><strong>TechFlow</strong> picks up where Parts leaves off — approved claims with received parts auto-generate work orders with labor tracking.</div>
            <a href="/services/techflow">Add TechFlow →</a>
          </div>
        </div>
      </section>

      {/* 6. V1 — YOUR SUPPLIERS */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split split-rev anim">
            <div className="split-text">
              <div className="badge" style={{background:'hsl(140,60%,92%)',color:'hsl(140,60%,28%)',borderColor:'hsl(140,50%,80%)'}}>Live Now</div>
              <h2>Your Suppliers. Our Tracking.</h2>
              <p>DS360 integrates with the suppliers you already work with. Your vendor relationships stay intact — DS360 adds the tracking layer, claims integration, and automated ordering on top of the relationships you have built. Nothing changes about who you buy from. Everything changes about how you track it.</p>
              <div className="checks">
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Integrate Your Current Suppliers</h3><p>Your existing vendor accounts, pricing, and relationships are preserved</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Auto-Order on Claim Approval</h3><p>No manual POs — ordering begins the moment a claim is approved</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Full Order-to-Install Tracking</h3><p>Every order visible in your portal from placement to arrival</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Parts Costs Flow to Invoice</h3><p>No manual entry — costs auto-populate the claim invoice for payout</p></div></div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Supplier integration" width="576" height="432" loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. DYK */}
      <section className="sec-g">
        <div className="wrap">
          <div className="dyk anim">
            <div className="dyk-tag">Did You Know<span style={{color:'#033280'}}>?</span></div>
            <p>The average RV warranty repair waits <strong>8 to 14 business days</strong> for parts — not because parts are unavailable, but because the ordering process is manual, fragmented, and disconnected from the claims workflow. DS360 reduces this to the time it takes for a supplier to ship.</p>
          </div>
        </div>
      </section>

      {/* 8-10. V2 — UNIFIED SMART SOURCING SECTION */}
      <section style={{background:'linear-gradient(180deg,hsl(217,95%,14%) 0%,hsl(217,95%,18%) 40%,hsl(217,95%,20%) 100%)',padding:'5rem 0',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',right:'-6rem',top:'-6rem',width:'24rem',height:'24rem',background:'radial-gradient(circle,hsl(217,95%,28%,.25),transparent 70%)',borderRadius:'50%'}}></div>
        <div style={{position:'absolute',left:'10%',bottom:'-4rem',width:'16rem',height:'16rem',background:'radial-gradient(circle,hsl(160,80%,40%,.08),transparent 70%)',borderRadius:'50%'}}></div>
        <div className="wrap" style={{position:'relative',zIndex:1}}>

          {/* Header */}
          <div style={{textAlign:'center',marginBottom:'3.5rem'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:'.5rem',background:'rgba(12,178,44,.15)',border:'1px solid rgba(12,178,44,.3)',padding:'.35rem 1rem',borderRadius:'9999px',fontSize:'.75rem',fontWeight:700,color:'var(--green)',marginBottom:'1.25rem'}}>
              <span className="launch-dot"></span>
              Coming Soon — Active Development
            </div>
            <h2 style={{fontSize:'clamp(1.75rem,4vw,2.5rem)',fontWeight:800,color:'white',marginBottom:'.75rem',lineHeight:1.15}}>Intelligent Sourcing<br/>The DS360 Network Override</h2>
            <p style={{fontSize:'1.05rem',color:'hsl(217,30%,70%)',maxWidth:'44rem',margin:'0 auto',lineHeight:1.7}}>Your suppliers are the default. But when the DS360 network can beat them — on price, speed, or proximity — the system flags it. You set the rules. You make the call. Nothing changes without your approval.</p>
          </div>

          <div style={{maxWidth:'52rem',margin:'0 auto 3rem',height:'1px',background:'linear-gradient(90deg,transparent,hsl(217,50%,35%),transparent)'}}></div>

          {/* Override Rules */}
          <div style={{maxWidth:'52rem',margin:'0 auto'}}>
            <h3 style={{fontSize:'1.15rem',fontWeight:700,color:'white',textAlign:'center',marginBottom:'.5rem'}}>You Set the Override Rules</h3>
            <p style={{fontSize:'.88rem',color:'hsl(217,30%,65%)',textAlign:'center',maxWidth:'36rem',margin:'0 auto 1.75rem'}}>Three rule types. Set one, two, or all three. The system only overrides when your rules say it should.</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.25rem'}}>
              <div className="src-rule-card">
                <div className="src-rule-icon" style={{background:'rgba(12,178,44,.15)'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" width="22" height="22"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h4>Lower Price</h4>
                <p>DS360 finds the same part cheaper. Flagged with exact savings — dollar amount and percentage.</p>
              </div>
              <div className="src-rule-card">
                <div className="src-rule-icon" style={{background:'rgba(255,255,255,.08)'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <h4>Faster ETA</h4>
                <p>A DS360 supplier delivers faster. Flagged with the exact time difference.</p>
              </div>
              <div className="src-rule-card">
                <div className="src-rule-icon" style={{background:'rgba(255,255,255,.08)'}}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="22" height="22"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <h4>Closer Location</h4>
                <p>A network supplier is closer to your dealership — less shipping time and cost.</p>
              </div>
            </div>
          </div>

          <div style={{maxWidth:'52rem',margin:'3rem auto',height:'1px',background:'linear-gradient(90deg,transparent,hsl(217,50%,35%),transparent)'}}></div>

          {/* Dashboard Mockup */}
          <div style={{maxWidth:'52rem',margin:'0 auto'}}>
            <h3 style={{fontSize:'1.15rem',fontWeight:700,color:'white',textAlign:'center',marginBottom:'.5rem'}}>What This Looks Like in Your Dashboard</h3>
            <p style={{fontSize:'.88rem',color:'hsl(217,30%,65%)',textAlign:'center',maxWidth:'36rem',margin:'0 auto 1.75rem'}}>DS360 never silently switches your order. Every recommendation is flagged — the source, the reason, and the exact savings. You decide.</p>
            <div className="dash">
              <div className="dash-head">
                <span>Parts Order — CLM-2847</span>
                <div className="dash-head-tag">Override Available</div>
              </div>
              <div className="dash-cols"><span>Part</span><span>Your Supplier</span><span>Price</span><span>DS360 Recommendation</span></div>
              <div className="dash-row">
                <div className="dash-part">Slide-Out Seal Kit #J-4420</div>
                <div className="dash-supplier">National RV Parts</div>
                <div className="dash-price">$182.50</div>
                <div className="dash-rec">
                  <div className="dash-rec-tag dash-rec-save">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    Lower Price
                  </div>
                  <div className="dash-rec-detail">Order at <strong>ABC RV Parts</strong> — $132.88 <span style={{color:'hsl(140,60%,28%)',fontWeight:700}}>(27% savings)</span></div>
                </div>
              </div>
              <div className="dash-row">
                <div className="dash-part">Awning Fabric 18ft #FR-881</div>
                <div className="dash-supplier">National RV Parts</div>
                <div className="dash-price">$347.00</div>
                <div className="dash-rec">
                  <div className="dash-rec-tag dash-rec-fast">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Faster ETA
                  </div>
                  <div className="dash-rec-detail">Order at <strong>Midwest Awning Co.</strong> — same price, <span style={{color:'hsl(200,70%,30%)',fontWeight:700}}>delivers 4 days faster</span></div>
                </div>
              </div>
              <div className="dash-row">
                <div className="dash-part">Water Pump #SHF-200</div>
                <div className="dash-supplier">National RV Parts</div>
                <div className="dash-price">$89.95</div>
                <div className="dash-rec"><div className="dash-rec-none">No override — your supplier is the best option</div></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 11. STATS */}
      <section className="sec-w">
        <div className="wrap">
          <div className="grid-3 anim">
            <div className="stat-card"><div className="stat-val">100s</div><div className="stat-title">North American Suppliers</div><p className="stat-desc">OEM and approved aftermarket sourced across a continental network</p></div>
            <div className="stat-card"><div className="stat-val">Auto</div><div className="stat-title">Triggered Ordering</div><p className="stat-desc">Parts ordering begins the moment a claim is approved</p></div>
            <div className="stat-card"><div className="stat-val">100%</div><div className="stat-title">Order Visibility</div><p className="stat-desc">Every order tracked in real time from supplier to your service bay</p></div>
          </div>
        </div>
      </section>

      {/* 12. CONNECTED SERVICES */}
      <section className="sec-g">
        <div className="wrap">
          <div className="sec-head">
            <h2>Connected Services</h2>
            <p>Parts &amp; Components is included in every DS360 dealer plan as part of the claims workflow — no add-on fees. These services connect directly to the parts process.</p>
          </div>
          <div className="grid-2 anim">
            <a href="/services/claims-processing" className="link-card"><div><h4>Claims Processing</h4><p>The claim must be approved before parts ordering begins</p></div><span className="link-arrow">→</span></a>
            <a href="/services/techflow" className="link-card"><div><h4>TechFlow</h4><p>When parts arrive, work orders are already waiting</p></div><span className="link-arrow">→</span></a>
            <a href="/services/on-site-repairs" className="link-card"><div><h4>On-Site Repairs</h4><p>Mobile units can pre-stage parts before dispatch</p></div><span className="link-arrow">→</span></a>
            <a href="/services" className="link-card"><div><h4>All Services</h4><p>View the full DS360 service suite</p></div><span className="link-arrow">→</span></a>
          </div>
        </div>
      </section>

      {/* 13. FAQ */}
      <section className="sec-w">
        <div className="wrap">
          <div className="faq-layout anim">
            <div className="faq-left">
              <div className="badge">FAQ</div>
              <h2 style={{fontSize:'clamp(1.5rem,3.5vw,2rem)',fontWeight:700,marginTop:'.75rem',lineHeight:1.2}}>Parts &amp; Components<br/>Questions</h2>
              <p style={{fontSize:'1rem',color:'var(--muted)',lineHeight:1.7,marginTop:'1rem'}}>What you need to know about how DS360 handles parts sourcing.</p>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'1.5rem'}}>Contact Us →</a>
            </div>
            <div className="faq-right">
              {[
                { q: "Can I use my own preferred suppliers?", a: "Yes. DS360 is built to integrate with your existing supplier relationships. Your vendor accounts, pricing, and relationships stay intact. DS360 adds tracking and automation on top." },
                { q: "What happens if a part is back-ordered?", a: "DS360 automatically searches for alternative suppliers. Approved aftermarket options are presented when available. Your team is notified before any substitution is made." },
                { q: "How does the V2 override work?", a: "When V2 launches, you set rules — price, ETA, or location. If the DS360 network finds a better option based on your rules, the order is flagged with the recommendation and exact savings. Nothing changes without your approval." },
                { q: "Do I need TechFlow for parts to work?", a: "No. Parts sourcing works independently. TechFlow extends the workflow by generating work orders when parts arrive — but parts management is fully functional without it." },
                { q: "How are parts costs reflected on the invoice?", a: "Parts costs are captured automatically and flow directly into the claim invoice alongside labor charges. Everything is itemized and documented for manufacturer payout." },
              ].map((f, i) => (
                <div key={i} className={`faq-card${openFaq === i ? ' open' : ''}`}>
                  <button className="faq-q" onClick={() => toggleFaq(i)}>
                    <span>{f.q}</span>
                    <span className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M12 5v14M5 12h14"/></svg></span>
                  </button>
                  <div className="faq-a"><p>{f.a}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 14. BOTTOM CTA */}
      <section className="bcta">
        <div className="wrap">
          <h2>Stop Waiting on Parts. Start Closing Invoices.</h2>
          <p>See how DS360 connects approved claims to parts sourcing automatically — from approval to payout, nothing stalls.</p>
          <div className="bcta-btns">
            <a href="/contact" className="btn btn-lg btn-green">Book a Demo →</a>
            <a href="/services" className="btn btn-lg btn-white">View All Services</a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
