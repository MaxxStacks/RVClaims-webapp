import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function MyListings() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    apiFetch<any[]>(`/api/marketplace/listings?sellerId=${user.id}`)
      .then(d => setListings(Array.isArray(d) ? d : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const active = listings.filter(l => l.status === 'active' || l.status === 'listed');
  const offers = listings.reduce((sum: number, l: any) => sum + (l.inquiryCount || l.offerCount || 0), 0);
  const sold = listings.filter(l => l.status === 'sold');

  return (
    <div className="page active">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Listed Units</div><div className="sc-v" style={{color:'#2563eb'}}>{active.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Active Offers</div><div className="sc-v" style={{color:'#f59e0b'}}>{offers}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Sold (YTD)</div><div className="sc-v" style={{color:'#22c55e'}}>{sold.length}</div></div>
      </div>
      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">My Consigned Units</span>
          <button className="btn btn-p" style={{fontSize:12,padding:'6px 14px'}} onClick={() => navigate('/marketplace/consignor/my-listings/new')}>+ List a Unit</button>
        </div>
        {loading && <div style={{padding:32,textAlign:'center',color:'#888'}}>Loading...</div>}
        {!loading && listings.length === 0 && (
          <div style={{padding:'40px 20px',textAlign:'center',color:'#888',fontSize:13}}>
            No listings yet. Click "+ List a Unit" to post your first unit.
          </div>
        )}
        {!loading && listings.length > 0 && (
          <div className="tw"><table><thead><tr><th>Unit</th><th>VIN</th><th>List Price</th><th>Days Listed</th><th>Offers</th><th>Status</th></tr></thead><tbody>
            {listings.map((l: any) => {
              const daysListed = l.createdAt
                ? Math.floor((Date.now() - new Date(l.createdAt).getTime()) / 86400000)
                : '—';
              const offerCount = l.inquiryCount || l.offerCount || 0;
              const price = parseFloat(l.askingPrice || l.dealerPrice || '0');
              const isActive = l.status === 'active' || l.status === 'listed';
              return (
                <tr key={l.id}>
                  <td>{l.title || `${l.year || ''} ${l.manufacturer || ''} ${l.model || ''}`.trim() || '—'}</td>
                  <td style={{fontFamily:'monospace',fontSize:12}}>{l.vin || '—'}</td>
                  <td>{price ? `$${price.toLocaleString()}` : '—'}</td>
                  <td>{daysListed}</td>
                  <td>
                    {offerCount > 0
                      ? <span className="cid" onClick={() => navigate('/marketplace/consignor/offers')}>{offerCount}</span>
                      : 0}
                  </td>
                  <td>
                    <span className={`bg ${isActive ? 'active' : l.status === 'sold' ? 'pay-recv' : 'pending'}`}>
                      {isActive ? 'Listed' : l.status === 'sold' ? 'Sold' : l.status || 'Draft'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}
