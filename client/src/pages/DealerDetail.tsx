import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

const handleToast = (_msg: string) => {};

export default function DealerDetail() {
  const [, navigate] = useLocation();
  const [selectedDealerDetail] = useState<any | null>(null);
  const [dealerTab, setDealerTab] = useState('dtab-d-batches');
  const [opBatches, setOpBatches] = useState<any[]>([]);
  const [opClaims, setOpClaims] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/api/v6/claims').then(d => setOpClaims(Array.isArray(d) ? d : [])).catch(() => {});
    apiFetch<any>('/api/batches?status=uploaded').then(d => setOpBatches(d.batches || [])).catch(() => {});
  }, []);

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('dealers')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">{selectedDealerDetail?.name ?? "—"}</div><div className="detail-meta">{selectedDealerDetail?.plan ? `${selectedDealerDetail.plan} · ` : ""}{selectedDealerDetail?.claimFeePercent != null ? `${selectedDealerDetail.claimFeePercent}% claim fee` : "—"}</div></div><span className={`bg ${selectedDealerDetail?.status ?? "active"}`} style={{fontSize: 13, padding: "6px 16px"}}>{selectedDealerDetail?.status ?? "—"}</span></div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Batches</div><div className="sc-v" style={{color: '#f59e0b'}}>{opBatches.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Claims</div><div className="sc-v">{opClaims.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Approval</div><div className="sc-v" style={{color: '#22c55e'}}>—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Revenue</div><div className="sc-v">—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Outstanding</div><div className="sc-v" style={{color: '#dc2626'}}>—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Services</div><div className="sc-v" style={{color: '#2563eb'}}>—</div></div>
      </div>
      <div className="tabs">
        <div className="tab active" onClick={() => setDealerTab('dtab-d-batches')}>Photo Batches</div>
        <div className="tab" onClick={() => setDealerTab('dtab-d-claims')}>Claims</div>
        <div className="tab" onClick={() => setDealerTab('dtab-d-units')}>Units</div>
        <div className="tab" onClick={() => setDealerTab('dtab-d-sub')}>Subscription & Fees</div>
        <div className="tab" onClick={() => setDealerTab('dtab-d-services')}>Active Services</div>
        <div className="tab" onClick={() => setDealerTab('dtab-d-invoices')}>Invoices</div>
        <div className="tab" onClick={() => setDealerTab('dtab-d-staff')}>Staff</div>
        <div className="tab" onClick={() => setDealerTab('dtab-d-info')}>Info</div>
        <div className="tab" onClick={() => setDealerTab('dtab-d-assign')}>Assignment</div>
      </div>
      <div className={`pn dtab ${dealerTab === "dtab-d-batches" ? "active" : ""}`} style={{display: dealerTab === "dtab-d-batches" ? "block" : "none"}}><div className="tw"><table><thead><tr><th>Batch</th><th>VIN</th><th>Mfr</th><th>Type</th><th>Photos</th><th>Notes</th><th>Uploaded</th><th>Action</th></tr></thead><tbody><tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>BATCH-0048</td><td><span className="vin">...4K1</span></td><td><span className="mfr">Jayco</span></td><td>Warranty</td><td><strong>24</strong></td><td style={{fontSize: 12, color: '#666'}}>Sidewall, roof, seal, hinge</td><td>2h ago</td><td><button className="btn btn-p btn-sm" onClick={() => navigate('batch-review')}>Review</button></td></tr><tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>BATCH-0044</td><td><span className="vin">...4823</span></td><td><span className="mfr">Columbia NW</span></td><td>Extended</td><td><strong>20</strong></td><td style={{fontSize: 12, color: '#666'}}>Flooring, plumbing, countertop</td><td>6h ago</td><td><button className="btn btn-p btn-sm" onClick={() => navigate('batch-review')}>Review</button></td></tr></tbody></table></div></div>
      <div className={`pn dtab ${dealerTab === "dtab-d-claims" ? "active" : ""}`} style={{display: dealerTab === "dtab-d-claims" ? "block" : "none"}}><div className="tw"><table><thead><tr><th>Claim #</th><th>VIN</th><th>Type</th><th>Status</th><th>Amount</th><th>Updated</th></tr></thead><tbody><tr><td><span className="cid" onClick={() => navigate('claim-detail')}>CLM-0248</span></td><td><span className="vin">...4K1</span></td><td>Warranty</td><td><span className="bg submitted">Submitted</span></td><td>$1,240</td><td>2h ago</td></tr><tr><td><span className="cid" onClick={() => navigate('claim-detail')}>CLM-0243</span></td><td><span className="vin">...7P3</span></td><td>DAF</td><td><span className="bg pay-recv">Paid</span></td><td>$4,200</td><td>3 days</td></tr><tr><td><span className="cid" onClick={() => navigate('claim-detail')}>CLM-0237</span></td><td><span className="vin">...8R2</span></td><td>Warranty</td><td><span className="bg completed">Completed</span></td><td>$920</td><td>1 week</td></tr></tbody></table></div></div>
      <div className={`pn dtab ${dealerTab === "dtab-d-units" ? "active" : ""}`} style={{display: dealerTab === "dtab-d-units" ? "block" : "none"}}><div className="tw"><table><thead><tr><th>VIN</th><th>Stock #</th><th>Model</th><th>Claims</th><th>DAF</th><th>PDI</th><th>Status</th></tr></thead><tbody><tr><td><span className="cid" onClick={() => navigate('unit-detail')}>1UJBJ0BN8M1TJ4K1</span></td><td>STK-0891</td><td>2024 Jayco Jay Flight</td><td>3</td><td><span className="bg authorized">Done</span></td><td><span className="bg authorized">Done</span></td><td><span className="bg active">Delivered</span></td></tr></tbody></table></div></div>
      <div className={`pn dtab ${dealerTab === "dtab-d-sub" ? "active" : ""}`} style={{display: dealerTab === "dtab-d-sub" ? "block" : "none"}}><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0}}>
        <div style={{borderRight: '1px solid #f0f0f0'}}><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Subscription</div><div className="cd-row"><span className="cd-label">Plan</span><span className="cd-value" style={{color: 'var(--brand)', fontWeight: 600}}>Plan A — Monthly</span></div><div className="cd-row"><span className="cd-label">Monthly Fee</span><span className="cd-value">$349/mo</span></div><div className="cd-row"><span className="cd-label">Next Invoice</span><span className="cd-value">Apr 1, 2026</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg active">Active</span></span></div><div style={{padding: '14px 20px'}}><button className="btn btn-o btn-sm" onClick={() => handleToast('Plan change coming soon')}>Change Plan</button></div></div>
        <div><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Claim Fee Schedule</div><div className="cd-row"><span className="cd-label">Per-Claim Fee</span><span className="cd-value" style={{fontWeight: 600}}>10% of approved</span></div><div className="cd-row"><span className="cd-label">Min Fee</span><span className="cd-value">$50</span></div><div className="cd-row"><span className="cd-label">Max Fee Cap</span><span className="cd-value">$500</span></div><div className="cd-row"><span className="cd-label">DAF Fee</span><span className="cd-value">$25/unit</span></div><div className="cd-row"><span className="cd-label">PDI Fee</span><span className="cd-value">$15/unit</span></div><div style={{padding: '14px 20px'}}><button className="btn btn-o btn-sm" onClick={() => handleToast('Fee editing coming soon')}>Edit Fees</button></div></div>
      </div></div>
      <div className={`pn dtab ${dealerTab === "dtab-d-services" ? "active" : ""}`} style={{display: dealerTab === "dtab-d-services" ? "block" : "none"}}><div style={{padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
        <div className="svc-card"><div className="svc-icon" style={{background: '#eff6ff', color: '#3b82f6'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg></div><div className="svc-body"><div className="svc-title">Claims Processing</div><div className="svc-meta"><span className="bg active">Active</span><span style={{color: '#888'}}>Included</span></div></div><div className="toggle on" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}></div></div>
        <div className="svc-card"><div className="svc-icon" style={{background: '#f0fdf4', color: '#22c55e'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div className="svc-body"><div className="svc-title">Warranty Plans</div><div className="svc-meta"><span className="bg active">Active</span><span style={{color: '#888'}}>Included</span></div></div><div className="toggle on" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}></div></div>
        <div className="svc-card" style={{opacity: '0.5'}}><div className="svc-icon" style={{background: '#faf5ff', color: '#a855f7'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><div className="svc-body"><div className="svc-title">Financing</div><div className="svc-meta"><span className="bg pending">Coming Q2</span></div></div><div className="toggle"></div></div>
        <div className="svc-card" style={{opacity: '0.5'}}><div className="svc-icon" style={{background: '#fffbeb', color: '#f59e0b'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg></div><div className="svc-body"><div className="svc-title">F&I Services</div><div className="svc-meta"><span className="bg pending">Coming Q2</span></div></div><div className="toggle"></div></div>
      </div></div>
      <div className={`pn dtab ${dealerTab === "dtab-d-invoices" ? "active" : ""}`} style={{display: dealerTab === "dtab-d-invoices" ? "block" : "none"}}>
        <div className="pn-h" style={{borderBottom: '1px solid #f0f0f0'}}><span className="pn-t">Invoices</span><span className="pn-a" onClick={() => navigate('create-invoice')}>+ Create Invoice</span></div>
        <div className="tw"><table><thead><tr><th>Invoice</th><th>Type</th><th>Description</th><th>Total</th><th>Status</th><th>Issued</th></tr></thead><tbody><tr><td style={{fontWeight: 500}}>INV-0089</td><td>Claim Fee</td><td>10% on CLM-0248</td><td>$140.12</td><td><span className="bg pending">Pending</span></td><td>Mar 16</td></tr><tr><td>INV-0085</td><td>Subscription</td><td>March 2026</td><td>$394.37</td><td><span className="bg pay-recv">Paid</span></td><td>Mar 1</td></tr></tbody></table></div></div>
      <div className={`pn dtab ${dealerTab === "dtab-d-staff" ? "active" : ""}`} style={{display: dealerTab === "dtab-d-staff" ? "block" : "none"}}><div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th></tr></thead><tbody><tr><td style={{fontWeight: 500}}>Mike Smith</td><td>mike@smithsrv.ca</td><td><span className="bg" style={{background: '#eff6ff', color: 'var(--brand)'}}>Owner</span></td><td><span className="bg active">Active</span></td><td>4h ago</td></tr><tr><td>Lisa Patel</td><td>lisa@smithsrv.ca</td><td><span className="bg" style={{background: '#f0fdf4', color: '#16a34a'}}>Staff</span></td><td><span className="bg active">Active</span></td><td>Yesterday</td></tr></tbody></table></div></div>
      <div className={`pn dtab ${dealerTab === "dtab-d-info" ? "active" : ""}`} style={{display: dealerTab === "dtab-d-info" ? "block" : "none"}}>
        <div style={{padding: '12px 20px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>This information is shared with the dealer.</div>
        <div className="form-grid">
          <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Business Information</label></div>
          <div className="form-group"><label>Dealership Name</label><input defaultValue={selectedDealerDetail?.name ?? ""} /></div>
          <div className="form-group"><label>Legal Name</label><input defaultValue={selectedDealerDetail?.legalName ?? ""} /></div>
          <div className="form-group"><label>Business Email</label><input defaultValue={selectedDealerDetail?.email ?? ""} /></div>
          <div className="form-group"><label>Business Phone</label><input defaultValue={selectedDealerDetail?.phone ?? ""} /></div>
          <div className="form-group"><label>Website</label><input defaultValue={selectedDealerDetail?.website ?? ""} /></div>
          <div className="form-group"><label>Business Number</label><input defaultValue={selectedDealerDetail?.businessNumber ?? ""} /></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Address</label></div>
          <div className="form-group"><label>Street</label><input defaultValue={selectedDealerDetail?.street ?? ""} /></div>
          <div className="form-group"><label>City</label><input defaultValue={selectedDealerDetail?.city ?? ""} /></div>
          <div className="form-group"><label>Province</label><input defaultValue={selectedDealerDetail?.province ?? ""} /></div>
          <div className="form-group"><label>Postal Code</label><input defaultValue={selectedDealerDetail?.postalCode ?? ""} /></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Primary Contact</label></div>
          <div className="form-group"><label>Name</label><input defaultValue={selectedDealerDetail?.contactName ?? ""} /></div>
          <div className="form-group"><label>Email</label><input defaultValue={selectedDealerDetail?.contactEmail ?? ""} /></div>
          <div className="form-group"><label>Phone</label><input defaultValue={selectedDealerDetail?.contactPhone ?? ""} /></div>
          <div className="form-group"><label>Title</label><input defaultValue={selectedDealerDetail?.contactTitle ?? ""} /></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Internal Notes (operator only)</label></div>
          <div className="form-group full"><textarea placeholder="Internal notes about this dealership..."></textarea></div>
        </div>
        <div className="btn-bar"><button className="btn btn-p" onClick={() => handleToast('Dealer info saved')}>Save</button><button className="btn btn-o" onClick={() => handleToast('Fields reset')}>Reset</button><button className="btn btn-d" style={{marginLeft: 'auto'}} onClick={() => handleToast('Dealer suspended')}>Suspend Dealer</button></div>
      </div>
      <div className={`pn dtab ${dealerTab === "dtab-d-assign" ? "active" : ""}`} style={{display: dealerTab === "dtab-d-assign" ? "block" : "none"}}><div style={{padding: '24px 20px'}}><div style={{fontSize: 14, fontWeight: 600, marginBottom: 16}}>Operator Assignment</div><div className="form-grid" style={{padding: 0, maxWidth: 400}}><div className="form-group full"><label>Assigned Operator</label><select><option>Unassigned</option><option>Marie Tremblay</option><option>Alex Beaulieu</option><option>Sophie Martin</option></select></div><div className="form-group full"><label>Backup</label><select><option>None</option><option>Marie Tremblay</option><option>Alex Beaulieu</option></select></div></div><div style={{marginTop: 16}}><button className="btn btn-p" onClick={() => handleToast('Assignment saved')}>Save</button></div></div></div>
    </div>
  );
}
