import { useLocation } from 'wouter';

export default function NewTicket() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('tickets')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">New Support Ticket</div><div className="detail-meta">Create a ticket to discuss a specific topic with your dealer</div></div>
      </div>
      <div className="pn"><div className="form-grid">
        <div className="form-group"><label>Category</label>
          <select style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}>
            <option>Select category...</option>
            <option>Claim / Warranty Issue</option>
            <option>Billing / Invoice Question</option>
            <option>Parts Order Inquiry</option>
            <option>General Question</option>
            <option>Warranty Expiry / Renewal</option>
            <option>F&I / Protection Plans</option>
            <option>Feedback / Complaint</option>
          </select>
        </div>
        <div className="form-group"><label>Related Item (optional)</label>
          <select style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}>
            <option>None</option>
            <option>CLM-0248 (Warranty claim)</option>
            <option>PO-0038 (Parts order)</option>
            <option>WP-0041 (Ext. warranty)</option>
          </select>
        </div>
        <div className="form-group full"><label>Subject</label><input placeholder="Brief description of your question or issue..." /></div>
        <div className="form-group full"><label>Message</label><textarea placeholder="Describe your question or issue in detail..." style={{minHeight: 120}}></textarea></div>
        <div className="form-group full"><label>Attachments (optional)</label>
          <div className="upload-zone" style={{padding: 20}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 32, height: 32, color: '#ccc', marginBottom: 8}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><div style={{fontSize: 13, color: '#888'}}>Click to attach photos or files</div></div>
        </div>
      </div>
      <div className="btn-bar">
        <button className="btn btn-p" onClick={() => navigate('tickets')}>Submit Ticket</button>
        <button className="btn btn-o" onClick={() => navigate('tickets')}>Cancel</button>
      </div></div>
    </div>
  );
}
