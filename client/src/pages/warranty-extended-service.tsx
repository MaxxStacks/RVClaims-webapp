import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/page-layout';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "When does Extended Warranty coverage begin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Coverage begins when the manufacturer's standard warranty expires — or at the time of sale for used units that are already out of manufacturer coverage. The start date is configured during activation."
      }
    },
    {
      "@type": "Question",
      "name": "Can I sell Extended Warranty on used units?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Extended Warranty is available for both new and pre-owned units. For used units where the manufacturer warranty has already expired, coverage begins immediately at the time of sale. This makes it a strong upsell on every used unit your dealership moves."
      }
    },
    {
      "@type": "Question",
      "name": "How are claims processed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Through the DS360 platform — the same A-Z claims workflow used for manufacturer warranty claims. The client contacts your dealership or submits through the Client Portal. DS360 handles approval, parts, repair, and payout."
      }
    },
    {
      "@type": "Question",
      "name": "What is my margin on Extended Warranty?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You pay DS360 the wholesale cost and set your own retail price. The difference is your margin. Extended Warranty typically carries the highest per-unit margin of any product in the F&I suite. Volume-based cashback incentives further increase your return."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a deductible for the client?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Deductible structure depends on the coverage tier selected. Details are provided during dealer onboarding and are clearly stated on the client's certificate so there are no surprises when a claim is filed."
      }
    }
  ]
};

export default function WarrantyExtendedService() {
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
      seoTitle="Extended Warranty — RV Protection Beyond Manufacturer Coverage"
      seoDescription="DS360 Extended Warranty covers major RV systems beyond the manufacturer's standard warranty — drivetrain, electrical, plumbing, appliances, slide-outs. Multiple tiers. Co-branded with your dealership. Claims processed through the platform."
      canonical="https://dealersuite360.com/warranty-plans"
      schema={faqSchema}
    >
      {/* HERO */}
      <section className="phero">
        <div className="wrap">
          <div className="phero-grid">
            <div className="phero-text">
              <div><a href="/products/fi-services" style={{fontSize:'.82rem',color:'var(--muted)'}}>← All Products</a></div>
              <div><div className="badge">DS360 Product · Highest F&amp;I Margin</div></div>
              <h1>The Manufacturer's Warranty Ends.<span className="gradient">Your Client's Protection Doesn't Have To.</span></h1>
              <p className="phero-desc">DS360 Extended Warranty picks up where the manufacturer leaves off — covering major systems, components, and repairs that standard coverage no longer protects. Issued by DS360, co-branded with your dealership, and claims are processed through the same platform. The highest-margin product in the RV F&amp;I suite and the one your clients are most likely to buy.</p>
              <div className="phero-btns">
                <a href="/contact" className="btn btn-lg btn-primary">Start Selling Extended Warranty</a>
                <a href="#coverage" className="btn btn-lg btn-outline">View Coverage Tiers</a>
              </div>
              <div className="phero-stats">
                <div className="phero-stat"><div className="phero-stat-val">#1</div><div className="phero-stat-label">Highest-Margin F&amp;I Product</div></div>
                <div className="phero-stat"><div className="phero-stat-val">3</div><div className="phero-stat-label">Coverage Tiers</div></div>
                <div className="phero-stat"><div className="phero-stat-val">Your</div><div className="phero-stat-label">Brand on the Certificate</div></div>
              </div>
            </div>
            <div className="phero-img">
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=584&h=438&fm=webp&q=75" alt="Extended warranty" width={584} height={438} />
            </div>
          </div>
        </div>
      </section>

      {/* METRIC BAR */}
      <section className="sec-g" style={{padding:'2.5rem 0'}}>
        <div className="wrap">
          <div className="metric-bar">
            <div className="metric-item"><div className="metric-num">6+</div><div className="metric-label">Major Systems Covered</div></div>
            <div className="metric-item"><div className="metric-num">3</div><div className="metric-label">Coverage Tiers</div></div>
            <div className="metric-item"><div className="metric-num">DS360</div><div className="metric-label">Claims Processing</div></div>
            <div className="metric-item"><div className="metric-num">Co-Brand</div><div className="metric-label">Your Dealer Name</div></div>
          </div>
        </div>
      </section>

      {/* THE PITCH */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">The Dealer Opportunity</div>
              <h2>The Easiest Product to Sell — Because the Client Already Fears the Alternative</h2>
              <p>Every RV buyer knows that manufacturer warranties expire. What they don't know is how expensive RV repairs are without coverage. A single slide-out motor replacement can cost $2,500. An air conditioner compressor is $1,800. A water heater is $900. These are not hypothetical numbers — these are the repairs your service bay sees every month.</p>
              <p>Extended Warranty is the product that sells itself once the client understands the cost of not having it. Your job is to present it. DS360 handles everything after the handshake — issuance, certificate, and claims processing when the time comes.</p>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Service bay" width={576} height={432} loading="lazy" />
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
            <p>"A slide-out motor replacement costs $2,500. An extended warranty costs a fraction of that. The math does the selling for you."</p>
          </div>
        </div>
      </section>

      {/* WHAT'S COVERED */}
      <section className="sec-w">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">Coverage Areas</div>
            <h2>Major Systems. Real Protection.</h2>
            <p>DS360 Extended Warranty covers the systems and components that fail most often — and cost the most to repair. This is not a maintenance plan. This is protection against the repairs that can cost your client thousands.</p>
          </div>
          <div className="cov-grid anim">
            <div className="cov-card">
              <div className="cov-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
              <h4>Drivetrain</h4>
              <p>Engine, transmission, drive axle, transfer case, and related components. The most expensive system to repair on any motorized RV.</p>
            </div>
            <div className="cov-card">
              <div className="cov-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
              <h4>Electrical</h4>
              <p>Wiring harnesses, converters, inverters, generators, control panels, lighting systems, and shore power connections.</p>
            </div>
            <div className="cov-card">
              <div className="cov-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/><path d="M12 6v6"/><path d="M12 18h.01"/></svg></div>
              <h4>Plumbing</h4>
              <p>Water pump, water heater, fresh/gray/black tank systems, fittings, valves, and associated plumbing components.</p>
            </div>
            <div className="cov-card">
              <div className="cov-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg></div>
              <h4>Appliances</h4>
              <p>Refrigerator, air conditioning, furnace, microwave, range/oven, washer/dryer, and built-in entertainment systems.</p>
            </div>
            <div className="cov-card">
              <div className="cov-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></div>
              <h4>Slide-Outs</h4>
              <p>Slide-out motors, mechanisms, seals, and structural components. One of the most common and expensive RV failure points.</p>
            </div>
            <div className="cov-card">
              <div className="cov-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <h4>Structural</h4>
              <p>Roof, sidewall, floor, frame, and structural seals. Protection against the failures that compromise the unit's livability and value.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COVERAGE TIERS */}
      <section className="sec-g" id="coverage">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">Coverage Tiers</div>
            <h2>Three Levels of Protection</h2>
            <p>Offer your client the level that matches their budget and their comfort. All three tiers are processed through DS360 and co-branded with your dealership.</p>
          </div>
          <div className="cov-table anim">
            <div className="cov-table-head"><div>Component</div><div>Basic</div><div>Standard</div><div>Premium</div></div>
            <div className="cov-table-row"><div className="cov-table-feat">Drivetrain</div><div className="cov-check">✓</div><div className="cov-check">✓</div><div className="cov-check">✓</div></div>
            <div className="cov-table-row"><div className="cov-table-feat">Electrical</div><div className="cov-check">✓</div><div className="cov-check">✓</div><div className="cov-check">✓</div></div>
            <div className="cov-table-row"><div className="cov-table-feat">Plumbing</div><div className="cov-x">—</div><div className="cov-check">✓</div><div className="cov-check">✓</div></div>
            <div className="cov-table-row"><div className="cov-table-feat">Appliances</div><div className="cov-x">—</div><div className="cov-check">✓</div><div className="cov-check">✓</div></div>
            <div className="cov-table-row"><div className="cov-table-feat">Slide-Outs</div><div className="cov-x">—</div><div className="cov-x">—</div><div className="cov-check">✓</div></div>
            <div className="cov-table-row"><div className="cov-table-feat">Structural</div><div className="cov-x">—</div><div className="cov-x">—</div><div className="cov-check">✓</div></div>
            <div className="cov-table-row"><div className="cov-table-feat">A/C &amp; Heating</div><div className="cov-x">—</div><div className="cov-check">✓</div><div className="cov-check">✓</div></div>
            <div className="cov-table-row"><div className="cov-table-feat">Roof &amp; Seals</div><div className="cov-x">—</div><div className="cov-x">—</div><div className="cov-check">✓</div></div>
            <div className="cov-table-row" style={{background:'var(--primary-5)'}}>
              <div className="cov-table-feat" style={{fontWeight:700}}>Dealer Wholesale Price</div>
              <div style={{fontWeight:700,color:'var(--primary)',textAlign:'center'}}>$X,XXX</div>
              <div style={{fontWeight:700,color:'var(--primary)',textAlign:'center'}}>$X,XXX</div>
              <div style={{fontWeight:700,color:'var(--green)',textAlign:'center'}}>$X,XXX</div>
            </div>
          </div>
          <p style={{textAlign:'center',fontSize:'.78rem',color:'var(--muted)',marginTop:'1.25rem',maxWidth:'40rem',marginLeft:'auto',marginRight:'auto'}}>Prices shown are dealer wholesale cost. You set the retail price. The margin is your revenue. Volume-based cashback incentives available — <a href="/products/fi-services#incentives" style={{color:'var(--primary)',fontWeight:600}}>view incentive tiers</a>.</p>
        </div>
      </section>

      {/* AI CROSS-SELL */}
      <section className="sec-w" style={{padding:'2.5rem 0'}}>
        <div className="wrap">
          <div className="bcs">
            <div className="bcs-dot"></div>
            <div className="bcs-text"><strong>AI F&amp;I Presenter</strong> will present Extended Warranty to every credit-approved client automatically — with pricing personalized to their unit. Beta launching Q4 2026.</div>
            <a href="/services/ai-fi-presenter">Learn More →</a>
          </div>
        </div>
      </section>

      {/* HOW CLAIMS WORK */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split split-rev anim">
            <div className="split-text">
              <div className="badge">When the Client Needs It</div>
              <h2>Claims Go Through DS360 — The Same Platform You Already Use</h2>
              <p>When a client's covered component fails and the manufacturer warranty has expired, they contact your dealership or submit through the Client Portal. The claim enters the DS360 workflow — the same A-Z process used for warranty claims. Approval, parts, repair, payout. Your client's experience is seamless. Your team's process doesn't change.</p>
              <div className="checks">
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Same Claims Workflow</h3><p>Extended warranty claims use the same DS360 process as manufacturer warranty claims</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Parts Through DS360</h3><p>Approved claims trigger parts sourcing automatically — same as warranty parts</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Client Sees Your Brand</h3><p>Throughout the entire claims experience, the client interacts with your dealer branding</p></div>
                </div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Claims processing" width={576} height={432} loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* DYK */}
      <section className="sec-g">
        <div className="wrap">
          <div className="dyk anim">
            <div className="dyk-tag">Did You Know<span style={{color:'#033280'}}>?</span></div>
            <p>The average Class A motorhome owner will spend <strong>over $8,000 in repairs</strong> within the first two years after their manufacturer warranty expires. For fifth wheels, the number is <strong>$4,200 to $6,500</strong>. Extended Warranty is not a luxury — for most RV owners, it is the difference between a manageable expense and a financial crisis.</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="sec-w">
        <div className="wrap">
          <div className="grid-3 anim">
            <div className="stat-card"><div className="stat-val">#1</div><div className="stat-title">Highest F&amp;I Margin</div><p className="stat-desc">Extended Warranty consistently generates the highest per-unit revenue of any F&amp;I product</p></div>
            <div className="stat-card"><div className="stat-val">40%</div><div className="stat-title">Higher Close with Co-Brand</div><p className="stat-desc">Clients trust warranty products from their dealership over unfamiliar third-party names</p></div>
            <div className="stat-card"><div className="stat-val">$8K+</div><div className="stat-title">Avg Post-Warranty Repairs</div><p className="stat-desc">What Class A owners spend in the first 2 years after manufacturer coverage ends</p></div>
          </div>
        </div>
      </section>

      {/* OTHER PRODUCTS */}
      <section className="sec-g">
        <div className="wrap">
          <div className="sec-head">
            <h2>Complete the Protection Suite</h2>
            <p>Extended Warranty covers major systems. These products cover everything else. The more products per unit, the higher your cashback tier.</p>
          </div>
          <div className="grid-2 anim">
            <a href="/products/gap-insurance" className="link-card"><div><h4>GAP Insurance</h4><p>Covers the loan-to-value gap if the unit is totaled or stolen</p></div><span className="link-arrow">→</span></a>
            <a href="/products/appearance-protection" className="link-card"><div><h4>Appearance Protection</h4><p>Interior and exterior surface coverage — paint, upholstery, vinyl</p></div><span className="link-arrow">→</span></a>
            <a href="/products/tire-wheel-protection" className="link-card"><div><h4>Tire &amp; Wheel Protection</h4><p>Road hazard coverage for tires and wheels</p></div><span className="link-arrow">→</span></a>
            <a href="/products/roadside-travel-protection" className="link-card"><div><h4>Roadside &amp; Travel</h4><p>Titanium tier — 160KM+, trip interruption, emergency coverage</p></div><span className="link-arrow">→</span></a>
            <a href="/products/specialty-protection" className="link-card"><div><h4>Specialty Protection</h4><p>Generators, solar, leveling systems, awnings, accessories</p></div><span className="link-arrow">→</span></a>
            <a href="/products/fi-services" className="link-card"><div><h4>All Products &amp; Incentives</h4><p>View the full suite and cashback tier structure</p></div><span className="link-arrow">→</span></a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec-w">
        <div className="wrap">
          <div className="faq-layout anim">
            <div className="faq-left">
              <div className="badge">FAQ</div>
              <h2 style={{fontSize:'clamp(1.5rem,3.5vw,2rem)',fontWeight:700,marginTop:'.75rem',lineHeight:1.2}}>Extended Warranty<br/>Questions</h2>
              <p style={{fontSize:'1rem',color:'var(--muted)',lineHeight:1.7,marginTop:'1rem'}}>What dealers need to know about selling DS360 Extended Warranty.</p>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'1.5rem'}}>Get Started →</a>
            </div>
            <div className="faq-right">
              {[
                {
                  q: 'When does Extended Warranty coverage begin?',
                  a: "Coverage begins when the manufacturer's standard warranty expires — or at the time of sale for used units that are already out of manufacturer coverage. The start date is configured during activation."
                },
                {
                  q: 'Can I sell Extended Warranty on used units?',
                  a: 'Yes. Extended Warranty is available for both new and pre-owned units. For used units where the manufacturer warranty has already expired, coverage begins immediately at the time of sale. This makes it a strong upsell on every used unit your dealership moves.'
                },
                {
                  q: 'How are claims processed?',
                  a: 'Through the DS360 platform — the same A-Z claims workflow used for manufacturer warranty claims. The client contacts your dealership or submits through the Client Portal. DS360 handles approval, parts, repair, and payout.'
                },
                {
                  q: 'What is my margin on Extended Warranty?',
                  a: 'You pay DS360 the wholesale cost and set your own retail price. The difference is your margin. Extended Warranty typically carries the highest per-unit margin of any product in the F&I suite. Volume-based cashback incentives further increase your return.'
                },
                {
                  q: 'Is there a deductible for the client?',
                  a: "Deductible structure depends on the coverage tier selected. Details are provided during dealer onboarding and are clearly stated on the client's certificate so there are no surprises when a claim is filed."
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
          <h2>The Manufacturer Warranty Ends. Your Revenue Opportunity Begins.</h2>
          <p>Add DS360 Extended Warranty to your F&amp;I lineup and start earning on the highest-margin product in the RV industry.</p>
          <div className="bcta-btns">
            <a href="/contact" className="btn btn-lg btn-green">Start Selling →</a>
            <a href="/products/fi-services" className="btn btn-lg btn-white">View All Products</a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
