import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:      { bg: '#fef3c7', color: '#d97706' },
  under_review: { bg: '#dbeafe', color: '#2563eb' },
  approved:     { bg: '#dcfce7', color: '#16a34a' },
  active:       { bg: '#dcfce7', color: '#16a34a' },
  expired:      { bg: '#f3f4f6', color: '#6b7280' },
  suspended:    { bg: '#fee2e2', color: '#dc2626' },
  rejected:     { bg: '#fee2e2', color: '#dc2626' },
};

const CHECKLIST = [
  ['Business registration verified', 'Check provincial/state business registry for active status'],
  ['Dealer license confirmed', 'Verify dealer license number with applicable authority'],
  ['Physical location verified', 'Confirm address via Google Maps or visit'],
  ['Contact phone verified', 'Call to confirm direct contact'],
  ['Annual fee status', '$499/year via Stripe — confirm payment'],
];

export default function MktMemberDetail() {
  const [, navigate] = useLocation();
  const { memberId } = useParams<{ memberId: string }>();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [checked, setChecked] = useState<boolean[]>(CHECKLIST.map(() => false));

  useEffect(() => {
    if (!memberId) return;
    apiFetch<any>(`/api/marketplace/members/${memberId}`)
      .then(m => { setMember(m); setNotes(m.verificationNotes || ''); })
      .catch(() => setError('Member not found.'))
      .finally(() => setLoading(false));
  }, [memberId]);

  const handleVerify = async (status: 'active' | 'rejected') => {
    if (!memberId) return;
    setActing(true);
    try {
      await apiFetch(`/api/marketplace/members/${memberId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status, verificationNotes: notes }),
      });
      setMember((prev: any) => prev ? { ...prev, status } : prev);
      setActionMsg(status === 'active' ? 'Member approved.' : 'Application rejected.');
    } catch (e: any) {
      setActionMsg(e?.message || 'Action failed.');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="page active"><div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Loading…</div></div>;
  if (error || !member) {
    return (
      <div className="page active">
        <div style={{ padding: 48, textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          {error || 'Member not found.'}{' '}
          <button className="btn btn-o btn-sm" onClick={() => navigate('/operator/admin/marketplace/members')} style={{ marginLeft: 8 }}>Back</button>
        </div>
      </div>
    );
  }

  const style = STATUS_STYLE[member.status] || { bg: '#f3f4f6', color: '#6b7280' };

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('/operator/admin/marketplace/members')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">{member.businessName || member.contactName || 'Member'}</div>
          <div className="detail-meta">
            {member.createdAt ? `Applied ${new Date(member.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''} · Marketplace Membership
          </div>
        </div>
        <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, ...style }}>
          {member.status ? member.status.charAt(0).toUpperCase() + member.status.slice(1).replace(/_/g, ' ') : 'Pending'}
        </span>
      </div>

      {actionMsg && (
        <div style={{ padding: '10px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#166534' }}>
          {actionMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          <div className="pn" style={{ marginBottom: 16 }}>
            <div className="pn-h"><span className="pn-t">Verification Checklist</span><span style={{ fontSize: 12, color: '#888' }}>Complete all before approving</span></div>
            <div style={{ padding: 20 }}>
              {CHECKLIST.map(([title, desc], i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < CHECKLIST.length - 1 ? '1px solid #f5f5f5' : 'none', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={checked[i]}
                    onChange={e => setChecked(prev => { const n = [...prev]; n[i] = e.target.checked; return n; })}
                    style={{ width: 18, height: 18, flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="pn">
            <div className="pn-h"><span className="pn-t">Application Details</span></div>
            <div className="form-grid">
              {[
                ['Business Name', member.businessName],
                ['Legal Name', member.legalName || member.businessName],
                ['Owner / Contact', member.contactName],
                ['Email', member.contactEmail || member.businessEmail],
                ['Phone', member.contactPhone],
                ['Dealer License #', member.dealerLicenseNumber || '—'],
                ['Address', [member.address, member.city, member.province].filter(Boolean).join(', ') || '—'],
                ['Website', member.website || '—'],
              ].map(([label, val]) => (
                <div className="form-group" key={label}>
                  <label>{label}</label>
                  <input defaultValue={val || ''} readOnly style={{ background: '#f3f4f6' }} />
                </div>
              ))}
              {member.bio && (
                <div className="form-group full">
                  <label>Reason for Joining</label>
                  <textarea readOnly style={{ background: '#f3f4f6' }} defaultValue={member.bio} />
                </div>
              )}
              <div className="form-group full">
                <label>Internal Notes (staff only)</label>
                <textarea
                  placeholder="Add verification notes, call log, observations..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
            {!['active', 'rejected'].includes(member.status) && (
              <div className="btn-bar">
                <button
                  className="btn btn-s"
                  disabled={acting}
                  onClick={() => { if (window.confirm('Approve this member and activate their marketplace access?')) handleVerify('active'); }}
                >
                  Approve Member
                </button>
                <button
                  className="btn btn-d"
                  disabled={acting}
                  onClick={() => { if (window.confirm('Reject this application? The dealer will be notified.')) handleVerify('rejected'); }}
                >
                  Reject Application
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="cd-section">
            <div className="cd-section-h">Application Summary</div>
            <div className="cd-row">
              <span className="cd-label">Applied</span>
              <span className="cd-value">{member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-CA') : '—'}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Status</span>
              <span className="cd-value"><span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...style }}>{member.status || 'Pending'}</span></span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Annual Fee</span>
              <span className="cd-value" style={{ fontWeight: 600 }}>$499/year</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Membership Type</span>
              <span className="cd-value">{member.membershipType || 'Standard'}</span>
            </div>
          </div>
          <div className="cd-section">
            <div className="cd-section-h">Location</div>
            <div className="cd-row"><span className="cd-label">City</span><span className="cd-value">{member.city || '—'}</span></div>
            <div className="cd-row"><span className="cd-label">Province/State</span><span className="cd-value">{member.province || '—'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
