import { useState } from 'react';
import { useApiFetch } from '@/lib/api';

export default function DealerChangelog() {
  const apiFetch = useApiFetch();
  const [tab, setTab] = useState<'current'|'past'|'upcoming'|'request'>('current');
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800); };
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');
  const [featurePriority, setFeaturePriority] = useState('Nice to have');
  const [submittingFeature, setSubmittingFeature] = useState(false);

  async function submitFeatureRequest() {
    if (!featureTitle.trim()) { showToast('Feature title is required'); return; }
    setSubmittingFeature(true);
    try {
      await apiFetch('/api/feature-requests', {
        method: 'POST',
        body: JSON.stringify({ title: featureTitle, description: featureDesc, priority: featurePriority }),
      });
      showToast('Feature request submitted!');
      setFeatureTitle('');
      setFeatureDesc('');
      setFeaturePriority('Nice to have');
    } catch {
      showToast('Submit failed — please try again');
    } finally {
      setSubmittingFeature(false);
    }
  }

  return (
    <div className="page active">
      <div className="tabs">
        <div className={`tab ${tab === 'current' ? 'active' : ''}`} onClick={() => setTab('current')}>What's New</div>
        <div className={`tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>Past Updates</div>
        <div className={`tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>Coming Soon</div>
        <div className={`tab ${tab === 'request' ? 'active' : ''}`} onClick={() => setTab('request')}>Request a Feature</div>
      </div>

      {tab === 'current' && (
        <div className="pn">
          <div style={{padding: '24px 20px', borderBottom: '1px solid #f0f0f0'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div><div style={{fontSize: 24, fontWeight: 700, color: 'var(--brand)', marginBottom: 4}}>v2.0.0</div><div style={{fontSize: 14, color: '#888'}}>March 17, 2026</div></div>
              <span className="bg active" style={{fontSize: 13, padding: '6px 16px'}}>Latest</span>
            </div>
            <div style={{fontSize: 14, color: '#333', marginTop: 12, lineHeight: '1.6'}}>Complete platform rebuild with your dedicated dealer portal, customer portal management, and integrated service marketplace.</div>
          </div>
          <div style={{padding: 20, fontSize: 13, color: '#333', lineHeight: 2}}>
            <div style={{fontSize: 13, fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12}}>What you can do now</div>
            {[
              ['Upload photos and Push to Claim', 'select a unit, upload photos, describe the issue, and push directly to processing'],
              ['Track all your claims', 'see status, progress timeline, communicate with the claims team'],
              ['Request financing', 'submit customer financing requests, we shop lenders and find the best rate'],
              ['F&I product tracking', 'flag deals for F&I recommendations'],
              ['Order parts', 'request parts with sourcing, pricing, and delivery tracking'],
              ['Invite customers to their portal', 'white-label portal with your branding, logo, and custom domain'],
              ['Manage customer tickets', 'see and respond to customer support tickets from your portal'],
              ['Brand your customer portal', 'custom logo, colors, domain name, welcome message'],
              ['Manage your team', 'add/remove staff with role-based access (Owner vs Staff)'],
              ['Unit photo management', 'display photo visible to customers on their dashboard'],
            ].map(([title, desc]) => (
              <div key={title}><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>{title}</strong> — {desc}</div>
            ))}
          </div>
        </div>
      )}

      {tab === 'past' && (
        <div className="pn">
          <div style={{padding: 20}}>
            <div style={{borderLeft: '3px solid #e5e7eb', paddingLeft: 20}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700, color: '#333'}}>v1.0.0</div><span style={{fontSize: 12, color: '#888'}}>November 2025</span></div>
              <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>Original claims tracking portal</div>
              <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}>
                <div>• Basic claims submission and tracking</div>
                <div>• Contact form for new dealer signups</div>
                <div>• Bilingual website (EN/FR)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'upcoming' && (
        <div className="pn">
          <div style={{padding: 20}}>
            {[
              {date: 'April 2026', items: ['Drag-and-drop bulk photo upload with progress bars','Real-time notifications when claim status changes','Search and filter on all your tables','Email notifications for claim updates, invoices, and parts deliveries']},
              {date: 'May 2026', items: ['Online payment for invoices (credit card, Interac)','Customer portal SMS invitations','Quick Chat inbox for casual customer messages','Automated invoice generation on claim close']},
              {date: 'June 2026', items: ['AI-powered document scanner (warranty certs, invoices)','Mobile app (camera upload, unit tag scanning, push to claim on the go)','AI F&I Presenter for remote product presentations to customers']},
            ].map((block, i) => (
              <div key={block.date} style={{marginBottom: 24}}>
                <div style={{fontSize: 16, fontWeight: 700, color: i === 0 ? 'var(--brand)' : '#555', marginBottom: 4}}>Coming in {block.date}</div>
                <div style={{fontSize: 13, color: '#555', lineHeight: '1.8', marginTop: 8}}>
                  {block.items.map(item => <div key={item}>• {item}</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'request' && (
        <div className="pn">
          <div style={{padding: 20}}>
            <div style={{fontSize: 13, color: '#666', marginBottom: 16, lineHeight: '1.5'}}>Have an idea for a feature that would help your dealership? Let us know! We review all requests and prioritize based on dealer feedback.</div>
            <div className="form-grid" style={{padding: 0}}>
              <div className="form-group full"><label>Feature Title</label><input value={featureTitle} onChange={e => setFeatureTitle(e.target.value)} placeholder="Brief description of what you'd like to see..." /></div>
              <div className="form-group full"><label>Tell us more</label><textarea value={featureDesc} onChange={e => setFeatureDesc(e.target.value)} placeholder="How would this feature help your dealership? What problem does it solve?" style={{minHeight: 120}}></textarea></div>
              <div className="form-group"><label>Priority to you</label><select value={featurePriority} onChange={e => setFeaturePriority(e.target.value)}><option>Nice to have</option><option>Would really help</option><option>Critical for my business</option></select></div>
            </div>
            <div className="btn-bar" style={{padding: '16px 0'}}><button className="btn btn-p" disabled={submittingFeature} onClick={submitFeatureRequest}>{submittingFeature ? 'Submitting...' : 'Submit Request'}</button></div>
          </div>
        </div>
      )}
      {toast && <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1e293b',color:'#fff',padding:'10px 20px',borderRadius:8,fontSize:13,zIndex:9999,boxShadow:'0 4px 12px rgba(0,0,0,.2)'}}>{toast}</div>}
    </div>
  );
}
