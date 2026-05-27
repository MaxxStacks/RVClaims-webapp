import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function AddFeatureReq() {
  const [, navigate] = useLocation();
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [featureReqSaving, setFeatureReqSaving] = useState(false);
  const [featureReqForm, setFeatureReqForm] = useState({
    title: '', requestedBy: 'Internal', priority: 'medium', targetVersion: 'v2.1', description: ''
  });

  useEffect(() => {
    apiFetch<any>('/api/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!featureReqForm.title) return;
    setFeatureReqSaving(true);
    try {
      await apiFetch('/api/feature-requests', { method: 'POST', body: JSON.stringify(featureReqForm) });
      navigate('changelog');
    } catch {} finally {
      setFeatureReqSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('changelog')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">Add Feature Request</div><div className="detail-meta">Log a new feature request from a dealer or internal team</div></div>
      </div>
      <div className="pn"><div className="form-grid">
        <div className="form-group"><label>Feature Title</label><input placeholder="Brief description of the feature..." value={featureReqForm.title} onChange={e => setFeatureReqForm(f => ({...f, title: e.target.value}))} /></div>
        <div className="form-group"><label>Requested By</label><select value={featureReqForm.requestedBy} onChange={e => setFeatureReqForm(f => ({...f, requestedBy: e.target.value}))}><option>Internal</option><option>Smith's RV Centre</option><option>Atlantic RV</option><option>Prairie Wind RV</option>{opDealers.map(d => <option key={d.id}>{d.name}</option>)}</select></div>
        <div className="form-group"><label>Priority</label><select value={featureReqForm.priority} onChange={e => setFeatureReqForm(f => ({...f, priority: e.target.value}))}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
        <div className="form-group"><label>Target Version</label><select value={featureReqForm.targetVersion} onChange={e => setFeatureReqForm(f => ({...f, targetVersion: e.target.value}))}><option>v2.1</option><option>v2.2</option><option>v2.3</option><option>v3.0</option><option>Backlog</option></select></div>
        <div className="form-group full"><label>Description</label><textarea placeholder="Detailed description of the feature, use case, and why it matters..." value={featureReqForm.description} onChange={e => setFeatureReqForm(f => ({...f, description: e.target.value}))}></textarea></div>
      </div><div className="btn-bar"><button className="btn btn-p" onClick={handleSubmit} disabled={featureReqSaving}>{featureReqSaving ? 'Submitting…' : 'Submit Request'}</button><button className="btn btn-o" onClick={() => navigate('changelog')}>Cancel</button></div></div>
    </div>
  );
}
