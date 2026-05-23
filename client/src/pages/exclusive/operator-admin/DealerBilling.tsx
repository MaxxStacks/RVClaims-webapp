export default function DealerBilling() {
  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <div style={{ borderRight: '1px solid #f0f0f0' }}>
          <div className="cd-section-h" style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600 }}>Subscription</div>
          <div className="cd-row"><span className="cd-label">Plan</span><span className="cd-value" style={{ color: 'var(--brand)', fontWeight: 600 }}>Plan A — Monthly</span></div>
          <div className="cd-row"><span className="cd-label">Monthly Fee</span><span className="cd-value">$349/mo</span></div>
          <div className="cd-row"><span className="cd-label">Billing Cycle</span><span className="cd-value">1st of month</span></div>
          <div className="cd-row"><span className="cd-label">Next Invoice</span><span className="cd-value">Apr 1, 2026</span></div>
          <div className="cd-row"><span className="cd-label">Payment</span><span className="cd-value">Visa ****4242</span></div>
          <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg active">Active</span></span></div>
          <div style={{ padding: '14px 20px' }}>
            <button className="btn btn-o btn-sm" onClick={() => alert('Plan change coming soon')}>Change Plan</button>{' '}
            <button className="btn btn-o btn-sm" style={{ color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => alert('Cancellation requires confirmation')}>Cancel</button>
          </div>
        </div>
        <div>
          <div className="cd-section-h" style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600 }}>Claim Fee Schedule</div>
          <div className="cd-row"><span className="cd-label">Per-Claim Fee</span><span className="cd-value" style={{ fontWeight: 600 }}>10% of approved</span></div>
          <div className="cd-row"><span className="cd-label">Min Fee</span><span className="cd-value">$50</span></div>
          <div className="cd-row"><span className="cd-label">Max Fee Cap</span><span className="cd-value">$500</span></div>
          <div className="cd-row"><span className="cd-label">DAF Fee</span><span className="cd-value">$25/unit</span></div>
          <div className="cd-row"><span className="cd-label">PDI Fee</span><span className="cd-value">$15/unit</span></div>
          <div style={{ padding: '14px 20px' }}>
            <button className="btn btn-o btn-sm" onClick={() => alert('Fee editing coming soon')}>Edit Fees</button>
          </div>
        </div>
      </div>
    </div>
  );
}
