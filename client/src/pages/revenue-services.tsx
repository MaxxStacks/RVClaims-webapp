import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/page-layout';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do I need to use all revenue tools?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Each tool is modular — you can start with claims processing and add F&I products, TechFlow, marketing, and marketplace access as your operation grows. However, the more tools you stack, the more revenue layers you capture per deal."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between Revenue Services and Revenue Optimization?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Revenue Services is the guide to every tool that makes money. Revenue Optimization is the diagnostic that shows where you are losing money. One shows the tools. The other shows the gaps. Together, they give you the complete picture."
      }
    },
    {
      "@type": "Question",
      "name": "How quickly do revenue improvements show up?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Claims revenue recovery is immediate — the moment DS360 starts catching expired deadlines and maximizing labor lines, claim values increase on the next submission. F&I product revenue starts the day you begin selling products. TechFlow labor recovery starts the month it is activated. Marketing results typically build over 60-90 days."
      }
    },
    {
      "@type": "Question",
      "name": "Can I see ROI on each tool?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Every revenue-generating tool in DS360 is tracked within the platform. Claims revenue, F&I product margins, TechFlow labor recovery, marketing ROI — all visible in your dealer portal. You see exactly what each tool produces."
      }
    }
  ]
};

const revBlocks = [
  {
    num: '01',
    title: 'Claims Processing',
    sub: 'Maximize claim value, prevent expirations, accelerate payouts',
    body: "Every approved claim is revenue. DS360's AI-powered claims workflow increases labor lines per claim through FRC recognition, optimizes photos for manufacturer standards, generates fail-proof descriptions, and tracks every deadline to prevent expiration denials. The result: more claims approved, higher claim values, faster payouts.",
    links: [
      { href: '/services/claims-processing', label: 'Claims Processing' },
      { href: '/services/parts-components', label: 'Parts & Components' }
    ]
  },
  {
    num: '02',
    title: 'TechFlow Labor Recovery',
    sub: 'Capture every billable technician hour against the right claim',
    body: "The average dealership loses 12 to 18 labor hours per month on warranty repairs where the technician's time was never logged against the claim. At standard labor rates, that is $1,500 to $2,700 per month in unbilled work. TechFlow auto-generates work orders from approved claims and syncs every labor hour back to the invoice.",
    links: [
      { href: '/services/techflow', label: 'TechFlow' }
    ]
  },
  {
    num: '03',
    title: 'F&I Product Sales',
    sub: 'Margin on 6 products + cashback incentive tiers',
    body: 'Six products, each generating dealer margin on every sale: Extended Warranty (highest margin), GAP Insurance, Appearance Protection, Tire & Wheel, Roadside & Travel (Titanium), and Specialty Protection. Cashback incentives apply on top — Tier 1 (1-2 products), Tier 2 (3-4), Tier 3 (5-6 maximum).',
    links: [
      { href: '/products/fi-services', label: 'F&I Products' },
      { href: '/products/warranty-extended-service', label: 'Extended Warranty' },
      { href: '/products/gap-insurance', label: 'GAP' },
      { href: '/products/protection-plans', label: 'Protection Plans' }
    ]
  },
  {
    num: '04',
    title: 'AI F&I Presenter',
    sub: '100% presentation rate — every client, every product, every time',
    body: 'The revenue lost to inconsistent F&I delivery is invisible — because nobody knows what a client would have bought if they had received a complete presentation. The AI F&I Presenter ensures 100% of credit-approved clients see every product, with zero staff required. Beta launching Q4 2026.',
    links: [
      { href: '/services/ai-fi-presenter', label: 'AI F&I Presenter' }
    ]
  },
  {
    num: '05',
    title: 'On-Site Repairs',
    sub: 'Net-new revenue from mobile service calls off your lot',
    body: "Every mobile service call is billable work your shop would never have seen. Roadside emergencies, campsite convenience calls, storage lot service, pre-trip inspections — clients pay for labor and parts on every call. DS360's photo-first dispatch ensures your tech arrives prepared with the right parts.",
    links: [
      { href: '/services/on-site-repairs', label: 'On-Site Repairs' }
    ]
  },
  {
    num: '06',
    title: 'Financing Cashback',
    sub: 'Credits from partner financing — redeemable toward inventory',
    body: 'Route client financing through DS360 partner banks and earn cashback credits on every funded deal. Credits accumulate in your DS360 account and are redeemable toward new unit purchases. Covers loans, leasing, and rental fleet financing. Launching Q4 2026.',
    links: [
      { href: '/products/financing-services', label: 'Financing Services' }
    ]
  },
  {
    num: '07',
    title: 'Dealer Marketplace',
    sub: 'Move inventory through the DS360 dealer network and public auctions',
    body: "Three channels to move units: Dealer Exchange (dealer-to-dealer network, $499/yr), Live Auctions (monthly public events, $299/yr add-on), and Consignment Services (client-sourced inventory, finder's fee revenue). Revenue from inventory movement that would otherwise sit on your lot or never reach your hands.",
    links: [
      { href: '/marketplace', label: 'Marketplace' },
      { href: '/marketplace/dealer-exchange', label: 'Dealer Exchange' },
      { href: '/marketplace/live-auctions', label: 'Live Auctions' }
    ]
  },
  {
    num: '08',
    title: 'Marketing Services',
    sub: 'Lot traffic, leads, and clients — tracked to closed deals',
    body: 'SEO, PPC, social, email, lead gen, and remarketing — all managed by a team with 20+ years in the RV industry. Co-op compatible campaigns, precision targeting (competitor website visitors within 24 hours), and closed-loop ROI tracking from ad click to closed deal inside the DS360 platform.',
    links: [
      { href: '/services/marketing-services', label: 'Marketing Services' }
    ]
  }
];

export default function RevenueServices() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openBlocks, setOpenBlocks] = useState<Set<number>>(new Set());

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('v'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.anim').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const toggleBlock = (i: number) => {
    setOpenBlocks(prev => {
      const next = new Set(prev);
      if (next.has(i)) { next.delete(i); } else { next.add(i); }
      return next;
    });
  };

  return (
    <PageLayout
      seoTitle="Revenue Services — Every DS360 Tool That Makes You Money"
      seoDescription="A complete guide to every DS360 tool and product that generates or recovers dealer revenue — claims recovery, F&I product margins, and partner financing cashback."
      canonical="https://dealersuite360.com/revenue-services"
      schema={faqSchema}
    >
      {/* HERO */}
      <section className="phero">
        <div className="wrap">
          <div className="phero-center">
            <div className="badge">Revenue Growth</div>
            <h1>Every DS360 Tool That<span className="gradient">Puts Money in Your Account</span></h1>
            <p>This is not a feature list. This is a guide to every DS360 tool and product that directly generates revenue, recovers lost revenue, or creates a new revenue stream your dealership did not have before. Three categories. One platform. Revenue from every angle.</p>
            <div className="phero-btns">
              <a href="/contact" className="btn btn-lg btn-primary">Book a Revenue Consultation</a>
              <a href="/revenue/optimization" className="btn btn-lg btn-outline">See What You're Missing</a>
            </div>
          </div>
        </div>
      </section>

      {/* STREAM 1: CLAIMS RECOVERY */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">Revenue Stream 1</div>
              <h2>Claim Revenue Recovery</h2>
              <p>Every valid warranty claim your dealership files and gets paid on is revenue. Every claim that expires, gets denied due to a weak submission, or is filed with missing labor lines is revenue lost. DS360's claims workflow is designed to maximize claim value and prevent revenue from slipping through the cracks.</p>
              <div className="checks">
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Expiration Prevention</h3><p>DS360 tracks every claim deadline and sends alerts before manufacturer cutoffs pass — no more expired claims</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Maximized Labor Lines</h3><p>AI-assisted Flat Rate Code (FRC) recognition ensures every billable labor line is captured on every claim</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>97% Approval Rate</h3><p>Photo optimization, fail-proof descriptions, and complete submissions reduce denials to near zero</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Faster Payouts</h3><p>Complete, accurate claims move through manufacturer review faster — accelerating your cash flow</p></div>
                </div>
              </div>
              <a href="/services/claims-processing" className="btn btn-primary" style={{width:'fit-content'}}>Claims Processing →</a>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Claims revenue" width={576} height={432} loading="lazy" />
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
            <p>"You cannot deposit a claim that was never filed. DS360 makes sure every valid claim is filed, optimized, and paid — before the deadline passes."</p>
          </div>
        </div>
      </section>

      {/* STREAM 2: F&I PRODUCT REVENUE */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split split-rev anim">
            <div className="split-text">
              <div className="badge">Revenue Stream 2</div>
              <h2>F&amp;I Product Revenue</h2>
              <p>Every F&amp;I product your dealership sells to a client is margin in your pocket. DS360 builds, issues, and manages a complete suite of 6 products — your dealership sells them at retail, pays DS360 wholesale, and keeps the difference. Volume-based cashback incentives stack on top of that margin.</p>
              <div className="checks">
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>6 Products in the Suite</h3><p>Extended Warranty, GAP, Appearance, Tire &amp; Wheel, Roadside &amp; Travel, Specialty Protection</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>You Set the Retail Price</h3><p>DS360 provides wholesale cost. You set retail. The margin is yours.</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Cashback Incentive Tiers</h3><p>1-2 products per unit = Tier 1. 3-4 = Tier 2. 5-6 = Tier 3 maximum. Applied to total volume.</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>AI F&amp;I Presenter</h3><p>Launching beta Q4 2026 — presents every product to every client, 24/7, with zero staff required</p></div>
                </div>
              </div>
              <a href="/products/fi-services" className="btn btn-primary" style={{width:'fit-content'}}>F&amp;I Products →</a>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="F&I revenue" width={576} height={432} loading="lazy" />
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
            <p>Dealers who <strong>present the full 6-product F&amp;I suite on every deal</strong> generate 3x to 5x more per-unit F&amp;I revenue than those who only offer Extended Warranty. The products exist. The margin is there. The only variable is whether the client sees the presentation — and with the AI F&amp;I Presenter, 100% of them will.</p>
          </div>
        </div>
      </section>

      {/* STREAM 3: FINANCING REVENUE */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">Revenue Stream 3 · Q4 2026</div>
              <h2>Financing Cashback</h2>
              <p>The third revenue stream most dealers are not capturing. When a client finances a unit, the bank earns interest for years — and the dealer earns nothing on that transaction. DS360 Financing Services changes that by routing deals through partner banks that offer preferential rates and cashback credits to your dealership on every funded deal.</p>
              <div className="checks">
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Partner Bank Network</h3><p>Multiple institutions competing for your client's deal — best rate wins</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Cashback on Every Deal</h3><p>Credits accumulate in your DS360 account — redeemable toward new unit purchases</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Loans, Leasing, Rental Fleet</h3><p>Three financing types — all generating dealer cashback</p></div>
                </div>
              </div>
              <a href="/products/financing-services" className="btn btn-primary" style={{width:'fit-content'}}>Financing Services →</a>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Financing revenue" width={576} height={432} loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLETE REVENUE MAP */}
      <section className="sec-g">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">Complete Revenue Map</div>
            <h2>Every Revenue Tool — Expandable</h2>
            <p>Click any block to see how each DS360 tool generates or recovers revenue for your dealership.</p>
          </div>
          <div className="rev-stream anim">
            {revBlocks.map((block, i) => (
              <div key={i} className={`rev-block${openBlocks.has(i) ? ' open' : ''}`}>
                <div className="rev-block-head" onClick={() => toggleBlock(i)}>
                  <div className="rev-block-num">{block.num}</div>
                  <div className="rev-block-title">
                    <h3>{block.title}</h3>
                    <p>{block.sub}</p>
                  </div>
                  <div className="rev-block-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  </div>
                </div>
                <div className="rev-block-body">
                  <div className="rev-block-content">
                    <p>{block.body}</p>
                    <div className="rev-block-links">
                      {block.links.map((link, j) => (
                        <a key={j} href={link.href} className="rev-link">{link.label}</a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONNECTED */}
      <section className="sec-w">
        <div className="wrap">
          <div className="sec-head">
            <h2>See the Other Side</h2>
            <p>Revenue Services shows where the money comes from. Revenue Optimization shows where it's being lost.</p>
          </div>
          <div className="grid-2 anim">
            <a href="/revenue/optimization" className="link-card"><div><h4>Revenue Optimization</h4><p>Where you're losing money — and how DS360 closes those gaps</p></div><span className="link-arrow">→</span></a>
            <a href="/services" className="link-card"><div><h4>All Services</h4><p>The full DS360 service suite</p></div><span className="link-arrow">→</span></a>
            <a href="/products/fi-services" className="link-card"><div><h4>All F&amp;I Products</h4><p>The complete product lineup with pricing and incentive tiers</p></div><span className="link-arrow">→</span></a>
            <a href="/pricing" className="link-card"><div><h4>Pricing</h4><p>Transparent pricing for every DS360 service and product</p></div><span className="link-arrow">→</span></a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec-g">
        <div className="wrap">
          <div className="faq-layout anim">
            <div className="faq-left">
              <div className="badge">FAQ</div>
              <h2 style={{fontSize:'clamp(1.5rem,3.5vw,2rem)',fontWeight:700,marginTop:'.75rem',lineHeight:1.2}}>Revenue Services<br/>Questions</h2>
              <p style={{fontSize:'1rem',color:'var(--muted)',lineHeight:1.7,marginTop:'1rem'}}>How DS360 generates revenue for your dealership.</p>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'1.5rem'}}>Book a Consultation →</a>
            </div>
            <div className="faq-right">
              {[
                {
                  q: 'Do I need to use all revenue tools?',
                  a: 'No. Each tool is modular — you can start with claims processing and add F&I products, TechFlow, marketing, and marketplace access as your operation grows. However, the more tools you stack, the more revenue layers you capture per deal.'
                },
                {
                  q: 'What is the difference between Revenue Services and Revenue Optimization?',
                  a: 'Revenue Services is the guide to every tool that makes money. Revenue Optimization is the diagnostic that shows where you are losing money. One shows the tools. The other shows the gaps. Together, they give you the complete picture.'
                },
                {
                  q: 'How quickly do revenue improvements show up?',
                  a: 'Claims revenue recovery is immediate — the moment DS360 starts catching expired deadlines and maximizing labor lines, claim values increase on the next submission. F&I product revenue starts the day you begin selling products. TechFlow labor recovery starts the month it is activated. Marketing results typically build over 60-90 days.'
                },
                {
                  q: 'Can I see ROI on each tool?',
                  a: 'Yes. Every revenue-generating tool in DS360 is tracked within the platform. Claims revenue, F&I product margins, TechFlow labor recovery, marketing ROI — all visible in your dealer portal. You see exactly what each tool produces.'
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
          <h2>Revenue From Every Angle. One Platform.</h2>
          <p>Book a revenue consultation and see exactly how much your dealership is leaving on the table — and which DS360 tools recover it.</p>
          <div className="bcta-btns">
            <a href="/contact" className="btn btn-lg btn-green">Book a Consultation →</a>
            <a href="/revenue/optimization" className="btn btn-lg btn-white">Revenue Optimization</a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
