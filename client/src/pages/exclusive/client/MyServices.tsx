export default function MyServices() {
  return (
    <div className="page active">
      <div className="pn" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: 20 }}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
        </svg>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>My Services</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 28 }}>
          View all active services on your account — warranty coverage, protection plans, financing, roadside assistance,
          and any add-ons your dealer has activated for your RV. Manage renewals and coverage details in one place.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340, margin: '0 auto', marginBottom: 28 }}>
          {[
            ['Manufacturer warranty tracking', 'Coverage dates, expiry alerts, and claim history'],
            ['Extended warranty & service plans', 'Aftermarket coverage from your dealer or DS360'],
            ['Protection packages', 'Paint, fabric, and interior protection status'],
            ['Roadside assistance', '24/7 emergency coverage anywhere you travel'],
            ['Financing summary', 'Your loan details, lender contact, and payment schedule'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{title}</div><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{desc}</div></div>
            </div>
          ))}
        </div>
        <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 20, border: '1px solid #ddd6fe' }}>
          Launching with Consumer Services — Q4 2026
        </span>
      </div>
    </div>
  );
}
