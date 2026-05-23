import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Auctions() {
  const [, navigate] = useLocation();
  const [mainTab, setMainTab] = useState<'browse'|'live'>('browse');

  // Browse filters
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseType, setBrowseType] = useState('');
  const [browseSlides, setBrowseSlides] = useState('');
  const [browseBunks, setBrowseBunks] = useState('');
  const [browsePrice, setBrowsePrice] = useState('');
  const [browseLength, setBrowseLength] = useState('');

  // Live auction tabs
  const [auctionTab, setAuctionTab] = useState<'live'|'upcoming'|'won'>('live');

  return (
    <div className="page active">
      <div className="tabs">
        <div className={`tab ${mainTab === 'browse' ? 'active' : ''}`} onClick={() => setMainTab('browse')}>Browse Marketplace</div>
        <div className={`tab ${mainTab === 'live' ? 'active' : ''}`} onClick={() => setMainTab('live')}>Live Auctions</div>
      </div>

      {mainTab === 'browse' && (
        <div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 16}}>
            <div><div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Dealer Marketplace</div><div style={{fontSize: 13, color: '#888'}}>Browse units from verified dealers across North America. All transactions go through Dealer Suite 360.</div></div>
            <button className="btn btn-p btn-sm" onClick={() => navigate('new-listing')}>+ List a Unit for Sale</button>
          </div>

          <div className="pn" style={{marginBottom: 20}}>
            <div style={{padding: '16px 20px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'end'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Search</span><input placeholder="Year, make, model..." value={browseSearch} onChange={(e) => setBrowseSearch(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}} /></div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Type</span><select value={browseType} onChange={(e) => setBrowseType(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option value="">All Types</option><option value="tt">Travel Trailer</option><option value="fw">Fifth Wheel</option><option value="a">Class A</option><option value="c">Class C</option><option value="th">Toy Hauler</option></select></div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Slides</span><select value={browseSlides} onChange={(e) => setBrowseSlides(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option value="">Any</option><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3+</option></select></div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Bunks</span><select value={browseBunks} onChange={(e) => setBrowseBunks(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option value="">Any</option><option value="1">1</option><option value="2">2</option><option value="3">3+</option></select></div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Price</span><select value={browsePrice} onChange={(e) => setBrowsePrice(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option value="">Any</option><option value="u25">Under $25K</option><option value="25-40">$25K-$40K</option><option value="40-60">$40K-$60K</option><option value="60-80">$60K-$80K</option><option value="80">$80K+</option></select></div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Length</span><select value={browseLength} onChange={(e) => setBrowseLength(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option value="">Any</option><option value="u25">Under 25'</option><option value="25-30">25'-30'</option><option value="30-35">30'-35'</option><option value="35">35'+</option></select></div>
              <button className="btn btn-p btn-sm" style={{height: 34}}>Search</button>
            </div>
            <div style={{padding: '0 20px 12px', display: 'flex', gap: 8, flexWrap: 'wrap'}}>
              <span style={{fontSize: 12, color: '#888'}}>Quick:</span>
              <button className="btn btn-o btn-sm" style={{fontSize: 11, padding: '4px 10px'}} onClick={() => setBrowseBunks('2')}>Bunk Models</button>
              <button className="btn btn-o btn-sm" style={{fontSize: 11, padding: '4px 10px'}} onClick={() => setBrowseType('fw')}>Fifth Wheels</button>
              <button className="btn btn-o btn-sm" style={{fontSize: 11, padding: '4px 10px'}} onClick={() => setBrowsePrice('u25')}>Under $25K</button>
              <button className="btn btn-o btn-sm" style={{fontSize: 11, padding: '4px 10px'}} onClick={() => setBrowseSlides('3')}>3+ Slides</button>
              <button className="btn btn-o btn-sm" style={{fontSize: 11, padding: '4px 10px'}} onClick={() => { setBrowseSearch(''); setBrowseType(''); setBrowseSlides(''); setBrowseBunks(''); setBrowsePrice(''); setBrowseLength(''); }}>Clear All</button>
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
            <span style={{fontSize: 13, color: '#888'}}>142 units found</span>
            <select style={{padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit'}}><option>Newest First</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Year: Newest</option></select>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16}}>
            {[
              { id: 'MKT-0284', unit: '2024 Grand Design Imagine 2800BH', type: 'Travel Trailer', len: "28'", weight: '6,200 lbs', slides: 3, bunks: 2, sleeps: 8, price: '$42,900', date: 'Mar 10', status: '' },
              { id: 'MKT-0281', unit: '2023 Keystone Cougar 29BHS', type: 'Fifth Wheel', len: "33'", weight: '7,800 lbs', slides: 2, bunks: 2, sleeps: 10, price: '$38,500', date: 'Mar 8', status: 'On Hold' },
              { id: 'MKT-0276', unit: '2024 Forest River Rockwood 2891BH', type: 'Travel Trailer', len: "32'", weight: '8,100 lbs', slides: 3, bunks: 1, sleeps: 6, price: '$45,200', date: 'Mar 5', status: '' },
              { id: 'MKT-0283', unit: '2024 Jayco Jay Flight 264BH', type: 'Travel Trailer', len: "28'", weight: '5,900 lbs', slides: 1, bunks: 2, sleeps: 8, price: '$34,900', date: 'Mar 12', status: '' },
            ].map((item) => (
              <div className="pn" key={item.id} style={{cursor: 'pointer'}} onClick={() => navigate('auction-detail')}>
                <div style={{display: 'flex', gap: 16, padding: 16}}>
                  <div style={{width: 180, height: 120, background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#888', flexShrink: 0}}>Photo</div>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4}}>{item.unit}</div>
                    <div style={{fontSize: 12, color: '#888', marginBottom: 8}}>{item.type} · {item.len} · {item.weight}</div>
                    <div style={{display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap'}}>
                      <span style={{fontSize: 12, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4}}>{item.slides} Slides</span>
                      <span style={{fontSize: 12, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4}}>{item.bunks} Bunks</span>
                      <span style={{fontSize: 12, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4}}>Sleeps {item.sleeps}</span>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <div style={{fontSize: 20, fontWeight: 700, color: 'var(--brand)'}}>{item.price}</div>
                      {item.status ? <span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>{item.status}</span> : <span style={{fontSize: 11, color: '#888'}}>Listed {item.date} · {item.id}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mainTab === 'live' && (
        <div style={{marginTop: 16}}>
          <div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Live Auctions</div>
          <div style={{fontSize: 13, color: '#888', marginBottom: 20}}>Bid on units in real-time. $500 deposit from winner. Dealer Suite 360 facilitates all transactions.</div>
          <div className="tabs">
            <div className={`tab ${auctionTab === 'live' ? 'active' : ''}`} onClick={() => setAuctionTab('live')}>Live Now (1)</div>
            <div className={`tab ${auctionTab === 'upcoming' ? 'active' : ''}`} onClick={() => setAuctionTab('upcoming')}>Upcoming (2)</div>
            <div className={`tab ${auctionTab === 'won' ? 'active' : ''}`} onClick={() => setAuctionTab('won')}>Won / Completed</div>
          </div>
          <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px', padding: 16}}>
            {auctionTab === 'live' && (
              <div style={{border: '2px solid #dc2626', borderRadius: 8, padding: 16, background: '#fef2f2', cursor: 'pointer'}} onClick={() => navigate('auction-detail')}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}><span style={{background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999}}>🔴 LIVE</span><span style={{fontSize: 15, fontWeight: 700}}>2023 Heartland Bighorn 3960LS</span></div>
                  <span style={{fontSize: 12, color: '#dc2626', fontWeight: 600}}>Ends in 23 min</span>
                </div>
                <div style={{display: 'flex', gap: 24, fontSize: 13, color: '#555', flexWrap: 'wrap'}}>
                  <span>Fifth Wheel · 39' · 4 slides</span>
                  <span>Starting: $55,000</span>
                  <span style={{fontWeight: 700, color: '#dc2626'}}>Current: $62,500</span>
                  <span>14 bids · 8 watchers</span>
                </div>
                <div style={{marginTop: 12}}><button className="btn btn-p btn-sm">Enter Auction Room →</button></div>
              </div>
            )}
            {auctionTab === 'upcoming' && (
              <div>
                {[
                  { id: 'AUC-0035', unit: '2024 Forest River Salem 30KQBSS', specs: "Travel Trailer · 30' · 2 slides", start: '$32,000', date: 'Mar 20, 2 PM', watchers: 12 },
                  { id: 'AUC-0036', unit: '2023 Jayco Eagle 321RSTS', specs: "Fifth Wheel · 36' · 3 slides", start: '$48,000', date: 'Mar 22, 10 AM', watchers: 6 },
                ].map((auc) => (
                  <div key={auc.id} style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: 8}}><span className="bg pending">Starts {auc.date}</span><span style={{fontSize: 15, fontWeight: 700}}>{auc.unit}</span></div>
                    </div>
                    <div style={{display: 'flex', gap: 24, fontSize: 13, color: '#555'}}>
                      <span>{auc.specs}</span><span>Starting: {auc.start}</span><span>{auc.watchers} watchers</span>
                    </div>
                    <div style={{marginTop: 12}}><button className="btn btn-o btn-sm" onClick={() => alert('You will be notified when this auction starts.')}>Watch This Auction</button></div>
                  </div>
                ))}
              </div>
            )}
            {auctionTab === 'won' && (
              <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Your Bid</th><th>Result</th><th>Commission</th><th>Date</th></tr></thead><tbody>
                <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0029</td><td>2023 Forest River Cherokee 264DBH</td><td style={{fontWeight: 600}}>$31,500</td><td><span className="bg active">Won</span></td><td>$250</td><td>Mar 6</td></tr>
              </tbody></table></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
