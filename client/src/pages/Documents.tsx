import { useState } from 'react';

export default function Documents() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['All', 'Invoices', 'Contracts', 'Reports', 'Correspondence'];

  return (
    <div className="page active">
      <div style={{marginBottom: 16, display: 'flex', gap: 8}}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} className={`tab${i === activeTab ? ' active' : ''}`}>{t}</button>
        ))}
      </div>
      <div className="pn">
        <div className="tw"><table><thead><tr><th>Document</th><th>Type</th><th>Date</th><th>Size</th><th></th></tr></thead><tbody>
          <tr><td><div style={{display: 'flex', alignItems: 'center', gap: 8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>INV-2026-0042.pdf</strong></div></td><td>Invoice</td><td>Mar 15, 2026</td><td>124 KB</td><td><span className="cid" onClick={() => alert('Download coming soon')}>Download</span></td></tr>
          <tr><td><div style={{display: 'flex', alignItems: 'center', gap: 8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>Service-Agreement-2026.pdf</strong></div></td><td>Contract</td><td>Jan 1, 2026</td><td>890 KB</td><td><span className="cid" onClick={() => alert('Download coming soon')}>Download</span></td></tr>
          <tr><td><div style={{display: 'flex', alignItems: 'center', gap: 8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>Q1-2026-Claims-Report.xlsx</strong></div></td><td>Report</td><td>Apr 1, 2026</td><td>256 KB</td><td><span className="cid" onClick={() => alert('Download coming soon')}>Download</span></td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
