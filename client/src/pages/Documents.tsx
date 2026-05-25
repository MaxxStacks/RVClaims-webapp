import { useState } from 'react';

export default function Documents() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['All', 'Invoices', 'Contracts', 'Reports', 'Correspondence'];
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  return (
    <div className="page active">
      <div style={{marginBottom: 16, display: 'flex', gap: 8}}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} className={`tab${i === activeTab ? ' active' : ''}`}>{t}</button>
        ))}
      </div>
      <div className="pn">
        <div className="tw"><table><thead><tr><th>Document</th><th>Type</th><th>Date</th><th>Size</th><th></th></tr></thead><tbody>
          <tr><td><div style={{display: 'flex', alignItems: 'center', gap: 8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>INV-2026-0042.pdf</strong></div></td><td>Invoice</td><td>Mar 15, 2026</td><td>124 KB</td><td><span className="cid" onClick={() => showToast('Document download coming in v2.2')}>Download</span></td></tr>
          <tr><td><div style={{display: 'flex', alignItems: 'center', gap: 8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>Service-Agreement-2026.pdf</strong></div></td><td>Contract</td><td>Jan 1, 2026</td><td>890 KB</td><td><span className="cid" onClick={() => showToast('Document download coming in v2.2')}>Download</span></td></tr>
          <tr><td><div style={{display: 'flex', alignItems: 'center', gap: 8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>Q1-2026-Claims-Report.xlsx</strong></div></td><td>Report</td><td>Apr 1, 2026</td><td>256 KB</td><td><span className="cid" onClick={() => showToast('Document download coming in v2.2')}>Download</span></td></tr>
        </tbody></table></div>
      </div>
      {toast && <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1e293b',color:'#fff',padding:'10px 20px',borderRadius:8,fontSize:13,zIndex:9999,boxShadow:'0 4px 12px rgba(0,0,0,.2)'}}>{toast}</div>}
    </div>
  );
}
