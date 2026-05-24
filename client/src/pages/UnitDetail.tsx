import { useState } from 'react';
import { useLocation } from 'wouter';

function updateOpUnitPhoto(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.getElementById('op-unit-photo-img') as HTMLImageElement | null;
    const ph = document.getElementById('op-unit-photo-ph');
    if (img && ev.target?.result) { img.src = ev.target.result as string; img.style.display = 'block'; if (ph) ph.style.display = 'none'; }
  };
  reader.readAsDataURL(file);
}

export default function UnitDetail() {
  const [, navigate] = useLocation();
  const [unitTab, setUnitTab] = useState('utab-u-specs');
  const [unitEditMode, setUnitEditMode] = useState(false);
  const [selectedUnit] = useState<any | null>(null);
  const handleToast = (_msg: string) => {};

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('units')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">{[selectedUnit?.year, selectedUnit?.manufacturer, selectedUnit?.model].filter(Boolean).join(" ") || "—"}</div><div className="detail-meta">VIN: {selectedUnit?.vin ?? "—"} · {selectedUnit?.stockNumber ?? "—"} · {selectedUnit?.dealerName ?? "—"}</div></div><span className={`bg ${selectedUnit?.status ?? "active"}`} style={{fontSize: 13, padding: "6px 16px"}}>{selectedUnit?.status ?? "—"}</span><button className="btn btn-o btn-sm" onClick={() => setUnitEditMode(m => !m)}>Edit Unit</button></div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 20}}><div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Claims</div><div className="sc-v">—</div></div><div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Claimed</div><div className="sc-v">—</div></div><div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Approved</div><div className="sc-v" style={{color: "#22c55e"}}>—</div></div><div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Paid</div><div className="sc-v" style={{color: "#2563eb"}}>—</div></div><div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Approval</div><div className="sc-v" style={{color: "#22c55e"}}>—</div></div></div>
      <div className="tabs"><div className="tab active" onClick={() => setUnitTab('utab-u-specs')}>Specs</div><div className="tab" onClick={() => setUnitTab('utab-u-claims')}>Claims</div><div className="tab" onClick={() => setUnitTab('utab-u-photos')}>Photos</div><div className="tab" onClick={() => setUnitTab('utab-u-fin')}>Financials</div><div className="tab" onClick={() => setUnitTab('utab-u-time')}>Timeline</div>{selectedUnit?.customData && Object.keys(selectedUnit.customData).length > 0 && <div className="tab" onClick={() => setUnitTab('utab-u-custom')}>Custom Data</div>}</div>
      <div className={`pn utab ${unitTab === "utab-u-specs" ? "active" : ""}`} style={{display: unitTab === "utab-u-specs" ? "block" : "none"}}>
        <div style={{padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 16, alignItems: 'center'}}>
          <div style={{width: 140, height: 90, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer'}} onClick={() => document.getElementById('op-unit-photo-input')?.click()}>
            <div id="op-unit-photo-ph" style={{textAlign: 'center'}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><div style={{fontSize: 10, color: '#aaa', marginTop: 4}}>Unit Photo</div></div>
            <img id="op-unit-photo-img" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'none'}} />
          </div>
          <input type="file" id="op-unit-photo-input" accept="image/*" style={{display: 'none'}} onChange={updateOpUnitPhoto} />
          <div style={{flex: 1}}><div style={{fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4}}>Unit Display Photo</div><div style={{fontSize: 12, color: '#888', lineHeight: '1.4'}}>Visible on the customer portal.</div></div>
          <button className="btn btn-o btn-sm" onClick={() => document.getElementById('op-unit-photo-input')?.click()}>Upload / Change</button>
        </div>
        <div style={{display: unitEditMode ? "none" : "block"}}><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0}}><div style={{borderRight: '1px solid #f0f0f0'}}><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Vehicle</div><div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{fontFamily: 'monospace', fontSize: 12}}>1UJBJ0BN8M1TJ4K1</span></div><div className="cd-row"><span className="cd-label">Stock #</span><span className="cd-value">STK-0891</span></div><div className="cd-row"><span className="cd-label">Year / Make / Model</span><span className="cd-value">2024 Jayco Jay Flight 264BH</span></div><div className="cd-row"><span className="cd-label">Type</span><span className="cd-value">Travel Trailer</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg active">Delivered</span></span></div></div><div><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Customer</div><div className="cd-row"><span className="cd-label">Name</span><span className="cd-value">Robert Martin</span></div><div className="cd-row"><span className="cd-label">Email</span><span className="cd-value" style={{color: 'var(--brand)'}}>robert.martin@gmail.com</span></div><div className="cd-row"><span className="cd-label">Phone</span><span className="cd-value">(905) 555-0147</span></div><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Dealer</div><div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value cid" onClick={() => navigate('dealer-detail')}>Smith's RV Centre</span></div></div></div></div>
        <div style={{display: unitEditMode ? "block" : "none"}}><div style={{padding: '14px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: 13, color: '#92400e'}}>Editing unit. Click <strong>Save</strong> when done.</div><div className="btn-bar"><button className="btn btn-p" onClick={() => setUnitEditMode(false)}>Save</button><button className="btn btn-o" onClick={() => setUnitEditMode(false)}>Cancel</button></div></div>
      </div>
      <div className={`pn utab ${unitTab === "utab-u-claims" ? "active" : ""}`} style={{display: unitTab === "utab-u-claims" ? "block" : "none"}}><div className="tw"><table><thead><tr><th>Claim #</th><th>Type</th><th>Lines</th><th>Status</th><th>Claimed</th><th>Approved</th></tr></thead><tbody><tr><td><span className="cid" onClick={() => navigate('claim-detail')}>CLM-0248</span></td><td>Warranty</td><td>4</td><td><span className="bg submitted">Submitted</span></td><td>$1,240</td><td>—</td></tr></tbody></table></div></div>
      <div className={`pn utab ${unitTab === "utab-u-photos" ? "active" : ""}`} style={{display: unitTab === "utab-u-photos" ? "block" : "none"}}><div style={{padding: '16px 20px', color: '#888', fontSize: 13}}>Photos will load from API</div></div>
      <div className={`pn utab ${unitTab === "utab-u-fin" ? "active" : ""}`} style={{display: unitTab === "utab-u-fin" ? "block" : "none"}}><div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, padding: 20}}><div><div style={{fontSize: 12, color: '#888', marginBottom: 4}}>Claimed</div><div style={{fontSize: 20, fontWeight: 700}}>—</div></div><div><div style={{fontSize: 12, color: '#888', marginBottom: 4}}>Approved</div><div style={{fontSize: 20, fontWeight: 700, color: '#22c55e'}}>—</div></div><div><div style={{fontSize: 12, color: '#888', marginBottom: 4}}>Paid</div><div style={{fontSize: 20, fontWeight: 700, color: '#2563eb'}}>—</div></div><div><div style={{fontSize: 12, color: '#888', marginBottom: 4}}>Outstanding</div><div style={{fontSize: 20, fontWeight: 700, color: '#dc2626'}}>—</div></div></div></div>
      <div className={`pn utab ${unitTab === "utab-u-time" ? "active" : ""}`} style={{display: unitTab === "utab-u-time" ? "block" : "none"}}><div className="act"><div style={{textAlign:'center',padding:'32px 0',color:'#888',fontSize:13}}>No timeline events</div></div></div>
      {selectedUnit?.customData && Object.keys(selectedUnit.customData).length > 0 && (
        <div className={`pn utab ${unitTab === "utab-u-custom" ? "active" : ""}`} style={{display: unitTab === "utab-u-custom" ? "block" : "none"}}>
          <div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Imported Custom Fields</div>
          {Object.entries(selectedUnit.customData as Record<string, string>).map(([key, val]) => (
            <div key={key} className="cd-row"><span className="cd-label">{key}</span><span className="cd-value">{String(val)}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}
