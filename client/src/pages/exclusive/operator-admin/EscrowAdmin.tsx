export default function EscrowAdmin() {
  return (
    <div className="page active">
      <div className="pn" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: 20 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Escrow Admin</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 28 }}>
          Manage escrow holds for marketplace auction transactions. Review active holds, release funds upon unit delivery
          confirmation, handle buyer/seller disputes, and generate settlement reports. Operator-controlled Stripe escrow
          flow with automatic commission collection.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340, margin: '0 auto', marginBottom: 28 }}>
          {[
            ['$500 deposit holds on all deals', 'Auto-authorized via Stripe on bid acceptance'],
            ['Capture on delivery confirmation', 'Release or capture with one click per transaction'],
            ['Dispute management workflow', 'Structured resolution for buyer/seller disputes'],
            ['$250 commission auto-charged', 'Collected from seller on completed transactions'],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}><polyline points="20 6 9 17 4 12"/></svg>
              <div><div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{title}</div><div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{desc}</div></div>
            </div>
          ))}
        </div>
        <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 20, border: '1px solid #ddd6fe' }}>
          Launching with Marketplace — Q3 2026
        </span>
      </div>
    </div>
  );
}
