export default function EscrowAdmin() {
  return (
    <div className="page active">
      <div className="pn" style={{ padding: '48px 32px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: 16 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Escrow Admin</div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>Manage escrow holds for auction transactions. Review active holds, release funds upon unit delivery confirmation, handle disputes, and generate settlement reports for buyers and sellers.</div>
        <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20, border: '1px solid #fcd34d' }}>Coming Soon — V6 Feature</span>
      </div>
    </div>
  );
}
