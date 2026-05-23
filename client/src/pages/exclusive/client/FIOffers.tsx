import { useLocation } from 'wouter';

export default function FIOffers() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{fontSize: 13, color: '#666', marginBottom: 20}}>Personalized protection offers for your 2024 Jayco Jay Flight. Reviewed and recommended by Smith's RV Centre based on your coverage and usage.</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20}}>
        {[
          {name: 'Extended Warranty', desc: '5 years / 100,000 km bumper-to-bumper coverage after factory warranty expires.', price: '$1,895', highlight: true, badge: 'Recommended'},
          {name: 'GAP Insurance', desc: "Covers the gap between loan balance and actual cash value if your RV is totalled.", price: '$495', highlight: false, badge: null},
          {name: 'Tire & Wheel Protection', desc: 'Covers flat tires, road hazard damage, and rim replacement.', price: '$395', highlight: false, badge: 'Popular'},
        ].map(p => (
          <div key={p.name} className="pn" style={{padding: 20, border: p.highlight ? '2px solid #08235d' : '1px solid #e8e8e8', position: 'relative'}}>
            {p.badge && <div style={{position: 'absolute', top: 12, right: 12, background: p.highlight ? '#08235d' : '#22c55e', color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4}}>{p.badge}</div>}
            <div style={{fontWeight: 700, fontSize: 15, marginBottom: 8}}>{p.name}</div>
            <div style={{fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 16}}>{p.desc}</div>
            <div style={{fontSize: 20, fontWeight: 700, color: '#08235d', marginBottom: 12}}>{p.price}<span style={{fontSize: 12, fontWeight: 400, color: '#888'}}>/one-time</span></div>
            <button className="btn btn-p" style={{width: '100%', fontSize: 13}} onClick={() => navigate('fi-products')}>Learn More</button>
          </div>
        ))}
      </div>
      <div className="pn" style={{padding: 20, background: '#f0f4ff'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#08235d" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          <div>
            <div style={{fontWeight: 600, fontSize: 13}}>AI-Powered Recommendation</div>
            <div style={{fontSize: 12, color: '#555'}}>Based on your unit's age, usage patterns, and manufacturer history, our system recommends adding extended warranty coverage before your factory warranty expires in Feb 2028.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
