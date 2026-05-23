export default function Reports() {
  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc" style={{padding: 24}}><div className="sc-l" style={{marginBottom: 8}}>Revenue (YTD)</div><div className="sc-v">$128,400</div><div className="sc-c up">+23%</div></div>
        <div className="sc" style={{padding: 24}}><div className="sc-l" style={{marginBottom: 8}}>Claims (YTD)</div><div className="sc-v">248</div><div className="sc-c up">+18%</div></div>
        <div className="sc" style={{padding: 24}}><div className="sc-l" style={{marginBottom: 8}}>Service Revenue (MTD)</div><div className="sc-v">$7,200</div><div className="sc-c up">Financing + F&I + Parts</div></div>
      </div>
      <div className="pg pg-2">
        <div className="pn"><div className="pn-h"><span className="pn-t">Revenue by Source</span></div><div style={{padding: 20}}>
          <div style={{marginBottom: 12}}><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4}}><span>Claims Processing</span><span style={{fontWeight: 600}}>$42,800</span></div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4}}><div style={{height: '100%', width: '65%', background: 'var(--brand)', borderRadius: 4}}></div></div></div>
          <div style={{marginBottom: 12}}><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4}}><span>Subscriptions</span><span style={{fontWeight: 600}}>$31,200</span></div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4}}><div style={{height: '100%', width: '48%', background: '#3b82f6', borderRadius: 4}}></div></div></div>
          <div style={{marginBottom: 12}}><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4}}><span>Warranty Plan Sales</span><span style={{fontWeight: 600}}>$12,475</span></div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4}}><div style={{height: '100%', width: '19%', background: '#22c55e', borderRadius: 4}}></div></div></div>
          <div style={{marginBottom: 12}}><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4}}><span>Service Add-ons</span><span style={{fontWeight: 600}}>$7,200</span></div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4}}><div style={{height: '100%', width: '11%', background: '#a855f7', borderRadius: 4}}></div></div></div>
          <div><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4}}><span>Parts Margin</span><span style={{fontWeight: 600}}>$3,420</span></div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4}}><div style={{height: '100%', width: '5%', background: '#f59e0b', borderRadius: 4}}></div></div></div>
        </div></div>
        <div className="pn"><div className="pn-h"><span className="pn-t">Top Dealers</span></div>
          <div style={{padding: '14px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', fontSize: 13}}><span style={{fontWeight: 500}}>Smith's RV Centre</span><span style={{fontWeight: 600}}>$28,400</span></div>
          <div style={{padding: '14px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', fontSize: 13}}><span style={{fontWeight: 500}}>Prairie Wind RV</span><span style={{fontWeight: 600}}>$22,100</span></div>
          <div style={{padding: '14px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', fontSize: 13}}><span style={{fontWeight: 500}}>Atlantic RV</span><span style={{fontWeight: 600}}>$18,900</span></div>
          <div style={{padding: '14px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 13}}><span style={{fontWeight: 500}}>West Coast Campers</span><span style={{fontWeight: 600}}>$14,600</span></div>
        </div>
      </div>
    </div>
  );
}
