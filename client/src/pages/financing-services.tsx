import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/page-layout';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "When does Financing Services launch?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Financing Services is scheduled to launch in Q4 2026. Dealers on the waitlist will receive early access and priority onboarding when the partner network is live."
      }
    },
    {
      "@type": "Question",
      "name": "Is the cashback actual cash?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Financing cashback credits are redeemable toward new unit purchases through DS360 — they cannot be withdrawn as cash. This structure incentivizes inventory reinvestment and keeps the value within the DS360 ecosystem."
      }
    },
    {
      "@type": "Question",
      "name": "Am I required to use DS360 partner financing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. DS360 partner financing is optional. You can continue using your existing lender relationships. However, only deals routed through DS360 partner institutions generate cashback credits. There is no penalty for using external lenders — you simply miss the cashback opportunity."
      }
    },
    {
      "@type": "Question",
      "name": "Does the client get a better rate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DS360 partner institutions offer preferential rates negotiated through the DS360 network volume. In most cases, the client receives a competitive or better rate compared to going directly to a bank — which makes routing through DS360 an easy recommendation for the dealer."
      }
    },
    {
      "@type": "Question",
      "name": "How does the rate shopping process work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you submit a deal for partner financing through the DS360 portal, the application is sent to multiple partner institutions simultaneously. Each institution returns their best available rate. Your client selects the offer that works for them. The entire process is managed through DS360 — you do not need to contact banks individually or compare rate sheets manually."
      }
    },
    {
      "@type": "Question",
      "name": "Do cashback credits expire?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Financing cashback credits accumulate in your DS360 account and do not expire. They remain available until you redeem them toward a unit purchase through the DS360 Marketplace or manufacturer ordering process."
      }
    },
    {
      "@type": "Question",
      "name": "Does this work with the AI F&I Presenter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When both services are live, the AI F&I Presenter will be able to present DS360 partner financing options alongside F&I products during the client session — creating a seamless flow from unit purchase to financing to product selection."
      }
    }
  ]
};

export default function Financing() {
  const [activeTab, setActiveTab] = useState<'loans' | 'leasing' | 'rental'>('loans');
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
      seoTitle="Financing Services — RV Dealer Partner Financing"
      seoDescription="DS360 Financing Services — partner-based loans, leasing, and rental financing with preferential rates and dealer cashback rewards. Launching Q4 2026."
      canonical="https://dealersuite360.com/financing"
      schema={faqSchema}
    >
      {/* HERO */}
      <section className="phero">
        <div className="wrap">
          <div className="phero-grid">
            <div className="phero-text">
              <div><a href="/products/fi-services" style={{fontSize:'.82rem',color:'var(--muted)'}}>← All Products</a></div>
              <div><div className="launch-badge"><span className="launch-dot"></span>Launching Q4 2026</div></div>
              <h1>Earn on the Financing.<span className="gradient">Not Just the Unit.</span></h1>
              <p className="phero-desc">DS360 Financing Services connects your dealership to a network of partner banks and financial institutions offering preferential rates on loans, leasing, and rental financing. Route financing through DS360 partners and earn cashback rewards on every funded deal — credited to your account and redeemable toward new unit purchases.</p>
              <div className="phero-btns">
                <a href="/contact" className="btn btn-lg btn-primary">Join the Waitlist</a>
                <a href="#how-it-works" className="btn btn-lg btn-outline">How It Works</a>
              </div>
              <div className="phero-stats">
                <div className="phero-stat"><div className="phero-stat-val">Partner</div><div className="phero-stat-label">Bank Network</div></div>
                <div className="phero-stat"><div className="phero-stat-val">Cashback</div><div className="phero-stat-label">On Every Funded Deal</div></div>
                <div className="phero-stat"><div className="phero-stat-val">3</div><div className="phero-stat-label">Financing Types</div></div>
              </div>
            </div>
            <div className="phero-img">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=584&h=438&fm=webp&q=75" alt="Financing services" width={584} height={438} />
            </div>
          </div>
        </div>
      </section>

      {/* METRIC BAR */}
      <section className="sec-g" style={{padding:'2.5rem 0'}}>
        <div className="wrap">
          <div className="metric-bar">
            <div className="metric-item"><div className="metric-num">Banks</div><div className="metric-label">Partner Network</div></div>
            <div className="metric-item"><div className="metric-num">Pref.</div><div className="metric-label">Preferential Rates</div></div>
            <div className="metric-item"><div className="metric-num">Cash</div><div className="metric-label">Back Rewards</div></div>
            <div className="metric-item"><div className="metric-num">Q4 '26</div><div className="metric-label">Launch Date</div></div>
          </div>
        </div>
      </section>

      {/* THE OPPORTUNITY */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">The Opportunity</div>
              <h2>Most Dealers Earn Nothing on the Financing. DS360 Changes That.</h2>
              <p>When a client finances through an external lender or their own bank, your dealership earns zero on the financing side. The unit sale generates revenue. The F&amp;I products generate revenue. But the financing — often the largest transaction in the deal — produces nothing for the dealer.</p>
              <p>DS360 Financing Services changes that equation. Route financing through DS360 partner institutions and earn cashback rewards on every funded deal. The client gets competitive rates. Your dealership earns on the financing for the first time.</p>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Financing opportunity" width={576} height={432} loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* STATEMENT */}
      <section className="sec-g" style={{padding:'3.5rem 0'}}>
        <div className="wrap">
          <div className="bst">
            <div className="bst-line"></div>
            <p>"Your client finances $85,000. The bank earns interest for 15 years. Your dealership earns nothing on that transaction — unless you route it through DS360."</p>
          </div>
        </div>
      </section>

      {/* THREE FINANCING TYPES */}
      <section className="sec-w" id="how-it-works">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">Financing Types</div>
            <h2>Three Ways Your Clients Finance — Three Ways You Earn</h2>
            <p>DS360 partner financing covers the three most common financing scenarios in the RV industry. Each one generates cashback for your dealership.</p>
          </div>
          <div className="fin-tabs anim">
            <div className="fin-tab-nav">
              <button className={`fin-tab-btn${activeTab === 'loans' ? ' active' : ''}`} onClick={() => setActiveTab('loans')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                RV Loans
              </button>
              <button className={`fin-tab-btn${activeTab === 'leasing' ? ' active' : ''}`} onClick={() => setActiveTab('leasing')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                Leasing
              </button>
              <button className={`fin-tab-btn${activeTab === 'rental' ? ' active' : ''}`} onClick={() => setActiveTab('rental')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Rental
              </button>
            </div>

            {activeTab === 'loans' && (
              <div className="fin-panel active">
                <div className="fin-panel-text">
                  <h3>Traditional RV Purchase Financing</h3>
                  <p>Your client finances through a DS360 partner bank instead of an external lender. They get competitive rates negotiated through the DS360 network volume. You earn cashback on every funded deal.</p>
                  <div className="fin-panel-highlights">
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>5 to 20 year terms</span></div>
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>Preferential partner rates</span></div>
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>Dealer cashback on every funded loan</span></div>
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>New and used units eligible</span></div>
                  </div>
                </div>
                <div className="fin-panel-visual">
                  <div className="fin-panel-stat">5–20yr</div>
                  <div className="fin-panel-stat-label">Flexible loan terms through DS360 partner banks</div>
                  <div className="fin-panel-stat-sub">Cashback on every funded deal</div>
                </div>
              </div>
            )}

            {activeTab === 'leasing' && (
              <div className="fin-panel active">
                <div className="fin-panel-text">
                  <h3>Lease-to-Own &amp; Standard Leasing</h3>
                  <p>For clients who prefer lower monthly payments or plan to upgrade every few years. Same DS360 partner network, same preferential rates, same cashback structure — different payment model.</p>
                  <div className="fin-panel-highlights">
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>Lower monthly payments for clients</span></div>
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>Lease-to-own and standard options</span></div>
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>Same partner rates and cashback</span></div>
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>Ideal for frequent upgraders</span></div>
                  </div>
                </div>
                <div className="fin-panel-visual">
                  <div className="fin-panel-stat">Lower</div>
                  <div className="fin-panel-stat-label">Monthly payments attract clients who would otherwise walk</div>
                  <div className="fin-panel-stat-sub">Same dealer cashback structure</div>
                </div>
              </div>
            )}

            {activeTab === 'rental' && (
              <div className="fin-panel active">
                <div className="fin-panel-text">
                  <h3>Fleet Acquisition for Rental Operations</h3>
                  <p>For dealers who operate RV rental fleets — financing structured specifically for fleet acquisition. Build your rental inventory with partner-backed financing and earn cashback on the fleet funding itself.</p>
                  <div className="fin-panel-highlights">
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>Fleet-specific financing terms</span></div>
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>Multi-unit acquisition packages</span></div>
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>Cashback on fleet volume</span></div>
                    <div className="fin-hl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg><span>Revenue from rentals + financing</span></div>
                  </div>
                </div>
                <div className="fin-panel-visual">
                  <div className="fin-panel-stat">Fleet</div>
                  <div className="fin-panel-stat-label">Build your rental operation with partner-backed financing</div>
                  <div className="fin-panel-stat-sub">Earn on the fleet funding</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW THE PROCESS WORKS */}
      <section className="sec-g">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">The Process</div>
            <h2>How a Deal Flows Through DS360 Partner Financing</h2>
            <p>From client credit application to funded deal — four steps, all managed through the DS360 platform.</p>
          </div>
          <div style={{maxWidth:'52rem',margin:'0 auto'}} className="anim">
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1.25rem'}}>
              <div className="proc-step-card" style={{position:'relative'}}>
                <div style={{width:'2.5rem',height:'2.5rem',background:'var(--primary)',color:'white',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem',fontWeight:800,margin:'0 auto .75rem'}}>1</div>
                <h4 style={{fontSize:'.88rem',fontWeight:700,marginBottom:'.3rem'}}>Client Applies</h4>
                <p style={{fontSize:'.78rem',color:'var(--muted)',lineHeight:1.5}}>Client submits a credit application through your dealership. You enter the deal into the DS360 portal and select "Partner Financing."</p>
                <div style={{position:'absolute',right:'-.85rem',top:'50%',transform:'translateY(-50%)',color:'var(--border)',fontSize:'1.1rem',zIndex:1}}>→</div>
              </div>
              <div className="proc-step-card" style={{position:'relative'}}>
                <div style={{width:'2.5rem',height:'2.5rem',background:'var(--primary)',color:'white',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem',fontWeight:800,margin:'0 auto .75rem'}}>2</div>
                <h4 style={{fontSize:'.88rem',fontWeight:700,marginBottom:'.3rem'}}>DS360 Shops Rates</h4>
                <p style={{fontSize:'.78rem',color:'var(--muted)',lineHeight:1.5}}>DS360 submits the application across the partner bank network simultaneously. Multiple institutions compete for the deal — your client gets the best available rate.</p>
                <div style={{position:'absolute',right:'-.85rem',top:'50%',transform:'translateY(-50%)',color:'var(--border)',fontSize:'1.1rem',zIndex:1}}>→</div>
              </div>
              <div className="proc-step-card" style={{position:'relative'}}>
                <div style={{width:'2.5rem',height:'2.5rem',background:'var(--primary)',color:'white',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem',fontWeight:800,margin:'0 auto .75rem'}}>3</div>
                <h4 style={{fontSize:'.88rem',fontWeight:700,marginBottom:'.3rem'}}>Deal Funded</h4>
                <p style={{fontSize:'.78rem',color:'var(--muted)',lineHeight:1.5}}>The client selects a rate. The partner institution funds the deal. Financing details are stored in the DS360 platform alongside the unit, F&amp;I products, and client record.</p>
                <div style={{position:'absolute',right:'-.85rem',top:'50%',transform:'translateY(-50%)',color:'var(--border)',fontSize:'1.1rem',zIndex:1}}>→</div>
              </div>
              <div className="proc-step-card">
                <div style={{width:'2.5rem',height:'2.5rem',background:'var(--green)',color:'white',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.85rem',fontWeight:800,margin:'0 auto .75rem'}}>4</div>
                <h4 style={{fontSize:'.88rem',fontWeight:700,marginBottom:'.3rem'}}>Cashback Credited</h4>
                <p style={{fontSize:'.78rem',color:'var(--muted)',lineHeight:1.5}}>DS360 receives a referral credit from the partner bank. Your cashback is calculated and credited to your DS360 dealer account automatically.</p>
              </div>
            </div>
            <p style={{textAlign:'center',fontSize:'.78rem',color:'var(--muted)',marginTop:'1.5rem',maxWidth:'40rem',marginLeft:'auto',marginRight:'auto'}}>The entire process is managed through the DS360 portal. Your dealership does not need to contact banks directly, compare rates manually, or manage paperwork — DS360 handles the submission, rate shopping, and funding coordination.</p>
          </div>
        </div>
      </section>

      {/* CASHBACK MODEL */}
      <section className="sec-g">
        <div className="wrap">
          <div className="split split-rev anim">
            <div className="split-text">
              <div className="badge badge-green">Dealer Cashback</div>
              <h2>How the Cashback Works</h2>
              <p>When your dealership routes a client's financing through a DS360 partner institution, DS360 receives a referral credit from the partner bank. A portion of that credit is passed back to your dealership as a cashback reward.</p>
              <div className="checks">
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Credited to Your DS360 Account</h3><p>Cashback rewards accumulate in your dealer account within the DS360 platform</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Redeemable Toward New Unit Purchases</h3><p>Cashback credits can be applied toward inventory acquisition — reducing your cost on new units</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Non-Cashable</h3><p>Credits are redeemable toward unit purchases through DS360 — they cannot be withdrawn as cash</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Accumulates Over Volume</h3><p>The more deals you route through DS360 partners, the more credits you accumulate toward your next inventory purchase</p></div>
                </div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Cashback rewards" width={576} height={432} loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* RATE ADVANTAGE */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">Rate Advantage</div>
              <h2>Why DS360 Partner Rates Beat Walk-In Bank Rates</h2>
              <p>When a client walks into their local bank and asks for an RV loan, they get whatever rate that single institution offers — no negotiation leverage, no competitive pressure, no volume discount.</p>
              <p>DS360 partner financing works differently. Your client's application is submitted across multiple partner institutions simultaneously. These banks compete for the deal because DS360 brings volume — hundreds of dealers, thousands of deals per year. That volume leverage translates directly into lower rates for your clients and better terms than any single-dealer relationship can negotiate.</p>
              <div className="checks">
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Multiple Institutions Compete</h3><p>Your client's application goes to several banks at once — the best rate wins</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Network Volume Leverage</h3><p>DS360's combined dealer volume gives partner banks a reason to offer preferential rates</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Client Gets a Better Deal</h3><p>Lower rate = easier close. The financing becomes a selling point, not a barrier.</p></div>
                </div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Rate advantage" width={576} height={432} loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNER NETWORK */}
      <section className="sec-g">
        <div className="wrap">
          <div className="split split-rev anim">
            <div className="split-text">
              <div className="badge">Partner Network</div>
              <h2>Banks and Financial Institutions Across Canada and the U.S.</h2>
              <p>The DS360 partner network includes national banks, regional credit unions, specialty RV lenders, and financial institutions that understand recreational vehicle financing. This is not a single-lender arrangement — it is a diversified network that gives your clients options and your dealership leverage.</p>
              <div className="checks">
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>National &amp; Regional Banks</h3><p>Major financial institutions with competitive rates and established RV lending programs</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Credit Unions</h3><p>Member-owned institutions that often offer the most competitive rates for qualified borrowers</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Specialty RV Lenders</h3><p>Institutions that specialize in recreational vehicle financing — longer terms, higher limits, and industry-specific underwriting</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Canada &amp; U.S. Coverage</h3><p>Partner institutions available for both Canadian and American dealerships — supporting the DS360 expansion into the U.S. market in Q3 2026</p></div>
                </div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Partner network" width={576} height={432} loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CASHBACK REDEMPTION */}
      <section className="sec-w">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge badge-green">Cashback Redemption</div>
            <h2>Where Your Credits Go</h2>
            <p>Financing cashback credits accumulate in your DS360 account. Here is exactly how you use them.</p>
          </div>
          <div style={{maxWidth:'48rem',margin:'0 auto'}} className="anim">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.25rem'}}>
              <div className="cashback-card">
                <div style={{width:'2.5rem',height:'2.5rem',background:'hsl(140,60%,92%)',borderRadius:'.5rem',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0cb22c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.25rem" height="1.25rem"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
                </div>
                <h4 style={{fontSize:'.95rem',fontWeight:700,marginBottom:'.35rem'}}>DS360 Marketplace Purchases</h4>
                <p style={{fontSize:'.82rem',color:'var(--muted)',lineHeight:1.6}}>Apply credits toward units purchased through the DS360 Dealer Exchange — reduce your acquisition cost on network inventory.</p>
              </div>
              <div className="cashback-card">
                <div style={{width:'2.5rem',height:'2.5rem',background:'hsl(140,60%,92%)',borderRadius:'.5rem',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0cb22c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.25rem" height="1.25rem"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
                </div>
                <h4 style={{fontSize:'.95rem',fontWeight:700,marginBottom:'.35rem'}}>Manufacturer Unit Orders</h4>
                <p style={{fontSize:'.82rem',color:'var(--muted)',lineHeight:1.6}}>Apply credits toward new units ordered through DS360's manufacturer relationships — lower your floor plan cost on incoming inventory.</p>
              </div>
              <div className="cashback-card">
                <div style={{width:'2.5rem',height:'2.5rem',background:'hsl(140,60%,92%)',borderRadius:'.5rem',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0cb22c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.25rem" height="1.25rem"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <h4 style={{fontSize:'.95rem',fontWeight:700,marginBottom:'.35rem'}}>Credits Accumulate</h4>
                <p style={{fontSize:'.82rem',color:'var(--muted)',lineHeight:1.6}}>Credits do not expire and accumulate over time. The more deals you route through DS360 partners, the larger your credit balance grows toward your next acquisition.</p>
              </div>
              <div className="cashback-card">
                <div style={{width:'2.5rem',height:'2.5rem',background:'hsl(0,70%,95%)',borderRadius:'.5rem',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1rem'}}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="hsl(0,60%,50%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1.25rem" height="1.25rem"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <h4 style={{fontSize:'.95rem',fontWeight:700,marginBottom:'.35rem'}}>Non-Cashable</h4>
                <p style={{fontSize:'.82rem',color:'var(--muted)',lineHeight:1.6}}>Credits cannot be withdrawn as cash. They are redeemable exclusively toward unit purchases through the DS360 ecosystem — keeping the value reinvested in your inventory.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RENTAL FLEET */}
      <section className="sec-g">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">Rental Operations</div>
              <h2>Fleet Financing Built for Dealers Who Rent</h2>
              <p>If your dealership operates a rental fleet, you know that fleet acquisition is the single largest capital expense in the business. DS360 Rental Financing is structured specifically for this use case — not a standard loan repackaged, but financing designed around fleet economics.</p>
              <div className="checks">
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Multi-Unit Acquisition</h3><p>Finance multiple units in a single package — 5, 10, 20 units at fleet rates instead of individual loan applications per unit</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Seasonal Scaling</h3><p>Scale your fleet up before peak season and restructure after — financing terms built for the seasonal nature of the RV rental business</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Cashback on Fleet Volume</h3><p>Every unit financed through DS360 partners generates cashback — fleet operators accumulate credits faster due to higher volume</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Dual Revenue</h3><p>Earn rental income from the fleet AND cashback credits from the financing — two revenue streams from the same asset</p></div>
                </div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Rental fleet" width={576} height={432} loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* REVENUE STACKING */}
      <section className="sec-w">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">Revenue Stacking</div>
            <h2>Four Revenue Streams on Every Deal</h2>
            <p>DS360 Financing adds a fourth layer of revenue that most dealers are not capturing today.</p>
          </div>
          <div className="rev-pyramid anim">
            <div className="rev-bar">
              <div className="rev-bar-num">01</div>
              <div className="rev-bar-text"><h4>Unit Sale Margin</h4><p>The foundation — your margin on the unit itself</p></div>
              <div className="rev-bar-tag rev-tag-base">Standard</div>
            </div>
            <div className="rev-bar">
              <div className="rev-bar-num">02</div>
              <div className="rev-bar-text"><h4>F&amp;I Product Revenue</h4><p>Extended Warranty, GAP, Protection Plans — margin on every product sold</p></div>
              <div className="rev-bar-tag rev-tag-base">Standard</div>
            </div>
            <div className="rev-bar">
              <div className="rev-bar-num">03</div>
              <div className="rev-bar-text"><h4>F&amp;I Cashback Incentives</h4><p>DS360 tier-based cashback on your total F&amp;I volume — the more you attach, the more you earn</p></div>
              <div className="rev-bar-tag rev-tag-ds360">DS360 Only</div>
            </div>
            <div className="rev-bar rev-bar-4">
              <div className="rev-bar-num">04</div>
              <div className="rev-bar-text"><h4>Financing Cashback</h4><p>Partner financing credits redeemable toward new inventory — revenue most dealers never capture</p></div>
              <div className="rev-bar-tag rev-tag-ds360">DS360 Only</div>
            </div>
          </div>
          <p style={{textAlign:'center',fontSize:'.85rem',color:'var(--muted)',marginTop:'2rem',maxWidth:'40rem',marginLeft:'auto',marginRight:'auto'}}>Most dealers capture layers 1 and 2. DS360 dealers capture all four — on every deal.</p>
        </div>
      </section>

      {/* DYK */}
      <section className="sec-g">
        <div className="wrap">
          <div className="dyk anim">
            <div className="dyk-tag">Did You Know<span style={{color:'#033280'}}>?</span></div>
            <p>The average RV financing deal is <strong>$75,000 to $150,000 over 10 to 20 years</strong>. The interest revenue generated by that loan is substantial — and traditionally, 100% of it goes to the lender. DS360 Financing Services is the first program that gives RV dealers a share of that value through cashback credits on every funded deal.</p>
          </div>
        </div>
      </section>

      {/* CONNECTED */}
      <section className="sec-w">
        <div className="wrap">
          <div className="sec-head">
            <h2>Connected to the DS360 Revenue Ecosystem</h2>
            <p>Financing Services is one part of a complete revenue optimization strategy built into the DS360 platform.</p>
          </div>
          <div className="grid-2 anim">
            <a href="/products/fi-services" className="link-card"><div><h4>F&amp;I Products</h4><p>The products your client finances alongside the unit</p></div><span className="link-arrow">→</span></a>
            <a href="/products/gap-insurance" className="link-card"><div><h4>GAP Insurance</h4><p>Particularly relevant for financed units — covers the loan-to-value gap</p></div><span className="link-arrow">→</span></a>
            <a href="/revenue/services" className="link-card"><div><h4>Revenue Services</h4><p>Full guide to every DS360 tool that generates or recovers revenue</p></div><span className="link-arrow">→</span></a>
            <a href="/revenue/optimization" className="link-card"><div><h4>Revenue Optimization</h4><p>Where you're losing money and how DS360 closes the gaps</p></div><span className="link-arrow">→</span></a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec-g">
        <div className="wrap">
          <div className="faq-layout anim">
            <div className="faq-left">
              <div className="badge">FAQ</div>
              <h2 style={{fontSize:'clamp(1.5rem,3.5vw,2rem)',fontWeight:700,marginTop:'.75rem',lineHeight:1.2}}>Financing<br/>Questions</h2>
              <p style={{fontSize:'1rem',color:'var(--muted)',lineHeight:1.7,marginTop:'1rem'}}>What dealers need to know about DS360 partner financing.</p>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'1.5rem'}}>Join the Waitlist →</a>
            </div>
            <div className="faq-right">
              {[
                {
                  q: 'When does Financing Services launch?',
                  a: 'Financing Services is scheduled to launch in Q4 2026. Dealers on the waitlist will receive early access and priority onboarding when the partner network is live.'
                },
                {
                  q: 'Is the cashback actual cash?',
                  a: 'No. Financing cashback credits are redeemable toward new unit purchases through DS360 — they cannot be withdrawn as cash. This structure incentivizes inventory reinvestment and keeps the value within the DS360 ecosystem.'
                },
                {
                  q: 'Am I required to use DS360 partner financing?',
                  a: 'No. DS360 partner financing is optional. You can continue using your existing lender relationships. However, only deals routed through DS360 partner institutions generate cashback credits. There is no penalty for using external lenders — you simply miss the cashback opportunity.'
                },
                {
                  q: 'Does the client get a better rate?',
                  a: "DS360 partner institutions offer preferential rates negotiated through the DS360 network volume. In most cases, the client receives a competitive or better rate compared to going directly to a bank — which makes routing through DS360 an easy recommendation for the dealer."
                },
                {
                  q: 'How does the rate shopping process work?',
                  a: 'When you submit a deal for partner financing through the DS360 portal, the application is sent to multiple partner institutions simultaneously. Each institution returns their best available rate. Your client selects the offer that works for them. The entire process is managed through DS360 — you do not need to contact banks individually or compare rate sheets manually.'
                },
                {
                  q: 'Do cashback credits expire?',
                  a: 'No. Financing cashback credits accumulate in your DS360 account and do not expire. They remain available until you redeem them toward a unit purchase through the DS360 Marketplace or manufacturer ordering process.'
                },
                {
                  q: 'Does this work with the AI F&I Presenter?',
                  a: 'When both services are live, the AI F&I Presenter will be able to present DS360 partner financing options alongside F&I products during the client session — creating a seamless flow from unit purchase to financing to product selection.'
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
          <h2>Stop Leaving Financing Revenue on the Table.</h2>
          <p>DS360 Financing Services launches Q4 2026. Join the waitlist and be the first to earn on every funded deal.</p>
          <div className="bcta-btns">
            <a href="/contact" className="btn btn-lg btn-green">Join the Waitlist →</a>
            <a href="/products/fi-services" className="btn btn-lg btn-white">View All Products</a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
