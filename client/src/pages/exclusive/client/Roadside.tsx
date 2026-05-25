import { useState } from 'react';

export default function Roadside() {
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800); };
  return (
    <div className="page active">
      <div style={{textAlign: 'center', padding: '60px 20px'}}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5" style={{marginBottom: 16}}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81"/></svg>
        <div style={{fontSize: 20, fontWeight: 700, color: '#333', marginBottom: 8}}>Roadside Assistance</div>
        <div style={{fontSize: 14, color: '#888', maxWidth: 400, margin: '0 auto', lineHeight: '1.6'}}>24/7 emergency roadside assistance is coming soon. Get help with towing, tire changes, lockouts, and more — anywhere you travel.</div>
        <div style={{marginTop: 24}}><button className="btn btn-o" onClick={() => showToast('Roadside assistance coming in v2.3')}>Notify Me When Available</button></div>
      {toast && <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1e293b',color:'#fff',padding:'10px 20px',borderRadius:8,fontSize:13,zIndex:9999,boxShadow:'0 4px 12px rgba(0,0,0,.2)'}}>{toast}</div>}
      </div>
    </div>
  );
}
