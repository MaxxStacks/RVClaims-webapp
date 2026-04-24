import { useEffect, useState } from 'react';

export default function Services() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'RV Dealer Services — Claims, Service Management & More | DealerSuite360';
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'Explore the full suite of DS360 dealer services — claims processing, parts management, TechFlow service tracking, on-site repairs, roadside assistance, AI-powered F&I, and marketing.');
    setMeta('og:title', 'RV Dealer Services — Claims, Service Management & More | DealerSuite360', true);
    setMeta('og:description', 'Explore the full suite of DS360 dealer services — claims processing, parts management, TechFlow service tracking, on-site repairs, roadside assistance, AI-powered F&I, and marketing.', true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', 'RV Dealer Services — Claims, Service Management & More | DealerSuite360');
    setMeta('twitter:description', 'Explore the full suite of DS360 dealer services — claims processing, parts management, TechFlow service tracking, on-site repairs, roadside assistance, AI-powered F&I, and marketing.');

    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
    canon.href = 'https://dealersuite360.com/services';

    const ldId = 'ld-services';
    if (!document.getElementById(ldId)) {
      const script = document.createElement('script');
      script.id = ldId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Do I need to use every DS360 service?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Every service operates independently. Start with what your dealership needs most — claims processing, service management, or roadside — and add services as your operation grows. There is no requirement to use the full suite."
            }
          },
          {
            "@type": "Question",
            "name": "Are these services included in my DS360 plan?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Core services like claims processing, parts tracking, and basic roadside assistance are included in your dealer subscription. TechFlow and Marketing Services are available as add-ons. Visit the Pricing page for a full breakdown of what is included at each tier."
            }
          },
          {
            "@type": "Question",
            "name": "How does DS360 differ from other dealer management tools?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "DS360 is the only platform in North America that combines AI-powered claims processing with a full dealership operating system. Our technology runs on MSIL — proprietary to DS360 through a lifetime exclusivity agreement — meaning no competitor has access to the same technology now or ever. The AI claims processing workflows are patent-pending."
            }
          },
          {
            "@type": "Question",
            "name": "What is the difference between Services and Products?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Services are operational tools your dealership uses to run your business — claims processing, TechFlow, parts management. Your clients never see or interact with these. Products are things your dealership sells to clients — Extended Warranty, GAP Insurance, Protection Plans. DS360 issues the products, you sell them, and DS360 manages all claims on the back end."
            }
          },
          {
            "@type": "Question",
            "name": "Can I try DS360 before committing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Book a demo and our team will walk you through the platform live, tailored to your dealership's specific needs and operation size. We will show you exactly how each service works with real examples relevant to your business."
            }
          }
        ]
      });
      document.head.appendChild(script);
    }

    return () => {
      const ld = document.getElementById(ldId);
      if (ld) ld.remove();
    };
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('v'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.anim').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div className="hero-text slide-in-up">
              <div><div className="hero-badge">Complete Dealership Operating System</div></div>
              <div>
                <h1>Every Service Your Dealership Needs —<span className="gradient">In One Platform</span></h1>
                <p className="hero-desc">DealerSuite360 replaces the patchwork of disconnected tools, spreadsheets, and manual processes slowing your dealership down. Claims processing, service management, parts sourcing, roadside dispatch, AI-powered F&I, and dealer marketing — all built for the RV industry, all powered by proprietary technology, all managed by DS360.</p>
              </div>
              <div className="hero-btns">
                <a href="/contact" className="btn btn-lg btn-primary">Book a Demo</a>
                <a href="#services" className="btn btn-lg btn-outline">Explore Services</a>
              </div>
              <div className="hero-stats">
                <div className="hero-stat"><div className="hero-stat-val">7</div><div className="hero-stat-label">Core Services</div></div>
                <div className="hero-stat"><div className="hero-stat-val">97%</div><div className="hero-stat-label">Claim Approval Rate</div></div>
                <div className="hero-stat"><div className="hero-stat-val">1</div><div className="hero-stat-label">Platform for Everything</div></div>
              </div>
            </div>
            <div className="fade-in">
              <div className="hero-img"><img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=584&h=438&fm=webp&q=75" alt="DS360 dealership management platform" width={584} height={438} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE SERVICES — BENTO GRID */}
      <section className="sec-w" id="services">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">DS360 Services</div>
            <h2>What DS360 Does for Your Dealership</h2>
            <p>Every service below is an operational tool that DS360 manages for you. Your dealership uses them to run your business — these are the systems that keep your operation running faster, smarter, and with fewer gaps.</p>
          </div>

          <div className="bento anim">
            <a href="/claims-processing" className="bento-card bento-hero">
              <div className="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg></div>
              <h3>Claims Processing — The Foundation of DS360</h3>
              <p>Full A-Z lifecycle management across DAF, PDI, Warranty, Extended Warranty, and Protection Plans. AI-powered Flat Rate Code recognition, photo optimization, description generation, and industry-leading warranty expiration notifications ensure no valid claim goes unfiled.</p>
              <div className="bento-hero-stats">
                <div><div className="bento-hero-stat-val">97%</div><div className="bento-hero-stat-label">Approval Rate</div></div>
                <div><div className="bento-hero-stat-val">48h</div><div className="bento-hero-stat-label">Avg Processing</div></div>
                <div><div className="bento-hero-stat-val">All</div><div className="bento-hero-stat-label">Manufacturers</div></div>
              </div>
              <div className="b-link" style={{marginTop:'1.25rem'}}>Explore Claims Processing →</div>
            </a>

            <a href="/parts-components" className="bento-card bento-side">
              <div className="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
              <h3>Parts &amp; Components</h3>
              <p>Hundreds of suppliers across North America. OEM and aftermarket. Step-by-step tracking from order to installation. Parts ordering triggers automatically on claim approval.</p>
              <ul className="b-features"><li>Auto-triggered on approval</li><li>OEM + aftermarket sourcing</li><li>Integrated into claims workflow</li></ul>
              <div className="b-link">Learn More →</div>
            </a>

            <a href="/services/techflow" className="bento-card bento-std">
              <div className="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
              <h3>TechFlow <span className="badge-q badge-addon">Add-On</span></h3>
              <p>Claims-to-work-order automation. Approved claims generate work orders, labor hours sync back to invoices. Zero unbilled labor.</p>
              <ul className="b-features"><li>Auto work order generation</li><li>Labor sync to invoices</li><li>Technician assignment</li></ul>
              <div className="b-link">Learn More →</div>
            </a>

            <a href="/on-site-repairs" className="bento-card bento-std">
              <div className="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 9H12"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg></div>
              <h3>On-Site Repairs</h3>
              <p>Deploy mobile repair units to client locations. Roadside emergencies and campsite convenience. A new revenue stream beyond the shop floor.</p>
              <ul className="b-features"><li>Billable mobile service calls</li><li>Photo submission before dispatch</li><li>Revenue from off-lot work</li></ul>
              <div className="b-link">Learn More →</div>
            </a>

            <a href="/roadside-assistance" className="bento-card bento-std">
              <div className="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg></div>
              <h3>Roadside Assistance</h3>
              <p>Included free in every dealer plan. A deal-closing incentive for your clients — DS360 manages dispatch and coordination within 50KM. Titanium upgrade available for resale.</p>
              <ul className="b-features"><li>Free in all dealer plans</li><li>DS360 manages dispatch</li><li>Titanium tier for resale</li></ul>
              <div className="b-link">Learn More →</div>
            </a>

            <a href="/ai-fi-presenter" className="bento-card bento-wide bento-dark">
              <div><div className="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/></svg></div></div>
              <div className="b-text">
                <h3>AI F&amp;I Presenter <span className="badge-q badge-q4">Q4 2026</span></h3>
                <p>The industry's first AI-powered F&amp;I tool. A live video avatar greets credit-approved clients by name, presents every product, answers questions in real time, and processes contracts — without staffing an F&amp;I desk. 100% presentation rate. Zero inconsistency.</p>
                <div className="b-link">Learn More →</div>
              </div>
            </a>

            <a href="/marketing-services" className="bento-card bento-wide">
              <div><div className="b-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div></div>
              <div className="b-text">
                <h3>Marketing Services <span className="badge-q badge-addon">Premium</span></h3>
                <p>A digital marketing engine built for the RV industry with 20+ years of experience. SEO/PPC, social media, email campaigns, lead generation, remarketing — with ROI tracking built into the platform. Fills the gaps manufacturer co-op programs don't cover.</p>
                <div className="b-link">Learn More →</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* PLATFORM SPLIT */}
      <section className="sec-g">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">Proprietary Technology</div>
              <h2>Built on Technology No Competitor Can Access</h2>
              <p>Every service above runs on MSIL — proprietary technology developed by Maxx Stacks and exclusively licensed to DS360 for life. Combined with Anthropic AI for intelligent automation and 24/7 monitoring, DS360 operates on a technology stack that no other dealer services platform can replicate.</p>
              <div className="checks">
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>MSIL Exclusivity</h3><p>Lifetime exclusive agreement — no other platform has access now or ever</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Anthropic AI</h3><p>Powers claims optimization, document scanning, F&I presentations, and content generation</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth={3}><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Patent-Pending</h3><p>AI-powered claims processing workflows under active patent application</p></div></div>
              </div>
              <a href="/technology" className="btn btn-primary" style={{width:'fit-content',marginTop:'.5rem'}}>Explore the Technology →</a>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="DS360 technology platform" width={576} height={432} loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* BEYOND SERVICES */}
      <section className="sec-w">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">The Full Ecosystem</div>
            <h2>Services Are Just the Start</h2>
            <p>DS360 is not only about the tools your dealership uses — it is also about the products you sell to your clients and the inventory channels that move your stock. Three pillars, one platform.</p>
          </div>

          <div className="grid-3 anim">
            <a href="/fi-services" className="svc-card">
              <div className="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
              <h3>DS360 Products</h3>
              <p>Revenue-generating F&I products your dealership sells to clients — Extended Warranty, GAP Insurance, Appearance Protection, Tire &amp; Wheel, Roadside &amp; Travel, and Specialty Protection. Issued by DS360, sold by you, claimed through our platform.</p>
              <div className="svc-link">Explore Products →</div>
            </a>
            <a href="/marketplace" className="svc-card">
              <div className="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg></div>
              <h3>Marketplace</h3>
              <p>Move inventory through three channels — the Dealer Exchange for dealer-to-dealer trading, monthly Live Auctions for public buyers, and Consignment Services for client-sourced used units. Stripe-secured escrow on every transaction.</p>
              <div className="svc-link">Explore Marketplace →</div>
            </a>
            <a href="/revenue-optimization" className="svc-card">
              <div className="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={24} height={24}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
              <h3>Revenue Optimization</h3>
              <p>DS360 identifies where your dealership is losing money — expired claims, missed F&I opportunities, unbilled labor, aged inventory — and closes every gap. The diagnostic layer that shows you the problem before pointing to the solution.</p>
              <div className="svc-link">See Where You're Losing Revenue →</div>
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="sec-g">
        <div className="wrap">
          <div className="sec-head">
            <h2>15 Years of RV Industry Experience</h2>
            <p>DS360 is not a generic software company that stumbled into the RV market. This platform was built by people who have processed claims, managed service departments, and worked with manufacturers for over a decade and a half.</p>
          </div>
          <div className="grid-3 anim">
            <div className="stat-card"><div className="stat-val">15+</div><div className="stat-title">Years in the RV Industry</div><p className="stat-desc">Deep operational experience across claims, service, and dealer management</p></div>
            <div className="stat-card"><div className="stat-val">97%</div><div className="stat-title">Claim Approval Rate</div><p className="stat-desc">First-submission approval rate with AI-optimized claims processing</p></div>
            <div className="stat-card"><div className="stat-val">All</div><div className="stat-title">Manufacturers Covered</div><p className="stat-desc">Every RV manufacturer in North America — no exceptions</p></div>
          </div>
        </div>
      </section>

      {/* MANUFACTURER COVERAGE — DARK BLOCK */}
      <section className="sec-w">
        <div className="wrap">
          <div className="mfr-dark anim">
            <div className="mfr-dark-top">
              <div className="mfr-dark-text">
                <h3>We Cover Every Manufacturer<br/>in the RV Industry</h3>
                <p>If they make RVs, we process their claims. DS360 integrates with every manufacturer — not just the ones listed here. These are our most active integrations, but our platform handles all brands and their full lineups.</p>
              </div>
              <div className="mfr-dark-stat">
                <div className="mfr-dark-stat-val">100%</div>
                <div className="mfr-dark-stat-label">Manufacturer Coverage</div>
              </div>
            </div>
            <div className="mfr-dark-grid">
              <div className="mfr-dark-item"><div className="mfr-dark-item-name">Jayco</div><div className="mfr-dark-item-sub">All brands</div></div>
              <div className="mfr-dark-item"><div className="mfr-dark-item-name">Forest River</div><div className="mfr-dark-item-sub">All brands</div></div>
              <div className="mfr-dark-item"><div className="mfr-dark-item-name">Heartland</div><div className="mfr-dark-item-sub">All brands</div></div>
              <div className="mfr-dark-item"><div className="mfr-dark-item-name">Keystone</div><div className="mfr-dark-item-sub">All brands</div></div>
              <div className="mfr-dark-item"><div className="mfr-dark-item-name">Columbia NW</div><div className="mfr-dark-item-sub">All brands</div></div>
              <div className="mfr-dark-item"><div className="mfr-dark-item-name">Midwest Auto</div><div className="mfr-dark-item-sub">All brands</div></div>
            </div>
            <div className="mfr-dark-footer">
              <p><strong>Don't see your manufacturer?</strong> It doesn't matter. DS360 covers every RV manufacturer in North America with full Flat Rate Code integration.</p>
              <a href="/contact" className="btn btn-green">Confirm Your Manufacturer →</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec-g">
        <div className="wrap">
          <div className="faq-layout anim">
            <div className="faq-left">
              <div className="badge">FAQ</div>
              <h2 style={{fontSize:'clamp(1.5rem,3.5vw,2rem)',fontWeight:700,marginTop:'.75rem',lineHeight:1.2}}>Questions About<br/>DS360 Services</h2>
              <p style={{fontSize:'1rem',color:'var(--muted)',lineHeight:1.7,marginTop:'1rem'}}>Everything you need to know about what DS360 does for your dealership.</p>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'1.5rem'}}>Still Have Questions? →</a>
            </div>
            <div className="faq-right">
              {[
                {q:'Do I need to use every DS360 service?',a:'No. Every service operates independently. Start with what your dealership needs most — claims processing, service management, or roadside — and add services as your operation grows. There is no requirement to use the full suite.'},
                {q:'Are these services included in my DS360 plan?',a:'Core services like claims processing, parts tracking, and basic roadside assistance are included in your dealer subscription. TechFlow and Marketing Services are available as add-ons. Visit the Pricing page for a full breakdown of what is included at each tier.'},
                {q:'How does DS360 differ from other dealer management tools?',a:'DS360 is the only platform in North America that combines AI-powered claims processing with a full dealership operating system. Our technology runs on MSIL — proprietary to DS360 through a lifetime exclusivity agreement — meaning no competitor has access to the same technology now or ever. The AI claims processing workflows are patent-pending.'},
                {q:'What is the difference between Services and Products?',a:'Services are operational tools your dealership uses to run your business — claims processing, TechFlow, parts management. Your clients never see or interact with these. Products are things your dealership sells to clients — Extended Warranty, GAP Insurance, Protection Plans. DS360 issues the products, you sell them, and DS360 manages all claims on the back end.'},
                {q:'Can I try DS360 before committing?',a:'Book a demo and our team will walk you through the platform live, tailored to your dealership\'s specific needs and operation size. We will show you exactly how each service works with real examples relevant to your business.'},
              ].map((item, i) => (
                <div key={i} className={`faq-card${openFaq === i ? ' open' : ''}`}>
                  <button className="faq-q" onClick={() => toggleFaq(i)}>
                    <span>{item.q}</span>
                    <span className="faq-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={20} height={20}><path d="M12 5v14M5 12h14"/></svg></span>
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
          <h2>See the Full Platform in Action</h2>
          <p>Book a walkthrough and we will show you how every DS360 service works together to simplify your operation and increase your revenue.</p>
          <div className="bcta-btns"><a href="/contact" className="btn btn-lg btn-green">Book a Demo →</a><a href="/pricing" className="btn btn-lg btn-white">View Pricing</a></div>
        </div>
      </section>
    </>
  );
}
