import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const CATEGORIES = [
  { value: 'claim_warranty', label: 'Claim / Warranty Issue' },
  { value: 'billing', label: 'Billing / Invoice Question' },
  { value: 'parts_order', label: 'Parts Order Inquiry' },
  { value: 'general', label: 'General Question' },
  { value: 'warranty_expiry', label: 'Warranty Expiry / Renewal' },
  { value: 'fi_protection', label: 'F&I / Protection Plans' },
  { value: 'feedback', label: 'Feedback / Complaint' },
];

export default function NewTicket() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
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
    if (e.target.files) {
      setPhotoFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) { showToast('Please select a category'); return; }
    if (!subject.trim()) { showToast('Subject is required'); return; }
    if (!description.trim()) { showToast('Please describe your issue'); return; }

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
        } catch { /* continue without this photo */ }
      }

      const data = await apiFetch<any>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          message: description.trim(),
          attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined,
          dealershipId: user?.dealershipId,
        }),
      });

      const ticket = data.ticket || data;
      if (ticket?.id) {
        // Navigate to the ticket detail page
        const segs = location.split('/').filter(Boolean);
        // segs looks like ['dealerId', 'client', 'tickets', 'new']
        const base = segs.slice(0, -1).join('/');
        navigate(`/${base}/${ticket.id}`);
      } else {
        navigate('../tickets');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create ticket');
      setSubmitting(false);
    }
  };

  const getBackPath = () => {
    const segs = location.split('/').filter(Boolean);
    // Remove 'new' segment
    return '/' + segs.slice(0, -1).join('/');
  };

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)'}}>
          {toastMsg}
        </div>
      )}

      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate(getBackPath())}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">New Support Ticket</div>
          <div className="detail-meta">Create a ticket to discuss a specific topic with your dealer</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="pn">
          <div className="form-grid">
            <div className="form-group">
              <label>Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}
                required
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div className="form-group full">
              <label>Subject</label>
              <input
                placeholder="Brief description of your question or issue..."
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group full">
              <label>Message</label>
              <textarea
                placeholder="Describe your question or issue in detail..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={{minHeight: 120}}
                required
              />
            </div>

            <div className="form-group full">
              <label>Attachments (optional)</label>
              <div
                className="upload-zone"
                style={{padding: 20, cursor: 'pointer'}}
                onClick={() => fileRef.current?.click()}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 32, height: 32, color: '#ccc', marginBottom: 8}}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <div style={{fontSize: 13, color: '#888'}}>Click to attach photos or files</div>
                <input ref={fileRef} type="file" accept="image/*,.pdf" multiple style={{display: 'none'}} onChange={handleFileChange} />
              </div>

              {photoFiles.length > 0 && (
                <div style={{marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8}}>
                  {photoFiles.map((f, i) => (
                    <div key={i} style={{background: '#f0f4ff', borderRadius: 6, padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6}}>
                      {f.name}
                      <span style={{cursor: 'pointer', color: '#e53e3e', fontWeight: 600}} onClick={() => removeFile(i)}>×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="btn-bar">
            <button type="submit" className="btn btn-p" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <button type="button" className="btn btn-o" onClick={() => navigate(getBackPath())}>Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
}
