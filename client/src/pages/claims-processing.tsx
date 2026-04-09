import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/page-layout';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does DS360 submit claims directly to manufacturers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DS360 is a tracking and management platform. Actual submissions happen through manufacturer portals. DS360 prepares, optimizes, and tracks every claim so your submissions are complete and compliant before they reach the manufacturer."
      }
    },
    {
      "@type": "Question",
      "name": "Which manufacturers does DS360 support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Jayco, Forest River, Heartland, Keystone, Columbia Northwest, and Midwest Auto. Additional manufacturers are added to the platform continuously."
      }
    },
    {
      "@type": "Question",
      "name": "How does DS360 prevent claim expirations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The platform monitors every open warranty window by VIN and sends automated alerts at 30, 14, and 7 days before the manufacturer deadline closes. Your team gets full visibility into every claim at risk."
      }
    },
    {
      "@type": "Question",
      "name": "Can DS360 handle claims for units I did not sell?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DS360 tracks claims by VIN, not by original sale. If the unit is in your shop for warranty work, DS360 manages the claim regardless of where it was originally purchased."
      }
    },
    {
      "@type": "Question",
      "name": "What claim types does DS360 process?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DAF, PDI, Warranty, Extended Warranty, and Protection Plan claims — covering the full lifecycle of every unit from dealer acceptance through post-warranty coverage."
      }
    }
  ]
};

export default function ClaimsProcessing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('v'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.anim').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <PageLayout
      seoTitle="RV Claims Processing — AI-Powered Warranty & DAF Claims"
      seoDescription="DS360 handles the full RV claims lifecycle — DAF, PDI, Warranty, and Extended Warranty. AI-powered Flat Rate Code (FRC) recognition, photo optimization, and deadline tracking deliver maximum approvals and faster payouts."
      canonical="https://dealersuite360.com/claims-processing"
      schema={faqSchema}
    >
      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-text slide-in-up">
              <div>
                <div className="hero-badge">AI-Powered Claims Platform</div>
              </div>
              <div>
                <h1>
                  A-Z Claims Processing for{' '}
                  <span className="gradient">RV Dealers</span>
                </h1>
                <p className="hero-desc">Manage the full claims lifecycle from inspection to payout. Industry-leading warranty expiration notifications ensure no valid claim expires before it is filed — eliminating lost revenue before it happens. AI-powered Flat Rate Code recognition, photo optimization, and deadline tracking deliver maximum approvals and faster payouts.</p>
              </div>
              <div className="hero-btns">
                <a href="/contact" className="btn btn-lg btn-primary">Start Processing Claims</a>
                <a href="#services" className="btn btn-lg btn-outline">See How It Works</a>
              </div>
              <div className="hero-stats">
                <div className="hero-stat"><div className="hero-stat-val">150%</div><div className="hero-stat-label">Revenue Increase</div></div>
                <div className="hero-stat"><div className="hero-stat-val">97%</div><div className="hero-stat-label">Approval Rate</div></div>
                <div className="hero-stat"><div className="hero-stat-val">48h</div><div className="hero-stat-label">Processing Time</div></div>
              </div>
            </div>
            <div className="fade-in">
              <div className="hero-img">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=584&h=438&fm=webp&q=75" alt="RV claims management dashboard" width={584} height={438} fetchPriority="high" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN SERVICES GRID */}
      <section className="sec-white" id="services">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">Core Claims Services</div>
            <h2>Complete Dealership Solutions</h2>
            <p>DS360 processes five categories of RV claims with manufacturer-specific workflows, AI optimization, and deadline monitoring built in.</p>
          </div>
          <div className="grid-4 anim">
            <div className="svc-card">
              <div className="svc-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
              </div>
              <h3>DAF &amp; PDI Claims</h3>
              <p>Capture issues at dealer acceptance and pre-delivery inspection before manufacturer windows close.</p>
              <ul><li>AI-flagged inspection items</li><li>Deadline monitoring</li><li>Photo documentation</li></ul>
            </div>
            <div className="svc-card">
              <div className="svc-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
              </div>
              <h3>Warranty Claims</h3>
              <p>Full lifecycle tracking for manufacturer warranty claims — from submission through payout.</p>
              <ul><li>VIN-based tracking</li><li>Multi-manufacturer FRC codes</li><li>Expiry prevention alerts</li></ul>
            </div>
            <div className="svc-card">
              <div className="svc-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3>Extended &amp; Protection</h3>
              <p>Process claims under extended warranties and protection plans through the same DS360 workflow.</p>
              <ul><li>Extended warranty tracking</li><li>Protection plan claims</li><li>Unified claim workflow</li></ul>
            </div>
            <div className="svc-card">
              <div className="svc-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </div>
              <h3>Revenue Recovery</h3>
              <p>AI identifies missed labor lines, expired windows, and unsubmitted claims across your operation.</p>
              <ul><li>Labor line maximization</li><li>Unsubmitted claim surfacing</li><li>Revenue leakage reports</li></ul>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALIZED CLAIMS */}
      <section className="sec-gray">
        <div className="wrap">
          <div className="sec-head">
            <h2>Specialized Claims Processing</h2>
            <p>DS360 processes all five categories with manufacturer-specific workflows for each claim type.</p>
          </div>
          <div className="grid-5 anim">
            <div className="claim-card">
              <div className="claim-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 9H12"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
              </div>
              <h3>DAF</h3>
              <p>Dealer Acceptance Form — issues at initial inspection</p>
            </div>
            <div className="claim-card">
              <div className="claim-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
              </div>
              <h3>PDI</h3>
              <p>Pre-Delivery Inspection — problems before handoff</p>
            </div>
            <div className="claim-card">
              <div className="claim-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
              </div>
              <h3>Warranty</h3>
              <p>Manufacturer standard warranty defects and failures</p>
            </div>
            <div className="claim-card">
              <div className="claim-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h3>Extended</h3>
              <p>Claims beyond original manufacturer coverage</p>
            </div>
            <div className="claim-card">
              <div className="claim-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
              </div>
              <h3>Protection</h3>
              <p>Appearance, Tire &amp; Wheel, Roadside, Specialty</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI SPLIT */}
      <section className="sec-white">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">Patent-Pending AI Technology</div>
              <h2>World-Leading Claim Management Software</h2>
              <p>DS360 does not just track claims — it actively increases claim value and approval rates using proprietary technology no other platform can access.</p>
              <div className="checks">
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Flat Rate Code (FRC) Recognition</h3><p>AI identifies correct failure report codes, reducing denial-causing coding errors</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Photo Optimization</h3><p>Every image verified against manufacturer submission standards</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Description Generation</h3><p>Fail-proof repair descriptions that pass review on first submission</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Labor Line Maximization</h3><p>Surfaces billable labor your team may have missed on every claim</p></div>
                </div>
              </div>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'.5rem'}}>Learn More →</a>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Claims management analytics dashboard" width={576} height={432} loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE / STATS */}
      <section className="sec-gray">
        <div className="wrap">
          <div className="sec-head">
            <h2>15 Years of Industry Excellence</h2>
            <p>Results from dealers processing claims through the DS360 platform.</p>
          </div>
          <div className="grid-3 anim" style={{marginBottom:'4rem'}}>
            <div className="stat-card"><div className="stat-val">150%</div><div className="stat-title">Revenue Increase</div><p className="stat-desc">Average claims revenue growth for DS360 partner dealers</p></div>
            <div className="stat-card"><div className="stat-val">97%</div><div className="stat-title">Approval Rate</div><p className="stat-desc">First-submission approval rate with AI-optimized claims</p></div>
            <div className="stat-card"><div className="stat-val">48h</div><div className="stat-title">Processing Time</div><p className="stat-desc">Average turnaround from submission to manufacturer response</p></div>
          </div>
          <div className="mfr-box anim">
            <h3 style={{fontSize:'1.5rem',fontWeight:600,textAlign:'center',marginBottom:'.75rem'}}>Manufacturer Coverage</h3>
            <p style={{textAlign:'center',color:'var(--muted)',marginBottom:'2rem',maxWidth:'40rem',marginLeft:'auto',marginRight:'auto',fontSize:'.95rem'}}>DS360 integrates with every RV manufacturer in the industry. The manufacturers listed below represent our most active integrations — but our platform covers all manufacturers, including their full brand lineups.</p>
            <div className="mfr-grid">
              <div className="mfr-item">Jayco</div>
              <div className="mfr-item">Forest River</div>
              <div className="mfr-item">Heartland</div>
              <div className="mfr-item">Keystone</div>
              <div className="mfr-item">Columbia NW</div>
              <div className="mfr-item">Midwest Auto</div>
            </div>
            <p style={{textAlign:'center',color:'var(--primary)',marginTop:'1.5rem',fontSize:'.95rem',fontWeight:600}}>These are our most popular integrations. DS360 covers every RV manufacturer in North America — if they make RVs, we process their claims.</p>
          </div>
        </div>
      </section>

      {/* PORTALS SPLIT (reversed) */}
      <section className="sec-white">
        <div className="wrap">
          <div className="split anim" style={{direction:'rtl'}}>
            <div className="split-img" style={{direction:'ltr'}}>
              <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Dealer portal team collaboration" width={576} height={432} loading="lazy" />
              <div className="overlay"></div>
            </div>
            <div className="split-text" style={{direction:'ltr'}}>
              <div className="badge">Dealer &amp; Client Portals</div>
              <h2>Dedicated Portals for Every User</h2>
              <p>Your team tracks claims in the Dealer Portal. Your clients check status in a white-label Customer Portal branded with your dealership. DS360 processes everything in the Operator Portal.</p>
              <div className="checks">
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Dealer Portal</h3><p>Claims creation, unit tracking, photos, billing, staff management</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Client Portal</h3><p>White-label self-service — warranty info, claim tracking, issue submission</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>24/7 AI Monitoring</h3><p>Guardrails and continuous monitoring across all portals</p></div>
                </div>
              </div>
              <a href="/platform/dealer-portal" className="btn btn-primary" style={{width:'fit-content',marginTop:'.5rem'}}>Explore the Portal →</a>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="sec-gray">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">Pricing</div>
            <h2>Choose the Right Plan for Your Dealership</h2>
            <p>Claims processing is included in every DS360 plan. Choose the tier that matches your operation.</p>
          </div>
          <div className="pricing-table anim">
            <div className="pt-col">
              <div className="pt-head">
                <div className="pt-tier">Starter</div>
                <div className="pt-price"><span className="pt-dollar">$</span><span className="pt-amount">—</span><span className="pt-period">/mo</span></div>
                <div className="pt-desc">For single-location dealers getting started with claims management</div>
              </div>
              <div className="pt-body">
                <ul>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>A-Z claims lifecycle</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>AI FRC recognition</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Photo optimization</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Deadline alerts</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>DAF, PDI &amp; Warranty</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Dealer portal</li>
                  <li className="pt-off"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Extended &amp; Protection claims</li>
                  <li className="pt-off"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>White-label client portal</li>
                  <li className="pt-off"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Labor line maximization</li>
                  <li className="pt-off"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Priority support</li>
                </ul>
              </div>
              <div className="pt-foot">
                <a href="/contact" className="btn btn-outline" style={{width:'100%',justifyContent:'center',color:'var(--fg)'}}>Get Started</a>
              </div>
            </div>
            <div className="pt-col pt-featured">
              <div className="pt-popular">Most Popular</div>
              <div className="pt-head">
                <div className="pt-tier">Professional</div>
                <div className="pt-price"><span className="pt-dollar">$</span><span className="pt-amount">—</span><span className="pt-period">/mo</span></div>
                <div className="pt-desc">For growing dealers who need the full claims engine and client portal</div>
              </div>
              <div className="pt-body">
                <ul>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>A-Z claims lifecycle</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>AI FRC recognition</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Photo optimization</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Deadline alerts</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>All 5 claim types</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Dealer portal</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>White-label client portal</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Labor line maximization</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>AI description generation</li>
                  <li className="pt-off"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>Priority support</li>
                </ul>
              </div>
              <div className="pt-foot">
                <a href="/contact" className="btn btn-green" style={{width:'100%',justifyContent:'center'}}>Get Started →</a>
              </div>
            </div>
            <div className="pt-col">
              <div className="pt-head">
                <div className="pt-tier">Enterprise</div>
                <div className="pt-price"><span className="pt-amount" style={{fontSize:'2rem'}}>Custom</span></div>
                <div className="pt-desc">For multi-location dealers and high-volume operations</div>
              </div>
              <div className="pt-body">
                <ul>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Everything in Professional</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Multi-location management</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Priority support</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Dedicated account manager</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Custom integrations</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Volume-based pricing</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Onboarding &amp; training</li>
                  <li className="pt-on"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>SLA guarantee</li>
                </ul>
              </div>
              <div className="pt-foot">
                <a href="/contact" className="btn btn-outline" style={{width:'100%',justifyContent:'center',color:'var(--fg)'}}>Contact Sales</a>
              </div>
            </div>
          </div>
          <p style={{textAlign:'center',marginTop:'2rem',fontSize:'.88rem',color:'var(--muted)'}}>All plans include basic roadside assistance. <a href="/pricing" style={{color:'var(--primary)',fontWeight:500}}>View full pricing details →</a></p>
        </div>
      </section>

      {/* CONNECTED SERVICES */}
      <section className="sec-white">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">Connected Services</div>
            <h2>Claims Processing Powers Everything Else</h2>
          </div>
          <div className="grid-2 anim">
            <a href="/services/parts-components" className="link-card"><div><h4>Parts &amp; Components</h4><p>Approved claims trigger fast parts sourcing across North America</p></div><span className="link-arrow">→</span></a>
            <a href="/services/techflow" className="link-card"><div><h4>TechFlow</h4><p>Approved claims auto-generate work orders with labor sync</p></div><span className="link-arrow">→</span></a>
            <a href="/revenue/services" className="link-card"><div><h4>Revenue Services</h4><p>Claims recovery as part of the full DS360 revenue model</p></div><span className="link-arrow">→</span></a>
            <a href="/revenue/optimization" className="link-card"><div><h4>Revenue Optimization</h4><p>See how much revenue your dealership is missing</p></div><span className="link-arrow">→</span></a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec-gray">
        <div className="wrap">
          <div className="faq-layout anim">
            <div className="faq-left">
              <div className="badge">FAQ</div>
              <h2 style={{fontSize:'clamp(1.75rem,4vw,2.25rem)',fontWeight:700,color:'var(--fg)',marginTop:'.75rem',lineHeight:1.2}}>Common Questions<br/>About Claims Processing</h2>
              <p style={{fontSize:'1rem',color:'var(--muted)',lineHeight:1.7,marginTop:'1rem'}}>Everything you need to know about how DS360 handles claims for your dealership.</p>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'1.5rem'}}>Still Have Questions? →</a>
            </div>
            <div className="faq-right">
              {[
                {
                  q: 'Does DS360 submit claims directly to manufacturers?',
                  a: 'DS360 is a tracking and management platform. Actual submissions happen through manufacturer portals. DS360 prepares, optimizes, and tracks every claim so your submissions are complete and compliant before they reach the manufacturer.'
                },
                {
                  q: 'Which manufacturers does DS360 support?',
                  a: 'Jayco, Forest River, Heartland, Keystone, Columbia Northwest, and Midwest Auto. Additional manufacturers are added to the platform continuously.'
                },
                {
                  q: 'How does DS360 prevent claim expirations?',
                  a: 'The platform monitors every open warranty window by VIN and sends automated alerts at 30, 14, and 7 days before the manufacturer deadline closes. Your team gets full visibility into every claim at risk.'
                },
                {
                  q: 'Can DS360 handle claims for units I did not sell?',
                  a: 'Yes. DS360 tracks claims by VIN, not by original sale. If the unit is in your shop for warranty work, DS360 manages the claim regardless of where it was originally purchased.'
                },
                {
                  q: 'What claim types does DS360 process?',
                  a: 'DAF, PDI, Warranty, Extended Warranty, and Protection Plan claims — covering the full lifecycle of every unit from dealer acceptance through post-warranty coverage.'
                }
              ].map((item, i) => (
                <div key={i} className={`faq-card${openFaq === i ? ' open' : ''}`}>
                  <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{item.q}</span>
                    <span className="faq-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M12 5v14M5 12h14"/></svg>
                    </span>
                  </button>
                  <div className="faq-a"><p>{item.a}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bcta">
        <div className="wrap">
          <h2>Ready to Optimize Your Claims Revenue?</h2>
          <p>Book a walkthrough and see how DS360 processes claims faster, prevents denials, and ensures no valid claim goes unfiled.</p>
          <div className="bcta-btns">
            <a href="/contact" className="btn btn-lg btn-green">Start Processing Claims →</a>
            <a href="/pricing" className="btn btn-lg btn-white">View Pricing</a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
