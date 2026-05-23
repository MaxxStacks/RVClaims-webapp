import { useState } from 'react';

export default function PartsCatalog() {
  const [search, setSearch] = useState('');
  const [mfr, setMfr] = useState('');
  const [category, setCategory] = useState('');

  return (
    <div className="page active">
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <input
          placeholder="Search parts by name, part number, or manufacturer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
        />
        <select value={mfr} onChange={e => setMfr(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}>
          <option value="">All Manufacturers</option>
          <option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option>
        </select>
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}>
          <option value="">All Categories</option>
          <option>Structural</option><option>Electrical</option><option>Plumbing</option><option>Appliances</option><option>Slides</option>
        </select>
        <button className="btn btn-p" style={{ whiteSpace: 'nowrap' }}>+ Add Part</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total SKUs</div><div className="sc-v">2,847</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Active Orders</div><div className="sc-v" style={{ color: '#2563eb' }}>8</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Avg. Fulfillment</div><div className="sc-v">6.2d</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Parts Revenue (MTD)</div><div className="sc-v" style={{ color: '#22c55e' }}>$18,400</div></div>
      </div>
      <div className="pn">
        <div className="tw">
          <table>
            <thead>
              <tr><th>Part #</th><th>Name</th><th>Manufacturer</th><th>Category</th><th>Cost</th><th>Avg Delivery</th><th>Orders YTD</th></tr>
            </thead>
            <tbody>
              <tr><td>JAY-12844-A</td><td>Slide-out Seal Kit (Main)</td><td>Jayco</td><td>Structural</td><td>$124.00</td><td>5d</td><td>28</td></tr>
              <tr><td>FR-ROOF-7711</td><td>TPO Roof Patch Kit</td><td>Forest River</td><td>Structural</td><td>$89.00</td><td>7d</td><td>14</td></tr>
              <tr><td>KST-WATER-224</td><td>Fresh Water Pump 12V 3.0GPM</td><td>Keystone</td><td>Plumbing</td><td>$188.00</td><td>4d</td><td>19</td></tr>
              <tr><td>HTL-ELEC-503</td><td>30A Shore Power Converter</td><td>Heartland</td><td>Electrical</td><td>$245.00</td><td>6d</td><td>11</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
