export default function MyServices() {
  return (
    <div className="page active">
      <div className="pn" style={{padding: '48px 32px', textAlign: 'center', maxWidth: 520, margin: '0 auto'}}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{marginBottom: 16}}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
        <div style={{fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8}}>My Services</div>
        <div style={{fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 24}}>View all active services on your account — warranty coverage, protection plans, financing, roadside assist, and any add-ons your dealer has activated for your RV.</div>
        <span style={{background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20, border: '1px solid #fcd34d'}}>Coming Soon — V6 Feature</span>
      </div>
    </div>
  );
}
