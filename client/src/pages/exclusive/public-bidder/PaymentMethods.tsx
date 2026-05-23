export default function PaymentMethods() {
  return (
    <div className="page active">
      <div className="pn" style={{padding: '48px 32px', textAlign: 'center', maxWidth: 520, margin: '0 auto'}}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{marginBottom: 16}}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M6 14h4"/><path d="M14 14h4"/></svg>
        <div style={{fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8}}>Payment Methods</div>
        <div style={{fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 24}}>Manage all payment methods on your bidder account — credit cards, bank accounts, and escrow funding sources. Set your default method for auction deposits and final payments.</div>
        <span style={{background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20, border: '1px solid #fcd34d'}}>Coming Soon — V6 Feature</span>
      </div>
    </div>
  );
}
