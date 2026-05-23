import { useState } from 'react';

export default function Verification() {
  const [idUploaded, setIdUploaded]     = useState(false);
  const [addrUploaded, setAddrUploaded] = useState(false);

  return (
    <div className="page active">
      <div style={{maxWidth: 680}}>
        <div className={`al`} style={{marginBottom: 20, background: idUploaded ? '#fffbeb' : '#f9fafb', borderColor: idUploaded ? '#fde68a' : '#e5e7eb'}}>
          <div className={`al-i ${idUploaded ? 'pu' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div className="al-c">
            <div className="al-t">{idUploaded ? 'Documents Under Review' : 'Verification Required'}</div>
            <div className="al-d">{idUploaded ? 'Our team will verify your ID within 1 business day.' : 'Upload a government-issued ID to unlock bidding on units over $25,000.'}</div>
          </div>
          {idUploaded && <span className="bg pending" style={{alignSelf: 'center'}}>Pending</span>}
        </div>

        <div className="pn" style={{marginBottom: 16}}>
          <div className="pn-h"><span className="pn-t">Why is this required?</span></div>
          <div style={{padding: '14px 20px', fontSize: 13, color: '#666', lineHeight: '1.7'}}>
            <div>✓ <strong>Bids under $25,000</strong> — card on file is sufficient, ID optional</div>
            <div>✓ <strong>Bids $25,000 and over</strong> — government ID required before bidding</div>
            <div>✓ <strong>Won units</strong> — ID required for all payment processing and vehicle transfer</div>
            <div style={{marginTop: 8, color: '#888', fontSize: 12}}>All documents are handled securely and used only for identity verification purposes.</div>
          </div>
        </div>

        <div className="pn" style={{marginBottom: 16}}>
          <div className="pn-h">
            <span className="pn-t">Government-Issued Photo ID</span>
            {idUploaded && <span className="bg pending">Uploaded</span>}
          </div>
          <div style={{padding: 20}}>
            <div style={{fontSize: 12, color: '#888', marginBottom: 12}}>Driver's licence, passport, or provincial ID card. Must be valid and unexpired.</div>
            {!idUploaded ? (
              <label className="upload-zone" style={{cursor: 'pointer', display: 'block'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 40, height: 40, color: '#ccc', marginBottom: 8}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <div style={{fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 4}}>Upload Photo ID</div>
                <div style={{fontSize: 12, color: '#888'}}>JPG, PNG or PDF · Max 10 MB</div>
                <input type="file" accept="image/*,.pdf" style={{display: 'none'}} onChange={() => setIdUploaded(true)} />
              </label>
            ) : (
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 13, fontWeight: 600, color: '#166534'}}>government_id.jpg</div>
                  <div style={{fontSize: 11, color: '#888'}}>Uploaded · Pending review</div>
                </div>
                <button className="btn btn-o btn-sm" onClick={() => setIdUploaded(false)}>Remove</button>
              </div>
            )}
          </div>
        </div>

        <div className="pn">
          <div className="pn-h">
            <span className="pn-t">Proof of Address</span>
            {addrUploaded && <span className="bg pending">Uploaded</span>}
            <span style={{fontSize: 11, color: '#888', marginLeft: 8}}>Optional</span>
          </div>
          <div style={{padding: 20}}>
            <div style={{fontSize: 12, color: '#888', marginBottom: 12}}>Utility bill, bank statement, or government letter dated within 3 months. Must match your profile address.</div>
            {!addrUploaded ? (
              <label className="upload-zone" style={{cursor: 'pointer', display: 'block'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 40, height: 40, color: '#ccc', marginBottom: 8}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <div style={{fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 4}}>Upload Proof of Address</div>
                <div style={{fontSize: 12, color: '#888'}}>JPG, PNG or PDF · Max 10 MB</div>
                <input type="file" accept="image/*,.pdf" style={{display: 'none'}} onChange={() => setAddrUploaded(true)} />
              </label>
            ) : (
              <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 13, fontWeight: 600, color: '#166534'}}>proof_of_address.pdf</div>
                  <div style={{fontSize: 11, color: '#888'}}>Uploaded · Pending review</div>
                </div>
                <button className="btn btn-o btn-sm" onClick={() => setAddrUploaded(false)}>Remove</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
