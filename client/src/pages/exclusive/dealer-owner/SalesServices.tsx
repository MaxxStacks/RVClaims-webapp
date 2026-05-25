import { useState } from 'react';
import { useLocation } from 'wouter';

export default function SalesServices() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Warranty Plans', 'F&I Products', 'Parts & Accessories'];

  const products = [
    {name: 'Extended Warranty', price: 'from $1,200', nav: 'svc-warranty'},
    {name: 'GAP Insurance', price: 'from $395', nav: 'svc-fi-new'},
    {name: 'Tire & Wheel Protection', price: 'from $295', nav: 'svc-fi-new'},
    {name: 'F&I Package', price: 'Custom', nav: 'svc-fi-new'},
    {name: 'Parts Order', price: 'Per quote', nav: 'svc-parts-new'},
    {name: 'Roadside Assist', price: 'from $149/yr', nav: 'svc-warranty'},
  ];

  return (
    <div className="page active">
      <div style={{marginBottom: 16, display: 'flex', gap: 8}}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} className={`tab${i === activeTab ? ' active' : ''}`}>{t}</button>
        ))}
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Plans Sold (YTD)</div><div className="sc-v" style={{color: '#22c55e'}}>24</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>F&I Deals (YTD)</div><div className="sc-v" style={{color: '#2563eb'}}>11</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Parts Revenue</div><div className="sc-v" style={{color: '#f59e0b'}}>$8,240</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Total Revenue</div><div className="sc-v">$47,200</div></div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Sell a Product to a Customer</span></div>
        <div style={{padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16}}>
          {products.map(p => (
            <div key={p.name} className="pn" style={{padding: 20, textAlign: 'center', cursor: 'pointer'}} onClick={() => navigate(p.nav)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#033280" strokeWidth="1.5" style={{margin: '0 auto 12px'}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div style={{fontWeight: 600, fontSize: 14, marginBottom: 4}}>{p.name}</div>
              <div style={{fontSize: 12, color: '#888'}}>{p.price}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
