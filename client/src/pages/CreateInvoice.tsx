import { useLocation } from 'wouter';

export default function CreateInvoice() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('billing')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">New Invoice</div><div className="detail-meta">Create and send an invoice to a dealer</div></div>
        <button className="btn btn-o btn-sm">Preview</button>
        <button className="btn btn-p btn-sm" onClick={() => navigate('billing')}>Save & Send</button>
      </div>

      <div className="pn" style={{marginBottom: 20}}>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 16, padding: '16px 20px', alignItems: 'end', borderBottom: '1px solid #f0f0f0'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Bill To</span><select style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option>Select dealer...</option><option>Smith's RV Centre</option><option>Atlantic RV</option><option>Prairie Wind RV</option></select></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Invoice #</span><input defaultValue="INV-2026-0090" style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}} /></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Invoice Date</span><input type="date" defaultValue="2026-03-17" style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}} /></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Payment Due</span><select style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option>On Receipt</option><option>Net 15</option><option>Net 30</option></select></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Payment Method</span><select style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option>Charge card (Stripe)</option><option>Send via email</option><option>Deduct from wallet</option><option>Interac e-Transfer</option></select></div>
        </div>
        <div style={{padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>
          <span style={{fontSize: 12, color: '#888', fontWeight: 500, marginRight: 4}}>Quick Add:</span>
          <button className="btn btn-o btn-sm" style={{fontSize: 11}}>Plan A ($349)</button>
          <button className="btn btn-o btn-sm" style={{fontSize: 11}}>Claim Fee 10%</button>
          <button className="btn btn-o btn-sm" style={{fontSize: 11}}>DAF ($25)</button>
          <button className="btn btn-o btn-sm" style={{fontSize: 11}}>PDI ($15)</button>
          <button className="btn btn-o btn-sm" style={{fontSize: 11}}>Financing ($199)</button>
          <button className="btn btn-o btn-sm" style={{fontSize: 11}}>F&I ($299)</button>
          <button className="btn btn-o btn-sm" style={{fontSize: 11}}>Parts ($149)</button>
          <button className="btn btn-o btn-sm" style={{fontSize: 11}}>Custom Item</button>
          <div style={{marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center'}}>
            <span style={{fontSize: 11, color: '#888'}}>Related:</span>
            <select style={{padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 11, fontFamily: 'inherit', background: '#fafafa'}}><option>No claim</option><option>CLM-0248</option><option>CLM-0247</option></select>
            <select style={{padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 11, fontFamily: 'inherit', background: '#fafafa'}}><option>No service</option><option>FIN-0023</option><option>FI-0014</option><option>PO-0038</option></select>
            <select style={{padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 11, fontFamily: 'inherit', background: '#fafafa'}}><option>One-time</option><option>Monthly</option><option>Quarterly</option></select>
          </div>
        </div>
      </div>

      <div className="pn">
        <table style={{width: '100%'}}><thead><tr>
          <th style={{width: '45%'}}>Item</th><th style={{width: '12%', textAlign: 'center'}}>Qty</th><th style={{width: '18%', textAlign: 'right'}}>Price</th><th style={{width: '18%', textAlign: 'right'}}>Amount</th><th style={{width: '7%'}}></th>
        </tr></thead><tbody>
          <tr><td style={{padding: '14px 16px'}}>
            <select style={{width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', marginBottom: 6}}>
              <option>Select item...</option>
              <optgroup label="Subscriptions"><option>Plan A Monthly Subscription</option><option>Plan B Wallet Top-Up</option></optgroup>
              <optgroup label="Claim Fees"><option>Claim Processing Fee (10%)</option><option>DAF Inspection Fee</option><option>PDI Processing Fee</option></optgroup>
              <optgroup label="Service Add-ons"><option>Financing Services</option><option>F&I Services</option><option>Parts & Accessories</option></optgroup>
              <option style={{fontStyle: 'italic', color: '#888'}}>+ Search parts...</option>
            </select>
            <input defaultValue="Monthly subscription - March 2026" style={{width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', color: '#555'}} />
          </td><td style={{textAlign: 'center', padding: '14px 8px'}}><input defaultValue="1" style={{width: 50, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'center', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 8px'}}><input defaultValue="349.00" style={{width: 90, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'right', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 16px', fontWeight: 600, fontSize: 13}}>$349.00</td><td style={{padding: '14px 8px', textAlign: 'center'}}><button onClick={(e) => (e.currentTarget as HTMLElement).closest('tr')?.remove()} style={{background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18}}>×</button></td></tr>
          <tr><td style={{padding: '14px 16px'}}>
            <select style={{width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', marginBottom: 6}}><option>Claim Processing Fee (10%)</option></select>
            <input defaultValue="10% fee on CLM-2026-0248 ($1,240 approved)" style={{width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', color: '#555'}} />
          </td><td style={{textAlign: 'center', padding: '14px 8px'}}><input defaultValue="1" style={{width: 50, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'center', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 8px'}}><input defaultValue="124.00" style={{width: 90, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'right', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 16px', fontWeight: 600, fontSize: 13}}>$124.00</td><td style={{padding: '14px 8px', textAlign: 'center'}}><button onClick={(e) => (e.currentTarget as HTMLElement).closest('tr')?.remove()} style={{background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18}}>×</button></td></tr>
          <tr><td style={{padding: '14px 16px'}}>
            <div style={{position: 'relative'}}>
              <input defaultValue="Sidewall Panel (2x3)" placeholder="Search parts..." style={{width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', marginBottom: 6}} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{position: 'absolute', left: 10, top: 10}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input defaultValue="Replacement panel for VIN ...4K1 delamination repair" style={{width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', color: '#555'}} />
          </td><td style={{textAlign: 'center', padding: '14px 8px'}}><input defaultValue="1" style={{width: 50, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'center', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 8px'}}><input defaultValue="285.00" style={{width: 90, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'right', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 16px', fontWeight: 600, fontSize: 13}}>$285.00</td><td style={{padding: '14px 8px', textAlign: 'center'}}><button onClick={(e) => (e.currentTarget as HTMLElement).closest('tr')?.remove()} style={{background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18}}>×</button></td></tr>
        </tbody></table>

        <div style={{padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12}}>
          <button style={{background: 'none', border: 'none', color: 'var(--brand)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Add service / subscription</button>
          <button style={{background: 'none', border: 'none', color: '#a855f7', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search & add part</button>
        </div>

        <div style={{borderTop: '2px solid #f0f0f0', padding: 20}}>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 40, marginBottom: 8, fontSize: 13}}><span style={{color: '#888', width: 120, textAlign: 'right'}}>Subtotal</span><span style={{fontWeight: 500, width: 100, textAlign: 'right'}}>$758.00</span></div>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 40, marginBottom: 8, fontSize: 13, alignItems: 'center'}}><span style={{color: '#888', width: 120, textAlign: 'right'}}>Tax <select style={{padding: '2px 6px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 11, fontFamily: 'inherit', marginLeft: 4}}><option>HST 13%</option><option>GST 5%</option><option>GST+QST</option><option>No Tax</option></select></span><span style={{fontWeight: 500, width: 100, textAlign: 'right'}}>$98.54</span></div>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 40, marginBottom: 8, fontSize: 12}}><span style={{color: 'var(--brand)', cursor: 'pointer', width: 120, textAlign: 'right'}}>+ Add discount</span><span style={{width: 100}}></span></div>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: 40, paddingTop: 12, borderTop: '1px solid #f0f0f0', fontSize: 16, fontWeight: 700}}><span>Total <span style={{fontWeight: 400, fontSize: 12, color: '#888'}}>CAD</span></span><span style={{width: 100, textAlign: 'right'}}>$856.54</span></div>
        </div>

        <div style={{borderTop: '1px solid #f0f0f0', padding: '16px 20px'}}>
          <div style={{fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6}}>Notes / Terms</div>
          <textarea placeholder="Enter notes or terms visible to the dealer..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none', background: '#fafafa'}}></textarea>
        </div>

        <div className="btn-bar"><button className="btn btn-p" onClick={() => navigate('billing')}>Save & Send</button><button className="btn btn-o" onClick={() => navigate('billing')}>Save Draft</button><button className="btn btn-o" onClick={() => navigate('billing')}>Cancel</button></div>
      </div>
    </div>
  );
}
