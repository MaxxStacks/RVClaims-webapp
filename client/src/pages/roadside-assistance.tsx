import { useState, useEffect } from "react";
import { PageLayout } from "@/components/page-layout";

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is basic roadside really free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Basic roadside assistance is included in every DS360 dealer plan at no additional charge. There are no per-use fees, no per-client fees, and no activation costs. DS360 covers it entirely.",
      },
    },
    {
      "@type": "Question",
      name: "Can I resell basic roadside to my clients?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Basic roadside is a complimentary benefit only — it cannot be charged to the client. If you want to sell roadside protection as an F&I product, Titanium Roadside & Travel is the resellable option.",
      },
    },
    {
      "@type": "Question",
      name: "How do I activate it for a client?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Activation happens in the DS360 dealer portal at the time of sale. Your team links the roadside benefit to the client's VIN — one step during the delivery process. The client receives confirmation automatically.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if the client is outside 50KM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Basic roadside covers a 50KM radius from your dealership. If the client is outside that zone, they would need Titanium Roadside & Travel for extended coverage. This is also a natural upsell opportunity at the point of sale — offer basic free, then present Titanium for full-trip coverage.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between this and Titanium?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Basic is a free service — 50KM, towing only, complimentary. Titanium is a premium product — 160KM+, trip interruption, emergency lodging and meals, vehicle return, and co-branded with your dealership. Basic is a gift. Titanium is a revenue-generating F&I product your dealership sells.",
      },
    },
  ],
};

export default function RoadsideAssistance() {
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
      seoTitle="Roadside Assistance — Free with Every DS360 Plan"
      seoDescription="Every DS360 dealer plan includes free basic roadside assistance — 50KM coverage, DS360-managed dispatch, and a deal-closing incentive that costs your dealership nothing."
      schema={schema}
    >
      {/* 1. HERO */}
      <section className="phero">
        <div className="wrap">
          <div className="phero-grid">
            <div className="phero-text">
              <div><a href="/services" style={{fontSize:'.82rem',color:'var(--muted)'}}>← All Services</a></div>
              <div><div className="badge badge-green">Free with Every DS360 Plan</div></div>
              <h1>A Deal-Closing Incentive That<span className="gradient">Costs You Nothing</span></h1>
              <p className="phero-desc">Every DS360 dealer plan includes basic roadside assistance at no additional cost. Offer it to every client at the point of sale as a complimentary benefit — towing coordination, dispatch, and client communication within a 50KM radius. DS360 manages everything. Your dealership gets the credit. The client gets peace of mind. And it never costs you a dollar.</p>
              <div className="phero-btns">
                <a href="/contact" className="btn btn-lg btn-primary">Get Started</a>
                <a href="#comparison" className="btn btn-lg btn-outline">Compare Tiers</a>
              </div>
              <div className="phero-stats">
                <div className="phero-stat"><div className="phero-stat-val">$0</div><div className="phero-stat-label">Cost to Dealer</div></div>
                <div className="phero-stat"><div className="phero-stat-val">50KM</div><div className="phero-stat-label">Coverage Radius</div></div>
                <div className="phero-stat"><div className="phero-stat-val">DS360</div><div className="phero-stat-label">Managed Dispatch</div></div>
              </div>
            </div>
            <div className="phero-img">
              <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=584&h=438&fm=webp&q=75" alt="RV on the road" width="584" height="438" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE SALES TOOL */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">The Sales Advantage</div>
              <h2>The Easiest Close Incentive You Will Ever Offer</h2>
              <p>Most F&amp;I products require a pitch, an explanation, and a price conversation. Basic roadside requires one sentence: "Your unit comes with complimentary roadside assistance — if you ever need help on the road, we have you covered." It costs you nothing. It removes a buyer objection. And it gives your client a reason to answer your call the next time you reach out.</p>
              <p>This is not a product you sell. It is a benefit you give. DS360 manages the dispatch, the towing coordination, and the client communication. Your dealership is the hero.</p>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="DS360 roadside management" width="576" height="432" loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATEMENT */}
      <section className="sec-g" style={{padding:'3.5rem 0'}}>
        <div className="wrap">
          <div className="bst"><div className="bst-line"></div><p>"The client does not remember the dealership that sold them the RV. They remember the dealership that showed up when they needed help."</p></div>
        </div>
      </section>

      {/* 4. WHAT'S INCLUDED */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split split-rev anim">
            <div className="split-text">
              <div className="badge badge-green">Included Free</div>
              <h2>What Basic Roadside Covers</h2>
              <p>Basic roadside assistance is a complimentary benefit — not a product for resale. It covers your client within a 50KM radius of your dealership and is activated at the time of sale through the dealer portal.</p>
              <div className="checks">
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Towing Coordination</h3><p>DS360 dispatches a tow to the client's location within the coverage radius</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Client Communication</h3><p>DS360 manages the client interaction — ETA updates, driver details, status tracking</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>50KM Coverage Radius</h3><p>Coverage zone centered on your dealership location — covers most local client travel</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Dealer Portal Activation</h3><p>Your team activates coverage for each client at the time of sale — one click in the portal</p></div></div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Roadside assistance" width="576" height="432" loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DYK */}
      <section className="sec-g">
        <div className="wrap">
          <div className="dyk anim">
            <div className="dyk-tag">Did You Know<span style={{color:'#033280'}}>?</span></div>
            <p>Dealers who offer <strong>complimentary roadside assistance at the point of sale</strong> report a measurable increase in client satisfaction scores and repeat purchase rates. The cost of providing the benefit is zero. The cost of not offering it is the client who buys their next unit somewhere else.</p>
          </div>
        </div>
      </section>

      {/* 6. TWO-PATH: BASIC VS TITANIUM */}
      <section className="sec-w" id="comparison">
        <div className="wrap">
          <div className="sec-head">
            <h2>Two Tiers of Roadside Protection</h2>
            <p>Basic is a free service you offer. Titanium is a premium product you sell. Different purpose, different revenue model — both managed by DS360.</p>
          </div>
          <div className="paths anim">
            <div className="path path-basic">
              <div className="path-tag path-tag-free">Free — Included</div>
              <h3>Basic Roadside</h3>
              <p>A complimentary benefit included in every DS360 dealer plan. Cannot be resold — offered to clients as a deal-closing incentive at no cost.</p>
              <ul className="path-list">
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>50KM coverage radius</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Towing coordination</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>DS360 managed dispatch</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Client communication</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span style={{color:'var(--border)'}}>Cannot be resold</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span style={{color:'var(--border)'}}>No extended coverage</span></li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span style={{color:'var(--border)'}}>No trip interruption</span></li>
              </ul>
              <div style={{fontSize:'1.75rem',fontWeight:800,color:'var(--green)',marginBottom:'.75rem'}}>$0<span style={{fontSize:'.85rem',fontWeight:500,color:'var(--muted)'}}>/always</span></div>
              <span style={{fontSize:'.82rem',color:'var(--muted)'}}>Included in your DS360 plan</span>
            </div>
            <div className="path path-titan">
              <div className="path-tag path-tag-premium">Premium — Resellable Product</div>
              <h3>Titanium Roadside &amp; Travel</h3>
              <p>A revenue-generating product your dealership sells to clients. Extended coverage, trip interruption benefits, and emergency expenses — issued by DS360, sold by you.</p>
              <ul className="path-list">
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>160KM+ extended coverage</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Towing + roadside repair</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Trip interruption coverage</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Emergency lodging &amp; meals</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Vehicle return after breakdown</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>Resellable — dealer earns revenue</li>
                <li><svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>DS360 co-branded with your dealer name</li>
              </ul>
              <a href="/products/roadside-travel-protection" className="btn btn-white" style={{width:'fit-content'}}>Explore Titanium →</a>
            </div>
          </div>
          <p style={{textAlign:'center',fontSize:'.78rem',color:'var(--muted)',marginTop:'2rem',maxWidth:'44rem',marginLeft:'auto',marginRight:'auto',lineHeight:1.6}}>Basic Roadside Assistance is provided free to the dealer and is intended exclusively as a complimentary client incentive. It cannot be sold, charged, or billed to a client under any circumstances. Dealers found charging clients for Basic Roadside will have all Basic Roadside services terminated for their entire client base. <a href="/legal/terms" style={{color:'var(--primary)',fontWeight:600,textDecoration:'underline'}}>View full terms and conditions →</a></p>
        </div>
      </section>

      {/* 7. STATS */}
      <section className="sec-g">
        <div className="wrap">
          <div className="grid-3 anim">
            <div className="stat-card"><div className="stat-val">$0</div><div className="stat-title">Cost to Dealer</div><p className="stat-desc">Basic roadside is fully funded by DS360 — zero cost to your dealership</p></div>
            <div className="stat-card"><div className="stat-val">50KM</div><div className="stat-title">Coverage Radius</div><p className="stat-desc">Centered on your dealership — covers most local client travel patterns</p></div>
            <div className="stat-card"><div className="stat-val">100%</div><div className="stat-title">DS360 Managed</div><p className="stat-desc">Dispatch, towing coordination, and client communication — all handled by DS360</p></div>
          </div>
        </div>
      </section>

      {/* 8. CONNECTED SERVICES */}
      <section className="sec-w">
        <div className="wrap">
          <div className="sec-head">
            <h2>Connected Services</h2>
            <p>Roadside Assistance is included in every DS360 plan. These services extend the roadside experience.</p>
          </div>
          <div className="grid-2 anim">
            <a href="/services/on-site-repairs" className="link-card"><div><h4>On-Site Repairs</h4><p>When towing brings the unit home, On-Site Repairs can handle the fix at the client's location</p></div><span className="link-arrow">→</span></a>
            <a href="/products/roadside-travel-protection" className="link-card"><div><h4>Titanium Roadside &amp; Travel</h4><p>Upgrade to the premium product your dealership sells — 160KM+, trip interruption, emergency coverage</p></div><span className="link-arrow">→</span></a>
            <a href="/services/claims-processing" className="link-card"><div><h4>Claims Processing</h4><p>If the roadside issue is warranty-related, the claim flows directly into the DS360 claims workflow</p></div><span className="link-arrow">→</span></a>
            <a href="/services" className="link-card"><div><h4>All Services</h4><p>View the full DS360 service suite</p></div><span className="link-arrow">→</span></a>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="sec-g">
        <div className="wrap">
          <div className="faq-layout anim">
            <div className="faq-left">
              <div className="badge">FAQ</div>
              <h2 style={{fontSize:'clamp(1.5rem,3.5vw,2rem)',fontWeight:700,marginTop:'.75rem',lineHeight:1.2}}>Roadside Assistance<br/>Questions</h2>
              <p style={{fontSize:'1rem',color:'var(--muted)',lineHeight:1.7,marginTop:'1rem'}}>What you need to know about the free basic tier and how it differs from Titanium.</p>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'1.5rem'}}>Contact Us →</a>
            </div>
            <div className="faq-right">
              {[
                { q: "Is basic roadside really free?", a: "Yes. Basic roadside assistance is included in every DS360 dealer plan at no additional charge. There are no per-use fees, no per-client fees, and no activation costs. DS360 covers it entirely." },
                { q: "Can I resell basic roadside to my clients?", a: "No. Basic roadside is a complimentary benefit only — it cannot be charged to the client. If you want to sell roadside protection as an F&I product, Titanium Roadside & Travel is the resellable option." },
                { q: "How do I activate it for a client?", a: "Activation happens in the DS360 dealer portal at the time of sale. Your team links the roadside benefit to the client's VIN — one step during the delivery process. The client receives confirmation automatically." },
                { q: "What happens if the client is outside 50KM?", a: "Basic roadside covers a 50KM radius from your dealership. If the client is outside that zone, they would need Titanium Roadside & Travel for extended coverage. This is also a natural upsell opportunity at the point of sale — offer basic free, then present Titanium for full-trip coverage." },
                { q: "What is the difference between this and Titanium?", a: "Basic is a free service — 50KM, towing only, complimentary. Titanium is a premium product — 160KM+, trip interruption, emergency lodging and meals, vehicle return, and co-branded with your dealership. Basic is a gift. Titanium is a revenue-generating F&I product your dealership sells." },
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

      {/* 10. BOTTOM CTA */}
      <section className="bcta">
        <div className="wrap">
          <h2>Give Every Client Peace of Mind — At Zero Cost to You.</h2>
          <p>Basic roadside assistance is included in every DS360 plan. Start using it as a closing tool today.</p>
          <div className="bcta-btns">
            <a href="/contact" className="btn btn-lg btn-green">Get Started →</a>
            <a href="/products/roadside-travel-protection" className="btn btn-lg btn-white">Explore Titanium</a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
