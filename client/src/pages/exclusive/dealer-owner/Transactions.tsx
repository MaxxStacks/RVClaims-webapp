import { useState } from 'react';

export default function Transactions() {
  const [txnTab, setTxnTab] = useState<'purchases'|'sales'|'all'>('purchases');

  return (
    <div className="page active">
      <div style={{fontSize: 13, color: '#666', marginBottom: 20}}>Your purchases and sales through the marketplace.</div>
      <div className="tabs">
        <div className={`tab ${txnTab === 'purchases' ? 'active' : ''}`} onClick={() => setTxnTab('purchases')}>Purchases (3)</div>
        <div className={`tab ${txnTab === 'sales' ? 'active' : ''}`} onClick={() => setTxnTab('sales')}>Sales (2)</div>
        <div className={`tab ${txnTab === 'all' ? 'active' : ''}`} onClick={() => setTxnTab('all')}>All</div>
      </div>
      <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
        {(txnTab === 'purchases' || txnTab === 'all') && (
          <div>
            {txnTab === 'all' && <div style={{padding: '10px 20px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: 12, fontWeight: 600, color: '#1e40af'}}>Purchases</div>}
            <div className="tw"><table><thead><tr><th>Transaction</th><th>Unit</th><th>Price</th><th>Hold</th><th>Status</th><th>Date</th></tr></thead><tbody>
              <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0089</td><td>2023 Keystone Cougar 29BHS</td><td>$38,500</td><td style={{color: '#d97706', fontWeight: 600}}>$500 held</td><td><span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>In Progress</span></td><td>Mar 15</td></tr>
              <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0072</td><td>2024 Forest River Salem</td><td>$33,200</td><td style={{color: '#22c55e'}}>Captured</td><td><span className="bg pay-recv">Completed</span></td><td>Feb 20</td></tr>
            </tbody></table></div>
          </div>
        )}
        {(txnTab === 'sales' || txnTab === 'all') && (
          <div>
            {txnTab === 'all' && <div style={{padding: '10px 20px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontSize: 12, fontWeight: 600, color: '#166534'}}>Sales</div>}
            <div className="tw"><table><thead><tr><th>Transaction</th><th>Unit</th><th>Price</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead><tbody>
              <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0085</td><td>2023 Jayco Eagle HT</td><td>$51,800</td><td>$250</td><td><span className="bg pay-recv">Completed</span></td><td>Mar 10</td></tr>
            </tbody></table></div>
          </div>
        )}
      </div>
    </div>
  );
}
