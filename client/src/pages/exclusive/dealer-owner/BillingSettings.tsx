import { useState } from 'react';

export default function BillingSettings() {
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800); };
  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24}}>
        <div className="pn" style={{padding: 24, border: '2px solid #033280'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16}}>
            <div><div style={{fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1}}>Current Plan</div><div style={{fontSize: 20, fontWeight: 700, color: '#033280'}}>Plan A — Subscription</div></div>
            <span className="bg active">Active</span>
          </div>
          <div style={{fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 20}}>Monthly recurring. Up to 50 claims/month, dedicated operator, priority support.</div>
          <div style={{display: 'flex', gap: 24, marginBottom: 20}}>
            <div><div style={{fontSize: 11, color: '#888'}}>Monthly Fee</div><div style={{fontSize: 22, fontWeight: 700, color: '#1a1a2e'}}>$299<span style={{fontSize: 13, fontWeight: 400, color: '#888'}}>/mo</span></div></div>
            <div><div style={{fontSize: 11, color: '#888'}}>Per-Claim Fee</div><div style={{fontSize: 22, fontWeight: 700, color: '#1a1a2e'}}>$35</div></div>
            <div><div style={{fontSize: 11, color: '#888'}}>Next Billing</div><div style={{fontSize: 15, fontWeight: 600, color: '#1a1a2e'}}>May 1, 2026</div></div>
          </div>
          <div style={{display: 'flex', gap: 8}}><button className="btn" style={{fontSize: 12}} onClick={() => showToast('Coming in v2.2')}>Manage Card</button><button className="btn" style={{fontSize: 12, color: '#ef4444', borderColor: '#ef4444'}} onClick={() => showToast('Contact your operator to cancel')}>Cancel Plan</button></div>
        </div>
        <div className="pn" style={{padding: 24}}>
          <div style={{fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1}}>Alternate Plan</div>
          <div style={{fontSize: 20, fontWeight: 700, color: '#333', marginBottom: 12}}>Plan B — Pre-Funded Wallet</div>
          <div style={{fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 20}}>No monthly fee. Lower per-claim rates. Load balance and fees auto-deduct per claim processed.</div>
          <div style={{display: 'flex', gap: 24, marginBottom: 20}}>
            <div><div style={{fontSize: 11, color: '#888'}}>Monthly Fee</div><div style={{fontSize: 22, fontWeight: 700, color: '#888'}}>$0</div></div>
            <div><div style={{fontSize: 11, color: '#888'}}>Per-Claim Fee</div><div style={{fontSize: 22, fontWeight: 700, color: '#888'}}>$25</div></div>
          </div>
          <button className="btn" style={{fontSize: 12}} onClick={() => showToast('Contact your operator to change plans')}>Switch to Plan B</button>
        </div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Payment Method</span></div>
        <div style={{padding: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
          <div style={{padding: '10px 16px', border: '2px solid #033280', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13}}><svg width="20" height="14" viewBox="0 0 32 22" fill="none"><rect width="32" height="22" rx="3" fill="#1a1f71"/><rect y="5" width="32" height="6" fill="#f7a600"/></svg>Visa ending 4242 &nbsp;<span style={{color: '#22c55e', fontSize: 11, fontWeight: 600}}>Primary</span></div>
          <button className="btn" style={{fontSize: 12}} onClick={() => showToast('Coming in v2.2')}>Update Card</button>
          <button className="btn" style={{fontSize: 12}} onClick={() => showToast('Interac e-Transfer setup coming in v2.2')}>Add Interac e-Transfer</button>
        </div>
      </div>
      {toast && <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1e293b',color:'#fff',padding:'10px 20px',borderRadius:8,fontSize:13,zIndex:9999,boxShadow:'0 4px 12px rgba(0,0,0,.2)'}}>{toast}</div>}
    </div>
  );
}
