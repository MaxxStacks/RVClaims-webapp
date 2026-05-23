export default function WorkByDealer() {
  return (
    <div className="page active">
      <div className="pn" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: 16 }}>
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Work by Dealer</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>View all open claims and outstanding work items grouped by dealer. Filter by status, claim type, or date to prioritize your processing queue across the dealer network.</div>
        <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20, border: '1px solid #fcd34d' }}>Coming Soon — V6 Feature</span>
      </div>
    </div>
  );
}
