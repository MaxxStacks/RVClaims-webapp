import { useState } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function BlogCreate() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    title: '',
    targetKeyword: '',
    category: 'Warranty Guides',
    promptTemplate: 'manufacturer-warranty-guide',
    scheduledDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.title || !form.targetKeyword) {
      setError('Title and target keyword are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await apiFetch('/api/blog/admin/queue', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          targetKeyword: form.targetKeyword,
          category: form.category,
          promptTemplate: form.promptTemplate,
          scheduledGeneration: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : new Date().toISOString(),
        }),
      });
      navigate('/operator/admin/blog');
    } catch (e: any) {
      setError(e?.message || 'Failed to add topic. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="detail-back" onClick={() => navigate('/operator/admin/blog')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Add Blog Topic</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Queue a new topic for AI content generation</div>
        </div>
      </div>

      <div className="pn" style={{ maxWidth: 640 }}>
        <div className="pn-h"><span className="pn-t">Topic Details</span></div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Topic Title <span style={{ color: '#dc2626' }}>*</span></label>
            <input placeholder="e.g. How to File a Jayco Warranty Claim in 2026" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-group full">
            <label>Target Keyword <span style={{ color: '#dc2626' }}>*</span></label>
            <input placeholder="e.g. jayco warranty claim process" value={form.targetKeyword} onChange={e => setForm(f => ({ ...f, targetKeyword: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              <option>Warranty Guides</option>
              <option>Inspections</option>
              <option>Dealership Operations</option>
              <option>Industry</option>
              <option>Guides</option>
            </select>
          </div>
          <div className="form-group">
            <label>Prompt Template</label>
            <select value={form.promptTemplate} onChange={e => setForm(f => ({ ...f, promptTemplate: e.target.value }))}>
              <option value="manufacturer-warranty-guide">Manufacturer Warranty Guide</option>
              <option value="dealership-operations">Dealership Operations</option>
              <option value="pdi-inspection">PDI Inspection</option>
              <option value="industry-trends">Industry Trends</option>
              <option value="how-to">How-To Guide</option>
            </select>
          </div>
          <div className="form-group full">
            <label>Scheduled Generation Date <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — defaults to now)</span></label>
            <input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} />
          </div>
        </div>
        {error && <div style={{ padding: '0 20px 16px', color: '#dc2626', fontSize: 13 }}>{error}</div>}
        <div className="btn-bar">
          <button className="btn btn-p" onClick={handleSubmit} disabled={saving}>{saving ? 'Adding…' : 'Add to Queue'}</button>
          <button className="btn btn-o" style={{ marginLeft: 8 }} onClick={() => navigate('/operator/admin/blog')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
