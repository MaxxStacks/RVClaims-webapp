import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function WonUnits() {
  const [wonUnits, setWonUnits] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/api/auctions/my-bids?won=true').then(d => setWonUnits(d.bids || [])).catch(() => {});
  }, []);

  if (wonUnits.length === 0) {
    return (
      <div className="page active">
        <div className="pn" style={{padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13}}>
          No won units yet. All won units from past auctions will appear here with payment status and documentation.
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      {wonUnits.map(w => {
        const isPaid = w.paymentStatus === 'paid' || w.paid;
        const isDue  = !isPaid;
        return (
          <div key={w.id} className="pn" style={{marginBottom: 16, borderColor: isPaid ? undefined : '#fde68a'}}>
            <div style={{padding: '12px 20px', background: isPaid ? '#f0fdf4' : '#fffbeb', borderBottom: `1px solid ${isPaid ? '#bbf7d0' : '#fde68a'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <span className={`bg ${isPaid ? 'active' : 'pending'}`} style={{marginRight: 8}}>{isPaid ? 'Paid' : 'Payment Due'}</span>
                <span style={{fontSize: 14, fontWeight: 700}}>{w.unitDescription || w.unit?.description || '—'}</span>
              </div>
              <span style={{fontSize: 13, color: isPaid ? '#888' : '#dc2626', fontWeight: isDue ? 600 : undefined}}>{w.auctionCode || w.auctionId}</span>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 0}}>
              <div>
                <div className="cd-row"><span className="cd-label">Auction</span><span className="cd-value">{w.auctionName || w.auctionCode || '—'}</span></div>
                <div className="cd-row"><span className="cd-label">Winning Bid</span><span className="cd-value" style={{fontWeight: 700, color: 'var(--brand)'}}>{w.bidAmount ? `$${Number(w.bidAmount).toLocaleString()}` : '—'}</span></div>
                <div className="cd-row"><span className="cd-label">$250 Hold</span><span className="cd-value" style={{color: isPaid ? '#22c55e' : undefined}}>{isPaid ? 'Applied to purchase' : 'Will be applied'}</span></div>
                {isPaid && <div className="cd-row"><span className="cd-label">Unit Transfer</span><span className="cd-value"><span className="bg active">Complete</span></span></div>}
                {isDue && <div className="cd-row"><span className="cd-label">Payment Window</span><span className="cd-value" style={{color: '#dc2626', fontWeight: 600}}>72 hours from auction close</span></div>}
              </div>
              <div style={{padding: 16, borderLeft: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 8}}>
                {isPaid ? (
                  <>
                    <button className="btn btn-o btn-sm" style={{justifyContent: 'center'}}>View Documents</button>
                    <button className="btn btn-o btn-sm" style={{justifyContent: 'center'}}>Download Receipt</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-s btn-sm" style={{justifyContent: 'center'}} onClick={() => alert('Complete Payment — coming soon')}>Complete Payment</button>
                    <button className="btn btn-o btn-sm" style={{justifyContent: 'center'}} onClick={() => alert('Financing application coming soon.')}>Apply for Financing</button>
                  </>
                )}
              </div>
            </div>
            {isDue && <div style={{padding: '10px 20px', background: '#fff7ed', borderTop: '1px solid #fed7aa', fontSize: 12, color: '#9a3412'}}>⚠ If payment is not received within 72 hours, the unit will be offered to the second-highest bidder and your $250 hold will be forfeited.</div>}
          </div>
        );
      })}
    </div>
  );
}
