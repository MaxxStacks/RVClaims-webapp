import { useLocation } from 'wouter';

export default function WorkOrderDetail() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('techflow')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">WO-0041</div><div className="detail-meta">2024 Jayco Jay Flight · Slide-out seal replacement</div></div>
        <span className="bg in-progress" style={{fontSize: 13, padding: '6px 16px'}}>In Progress</span>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div>
          <div className="pn" style={{marginBottom: 16}}>
            <div className="pn-h"><span className="pn-t">Work Details</span></div>
            <div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">2024 Jayco Jay Flight 264BH</span></div>
            <div className="cd-row"><span className="cd-label">Description</span><span className="cd-value">Slide-out seal replacement — full perimeter seal worn</span></div>
            <div className="cd-row"><span className="cd-label">Assigned To</span><span className="cd-value">Mike T.</span></div>
            <div className="cd-row"><span className="cd-label">Due</span><span className="cd-value">Apr 28, 2026</span></div>
            <div className="cd-row"><span className="cd-label">Related Claim</span><span className="cd-value cid" onClick={() => navigate('claim-detail')}>CLM-0248</span></div>
          </div>
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Notes</span></div>
            <div style={{padding: '16px 20px', fontSize: 13, color: '#555', lineHeight: 1.6}}>Seal kit on order (PO-0038). Expected delivery Mar 18. Schedule repair after parts arrive.</div>
            <div style={{padding: '0 20px 16px'}}>
              <textarea placeholder="Add a note..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea>
              <div style={{textAlign: 'right', marginTop: 8}}><button className="btn btn-p btn-sm" onClick={() => alert('Note added')}>Add Note</button></div>
            </div>
          </div>
        </div>
        <div>
          <div className="cd-section">
            <div className="cd-section-h">Work Order Info</div>
            <div className="cd-row"><span className="cd-label">WO #</span><span className="cd-value">WO-0041</span></div>
            <div className="cd-row"><span className="cd-label">Created</span><span className="cd-value">Apr 22, 2026</span></div>
            <div className="cd-row"><span className="cd-label">Priority</span><span className="cd-value">Normal</span></div>
            <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg in-progress">In Progress</span></span></div>
          </div>
          <div className="cd-section" style={{marginTop: 12}}>
            <div className="cd-section-h">Update Status</div>
            <div style={{padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8}}>
              <select style={{padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit'}}><option>Open</option><option>In Progress</option><option>Waiting on Parts</option><option>Complete</option><option>Cancelled</option></select>
              <button className="btn btn-p btn-sm" onClick={() => alert('Status updated')}>Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
