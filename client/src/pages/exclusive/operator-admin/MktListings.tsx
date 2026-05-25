import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function MktListings() {
  const [, navigate] = useLocation();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingSearch, setListingSearch] = useState('');
  const [listingMfr, setListingMfr] = useState('');
  const [listingType, setListingType] = useState('');
  const [listingStatus, setListingStatus] = useState('');

  useEffect(() => {
    apiFetch<any[]>('/api/marketplace/listings')
      .then(d => setListings(Array.isArray(d) ? d : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const active = listings.filter(l => l.status === 'active' || l.status === 'listed');
  const onHold = listings.filter(l => l.status === 'on_hold' || l.status === 'hold');
  const sold = listings.filter(l => l.status === 'sold' || l.status === 'completed');
  const commissionMtd = sold.length * 250;

  const avgDays = sold.length
    ? Math.round(
        sold.reduce((sum: number, l: any) => {
          if (!l.createdAt || !l.soldAt) return sum + 12;
          return sum + Math.floor((new Date(l.soldAt).getTime() - new Date(l.createdAt).getTime()) / 86400000);
        }, 0) / sold.length
      )
    : 0;

  const filtered = listings.filter(l => {
    const s = listingSearch.toLowerCase();
    const title = `${l.title || ''} ${l.year || ''} ${l.manufacturer || ''} ${l.model || ''}`.toLowerCase();
    const id = (l.id || '').toLowerCase();
    const seller = (l.sellerName || l.seller?.businessName || '').toLowerCase();
    if (s && !title.includes(s) && !id.includes(s) && !seller.includes(s)) return false;
    if (listingMfr && l.manufacturer !== listingMfr) return false;
    if (listingType && l.rvType !== listingType) return false;
    const status = l.status || '';
    if (listingStatus) {
      if (listingStatus === 'Active' && !['active','listed'].includes(status)) return false;
      if (listingStatus === 'On Hold' && !['on_hold','hold'].includes(status)) return false;
      if (listingStatus === 'Sold' && !['sold','completed'].includes(status)) return false;
    }
    return true;
  });

  const fmtStatus = (s: string) => {
    if (s === 'active' || s === 'listed') return { label: 'Active', cls: 'active' };
    if (s === 'on_hold' || s === 'hold') return { label: 'On Hold', cls: '' };
    if (s === 'sold' || s === 'completed') return { label: 'Sold', cls: 'pay-recv' };
    return { label: s || 'Unknown', cls: 'pending' };
  };

  return (
    <div className="page active">
      <div style={{display:'grid',gridTemplateColumns:'repeat(5, 1fr)',gap:16,marginBottom:20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Active</div><div className="sc-v" style={{color:'#2563eb'}}>{active.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>On Hold</div><div className="sc-v" style={{color:'#d97706'}}>{onHold.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Sold (MTD)</div><div className="sc-v" style={{color:'#22c55e'}}>{sold.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Commission (MTD)</div><div className="sc-v">${commissionMtd.toLocaleString()}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Avg Days to Sell</div><div className="sc-v">{avgDays || '—'}</div></div>
      </div>
      <div className="pn">
        <div className="filter-bar">
          <input type="text" placeholder="Search VIN, model, specs..." value={listingSearch} onChange={e => setListingSearch(e.target.value)} />
          <select value={listingMfr} onChange={e => setListingMfr(e.target.value)}><option value="">All Manufacturers</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Grand Design</option><option>Coachmen</option></select>
          <select value={listingType} onChange={e => setListingType(e.target.value)}><option value="">All Types</option><option>Travel Trailer</option><option>Fifth Wheel</option><option>Class A</option><option>Class C</option><option>Toy Hauler</option></select>
          <select value={listingStatus} onChange={e => setListingStatus(e.target.value)}><option value="">All Statuses</option><option>Active</option><option>On Hold</option><option>Sold</option></select>
        </div>
        {loading && <div style={{padding:32,textAlign:'center',color:'#888'}}>Loading...</div>}
        {!loading && (
          <div className="tw"><table><thead><tr><th>Listing</th><th>Unit</th><th>Seller</th><th>Price</th><th>Inquiries</th><th>Status</th><th>Listed</th><th>Action</th></tr></thead><tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{textAlign:'center',color:'#888',padding:20}}>No results match your filters</td></tr>
            ) : filtered.map(l => {
              const { label, cls } = fmtStatus(l.status);
              const price = parseFloat(l.askingPrice || l.dealerPrice || '0');
              const listedDate = l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—';
              return (
                <tr key={l.id}>
                  <td style={{fontWeight:500,color:'var(--brand)'}}><span className="cid" onClick={() => navigate(`/operator/admin/marketplace/listings`)}>{l.id?.slice(0,8).toUpperCase() || '—'}</span></td>
                  <td>{l.title || `${l.year||''} ${l.manufacturer||''} ${l.model||''}`.trim() || '—'}</td>
                  <td style={{fontSize:12,color:'#888'}}>{l.sellerName || l.seller?.businessName || '—'}</td>
                  <td style={{fontWeight:600}}>{price ? `$${price.toLocaleString()}` : '—'}</td>
                  <td>{l.inquiryCount ?? l.inquiries ?? 0}</td>
                  <td>
                    <span className={`bg ${cls}`} style={label === 'On Hold' ? {background:'#fef3c7',color:'#d97706'} : {}}>{label}</span>
                  </td>
                  <td>{listedDate}</td>
                  <td><button className="btn btn-o btn-sm" onClick={() => navigate(`/operator/admin/marketplace/listings`)}>View</button></td>
                </tr>
              );
            })}
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}
