import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function MyBids() {
  const [bidsTab, setBidsTab] = useState<'active'|'history'>('history');
  const [myBids, setMyBids]   = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/api/auctions/my-bids').then(d => setMyBids(d.bids || [])).catch(() => {});
  }, []);

  return (
    <div className="page active">
      <div className="tabs" style={{marginBottom: 0}}>
        <div className={`tab ${bidsTab === 'active' ? 'active' : ''}`} onClick={() => setBidsTab('active')}>Active (0)</div>
        <div className={`tab ${bidsTab === 'history' ? 'active' : ''}`} onClick={() => setBidsTab('history')}>Bid History ({myBids.length || 2})</div>
      </div>
      <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
        {bidsTab === 'active' && (
          <div style={{padding: '40px 20px', textAlign: 'center', color: '#888'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{marginBottom: 8, opacity: 0.3}}><path d="M14 2l-2 2-7 7 3 3 7-7 2-2-3-3z"/></svg>
            <div style={{fontSize: 14}}>No active bids — the auction is not currently live.</div>
            <div style={{fontSize: 12, marginTop: 4}}>Next auction: May 8, 2026 at 12:00 PM EDT</div>
          </div>
        )}
        {bidsTab === 'history' && (
          <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Your Bid</th><th>Final Price</th><th>Result</th><th>Date</th></tr></thead><tbody>
            {myBids.length === 0
              ? <tr><td colSpan={6} style={{textAlign: 'center', color: '#888', padding: 20}}>No bid history</td></tr>
              : myBids.map(b => {
                const won = b.result === 'won' || b.won;
                return (
                  <tr key={b.id}>
                    <td style={{fontWeight: 500, color: 'var(--brand)'}}>{b.auctionCode || b.auctionId}</td>
                    <td>{b.unitDescription || '—'}</td>
                    <td style={{fontWeight: 600}}>{b.bidAmount ? `$${Number(b.bidAmount).toLocaleString()}` : '—'}</td>
                    <td>{b.finalPrice ? `$${Number(b.finalPrice).toLocaleString()}` : '—'}</td>
                    <td>{won ? <span className="bg active">Won</span> : <span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>Outbid</span>}</td>
                    <td>{b.bidDate ? new Date(b.bidDate).toLocaleDateString('en-CA', {month: 'short', day: 'numeric'}) : '—'}</td>
                  </tr>
                );
              })
            }
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}
