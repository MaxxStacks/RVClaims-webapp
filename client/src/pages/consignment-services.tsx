import { useState, useEffect } from "react";
import { PageLayout } from "@/components/page-layout";

const schema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does the dealer pay anything to access consignment inventory?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Browsing and purchasing consignment inventory is free for all marketplace members. The $299 listing fee is paid by the client — not the dealer. Dealers earn the finder's fee with zero upfront cost.",
      },
    },
    {
      "@type": "Question",
      name: "How much is the finder's fee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The finder's fee is negotiated between the dealer and the client at the time of consignment. DS360 does not set the fee — the dealer determines their accommodation charge based on the unit value and the effort involved. Typical fees range from $500 to $2,000+.",
      },
    },
    {
      "@type": "Question",
      name: "Can I buy a consigned unit for my own lot?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. As a marketplace member, you can purchase any consigned unit outright — just like buying from the Dealer Exchange. This is useful when you spot a unit that would sell well on your lot or when a walk-in client needs a specific model that happens to be in consignment.",
      },
    },
    {
      "@type": "Question",
      name: "What does the $199 premium placement include?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The $199 premium add-on places the consigned unit in the next monthly Live Auction event. This gives the unit exposure to the general public — not just the dealer network. Featured placement means the listing appears in the top results and is highlighted during the auction event.",
      },
    },
    {
      "@type": "Question",
      name: "Does the client need a DS360 account to consign?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. The client does not need a DS360 dealer account. Consignment listings are initiated through a participating DS360 dealer or directly through DS360. The client pays the $299 listing fee and DS360 manages the listing, communication, and transaction process.",
      },
    },
  ],
};

export default function ConsignmentServices() {
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
      seoTitle="Consignment Services — Revenue From Inventory You Don't Own"
      seoDescription="DS360 Consignment Services — dealers earn on client-sourced inventory without buying, stocking, or financing it. Clients list units for $299 and reach the entire DS360 buyer network."
      schema={schema}
    >
      {/* 1. HERO */}
      <section className="phero">
        <div className="wrap">
          <div className="phero-grid">
            <div className="phero-text">
              <div><a href="/marketplace" style={{fontSize:'.82rem',color:'var(--muted)'}}>← Marketplace</a></div>
              <div><div className="badge">DS360 Marketplace · Channel 3</div></div>
              <h1>Earn on Inventory<span className="gradient">You Don't Own.</span></h1>
              <p className="phero-desc">A client wants to sell their RV. Instead of turning them away, DS360 Consignment lets you list their unit in the dealer network and public auctions. You don't buy it, stock it, or finance it — you earn a finder's fee when it sells. For clients, it is access to the entire DS360 buyer network for a flat $299 listing fee.</p>
              <div className="phero-btns">
                <a href="/contact" className="btn btn-lg btn-primary">Get Started</a>
                <a href="#for-dealers" className="btn btn-lg btn-outline">For Dealers</a>
              </div>
              <div className="phero-stats">
                <div className="phero-stat"><div className="phero-stat-val">$0</div><div className="phero-stat-label">Inventory Investment</div></div>
                <div className="phero-stat"><div className="phero-stat-val">$299</div><div className="phero-stat-label">Client Listing Fee</div></div>
                <div className="phero-stat"><div className="phero-stat-val">Finder's</div><div className="phero-stat-label">Fee Revenue</div></div>
              </div>
            </div>
            <div className="phero-img">
              <img src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=584&h=438&fm=webp&q=75" alt="Consignment" width="584" height="438" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOR DEALERS */}
      <section className="sec-w" id="for-dealers">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">For Dealers</div>
              <h2>Revenue Without the Risk</h2>
              <p>Traditional inventory requires capital — you buy the unit, insure it, finance the floor plan, and hope it sells before carrying costs eat the margin. Consignment flips that model. The client owns the unit. You list it. DS360 manages it. When it sells, you collect a finder's fee on the accommodation sale. Zero investment. Zero floor plan. Zero risk.</p>
              <div className="checks">
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Buy Outright</h3><p>See a consigned unit you want for your lot? Buy it directly from the client at a negotiated price</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Offer Exchange Credit</h3><p>Client consigning a trade-in? Offer a credit toward a new unit on your lot — close the upgrade and the consignment</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Sell for a Finder's Fee</h3><p>List the client's unit in the network, find a buyer, and collect a finder's fee on the accommodation sale — revenue from a unit you never owned</p></div></div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="For dealers" width="576" height="432" loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATEMENT */}
      <section className="sec-g" style={{padding:'3.5rem 0'}}>
        <div className="wrap">
          <div className="bst"><div className="bst-line"></div><p>"The client brought their trade-in. You listed it in the network. It sold in 3 weeks. You earned a finder's fee on a unit that never touched your floor plan."</p></div>
        </div>
      </section>

      {/* 4. FOR CLIENTS */}
      <section className="sec-w">
        <div className="wrap">
          <div className="split split-rev anim">
            <div className="split-text">
              <div className="badge">For Clients</div>
              <h2>Sell Your RV to a Network of Dealers and Buyers — Not Just One</h2>
              <p>Selling an RV privately is slow, risky, and full of tire-kickers. Trading it in to a single dealer means accepting one offer with no leverage. DS360 Consignment puts your unit in front of the entire dealer network — and with the premium add-on, tens of thousands of public auction buyers. More eyes, more competition, better price.</p>
              <div className="checks">
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>$299 Flat Listing Fee</h3><p>One payment gives you access to the full DS360 dealer network — no commissions, no percentage of the sale</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>$199 Premium Auction Placement</h3><p>Optional add-on to feature your unit in the monthly Live Auction event — maximum exposure to public buyers</p></div></div>
                <div className="check"><div className="check-dot"><svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>DS360 Manages Everything</h3><p>Photos, listing, buyer communication, transaction management, and escrow — you list it, DS360 handles the rest</p></div></div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="For clients" width="576" height="432" loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BALANCE SHEET ADVANTAGE */}
      <section className="sec-g">
        <div className="wrap">
          <div className="grid-3 anim">
            <div className="stat-card"><div className="stat-val">$0</div><div className="stat-title">Capital Required</div><p className="stat-desc">You don't buy the unit — the client retains ownership until sale</p></div>
            <div className="stat-card"><div className="stat-val">$0</div><div className="stat-title">Floor Plan Cost</div><p className="stat-desc">No financing, no interest, no carrying cost — it's not your inventory</p></div>
            <div className="stat-card"><div className="stat-val">100%</div><div className="stat-title">Finder's Fee Margin</div><p className="stat-desc">Your accommodation fee is pure margin — no cost of goods</p></div>
          </div>
        </div>
      </section>

      {/* 6. DYK */}
      <section className="sec-w">
        <div className="wrap">
          <div className="dyk anim">
            <div className="dyk-tag">Did You Know<span style={{color:'#033280'}}>?</span></div>
            <p>The average RV dealership <strong>turns away 5 to 10 consignment opportunities per month</strong> because they have no system to manage them. At a finder's fee of $500 to $2,000 per unit, that is $2,500 to $20,000 in monthly revenue that requires zero inventory investment. DS360 Consignment captures that revenue.</p>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS */}
      <section className="sec-g">
        <div className="wrap">
          <div className="split anim">
            <div className="split-text">
              <div className="badge">The Process</div>
              <h2>How a Consignment Unit Moves Through DS360</h2>
              <div className="checks">
                <div className="check"><div className="check-dot" style={{background:'var(--primary)'}}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{width:'.65rem',height:'.65rem'}}><circle cx="12" cy="12" r="4"/></svg></div><div className="check-info"><h3>Client Lists the Unit</h3><p>Client pays the $299 listing fee. DS360 photographs, inspects, and lists the unit in the dealer network with full specs and pricing</p></div></div>
                <div className="check"><div className="check-dot" style={{background:'var(--primary)'}}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{width:'.65rem',height:'.65rem'}}><circle cx="12" cy="12" r="4"/></svg></div><div className="check-info"><h3>Optional: Premium Auction Placement</h3><p>For $199, the unit is featured in the next monthly Live Auction — expanding visibility from the dealer network to the general public</p></div></div>
                <div className="check"><div className="check-dot" style={{background:'var(--primary)'}}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{width:'.65rem',height:'.65rem'}}><circle cx="12" cy="12" r="4"/></svg></div><div className="check-info"><h3>Dealers Browse and Engage</h3><p>DS360 dealers see consignment inventory alongside network listings. They can buy outright, offer an exchange credit, or sell to their own clients</p></div></div>
                <div className="check"><div className="check-dot" style={{background:'var(--green)'}}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{width:'.65rem',height:'.65rem'}}><path d="M5 13l4 4L19 7"/></svg></div><div className="check-info"><h3>Unit Sells — Everyone Earns</h3><p>The client gets their sale price. The dealer collects the finder's fee. DS360 manages the escrow and close. No floor plan. No risk. Pure revenue.</p></div></div>
              </div>
            </div>
            <div className="split-img">
              <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=576&h=432&fm=webp&q=75" alt="Process" width="576" height="432" loading="lazy" />
              <div className="overlay"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONNECTED */}
      <section className="sec-w">
        <div className="wrap">
          <div className="grid-2 anim">
            <a href="/marketplace" className="link-card"><div><h4>Marketplace Overview</h4><p>All three channels — Exchange, Auctions, Consignment</p></div><span className="link-arrow">→</span></a>
            <a href="/marketplace/dealer-exchange" className="link-card"><div><h4>Dealer Exchange</h4><p>The dealer-to-dealer network where consignment units are listed</p></div><span className="link-arrow">→</span></a>
            <a href="/marketplace/live-auctions" className="link-card"><div><h4>Live Auctions</h4><p>Monthly public events — premium consignment placement available</p></div><span className="link-arrow">→</span></a>
            <a href="/pricing" className="link-card"><div><h4>Full Pricing</h4><p>All DS360 services and products</p></div><span className="link-arrow">→</span></a>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="sec-g">
        <div className="wrap">
          <div className="faq-layout anim">
            <div className="faq-left">
              <div className="badge">FAQ</div>
              <h2 style={{fontSize:'clamp(1.5rem,3.5vw,2rem)',fontWeight:700,marginTop:'.75rem',lineHeight:1.2}}>Consignment<br/>Questions</h2>
              <p style={{fontSize:'1rem',color:'var(--muted)',lineHeight:1.7,marginTop:'1rem'}}>For dealers and clients.</p>
              <a href="/contact" className="btn btn-primary" style={{width:'fit-content',marginTop:'1.5rem'}}>Get Started →</a>
            </div>
            <div className="faq-right">
              {[
                { q: "Does the dealer pay anything to access consignment inventory?", a: "No. Browsing and purchasing consignment inventory is free for all marketplace members. The $299 listing fee is paid by the client — not the dealer. Dealers earn the finder's fee with zero upfront cost." },
                { q: "How much is the finder's fee?", a: "The finder's fee is negotiated between the dealer and the client at the time of consignment. DS360 does not set the fee — the dealer determines their accommodation charge based on the unit value and the effort involved. Typical fees range from $500 to $2,000+." },
                { q: "Can I buy a consigned unit for my own lot?", a: "Yes. As a marketplace member, you can purchase any consigned unit outright — just like buying from the Dealer Exchange. This is useful when you spot a unit that would sell well on your lot or when a walk-in client needs a specific model that happens to be in consignment." },
                { q: "What does the $199 premium placement include?", a: "The $199 premium add-on places the consigned unit in the next monthly Live Auction event. This gives the unit exposure to the general public — not just the dealer network. Featured placement means the listing appears in the top results and is highlighted during the auction event." },
                { q: "Does the client need a DS360 account to consign?", a: "No. The client does not need a DS360 dealer account. Consignment listings are initiated through a participating DS360 dealer or directly through DS360. The client pays the $299 listing fee and DS360 manages the listing, communication, and transaction process." },
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
          <h2>Revenue from Units You Never Bought, Stocked, or Financed.</h2>
          <p>DS360 Consignment turns every trade-in conversation into a revenue opportunity — with zero inventory investment.</p>
          <div className="bcta-btns">
            <a href="/contact" className="btn btn-lg btn-green">Get Started →</a>
            <a href="/marketplace" className="btn btn-lg btn-white">View Marketplace</a>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
