export default function ConsignmentOversight() {
  return (
    <div className="page active">
      <div className="pn" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: 16 }}>
          <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
        </svg>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Consignment Oversight</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>Monitor all active consignment listings across the dealer network. Review offer activity, payout status, seller disputes, and consignment agreement compliance from a single view.</div>
        <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20, border: '1px solid #fcd34d' }}>Coming Soon — V6 Feature</span>
      </div>
    </div>
  );
}
