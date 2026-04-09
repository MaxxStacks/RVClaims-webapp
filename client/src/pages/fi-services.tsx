import { useState, useEffect } from 'react';
import { PageLayout } from '@/components/page-layout';

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Who issues the products?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DS360 issues every product. Your dealership is the sales channel. The client sees your brand on the certificate, but DS360 is the issuer and manages all claims on the back end."
      }
    },
    {
      "@type": "Question",
      "name": "How do I get paid on product sales?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your dealership earns revenue on every product sold. The revenue model and margin structure are outlined when you onboard. DS360 handles product fulfillment and claims — your dealership retains the sales margin."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to sell all six products?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. You can start with the products that make sense for your market and add more over time. Most dealers start with Extended Warranty and GAP — the two highest-demand products — then expand."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when a client files a claim?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The client submits a claim through the DS360 Client Portal or contacts your dealership. DS360 processes the claim through the same A-Z workflow used for warranty claims — approval, parts, repair, payout. Your dealership can track every claim in the dealer portal."
      }
    },
    {
      "@type": "Question",
      "name": "Can the AI F&I Presenter sell these products for me?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. When the AI F&I Presenter launches in beta Q4 2026, it will walk every credit-approved client through the entire product suite — by name, with personalized pricing based on their unit and financing. Accepted products sync directly to the DS360 portal. No human F&I staff needed."
      }
    }
  ]
};

export default function FIServices() {
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
      seoTitle="F&I Products — Revenue-Generating Protection Products for RV Dealers"
      seoDescription="DS360 issues a complete suite of F&I products your dealership sells to clients — Extended Warranty, GAP Insurance, Appearance Protection, Tire & Wheel, Roadside & Travel, and Specialty Protection. You sell. DS360 manages. Claims flow through the platform."
      canonical="https://dealersuite360.com/fi-services"
      schema={faqSchema}
    >
      {/* HERO */}
      <section className="phero">
        <div className="wrap">
          <div className="phero-grid">
            <div className="phero-text">
              <div><div className="badge">DS360 Products — Dealer Revenue</div></div>
              <h1>We Build the Products.<br/>You Close the Sale.<span className="gradient">We Handle Everything Else.</span></h1>
              <p className="phero-desc">DS360 builds, issues, and manages a complete suite of F&amp;I protection products — and your dealership sells them. You do not need to create products, negotiate with underwriters, or process claims. DS360 does all of that. Your job is one thing: present the products to your client and close the sale. DS360 handles product issuance, co-branding with your dealer name, certificate generation, claims processing, and fulfillment. Your client sees your brand. DS360 does the heavy lifting behind the scenes.</p>
              <div className="phero-btns">
                <a href="/contact" className="btn btn-lg btn-primary">Start Selling Products</a>
                <a href="#products" className="btn btn-lg btn-outline">View the Product Suite</a>
              </div>
              <div className="phero-stats">
                <div className="phero-stat"><div className="phero-stat-val">6</div><div className="phero-stat-label">Protection Products</div></div>
                <div className="phero-stat"><div className="phero-stat-val">100%</div><div className="phero-stat-label">Dealer Revenue Per Sale</div></div>
                <div className="phero-stat"><div className="phero-stat-val">DS360</div><div className="phero-stat-label">Claims Handled for You</div></div>
              </div>
            </div>
            <div className="phero-img">
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=584&h=438&fm=webp&q=75" alt="F&I products" width={584} height={438} />
            </div>
          </div>
        </div>
      </section>

      {/* METRIC BAR */}
      <section className="sec-g" style={{padding:'2.5rem 0'}}>
        <div className="wrap">
          <div className="metric-bar">
            <div className="metric-item"><div className="metric-num">6</div><div className="metric-label">Products in Suite</div></div>
            <div className="metric-item"><div className="metric-num">DS360</div><div className="metric-label">Issued &amp; Managed</div></div>
            <div className="metric-item"><div className="metric-num">Your</div><div className="metric-label">Brand on Every Product</div></div>
            <div className="metric-item"><div className="metric-num">Auto</div><div className="metric-label">Claims Through Platform</div></div>
          </div>
        </div>
      </section>

      {/* SERVICES VS PRODUCTS DISTINCTION */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">Important Distinction</div>
              <h2>DS360 Builds the Products.<br/>Your Dealership Sells Them.</h2>
              <p>DS360 creates, underwrites, and manages every product in the F&amp;I suite. Your dealership does not build these products, does not negotiate with insurance carriers, and does not process claims. DS360 handles all of that — from product design to claims fulfillment.</p>
              <p>Your role is straightforward: present the products to your client at the point of sale. When they say yes, DS360 issues the product under your dealership branding, generates the certificate, and stores everything in the platform. When the client files a claim — months or years later — DS360 processes it through the same A-Z workflow. You earn revenue on every sale. DS360 does the work.</p>
              <a href="/services" className="btn btn-outline" style={{width:'fit-content'}}>View DS360 Services →</a>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Services vs products" width={576} height={432} loading="lazy" />
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
            <p>"Every unit that leaves your lot without an F&amp;I product is revenue your dealership earned the right to collect — but didn't."</p>
          </div>
        </div>
      </section>

      {/* PRODUCT SUITE */}
      <section className="sec-w" id="products">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">The DS360 F&amp;I Suite</div>
            <h2>Six Products. One Platform. Your Brand.</h2>
            <p>Each product below is a standalone, revenue-generating F&amp;I offering your dealership sells to clients. Every product is issued by DS360, co-branded with your dealership, and claims are processed through the DS360 platform. Click any product to learn more.</p>
          </div>
          <div className="products anim">
            <a href="/products/warranty-extended-service" className="prod-card">
              <div className="prod-card-revenue">Revenue per unit sold</div>
              <div className="prod-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div>
              <h3>Extended Warranty</h3>
              <p>Coverage beyond the manufacturer's standard warranty. Protects major systems — drivetrain, electrical, plumbing, appliances, slide-outs. Multiple coverage tiers available. Highest-margin F&amp;I product in the RV industry.</p>
              <div className="prod-link">Learn More →</div>
            </a>
            <a href="/products/gap-insurance" className="prod-card">
              <div className="prod-card-revenue">Revenue per unit sold</div>
              <div className="prod-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
              <h3>GAP Insurance</h3>
              <p>Covers the difference between what insurance pays and what the client owes if the unit is totaled, stolen, or declared a total loss. Protects the client from owing thousands on a unit they no longer have.</p>
              <div className="prod-link">Learn More →</div>
            </a>
            <a href="/products/appearance-protection" className="prod-card">
              <div className="prod-card-revenue">Revenue per unit sold</div>
              <div className="prod-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <h3>Appearance Protection</h3>
              <p>Interior and exterior surface coverage — paint, upholstery, carpet, vinyl, leather, fiberglass against stains, fading, UV damage, and accidental damage. Preserves resale value.</p>
              <div className="prod-link">Learn More →</div>
            </a>
            <a href="/products/tire-wheel-protection" className="prod-card">
              <div className="prod-card-revenue">Revenue per unit sold</div>
              <div className="prod-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg></div>
              <h3>Tire &amp; Wheel Protection</h3>
              <p>Covers repair or replacement from road hazards — blowouts, punctures, sidewall damage, bent or cracked wheels, and curb impact. RV tires are significantly more expensive than passenger vehicle tires.</p>
              <div className="prod-link">Learn More →</div>
            </a>
            <a href="/products/roadside-travel-protection" className="prod-card">
              <div className="prod-card-revenue">Revenue per unit sold</div>
              <div className="prod-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 9H12"/></svg></div>
              <h3>Roadside &amp; Travel Protection</h3>
              <p>Titanium-tier coverage — 160KM+, towing, roadside repair, trip interruption, emergency lodging and meals, vehicle return service. The premium upgrade from the free basic roadside included in all plans.</p>
              <div className="prod-link">Learn More →</div>
            </a>
            <a href="/products/specialty-protection" className="prod-card">
              <div className="prod-card-revenue">Revenue per unit sold</div>
              <div className="prod-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></div>
              <h3>Specialty Protection</h3>
              <p>Coverage for the components unique to RVs that standard warranties ignore — generators, solar systems, slide-outs, leveling systems, awnings, and aftermarket accessories.</p>
              <div className="prod-link">Learn More →</div>
            </a>
          </div>
        </div>
      </section>

      {/* AI F&I CROSS-SELL */}
      <section className="sec-g" style={{padding:'2.5rem 0'}}>
        <div className="wrap">
          <div className="bcs">
            <div className="bcs-dot"></div>
            <div className="bcs-text"><strong>AI F&amp;I Presenter</strong> walks every credit-approved client through this entire product suite — automatically, by name, with personalized pricing. Launching beta Q4 2026.</div>
            <a href="/services/ai-fi-presenter">Learn More →</a>
          </div>
        </div>
      </section>

      {/* PRICING TABLE */}
      <section className="sec-g">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge">Product Pricing</div>
            <h2>Dealer Cost Per Product</h2>
            <p>Your dealership pays DS360 the wholesale cost below. You set the retail price to your client. The margin between wholesale and retail is your revenue to keep.</p>
          </div>
          <div className="price-table anim">
            <div className="price-head">
              <div>Product</div>
              <div>Basic Coverage</div>
              <div>Standard Coverage</div>
              <div>Premium Coverage</div>
            </div>
            <div className="price-row">
              <div className="price-product">
                <div className="price-product-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div>
                <div><div className="price-product-name">Extended Warranty</div><div className="price-product-sub">Drivetrain, electrical, plumbing, appliances</div></div>
              </div>
              <div data-label="Basic: ">$X,XXX</div>
              <div data-label="Standard: ">$X,XXX</div>
              <div data-label="Premium: ">$X,XXX</div>
            </div>
            <div className="price-row">
              <div className="price-product">
                <div className="price-product-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
                <div><div className="price-product-name">GAP Insurance</div><div className="price-product-sub">Covers loan-to-value difference</div></div>
              </div>
              <div data-label="Basic: ">$XXX</div>
              <div data-label="Standard: ">$XXX</div>
              <div data-label="Premium: ">$XXX</div>
            </div>
            <div className="price-row">
              <div className="price-product">
                <div className="price-product-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div><div className="price-product-name">Appearance Protection</div><div className="price-product-sub">Paint, upholstery, vinyl, carpet</div></div>
              </div>
              <div data-label="Basic: ">$XXX</div>
              <div data-label="Standard: ">$XXX</div>
              <div data-label="Premium: ">$XXX</div>
            </div>
            <div className="price-row">
              <div className="price-product">
                <div className="price-product-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg></div>
                <div><div className="price-product-name">Tire &amp; Wheel</div><div className="price-product-sub">Road hazard, blowouts, bent wheels</div></div>
              </div>
              <div data-label="Basic: ">$XXX</div>
              <div data-label="Standard: ">$XXX</div>
              <div data-label="Premium: ">$XXX</div>
            </div>
            <div className="price-row">
              <div className="price-product">
                <div className="price-product-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg></div>
                <div><div className="price-product-name">Roadside &amp; Travel</div><div className="price-product-sub">Titanium — 160KM+, trip interruption</div></div>
              </div>
              <div data-label="Basic: ">$XXX</div>
              <div data-label="Standard: ">$XXX</div>
              <div data-label="Premium: ">$XXX</div>
            </div>
            <div className="price-row">
              <div className="price-product">
                <div className="price-product-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg></div>
                <div><div className="price-product-name">Specialty Protection</div><div className="price-product-sub">Generators, solar, slide-outs, awnings</div></div>
              </div>
              <div data-label="Basic: ">$XXX</div>
              <div data-label="Standard: ">$XXX</div>
              <div data-label="Premium: ">$XXX</div>
            </div>
          </div>
          <p style={{textAlign:'center',fontSize:'.78rem',color:'var(--muted)',marginTop:'1.25rem',maxWidth:'44rem',marginLeft:'auto',marginRight:'auto'}}>Prices shown are dealer wholesale cost. Your dealership sets the retail price. The difference is your margin. Volume-based incentives below can further increase your return per unit.</p>
        </div>
      </section>

      {/* INCENTIVE TIERS */}
      <section className="sec-w">
        <div className="wrap">
          <div className="sec-head">
            <div className="badge" style={{background:'hsl(140,60%,92%)',color:'hsl(140,60%,28%)',borderColor:'hsl(140,50%,80%)'}}>Dealer Incentives</div>
            <h2>Sell More Products Per Unit. Earn More Back.</h2>
            <p>The more F&amp;I products you attach to each unit sold, the higher your cashback reward. This is on top of your retail margin — a bonus from DS360 for bundling protection on every deal.</p>
          </div>
          <div className="incentive">
            <div className="incentive-grid anim">
              <div className="incentive-card">
                <div className="incentive-tier">Tier 1</div>
                <div className="incentive-range">1–2 products per unit</div>
                <div className="incentive-val">X%<span> cashback</span></div>
                <div className="incentive-desc">Base tier. You earn your retail margin on every product sold plus a cashback percentage on your total F&amp;I volume for the period.</div>
              </div>
              <div className="incentive-card incentive-best">
                <div className="incentive-best-tag">Best Value</div>
                <div className="incentive-tier">Tier 2</div>
                <div className="incentive-range">3–4 products per unit</div>
                <div className="incentive-val">X%<span> cashback</span></div>
                <div className="incentive-desc">Mid tier. Higher cashback percentage kicks in when you consistently bundle 3 or more products per unit. The margin increases on your entire volume — not just the extra products.</div>
              </div>
              <div className="incentive-card">
                <div className="incentive-tier">Tier 3</div>
                <div className="incentive-range">5–6 products per unit</div>
                <div className="incentive-val">X%<span> cashback</span></div>
                <div className="incentive-desc">Maximum tier. Full suite attached to every unit. Highest cashback rate across your total volume. Reserved for dealers who present and close the complete DS360 product lineup consistently.</div>
              </div>
            </div>
            <div style={{maxWidth:'52rem',margin:'2rem auto 0',display:'grid',gridTemplateColumns:'4px 1fr',gap:0,borderRadius:'.5rem',overflow:'hidden',border:'1px solid var(--border)',background:'white'}}>
              <div style={{background:'var(--green)'}}></div>
              <div style={{padding:'1rem 1.5rem',fontSize:'.85rem',color:'var(--muted)',lineHeight:1.6}}><strong style={{color:'var(--fg)'}}>Cashback is calculated on total F&amp;I volume</strong> — not per product. When you hit a higher tier, the increased rate applies to your entire volume for that period, including the products that would have qualified at the lower tier. The incentive rewards consistency, not individual sales.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CO-BRANDING */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split split-rev anim">
            <div className="split-text">
              <div className="badge">Your Brand. Our Platform.</div>
              <h2>Every Product Carries Your Dealership Name</h2>
              <p>DS360 Products are not sold under the DS360 brand. They are co-branded with your dealership name, your logo, and your colors. When a client receives their Extended Warranty certificate, they see your dealership — not DS360. When they file a claim, the experience is branded to you. DS360 is invisible to the client.</p>
              <div className="checks">
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Your Logo on Every Certificate</h3><p>Products are issued with your dealership branding — not a third-party name</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Client Portal Branded to You</h3><p>When clients check coverage or file claims, they see your brand in the white-label portal</p></div>
                </div>
                <div className="check">
                  <div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                  <div className="check-info"><h3>Higher Close Rates</h3><p>Clients trust products from the dealership they bought from — not unfamiliar third-party names</p></div>
                </div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Co-branded products" width={576} height={432} loading="lazy" />
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
            <p>Dealers who sell <strong>co-branded F&amp;I products under their own name</strong> see close rates up to 40% higher than those selling third-party plans with unfamiliar names. The client bought their RV from you. They trust you. When the protection product carries your name, the "yes" comes faster.</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="sec-w">
        <div className="wrap">
          <div className="grid-3 anim">
            <div className="stat-card"><div className="stat-val">6</div><div className="stat-title">Products in Suite</div><p className="stat-desc">A complete F&amp;I lineup covering every major protection category</p></div>
            <div className="stat-card"><div className="stat-val">40%</div><div className="stat-title">Higher Close Rates</div><p className="stat-desc">Co-branded products consistently outperform third-party alternatives</p></div>
            <div className="stat-card"><div className="stat-val">100%</div><div className="stat-title">Claims Through DS360</div><p className="stat-desc">Every product claim processed through the same platform you already use</p></div>
          </div>
        </div>
      </section>

      {/* CONNECTED */}
      <section className="sec-g">
        <div className="wrap">
          <div className="sec-head">
            <h2>Connected Platform</h2>
            <p>DS360 Products do not operate in isolation. They are connected to the full DS360 ecosystem.</p>
          </div>
          <div className="grid-2 anim">
            <a href="/services/ai-fi-presenter" className="link-card"><div><h4>AI F&amp;I Presenter</h4><p>Presents every product to every client — automatically, with personalized pricing</p></div><span className="link-arrow">→</span></a>
            <a href="/services/claims-processing" className="link-card"><div><h4>Claims Processing</h4><p>Product claims flow through the same A-Z workflow as warranty claims</p></div><span className="link-arrow">→</span></a>
            <a href="/platform/client-portal" className="link-card"><div><h4>Client Portal</h4><p>Clients view coverage, file claims, and track status through your branded portal</p></div><span className="link-arrow">→</span></a>
            <a href="/services" className="link-card"><div><h4>All Services</h4><p>View the full DS360 service suite that supports these products</p></div><span className="link-arrow">→</span></a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec-w">
        <div className="wrap">
          <div className="faq-layout anim">
            <div className="faq-left">
              <div className="badge">FAQ</div>
              <h2 style={{fontSize:'clamp(1.5rem,3.5vw,2rem)',fontWeight:700,marginTop:'.75rem',lineHeight:1.2}}>F&amp;I Products<br/>Questions</h2>
              <p style={{fontSize:'1rem',color:'var(--muted)',lineHeight:1.7,marginTop:'1rem'}}>What you need to know about selling DS360 products through your dealership.</p>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'1.5rem'}}>Get Started →</a>
            </div>
            <div className="faq-right">
              {[
                {
                  q: 'Who issues the products?',
                  a: 'DS360 issues every product. Your dealership is the sales channel. The client sees your brand on the certificate, but DS360 is the issuer and manages all claims on the back end.'
                },
                {
                  q: 'How do I get paid on product sales?',
                  a: 'Your dealership earns revenue on every product sold. The revenue model and margin structure are outlined when you onboard. DS360 handles product fulfillment and claims — your dealership retains the sales margin.'
                },
                {
                  q: 'Do I need to sell all six products?',
                  a: 'No. You can start with the products that make sense for your market and add more over time. Most dealers start with Extended Warranty and GAP — the two highest-demand products — then expand.'
                },
                {
                  q: 'What happens when a client files a claim?',
                  a: 'The client submits a claim through the DS360 Client Portal or contacts your dealership. DS360 processes the claim through the same A-Z workflow used for warranty claims — approval, parts, repair, payout. Your dealership can track every claim in the dealer portal.'
                },
                {
                  q: 'Can the AI F&I Presenter sell these products for me?',
                  a: 'Yes. When the AI F&I Presenter launches in beta Q4 2026, it will walk every credit-approved client through the entire product suite — by name, with personalized pricing based on their unit and financing. Accepted products sync directly to the DS360 portal. No human F&I staff needed.'
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
          <h2>Start Earning on Every Unit You Sell.</h2>
          <p>Add the DS360 F&amp;I product suite to your dealership and generate revenue on every sale — with claims handled by the same platform you already trust.</p>
          <div className="bcta-btns">
            <a href="/contact" className="btn btn-lg btn-green">Start Selling Products →</a>
            <a href="/services" className="btn btn-lg btn-white">View All Services</a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
