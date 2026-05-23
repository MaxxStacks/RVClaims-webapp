import { useLocation } from 'wouter';

export default function WarrantyDetail() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('svc-warranty')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">WP-0041 — Guardsman RV</div><div className="detail-meta">Robert Martin · 2024 Jayco Jay Flight · Comprehensive</div></div>
        <span className="bg active" style={{fontSize: 13, padding: '6px 16px'}}>Active</span>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Coverage Details</span></div>
          <div className="cd-row"><span className="cd-label">Plan</span><span className="cd-value">Comprehensive — 5 Year</span></div>
          <div className="cd-row"><span className="cd-label">Provider</span><span className="cd-value">Guardsman RV</span></div>
          <div className="cd-row"><span className="cd-label">Start Date</span><span className="cd-value">Feb 10, 2026</span></div>
          <div className="cd-row"><span className="cd-label">Expiry</span><span className="cd-value">Feb 10, 2031</span></div>
          <div className="cd-row"><span className="cd-label">Deductible</span><span className="cd-value">$100 per claim</span></div>
          <div className="cd-row"><span className="cd-label">Claims Used</span><span className="cd-value">1 of unlimited</span></div>
          <div style={{padding: '16px 20px', fontSize: 13, color: '#555', lineHeight: 1.6}}><strong>Covered:</strong> Slide mechanisms, electrical systems, appliances, water systems, roof, HVAC, awnings, leveling systems.</div>
        </div>
        <div>
          <div className="cd-section">
            <div className="cd-section-h">Plan Info</div>
            <div className="cd-row"><span className="cd-label">Plan #</span><span className="cd-value">WP-0041</span></div>
            <div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">Robert Martin</span></div>
            <div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{fontFamily: 'monospace', fontSize: 12}}>...4K1</span></div>
            <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg active">Active</span></span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
