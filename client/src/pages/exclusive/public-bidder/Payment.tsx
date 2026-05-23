import { useState } from 'react';

export default function Payment() {
  const [cardAdded, setCardAdded]       = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardName, setCardName]         = useState('');
  const [cardNum, setCardNum]           = useState('');
  const [cardExp, setCardExp]           = useState('');
  const [cardCvv, setCardCvv]           = useState('');

  const handleAddCard = () => {
    if (!cardName || !cardNum || !cardExp || !cardCvv) {
      alert('Please fill in all card fields.');
      return;
    }
    setCardAdded(true);
    setShowCardForm(false);
    alert('Card added successfully. You are ready to bid!');
  };

  return (
    <div className="page active">
      <div style={{maxWidth: 680}}>
        <div className="pn" style={{marginBottom: 16}}>
          <div className="pn-h"><span className="pn-t">How the $250 Bid Hold Works</span></div>
          <div style={{padding: '14px 20px', fontSize: 13, lineHeight: '1.8', color: '#555'}}>
            <div>✓ When you place your <strong>first bid</strong> in any auction, a <strong>$250 hold</strong> is placed on your card.</div>
            <div>✓ The hold is <strong>released automatically</strong> within 5 business days if you don't win.</div>
            <div>✓ If you win, the <strong>$250 is applied</strong> toward your purchase price.</div>
            <div>✓ Only <strong>one hold</strong> per auction event — bidding on multiple units uses the same hold.</div>
            <div style={{marginTop: 8, fontSize: 12, color: '#888'}}>The hold is not a charge. It is a temporary authorization to confirm your card is valid.</div>
          </div>
        </div>

        <div className="pn" style={{marginBottom: 16}}>
          <div className="pn-h"><span className="pn-t">Credit Card on File</span></div>
          <div style={{padding: 20}}>
            {cardAdded ? (
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 12}}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 14, fontWeight: 600}}>Visa ending in ·· {cardNum.slice(-4) || '4242'}</div>
                    <div style={{fontSize: 12, color: '#888'}}>Expires {cardExp || '12/28'} · {cardName || 'Jane Doe'}</div>
                  </div>
                  <span className="bg active">Active</span>
                </div>
                <div style={{display: 'flex', gap: 8}}>
                  <button className="btn btn-o btn-sm" onClick={() => { setCardAdded(false); setShowCardForm(true); }}>Replace Card</button>
                  <button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => { if (confirm('Remove card? You will not be able to bid without a card on file.')) setCardAdded(false); }}>Remove</button>
                </div>
              </div>
            ) : (
              <div>
                {!showCardForm ? (
                  <div style={{textAlign: 'center', padding: '20px 0'}}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{marginBottom: 8}}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <div style={{fontSize: 14, color: '#888', marginBottom: 16}}>No card on file. Add a card to start bidding.</div>
                    <button className="btn btn-p btn-sm" onClick={() => setShowCardForm(true)}>+ Add Credit Card</button>
                  </div>
                ) : (
                  <div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12}}>
                      <div className="form-group full" style={{margin: 0, gridColumn: '1/-1'}}><label>Cardholder Name</label><input placeholder="Jane Smith" value={cardName} onChange={e => setCardName(e.target.value)} /></div>
                      <div className="form-group full" style={{margin: 0, gridColumn: '1/-1'}}><label>Card Number</label><input placeholder="1234 5678 9012 3456" maxLength={19} style={{fontFamily: 'monospace'}} value={cardNum} onChange={e => setCardNum(e.target.value)} /></div>
                      <div className="form-group" style={{margin: 0}}><label>Expiry</label><input placeholder="MM / YY" maxLength={7} style={{fontFamily: 'monospace'}} value={cardExp} onChange={e => setCardExp(e.target.value)} /></div>
                      <div className="form-group" style={{margin: 0}}><label>CVV</label><input placeholder="123" maxLength={4} style={{fontFamily: 'monospace'}} value={cardCvv} onChange={e => setCardCvv(e.target.value)} /></div>
                    </div>
                    <div style={{fontSize: 11, color: '#888', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                      Secured by Stripe · No charge until you win an auction
                    </div>
                    <div style={{display: 'flex', gap: 8}}>
                      <button className="btn btn-s" onClick={handleAddCard}>Save Card</button>
                      <button className="btn btn-o" onClick={() => setShowCardForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="cd-section">
          <div className="cd-section-h">$250 Hold Status</div>
          <div className="cd-row"><span className="cd-label">Current Hold</span><span className="cd-value"><span className="bg" style={{background: '#f3f4f6', color: '#888'}}>None Active</span></span></div>
          <div className="cd-row"><span className="cd-label">Last Auction</span><span className="cd-value" style={{color: '#888'}}>No auctions yet</span></div>
          <div className="cd-row"><span className="cd-label">Holds Released</span><span className="cd-value">0</span></div>
          <div className="cd-row"><span className="cd-label">Applied to Purchase</span><span className="cd-value">$0.00</span></div>
        </div>
      </div>
    </div>
  );
}
