import { useLocation } from 'wouter';

export default function WorkOrderNew() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('techflow')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">New Work Order</div><div className="detail-meta">Create a work order for your service department</div></div>
      </div>
      <div className="pn">
        <div className="form-grid">
          <div className="form-group"><label>Unit</label><select><option>Select unit...</option><option>2024 Jayco Jay Flight 264BH</option><option>2024 Forest River Rockwood</option><option>2023 Keystone Montana</option><option>2022 Heartland Bighorn</option></select></div>
          <div className="form-group"><label>Assigned Technician</label><select><option>Unassigned</option><option>Mike T.</option><option>Jason R.</option><option>Carlos P.</option></select></div>
          <div className="form-group"><label>Priority</label><select><option>Normal</option><option>Urgent</option><option>Low</option></select></div>
          <div className="form-group"><label>Due Date</label><input type="date" /></div>
          <div className="form-group full"><label>Description</label><textarea placeholder="Describe the work to be done..."></textarea></div>
          <div className="form-group full"><label>Related Claim</label><select><option>None</option><option>CLM-0248 — Warranty</option><option>CLM-0246 — PDI</option></select></div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-p" onClick={() => { alert('Work order created'); navigate('techflow'); }}>Create Work Order</button>
          <button className="btn btn-o" onClick={() => navigate('techflow')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
