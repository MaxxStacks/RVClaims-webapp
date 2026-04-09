import { useState, useEffect } from "react";
import { PageLayout } from "@/components/page-layout";

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is On-Site Repairs included in my DS360 plan?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The On-Site Repairs workflow — client photo submission, dispatch tracking, and invoicing — is included in every DS360 dealer plan. You provide the mobile unit and the technician. DS360 provides the system to manage it.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a dedicated mobile service truck?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "DS360 does not require a specific vehicle type. A service van, pickup with a utility bed, or any vehicle that carries tools and parts works. The platform manages the workflow — what you drive is your choice.",
      },
    },
    {
      "@type": "Question",
      name: "Can I bill warranty work done on-site?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "On-Site Repairs is primarily a client-paid service offering. If the issue is covered under warranty, it would follow the standard DS360 claims workflow. The on-site service call itself — dispatch, travel, convenience — is typically billed to the client separately.",
      },
    },
    {
      "@type": "Question",
      name: "How does photo diagnosis work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The client submits photos of the issue through the DS360 Client Portal or mobile app — the damaged component, the location, the surrounding area. Your team reviews the photos, determines what parts and tools are needed, and dispatches prepared. No surprise when the tech arrives.",
      },
    },
    {
      "@type": "Question",
      name: "Does this work with TechFlow?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. If TechFlow is active on your plan, mobile repair labor is tracked exactly like shop labor. Work orders are created, hours are logged, and everything syncs to the invoice. Same system, different location.",
      },
    },
  ],
};

export default function OnSiteRepairs() {
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
      seoTitle="On-Site Repairs — Mobile RV Service & Revenue"
      seoDescription="Deploy mobile repair units to client locations — roadside emergencies and campsite convenience calls. A net-new revenue stream powered by DS360's photo-first dispatch workflow."
      schema={schema}
    >
      {/* 1. HERO */}
      <section className="phero">
        <div className="wrap">
          <div className="phero-grid">
            <div className="phero-text">
              <div><a href="/services" style={{fontSize:'.82rem',color:'var(--muted)'}}>← All Services</a></div>
              <div><div className="badge">DS360 Service · Included in All Plans</div></div>
              <h1>Your Service Bay Has Four Walls.<span className="gradient">Your Revenue Doesn't Have To.</span></h1>
              <p className="phero-desc">On-Site Repairs turns your dealership into a mobile service operation. Deploy repair units to client locations — roadside emergencies, campsite convenience calls, or seasonal pre-trip inspections. Clients submit photos through the DS360 app before your team arrives so the right parts are already on the truck. Every call is billable. Every hour is tracked.</p>
              <div className="phero-btns">
                <a href="/contact" className="btn btn-lg btn-primary">Get Started</a>
                <a href="#how-it-works" className="btn btn-lg btn-outline">How It Works</a>
              </div>
              <div className="phero-stats">
                <div className="phero-stat"><div className="phero-stat-val">New</div><div className="phero-stat-label">Revenue Stream</div></div>
                <div className="phero-stat"><div className="phero-stat-val">Photo</div><div className="phero-stat-label">Pre-Dispatch Diagnosis</div></div>
                <div className="phero-stat"><div className="phero-stat-val">100%</div><div className="phero-stat-label">Billable Service Calls</div></div>
              </div>
            </div>
            <div className="phero-img">
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=584&h=438&fm=webp&q=75" alt="On-site mobile repairs" width="584" height="438" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. METRIC BAR */}
      <section className="sec-g" style={{padding:'2.5rem 0'}}>
        <div className="wrap">
          <div className="metric-bar">
            <div className="metric-item"><div className="metric-num">Off-Lot</div><div className="metric-label">Revenue Generation</div></div>
            <div className="metric-item"><div className="metric-num">Photo</div><div className="metric-label">Diagnosis Before Dispatch</div></div>
            <div className="metric-item"><div className="metric-num">DS360</div><div className="metric-label">Tracked &amp; Invoiced</div></div>
            <div className="metric-item"><div className="metric-num">Mobile</div><div className="metric-label">App Integration</div></div>
          </div>
        </div>
      </section>

      {/* 3. THE OPPORTUNITY */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">The Opportunity</div>
              <h2>Revenue That Happens Beyond Your Shop Floor</h2>
              <p>Most RV dealers only bill for work performed inside their service bay. But your clients are everywhere — on the road, at campgrounds, at storage lots, at their driveways. When something breaks, they either call you and wait, or they call someone else. On-Site Repairs gives you the ability to go to them.</p>
              <p>This is not warranty work being done off-site. This is a net-new, client-paid service offering that generates revenue from labor and parts on every call — work your dealership would otherwise never see.</p>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="RV in landscape" width="576" height="432" loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="sec-g" id="how-it-works">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">How It Works</div>
            <h2>From Client Call to Completed Repair</h2>
            <p>Four steps. Photo-first diagnosis means your team arrives prepared.</p>
          </div>
          <div className="hstages anim">
            <div className="hstage">
              <div className="hstage-num">1</div>
              <h4>Client Submits Request</h4>
              <p>Client contacts your dealership or submits a service request through the DS360 Client Portal with photos of the issue and their location.</p>
              <div className="hstage-arrow">→</div>
            </div>
            <div className="hstage">
              <div className="hstage-num">2</div>
              <h4>Photo Diagnosis</h4>
              <p>Your team reviews the photos, identifies the issue, determines what parts and tools are needed, and stages them on the truck before dispatch.</p>
              <div className="hstage-arrow">→</div>
            </div>
            <div className="hstage">
              <div className="hstage-num">3</div>
              <h4>Mobile Dispatch</h4>
              <p>Your technician arrives with the right parts already loaded. No wasted trip. No return visit. The repair starts immediately on arrival.</p>
              <div className="hstage-arrow">→</div>
            </div>
            <div className="hstage">
              <div className="hstage-num">4</div>
              <h4>Repair &amp; Invoice</h4>
              <p>Work is completed on-site. Labor hours and parts are tracked in DS360. The invoice is generated automatically — ready for client payment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STATEMENT */}
      <section className="sec-w" style={{padding:'3.5rem 0'}}>
        <div className="wrap">
          <div className="bst"><div className="bst-line"></div><p>"When your client's RV breaks down at a campsite, the dealership that sends a truck is the dealership that earns a client for life."</p></div>
        </div>
      </section>

      {/* 6. USE CASES */}
      <section className="sec-g">
        <div className="wrap">
          <div className="sec-head">
            <h2>Where On-Site Repairs Creates Revenue</h2>
            <p>Four real scenarios where mobile service calls turn into billable work your shop would never see otherwise.</p>
          </div>
          <div className="cases anim">
            <div className="case">
              <div className="case-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              <h4>Roadside Emergency</h4>
              <p>Slide-out failure, water leak, electrical issue on the road. Client submits photos. Your team diagnoses remotely, loads the right parts, and dispatches. The repair is billable from the moment the truck rolls.</p>
            </div>
            <div className="case">
              <div className="case-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <h4>Campsite Convenience</h4>
              <p>A client's awning jams at the campground. Their water heater stops working mid-trip. Minor issues that ruin a vacation. You send a tech. They fix it on-site. Client stays happy. You bill the call.</p>
            </div>
            <div className="case">
              <div className="case-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              </div>
              <h4>Storage Lot Service</h4>
              <p>Client's unit is in winter storage. Roof seal needs replacement before the season. Battery maintenance. Pre-trip inspection. You send a tech to the storage lot — the client never has to move the unit.</p>
            </div>
            <div className="case">
              <div className="case-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h4>Seasonal Pre-Trip Inspections</h4>
              <p>Spring is coming. Your client wants their unit checked before the first trip. You offer a mobile pre-trip inspection at their home. If issues are found, the repair happens on the spot or is scheduled at the shop.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TECHFLOW CROSS-SELL */}
      <section className="sec-w" style={{padding:'2.5rem 0'}}>
        <div className="wrap">
          <div className="bcs">
            <div className="bcs-dot"></div>
            <div className="bcs-text"><strong>TechFlow</strong> tracks mobile repair labor the same way it tracks shop labor — every on-site hour is documented and synced to the invoice.</div>
            <a href="/services/techflow">Add TechFlow →</a>
          </div>
        </div>
      </section>

      {/* 8. WHY DS360 */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split split-rev anim">
            <div className="split-text">
              <div className="badge">Why DS360</div>
              <h2>Photo-First Dispatch Changes Everything</h2>
              <p>The biggest cost of a mobile service call is showing up unprepared. Wrong parts. Wrong tools. A return trip. DS360's photo-first workflow eliminates this. The client submits photos through the app before you dispatch. Your team diagnoses remotely, stages the right parts, and sends the truck knowing exactly what they are walking into.</p>
              <div className="checks">
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Remote Photo Diagnosis</h3><p>Client photos submitted through the DS360 app before dispatch</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Pre-Staged Parts</h3><p>The right parts are on the truck before it leaves the lot</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Tracked in DS360</h3><p>Every mobile call tracked, invoiced, and documented in the dealer portal</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>No Return Trips</h3><p>First-visit resolution rate goes up when the technician arrives prepared</p></div></div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="DS360 mobile dispatch" width="576" height="432" loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. DYK */}
      <section className="sec-g">
        <div className="wrap">
          <div className="dyk anim">
            <div className="dyk-tag">Did You Know<span style={{color:'#033280'}}>?</span></div>
            <p>RV dealers who offer mobile service calls report <strong>30% to 45% higher client retention rates</strong> compared to shop-only operations. The convenience factor alone — coming to the client instead of making them bring a 35-foot vehicle to you — turns a one-time buyer into a repeat client for maintenance, upgrades, and their next unit purchase.</p>
          </div>
        </div>
      </section>

      {/* 10. STATS */}
      <section className="sec-w">
        <div className="wrap">
          <div className="grid-3 anim">
            <div className="stat-card"><div className="stat-val">New</div><div className="stat-title">Revenue Stream</div><p className="stat-desc">Billable service calls from locations your shop could never reach</p></div>
            <div className="stat-card"><div className="stat-val">45%</div><div className="stat-title">Higher Retention</div><p className="stat-desc">Mobile service dealers see significantly higher client return rates</p></div>
            <div className="stat-card"><div className="stat-val">Photo</div><div className="stat-title">First Diagnosis</div><p className="stat-desc">Know the problem before the truck rolls — right parts, first visit</p></div>
          </div>
        </div>
      </section>

      {/* 11. CONNECTED SERVICES */}
      <section className="sec-g">
        <div className="wrap">
          <div className="sec-head">
            <h2>Connected Services</h2>
            <p>On-Site Repairs is included in every DS360 dealer plan. These services connect directly to the mobile workflow.</p>
          </div>
          <div className="grid-2 anim">
            <a href="/services/parts-components" className="link-card"><div><h4>Parts &amp; Components</h4><p>Pre-stage parts on the truck using the DS360 supplier network</p></div><span className="link-arrow">→</span></a>
            <a href="/services/techflow" className="link-card"><div><h4>TechFlow</h4><p>Mobile labor hours tracked and synced to invoices</p></div><span className="link-arrow">→</span></a>
            <a href="/services/roadside-assistance" className="link-card"><div><h4>Roadside Assistance</h4><p>When towing is needed before the repair, DS360 coordinates both</p></div><span className="link-arrow">→</span></a>
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
              <h2 style={{fontSize:'clamp(1.5rem,3.5vw,2rem)',fontWeight:700,marginTop:'.75rem',lineHeight:1.2}}>On-Site Repairs<br/>Questions</h2>
              <p style={{fontSize:'1rem',color:'var(--muted)',lineHeight:1.7,marginTop:'1rem'}}>What you need to know about adding mobile service to your operation.</p>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'1.5rem'}}>Contact Us →</a>
            </div>
            <div className="faq-right">
              {[
                { q: "Is On-Site Repairs included in my DS360 plan?", a: "Yes. The On-Site Repairs workflow — client photo submission, dispatch tracking, and invoicing — is included in every DS360 dealer plan. You provide the mobile unit and the technician. DS360 provides the system to manage it." },
                { q: "Do I need a dedicated mobile service truck?", a: "DS360 does not require a specific vehicle type. A service van, pickup with a utility bed, or any vehicle that carries tools and parts works. The platform manages the workflow — what you drive is your choice." },
                { q: "Can I bill warranty work done on-site?", a: "On-Site Repairs is primarily a client-paid service offering. If the issue is covered under warranty, it would follow the standard DS360 claims workflow. The on-site service call itself — dispatch, travel, convenience — is typically billed to the client separately." },
                { q: "How does photo diagnosis work?", a: "The client submits photos of the issue through the DS360 Client Portal or mobile app — the damaged component, the location, the surrounding area. Your team reviews the photos, determines what parts and tools are needed, and dispatches prepared. No surprise when the tech arrives." },
                { q: "Does this work with TechFlow?", a: "Yes. If TechFlow is active on your plan, mobile repair labor is tracked exactly like shop labor. Work orders are created, hours are logged, and everything syncs to the invoice. Same system, different location." },
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
          <h2>Take Your Service Department on the Road.</h2>
          <p>See how On-Site Repairs creates a new revenue stream from locations your shop could never reach.</p>
          <div className="bcta-btns">
            <a href="/contact" className="btn btn-lg btn-green">Book a Demo →</a>
            <a href="/services" className="btn btn-lg btn-white">View All Services</a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
