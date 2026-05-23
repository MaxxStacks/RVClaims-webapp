import { useState } from 'react';
import { useLocation } from 'wouter';

const listingsData = [
  { id: 'MKT-0284', unit: '2024 Grand Design Imagine 2800BH', specs: "28' · 3 slides · 2 bunks", seller: "Smith's RV", price: '$42,900', inquiries: 3, views: 48, status: 'Active', listed: 'Mar 10', mfr: 'Grand Design', type: 'Travel Trailer' },
  { id: 'MKT-0281', unit: '2023 Keystone Cougar 29BHS', specs: "33' · 2 slides · 2 bunks", seller: 'Atlantic RV', price: '$38,500', inquiries: 5, views: 73, status: 'On Hold', listed: 'Mar 8', mfr: 'Keystone', type: 'Travel Trailer' },
  { id: 'MKT-0276', unit: '2024 Forest River Rockwood 2891BH', specs: "32' · 3 slides · 1 bunk", seller: 'Prairie Wind', price: '$45,200', inquiries: 2, views: 51, status: 'Active', listed: 'Mar 5', mfr: 'Forest River', type: 'Travel Trailer' },
  { id: 'MKT-0270', unit: '2023 Jayco Eagle HT 28.5RSTS', specs: "34' · 3 slides · 0 bunks", seller: 'West Coast', price: '$51,800', inquiries: 1, views: 92, status: 'Sold', listed: 'Feb 28', mfr: 'Jayco', type: 'Fifth Wheel' },
  { id: 'MKT-0265', unit: '2024 Coachmen Catalina 263BHSCK', specs: "28' · 1 slide · 2 bunks", seller: "Smith's RV", price: '$35,900', inquiries: 4, views: 68, status: 'Sold', listed: 'Feb 22', mfr: 'Coachmen', type: 'Travel Trailer' },
  { id: 'MKT-0260', unit: '2025 Heartland Bighorn 3375SS', specs: "38' · 4 slides · 0 bunks", seller: 'Ontario RV', price: '$72,500', inquiries: 2, views: 41, status: 'Active', listed: 'Feb 18', mfr: 'Heartland', type: 'Fifth Wheel' },
];

export default function MktListings() {
  const [, navigate] = useLocation();
  const [listingSearch, setListingSearch] = useState('');
  const [listingMfr, setListingMfr] = useState('');
  const [listingType, setListingType] = useState('');
  const [listingStatus, setListingStatus] = useState('');

  const filteredListings = listingsData.filter(l => {
    const s = listingSearch.toLowerCase();
    if (s && !l.unit.toLowerCase().includes(s) && !l.id.toLowerCase().includes(s) && !l.seller.toLowerCase().includes(s) && !l.specs.toLowerCase().includes(s)) return false;
    if (listingMfr && l.mfr !== listingMfr) return false;
    if (listingType && l.type !== listingType) return false;
    if (listingStatus && l.status !== listingStatus) return false;
    return true;
  });

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active</div><div className="sc-v" style={{color: '#2563eb'}}>142</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>On Hold</div><div className="sc-v" style={{color: '#d97706'}}>8</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Sold (MTD)</div><div className="sc-v" style={{color: '#22c55e'}}>14</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Commission (MTD)</div><div className="sc-v">$3,500</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Avg Days to Sell</div><div className="sc-v">12</div></div>
      </div>
      <div className="pn">
        <div className="filter-bar">
          <input type="text" placeholder="Search VIN, model, specs..." value={listingSearch} onChange={(e) => setListingSearch(e.target.value)} />
          <select value={listingMfr} onChange={e => setListingMfr(e.target.value)}><option value="">All Manufacturers</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Grand Design</option><option>Coachmen</option></select>
          <select value={listingType} onChange={e => setListingType(e.target.value)}><option value="">All Types</option><option>Travel Trailer</option><option>Fifth Wheel</option><option>Class A</option><option>Class C</option><option>Toy Hauler</option></select>
          <select value={listingStatus} onChange={e => setListingStatus(e.target.value)}><option value="">All Statuses</option><option>Active</option><option>On Hold</option><option>Pending Review</option><option>Sold</option><option>Withdrawn</option></select>
        </div>
        <div className="tw"><table><thead><tr><th>Listing</th><th>Unit</th><th>Specs</th><th>Seller</th><th>Price</th><th>Inquiries</th><th>Views</th><th>Status</th><th>Listed</th><th>Action</th></tr></thead><tbody>
          {filteredListings.length === 0 ? (
            <tr><td colSpan={10} style={{textAlign:'center',color:'#888',padding:20}}>No results match your filters</td></tr>
          ) : filteredListings.map(l => (
            <tr key={l.id}>
              <td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => navigate('mkt-listing-detail')}>{l.id}</span></td>
              <td>{l.unit}</td>
              <td style={{fontSize: 12, color: '#666'}}>{l.specs}</td>
              <td style={{fontSize: 12, color: '#888'}}>{l.seller}</td>
              <td style={{fontWeight: 600}}>{l.price}</td>
              <td>{l.inquiries}</td>
              <td>{l.views}</td>
              <td><span className={`bg ${l.status === 'Active' ? 'active' : l.status === 'Sold' ? 'pay-recv' : ''}`} style={l.status === 'On Hold' ? {background:'#fef3c7',color:'#d97706'} : {}}>{l.status}</span></td>
              <td>{l.listed}</td>
              <td><button className="btn btn-o btn-sm" onClick={() => navigate('mkt-listing-detail')}>View</button></td>
            </tr>
          ))}
        </tbody></table></div>
      </div>
    </div>
  );
}
