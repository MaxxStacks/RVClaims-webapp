import { useState } from 'react';
import { useLocation } from 'wouter';

export default function MktTransactions() {
  const [, navigate] = useLocation();
  const [txnTab, setTxnTab] = useState<'holds'|'completed'|'cancelled'>('holds');

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Holds</div><div className="sc-v" style={{color: '#d97706'}}>8</div><div style={{fontSize: 12, color: '#888'}}>$4,000 in escrow</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Completed (MTD)</div><div className="sc-v" style={{color: '#22c55e'}}>14</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Commission (MTD)</div><div className="sc-v">$3,500</div><div style={{fontSize: 12, color: '#888'}}>14 × $250</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Commission (YTD)</div><div className="sc-v">$18,750</div></div>
      </div>
      <div className="tabs">
        <div className={`tab ${txnTab === 'holds' ? 'active' : ''}`} onClick={() => setTxnTab('holds')}>Active Holds (8)</div>
        <div className={`tab ${txnTab === 'completed' ? 'active' : ''}`} onClick={() => setTxnTab('completed')}>Completed (14)</div>
        <div className={`tab ${txnTab === 'cancelled' ? 'active' : ''}`} onClick={() => setTxnTab('cancelled')}>Released / Cancelled (3)</div>
      </div>
      <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
        <div style={{display: txnTab === 'holds' ? 'block' : 'none'}}>
          <div className="tw"><table><thead><tr><th>Transaction</th><th>Listing</th><th>Unit</th><th>Buyer</th><th>Seller</th><th>Hold</th><th>Sale Price</th><th>Status</th><th>Action</th></tr></thead><tbody>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => navigate('mkt-transaction-detail')}>TXN-0089</span></td><td>MKT-0281</td><td>2023 Keystone Cougar 29BHS</td><td>Ontario RV Depot</td><td>Atlantic RV</td><td style={{color: '#d97706', fontWeight: 600}}>$500</td><td>$38,500</td><td><span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>Escrow Active</span></td><td><button className="btn btn-o btn-sm" onClick={() => navigate('mkt-transaction-detail')}>Manage</button></td></tr>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0091</td><td>MKT-0260</td><td>2025 Heartland Bighorn</td><td>Maritime RV</td><td>Ontario RV</td><td style={{color: '#d97706', fontWeight: 600}}>$500</td><td>$72,500</td><td><span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>Escrow Active</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
          </tbody></table></div>
        </div>
        <div style={{display: txnTab === 'completed' ? 'block' : 'none'}}>
          <div className="tw"><table><thead><tr><th>Transaction</th><th>Listing</th><th>Unit</th><th>Buyer</th><th>Seller</th><th>Sale Price</th><th>Commission</th><th>Completed</th></tr></thead><tbody>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0085</td><td>MKT-0270</td><td>2023 Jayco Eagle HT</td><td>Maritime RV</td><td>West Coast</td><td>$51,800</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 12</td></tr>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0082</td><td>MKT-0265</td><td>2024 Coachmen Catalina</td><td>BC Camper</td><td>Smith's RV</td><td>$35,900</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 8</td></tr>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0078</td><td>MKT-0252</td><td>2023 Forest River Wildwood</td><td>Valley RV</td><td>Prairie Wind</td><td>$29,800</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 2</td></tr>
          </tbody></table></div>
        </div>
        <div style={{display: txnTab === 'cancelled' ? 'block' : 'none'}}>
          <div className="tw"><table><thead><tr><th>Transaction</th><th>Listing</th><th>Unit</th><th>Buyer</th><th>Reason</th><th>Hold</th><th>Date</th></tr></thead><tbody>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0079</td><td>MKT-0258</td><td>2023 Forest River Wildwood</td><td>Northern Trails</td><td style={{fontSize: 12, color: '#888'}}>Buyer withdrew — found unit locally</td><td style={{color: '#22c55e'}}>$500 refunded</td><td>Mar 5</td></tr>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0071</td><td>MKT-0248</td><td>2023 Keystone Montana</td><td>Ontario RV</td><td style={{fontSize: 12, color: '#888'}}>Undisclosed damage found on inspection</td><td style={{color: '#22c55e'}}>$500 refunded</td><td>Feb 22</td></tr>
          </tbody></table></div>
        </div>
      </div>
    </div>
  );
}
