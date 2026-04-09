import { useState, useEffect } from "react";
import { PageLayout } from "@/components/page-layout";

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Marketing included in my DS360 plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Marketing Services is a premium add-on — it is not included in the base DS360 dealer subscription. It is a full-service engagement with dedicated strategy, execution, and reporting.",
      },
    },
    {
      "@type": "Question",
      name: "How does pricing work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pricing is based on the scope of services, number of channels, and your monthly ad spend budget. We start with a marketing assessment to understand your goals, then build a custom plan with transparent pricing. No hidden fees.",
      },
    },
    {
      "@type": "Question",
      name: "Do you handle manufacturer co-op submissions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. DS360 structures qualifying campaigns to meet manufacturer co-op guidelines and provides the documentation and proof of performance required for reimbursement. We handle the paperwork so you collect the credit.",
      },
    },
    {
      "@type": "Question",
      name: "Can I start with just one channel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can start with a single channel — SEO only, PPC only, social only — and add channels as you see results. Most dealers who start with one channel expand within 90 days once they see the ROI tracking data inside the platform.",
      },
    },
    {
      "@type": "Question",
      name: "How is DS360 Marketing different from a regular agency?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Three things: industry knowledge (20+ years in RV, not learning on your dime), platform integration (ROI tracking lives inside DS360 where your sales data already exists), and co-op expertise (campaigns structured for manufacturer reimbursement from day one). A generic agency gives you none of these.",
      },
    },
  ],
};

export default function MarketingServices() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  return (
    <PageLayout
      seoTitle="Marketing Services — RV Dealer Digital Marketing"
      seoDescription="Full-service digital marketing built for the RV industry — SEO, PPC, social media, email, remarketing, and lead generation with ROI tracking built into the DS360 platform."
      schema={schema}
    >
      {/* 1. HERO */}
      <section className="phero">
        <div className="wrap">
          <div className="phero-grid">
            <div className="phero-text">
              <div><a href="/services" style={{fontSize:'.82rem',color:'var(--muted)'}}>← All Services</a></div>
              <div><div className="badge">DS360 Premium Service</div></div>
              <h1>Marketing Built by People Who<span className="gradient">Actually Know the RV Industry</span></h1>
              <p className="phero-desc">Most marketing agencies learn your industry on your dime. DS360 Marketing is built by a team with over 20 years of hands-on RV industry experience — they know your buyers, your seasonality, your co-op programs, and what actually drives lot traffic. Full-service digital marketing with ROI tracking built directly into the DS360 platform.</p>
              <div className="phero-btns">
                <a href="/contact" className="btn btn-lg btn-primary">Get a Marketing Assessment</a>
                <a href="#channels" className="btn btn-lg btn-outline">View Channels</a>
              </div>
              <div className="phero-stats">
                <div className="phero-stat"><div className="phero-stat-val">2-3x</div><div className="phero-stat-label">More Off-Season Leads</div></div>
                <div className="phero-stat"><div className="phero-stat-val">Click</div><div className="phero-stat-label">to Close Tracking</div></div>
                <div className="phero-stat"><div className="phero-stat-val">$0</div><div className="phero-stat-label">Wasted on Learning Curves</div></div>
              </div>
            </div>
            <div className="phero-img">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=584&h=438&fm=webp&q=75" alt="Marketing analytics" width="584" height="438" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. METRIC BAR */}
      <section className="sec-g" style={{padding:'2.5rem 0'}}>
        <div className="wrap">
          <div className="metric-bar">
            <div className="metric-item"><div className="metric-num">20+</div><div className="metric-label">Years in RV</div></div>
            <div className="metric-item"><div className="metric-num">6</div><div className="metric-label">Marketing Channels</div></div>
            <div className="metric-item"><div className="metric-num">DS360</div><div className="metric-label">ROI Tracking Built In</div></div>
            <div className="metric-item"><div className="metric-num">Co-op</div><div className="metric-label">Program Compatible</div></div>
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">The Problem</div>
              <h2>Generic Agencies Don't Understand Your Business</h2>
              <p>You hire a marketing agency. They ask you to explain what an RV dealer does. They don't understand seasonality, co-op reimbursement programs, lot events, or why a Class A buyer is a completely different person than a travel trailer buyer. You spend the first six months educating them — and paying for it.</p>
              <p>DS360 Marketing skips that learning curve entirely. The team has lived in this industry for over two decades. They know which keywords drive lot traffic in April versus October. They know how to structure campaigns that qualify for manufacturer co-op reimbursement. And they know that a Facebook ad showing the wrong floor plan to the wrong audience is a wasted budget.</p>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Marketing strategy" width="576" height="432" loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STATEMENT */}
      <section className="sec-g" style={{padding:'3.5rem 0'}}>
        <div className="wrap">
          <div className="bst"><div className="bst-line"></div><p>"The most expensive marketing is the kind where you pay an agency to learn your industry before they can do anything useful."</p></div>
        </div>
      </section>

      {/* 5. CHANNELS */}
      <section className="sec-w" id="channels">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">Full-Service Channels</div>
            <h2>Every Channel That Moves Units Off Your Lot</h2>
            <p>DS360 Marketing covers the full digital landscape — not just one channel. Each campaign is built to work together, and ROI tracking is built into the DS360 platform so you see exactly where your money is going.</p>
          </div>
          <div className="channels anim">
            <div className="channel">
              <div className="channel-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
              <h4>SEO</h4>
              <p>Local and national search optimization built for RV dealer queries. "RV dealer near me," model-specific searches, service queries, and seasonal terms. Content strategy that ranks and converts.</p>
            </div>
            <div className="channel">
              <div className="channel-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg></div>
              <h4>PPC / Paid Search</h4>
              <p>Google Ads campaigns targeting high-intent buyers. Budget optimization, bid management, negative keyword refinement, and landing page strategy — structured for co-op reimbursement eligibility.</p>
            </div>
            <div className="channel">
              <div className="channel-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
              <h4>Social Media</h4>
              <p>Facebook, Instagram, and YouTube campaigns built for the RV buyer journey. Inventory showcases, lifestyle content, event promotion, and retargeting audiences who engaged but didn't convert.</p>
            </div>
            <div className="channel">
              <div className="channel-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></div>
              <h4>Email Marketing</h4>
              <p>Segmented campaigns for leads, clients, and service customers. Seasonal promotions, new inventory alerts, service reminders, and F&amp;I product follow-ups — automated sequences that nurture without spamming.</p>
            </div>
            <div className="channel">
              <div className="channel-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg></div>
              <h4>Lead Generation</h4>
              <p>Multi-channel lead capture funnels. Landing pages, form optimization, lead scoring, and CRM integration. Every lead tracked from first click to lot visit to closed deal inside DS360.</p>
            </div>
            <div className="channel">
              <div className="channel-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M21 3v5h-5"/></svg></div>
              <h4>Remarketing</h4>
              <p>Stay in front of buyers who visited your site, browsed inventory, or started a form but didn't finish. Display, social, and search remarketing that brings them back when they are ready.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CO-OP PROGRAMS */}
      <section className="sec-g">
        <div className="wrap">
          <div className="split split-rev anim">
            <div className="split-text">
              <div className="badge">Co-Op Compatible</div>
              <h2>Campaigns Structured for Manufacturer Co-Op Reimbursement</h2>
              <p>Most manufacturers offer co-op advertising programs that reimburse dealers for a portion of qualifying marketing spend. But the campaigns have to meet specific guidelines — brand usage, placement rules, reporting requirements — and most agencies don't know these rules exist.</p>
              <p>DS360 Marketing structures every eligible campaign to meet manufacturer co-op requirements from the start. Your dealership spends the money. The manufacturer reimburses a portion. You get better marketing at a lower net cost.</p>
              <div className="checks">
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Pre-Structured for Compliance</h3><p>Campaigns built to meet manufacturer co-op guidelines from day one</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Documentation Handled</h3><p>DS360 provides the reporting and proof of performance manufacturers require</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Lower Net Cost</h3><p>The manufacturer covers a portion of qualifying spend — your effective cost drops</p></div></div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Co-op marketing" width="576" height="432" loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. AUDIENCE TARGETING */}
      <section className="sec-w">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">Precision Targeting</div>
            <h2>Reach Buyers Who Are Already Shopping — Including at Your Competitors</h2>
            <p>DS360 Marketing does not spray ads at random audiences. We target people who are actively in the market to buy an RV right now — based on their search behavior, websites they have visited, and how recently they showed intent. Every impression goes to someone who is already looking.</p>
          </div>
          <div className="target-section anim">
            <h3 style={{fontSize:'1rem',fontWeight:700,textAlign:'center',marginBottom:'1.25rem'}}>Retargeting Windows — How Recently They Showed Intent</h3>
            <div className="target-grid">
              <div className="target-win"><div className="target-win-num">1</div><div className="target-win-unit">Day</div><div className="target-win-label">Searched today — highest intent</div></div>
              <div className="target-win"><div className="target-win-num">3</div><div className="target-win-unit">Days</div><div className="target-win-label">Active research phase</div></div>
              <div className="target-win"><div className="target-win-num">7</div><div className="target-win-unit">Days</div><div className="target-win-label">Comparing dealers</div></div>
              <div className="target-win"><div className="target-win-num">14</div><div className="target-win-unit">Days</div><div className="target-win-label">Narrowing options</div></div>
              <div className="target-win"><div className="target-win-num">30</div><div className="target-win-unit">Days</div><div className="target-win-label">Re-engage before they go cold</div></div>
            </div>
            <h3 style={{fontSize:'1rem',fontWeight:700,textAlign:'center',marginBottom:'1.25rem'}}>How We Find Them</h3>
            <div className="target-methods">
              <div className="target-method"><h4>Keyword Intent Targeting</h4><p>Users who have searched for RV-related keywords — "RV dealers near me," specific makes and models, "fifth wheel vs travel trailer," financing queries, and trade-in searches. If they typed it, we target them.</p></div>
              <div className="target-method"><h4>Competitor Website Visitors</h4><p>Users who have visited a local competitor's website or inventory pages within your market area. They were shopping elsewhere — now your dealership appears in their feed, their search results, and their display ads.</p></div>
              <div className="target-method"><h4>In-Market Audience Segments</h4><p>Google and Meta classify users as "in-market for RVs" based on browsing behavior, search patterns, and content consumption. DS360 Marketing layers these segments with geographic targeting around your dealership.</p></div>
              <div className="target-method"><h4>Lookalike Audiences</h4><p>We build audiences that match the profile of your best existing clients — demographics, interests, online behavior, income indicators. These are people who look like your buyers but have not found you yet.</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* DYK — COMPETITOR TARGETING */}
      <section className="sec-g">
        <div className="wrap">
          <div className="dyk anim">
            <div className="dyk-tag">Did You Know<span style={{color:'#033280'}}>?</span></div>
            <p>When a buyer visits your competitor's website to browse inventory, <strong>DS360 Marketing can place your dealership's ads in front of that same buyer within 24 hours</strong> — on social media, Google Display, and search results. They shopped at your competitor. They see your ad. They visit your lot. Every conversion tracked inside your DS360 dashboard.</p>
          </div>
        </div>
      </section>

      {/* 8. ROI TRACKING */}
      <section className="sec-g">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">Built Into DS360</div>
              <h2>ROI Tracking That Closes the Loop</h2>
              <p>Most marketing agencies send you a report showing clicks and impressions. DS360 Marketing tracks the full journey — from ad click to lot visit to closed deal — because the marketing data lives inside the same platform where your leads, inventory, and sales data already exist.</p>
              <div className="checks">
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Click to Close Tracking</h3><p>See which campaigns, channels, and keywords actually produced closed deals — not just clicks</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Cost Per Acquisition</h3><p>Know exactly what it costs to acquire each client — by channel, by campaign, by month</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Live in Your Portal</h3><p>Marketing performance is visible in the same DS360 dealer portal you already use every day</p></div></div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="ROI tracking dashboard" width="576" height="432" loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. STATS */}
      <section className="sec-w">
        <div className="wrap">
          <div className="grid-3 anim">
            <div className="stat-card"><div className="stat-val">20+</div><div className="stat-title">Years RV Experience</div><p className="stat-desc">Not learning your industry on your budget — already know it inside and out</p></div>
            <div className="stat-card"><div className="stat-val">6</div><div className="stat-title">Integrated Channels</div><p className="stat-desc">SEO, PPC, social, email, lead gen, remarketing — working together, not in silos</p></div>
            <div className="stat-card"><div className="stat-val">100%</div><div className="stat-title">Closed-Loop Tracking</div><p className="stat-desc">From ad click to closed deal — every dollar tracked inside DS360</p></div>
          </div>
        </div>
      </section>

      {/* 10. MARKETPLACE CROSS-SELL */}
      <section className="sec-g" style={{padding:'2.5rem 0'}}>
        <div className="wrap">
          <div className="bcs">
            <div className="bcs-dot"></div>
            <div className="bcs-text"><strong>Dealer Exchange &amp; Live Auctions</strong> — marketing drives buyers to your inventory. The DS360 Marketplace gives you additional channels to move units.</div>
            <a href="/marketplace">Explore Marketplace →</a>
          </div>
        </div>
      </section>

      {/* 11. CONNECTED SERVICES */}
      <section className="sec-g">
        <div className="wrap">
          <div className="sec-head">
            <h2>Connected Services</h2>
            <p>Marketing Services is a premium add-on to your DS360 plan. These platform features amplify your marketing investment.</p>
          </div>
          <div className="grid-2 anim">
            <a href="/marketplace/dealer-exchange" className="link-card"><div><h4>Dealer Exchange</h4><p>Marketing brings buyers — Marketplace gives you additional channels to move inventory</p></div><span className="link-arrow">→</span></a>
            <a href="/services/ai-fi-presenter" className="link-card"><div><h4>AI F&amp;I Presenter</h4><p>Marketing acquires the client — the AI Presenter converts them on F&amp;I products</p></div><span className="link-arrow">→</span></a>
            <a href="/revenue/optimization" className="link-card"><div><h4>Revenue Optimization</h4><p>Marketing drives the top of funnel — Revenue Optimization ensures nothing leaks at the bottom</p></div><span className="link-arrow">→</span></a>
            <a href="/services" className="link-card"><div><h4>All Services</h4><p>View the full DS360 service suite</p></div><span className="link-arrow">→</span></a>
          </div>
        </div>
      </section>

      {/* 12. FAQ */}
      <section className="sec-w">
        <div className="wrap">
          <div className="faq-layout anim">
            <div className="faq-left">
              <div className="badge">FAQ</div>
              <h2 style={{fontSize:'clamp(1.5rem,3.5vw,2rem)',fontWeight:700,marginTop:'.75rem',lineHeight:1.2}}>Marketing Services<br/>Questions</h2>
              <p style={{fontSize:'1rem',color:'var(--muted)',lineHeight:1.7,marginTop:'1rem'}}>What you need to know about adding DS360 Marketing to your plan.</p>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'1.5rem'}}>Get an Assessment →</a>
            </div>
            <div className="faq-right">
              {[
                { q: "Is Marketing included in my DS360 plan?", a: "Marketing Services is a premium add-on — it is not included in the base DS360 dealer subscription. It is a full-service engagement with dedicated strategy, execution, and reporting." },
                { q: "How does pricing work?", a: "Pricing is based on the scope of services, number of channels, and your monthly ad spend budget. We start with a marketing assessment to understand your goals, then build a custom plan with transparent pricing. No hidden fees." },
                { q: "Do you handle manufacturer co-op submissions?", a: "Yes. DS360 structures qualifying campaigns to meet manufacturer co-op guidelines and provides the documentation and proof of performance required for reimbursement. We handle the paperwork so you collect the credit." },
                { q: "Can I start with just one channel?", a: "Yes. You can start with a single channel — SEO only, PPC only, social only — and add channels as you see results. Most dealers who start with one channel expand within 90 days once they see the ROI tracking data inside the platform." },
                { q: "How is DS360 Marketing different from a regular agency?", a: "Three things: industry knowledge (20+ years in RV, not learning on your dime), platform integration (ROI tracking lives inside DS360 where your sales data already exists), and co-op expertise (campaigns structured for manufacturer reimbursement from day one). A generic agency gives you none of these." },
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

      {/* 13. BOTTOM CTA */}
      <section className="bcta">
        <div className="wrap">
          <h2>Stop Paying Agencies to Learn Your Industry.</h2>
          <p>DS360 Marketing already knows it. Get a free marketing assessment and see where your dealership is leaving leads on the table.</p>
          <div className="bcta-btns">
            <a href="/contact" className="btn btn-lg btn-green">Get a Free Assessment →</a>
            <a href="/services" className="btn btn-lg btn-white">View All Services</a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
