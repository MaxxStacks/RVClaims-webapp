import { useState } from 'react';

export default function Marketplace() {
  const [mktAccess, setMktAccess] = useState<'none'|'pending'|'active'>('none');

  return (
    <div className="page active">
      {mktAccess === 'none' && (
        <div style={{maxWidth: 640, margin: '20px auto'}}>
          <div style={{textAlign: 'center', marginBottom: 24}}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" style={{marginBottom: 12}}>
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <div style={{fontSize: 22, fontWeight: 700, marginBottom: 6}}>Dealer Marketplace</div>
            <div style={{fontSize: 13, color: '#666', lineHeight: '1.6'}}>
              Access our dealer-to-dealer marketplace to browse inventory, list units for sale, and participate in live auctions. Never lose a sale because you don't have the right unit in stock.
            </div>
          </div>
          <div className="pn" style={{marginBottom: 20}}>
            <div className="pn-h"><span className="pn-t">Marketplace Membership — $499/year</span></div>
            <div style={{padding: 20, fontSize: 13, lineHeight: '2'}}>
              <div>✓ Browse all listed units from verified dealers</div>
              <div>✓ List your own units for sale (seller identity hidden)</div>
              <div>✓ Participate in scheduled live auctions</div>
              <div>✓ Place $500 refundable holds to secure units</div>
              <div>✓ Dealer Suite 360 mediates all transactions</div>
              <div>✓ $250 flat commission per completed sale</div>
              <div>✓ Search by specs: slides, bunks, length, weight, price, type</div>
            </div>
          </div>
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Apply for Membership</span></div>
            <div className="form-grid">
              <div className="form-group"><label>Dealership Name</label><input placeholder="Your dealership name" /></div>
              <div className="form-group"><label>Contact Name</label><input placeholder="Full name" /></div>
              <div className="form-group"><label>Email</label><input placeholder="dealer@example.com" /></div>
              <div className="form-group"><label>Phone</label><input placeholder="(555) 000-0000" /></div>
              <div className="form-group"><label>Dealer License #</label><input placeholder="OMVIC / provincial license" /></div>
              <div className="form-group"><label>Province</label><select><option>Select...</option><option>Ontario</option><option>Quebec</option><option>British Columbia</option><option>Alberta</option><option>Manitoba</option><option>Saskatchewan</option><option>Nova Scotia</option><option>New Brunswick</option><option>PEI</option><option>Newfoundland</option></select></div>
              <div className="form-group full"><label>Address</label><input placeholder="Dealership street address" /></div>
              <div className="form-group full"><label>Website</label><input placeholder="https://yourdealership.com" /></div>
              <div className="form-group full"><label>Why do you want to join?</label><textarea placeholder="Tell us about your dealership and how the marketplace would help..." /></div>
            </div>
            <div className="btn-bar">
              <button className="btn btn-s" onClick={() => setMktAccess('pending')}>Submit Application & Pay $499</button>
            </div>
          </div>
        </div>
      )}

      {mktAccess === 'pending' && (
        <div style={{maxWidth: 480, margin: '60px auto', textAlign: 'center'}}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" style={{marginBottom: 12}}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <div style={{fontSize: 22, fontWeight: 700, marginBottom: 8}}>Application Under Review</div>
          <div style={{fontSize: 13, color: '#666', lineHeight: '1.6', marginBottom: 20}}>
            Our team is verifying your dealership information. This typically takes 1-2 business days. You'll receive an email once approved.
          </div>
          <div className="cd-section" style={{textAlign: 'left'}}>
            <div className="cd-section-h">Application Status</div>
            <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg pending">Under Review</span></span></div>
            <div className="cd-row"><span className="cd-label">Submitted</span><span className="cd-value">Today</span></div>
            <div className="cd-row"><span className="cd-label">Payment</span><span className="cd-value" style={{color: '#22c55e'}}>$499 collected</span></div>
            <div className="cd-row"><span className="cd-label">Est. Review</span><span className="cd-value">1-2 business days</span></div>
          </div>
          <button className="btn btn-o btn-sm" style={{marginTop: 16}} onClick={() => setMktAccess('active')}>
            [Dev] Simulate Approval
          </button>
        </div>
      )}

      {mktAccess === 'active' && (
        <div style={{maxWidth: 480, margin: '60px auto', textAlign: 'center'}}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" style={{marginBottom: 12}}>
            <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
          </svg>
          <div style={{fontSize: 22, fontWeight: 700, marginBottom: 8}}>Membership Active</div>
          <div style={{fontSize: 13, color: '#666', lineHeight: '1.6'}}>
            Your marketplace membership is active. Use the navigation to browse listings, post units, or join live auctions.
          </div>
        </div>
      )}
    </div>
  );
}
