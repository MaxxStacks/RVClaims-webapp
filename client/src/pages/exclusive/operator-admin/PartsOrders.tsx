export default function PartsOrders() {
  return (
    <div className="page active">
      <div className="pn" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: 16 }}>
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Parts Orders</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>Operator-side view of all parts orders submitted across all dealers. Create, approve, and track orders from manufacturer or local suppliers with full audit trail and cost tracking per claim line.</div>
        <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20, border: '1px solid #fcd34d' }}>Coming Soon — V6 Feature</span>
      </div>
    </div>
  );
}
