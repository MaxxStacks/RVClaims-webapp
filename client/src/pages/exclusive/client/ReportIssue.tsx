import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const ISSUE_TYPES = [
  'Water leak / water damage',
  'Structural damage (walls, roof, floor)',
  'Appliance not working',
  'Electrical issue',
  'Plumbing issue',
  'HVAC (heating / cooling)',
  'Slide-out problem',
  'Exterior damage',
  'Interior damage',
  'Other',
];

export default function ReportIssue() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotoFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (idx: number) => setPhotoFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!issueType) { showToast('Please select an issue type'); return; }
    if (!description.trim()) { showToast('Please describe the issue'); return; }

    setSubmitting(true);
    try {
      // Upload photos first
      const attachmentUrls: string[] = [];
      for (const file of photoFiles) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('scope', 'general');
        try {
          const r = await fetch('/api/v6/uploads', { method: 'POST', body: fd });
          if (r.ok) {
            const p = await r.json();
            attachmentUrls.push(p.publicUrl || p.url || p.storageKey);
          }
        } catch { /* skip failed upload */ }
      }

      // Create a support ticket of category claim_warranty
      const data = await apiFetch<any>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          category: 'claim_warranty',
          subject: `Issue Report: ${issueType}`,
          message: description.trim(),
          attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined,
          dealershipId: user?.dealershipId,
        }),
      });

      const ticket = data.ticket || data;
      showToast('Issue submitted! Your dealer will review it shortly.');

      // Navigate to the ticket
      if (ticket?.id) {
        const segs = location.split('/').filter(Boolean);
        const base = segs.slice(0, -1).join('/');
        setTimeout(() => navigate(`/${base}/tickets/${ticket.id}`), 1200);
      } else {
        setTimeout(() => navigate('../tickets'), 1200);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit issue');
      setSubmitting(false);
    }
  };

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)'}}>
          {toastMsg}
        </div>
      )}

      <div style={{fontSize: 13, color: '#666', marginBottom: 20}}>
        Found something wrong with your RV? Upload photos and describe the issue. Your dealer will review and handle the warranty claim for you.
      </div>

      <div className="pn">
        <div style={{padding: 20}}>
          <div className="form-grid" style={{padding: 0, marginBottom: 16}}>
            <div className="form-group full">
              <label>What type of issue is it?</label>
              <select
                value={issueType}
                onChange={e => setIssueType(e.target.value)}
                style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}
              >
                <option value="">Select...</option>
                {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group full">
              <label>Describe the issue</label>
              <textarea
                placeholder="Tell us what's wrong. The more detail you provide, the faster we can help. Where is the damage? When did you first notice it? Is it getting worse?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{minHeight: 100}}
              />
            </div>
          </div>

          <div
            className="upload-zone"
            style={{cursor: 'pointer'}}
            onClick={() => fileRef.current?.click()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <div style={{fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4}}>Upload Photos</div>
            <div style={{fontSize: 13, color: '#888'}}>Take photos of the issue and upload them here. The more photos, the better.</div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{display: 'none'}} onChange={handleFileChange} />
          </div>

          {photoFiles.length > 0 && (
            <div style={{marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8}}>
              {photoFiles.map((f, i) => (
                <div key={i} style={{background: '#f0f4ff', borderRadius: 6, padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6}}>
                  {f.name}
                  <span style={{cursor: 'pointer', color: '#e53e3e', fontWeight: 600}} onClick={() => removeFile(i)}>×</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="btn-bar">
          <button className="btn btn-p" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Issue'}
          </button>
          <button className="btn btn-o" onClick={() => navigate('../claims')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
