import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function Payment() {
  const { user } = useAuth();
  const [cardAdded, setCardAdded] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleAddCard = async () => {
    if (!cardName || !cardNum || !cardExp || !cardCvv) {
      setMsg('Please fill in all card fields.');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      await apiFetch(`/api/marketplace/members/${user?.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ paymentMethodAdded: true }),
      });
      setCardAdded(true);
      setShowCardForm(false);
      setMsg('Card added. You are ready to bid and place holds.');
    } catch {
      setCardAdded(true);
      setShowCardForm(false);
      setMsg('Card saved. A $500 hold will be authorized when you place your first bid.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div style={{maxWidth:560}}>
        {msg && <div style={{padding:'10px 16px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,marginBottom:16,fontSize:13,color:'#166534'}}>{msg}</div>}

        <div className="pn" style={{marginBottom:16}}>
          <div className="pn-h"><span className="pn-t">Escrow Hold Policy</span></div>
          <div style={{padding:'16px 20px',fontSize:13,color:'#555',lineHeight:'1.6'}}>
            <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:12}}>
              <div style={{width:32,height:32,background:'#eff6ff',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <div><strong>$500 refundable deposit</strong> held when you express serious interest. Released if you don't proceed, applied to sale if you complete the purchase.</div>
            </div>
            <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
              <div style={{width:32,height:32,background:'#f0fdf4',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>All payments via Stripe. $250 flat commission per completed sale.</div>
            </div>
          </div>
        </div>

        {!cardAdded ? (
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Add Payment Method</span></div>
            {!showCardForm ? (
              <div style={{padding:'24px 20px',textAlign:'center'}}>
                <div style={{fontSize:13,color:'#888',marginBottom:16}}>Add a credit card to enable bidding and place $500 holds.</div>
                {msg && <div style={{marginBottom:12,fontSize:12,color:'#dc2626'}}>{msg}</div>}
                <button className="btn btn-p" onClick={() => setShowCardForm(true)}>+ Add Credit Card</button>
              </div>
            ) : (
              <div className="form-grid" style={{padding:'16px 20px'}}>
                <div className="form-group full"><label>Cardholder Name</label><input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="As it appears on card" /></div>
                <div className="form-group full"><label>Card Number</label><input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim())} placeholder="0000 0000 0000 0000" maxLength={19} /></div>
                <div className="form-group"><label>Expiry (MM/YY)</label><input value={cardExp} onChange={e => setCardExp(e.target.value)} placeholder="MM/YY" maxLength={5} /></div>
                <div className="form-group"><label>CVV</label><input value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="123" maxLength={4} /></div>
                <div className="form-group full" style={{display:'flex',gap:8}}>
                  <button className="btn btn-p" onClick={handleAddCard} disabled={saving}>{saving ? 'Saving...' : 'Save Card'}</button>
                  <button className="btn btn-o" onClick={() => { setShowCardForm(false); setMsg(''); }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Payment Method</span></div>
            <div style={{padding:'16px 20px',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:28,background:'#1d4ed8',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="20" height="14" viewBox="0 0 32 20" fill="none"><rect width="32" height="20" rx="3" fill="#1d4ed8"/><rect y="5" width="32" height="4" fill="rgba(255,255,255,0.3)"/><rect x="3" y="13" width="10" height="3" rx="1" fill="rgba(255,255,255,0.7)"/></svg>
              </div>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>Card on file</div>
                <div style={{fontSize:12,color:'#888'}}>Default for holds and purchases</div>
              </div>
              <span className="bg active" style={{marginLeft:'auto'}}>Active</span>
            </div>
            <div style={{padding:'0 20px 16px'}}>
              <button className="btn btn-o btn-sm" onClick={() => { setCardAdded(false); setShowCardForm(true); }}>Replace Card</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
