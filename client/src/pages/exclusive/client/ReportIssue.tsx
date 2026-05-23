import { useLocation } from 'wouter';

export default function ReportIssue() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{fontSize: 13, color: '#666', marginBottom: 20}}>Found something wrong with your RV? Upload photos and describe the issue. Your dealer will review and handle the warranty claim for you.</div>
      <div className="pn">
        <div style={{padding: 20}}>
          <div className="form-grid" style={{padding: 0, marginBottom: 16}}>
            <div className="form-group full"><label>What type of issue is it?</label><select style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}><option>Select...</option><option>Water leak / water damage</option><option>Structural damage (walls, roof, floor)</option><option>Appliance not working</option><option>Electrical issue</option><option>Plumbing issue</option><option>HVAC (heating / cooling)</option><option>Slide-out problem</option><option>Exterior damage</option><option>Interior damage</option><option>Other</option></select></div>
            <div className="form-group full"><label>Describe the issue</label><textarea placeholder="Tell us what's wrong. The more detail you provide, the faster we can help. Where is the damage? When did you first notice it? Is it getting worse?" style={{minHeight: 100}}></textarea></div>
          </div>
          <div className="upload-zone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><div style={{fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4}}>Upload Photos</div><div style={{fontSize: 13, color: '#888'}}>Take photos of the issue and upload them here. The more photos, the better.</div></div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-p" onClick={() => navigate('claims')}>Submit Issue</button>
          <button className="btn btn-o" onClick={() => alert('Draft saved')}>Save Draft</button>
        </div>
      </div>
    </div>
  );
}
