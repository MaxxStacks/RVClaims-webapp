export default function PaymentMethods() {
  return (
    <div className="page active">
      <div className="pn" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" style={{ marginBottom: 20 }}>
          <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /><path d="M6 14h4" /><path d="M14 14h4" />
        </svg>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>Payment Methods</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, marginBottom: 28 }}>
          Manage your bidder payment methods — credit cards, bank accounts, and escrow funding sources.
          Set your default method for auction deposits and final sale payments.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto', marginBottom: 28 }}>
          {[
            'Add and manage credit/debit cards',
            'Link a bank account for wire transfers',
            '$500 deposit auto-authorized on bid acceptance',
            'Secure storage via Stripe — PCI compliant',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize: 13, color: '#475569' }}>{item}</span>
            </div>
          ))}
        </div>
        <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 20, border: '1px solid #ddd6fe' }}>
          Launching with Bidder Payments — Q4 2026
        </span>
      </div>
    </div>
  );
}
