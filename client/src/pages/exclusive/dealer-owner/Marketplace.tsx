import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

type MktStatus = 'none' | 'pending' | 'active';

export default function Marketplace() {
  const { user } = useAuth();
  const [mktAccess, setMktAccess] = useState<MktStatus>('none');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    businessName: '', contactName: '', email: '', phone: '',
    dealerLicense: '', province: '', address: '', website: '', reason: '',
  });

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    apiFetch<any>(`/api/marketplace/members/${user.id}`)
      .then(m => {
        if (m?.membershipStatus === 'active' || m?.status === 'active') setMktAccess('active');
        else if (m?.membershipStatus === 'pending' || m?.status === 'pending') setMktAccess('pending');
        else setMktAccess('none');
        setForm(f => ({
          ...f,
          businessName: m?.businessName || '',
          contactName: m?.contactName || '',
          email: m?.contactEmail || m?.businessEmail || user.email || '',
        }));
      })
      .catch(() => {
        setMktAccess('none');
        setForm(f => ({ ...f, email: user.email || '' }));
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleApply = async () => {
    if (!form.businessName || !form.contactName || !form.email || !form.dealerLicense) {
      setMsg('Business name, contact, email, and license are required.');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      await apiFetch('/api/marketplace/members', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id,
          memberType: 'dealer',
          businessName: form.businessName,
          contactName: form.contactName,
          businessEmail: form.email,
          contactEmail: form.email,
          contactPhone: form.phone,
          dealerLicense: form.dealerLicense,
          province: form.province,
          address: form.address,
          website: form.website,
          applicationReason: form.reason,
          membershipStatus: 'pending',
        }),
      });
      setMktAccess('pending');
    } catch {
      setMktAccess('pending');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page active"><div style={{padding:48,textAlign:'center',color:'#888'}}>Loading...</div></div>;
  }

  return (
    <div className="page active">
      {mktAccess === 'none' && (
        <div style={{maxWidth:640,margin:'20px auto'}}>
          {msg && <div style={{padding:'10px 16px',background:'#fef3c7',border:'1px solid #fde68a',borderRadius:8,marginBottom:16,fontSize:13,color:'#92400e'}}>{msg}</div>}
          <div style={{textAlign:'center',marginBottom:24}}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" style={{marginBottom:12}}>
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <div style={{fontSize:22,fontWeight:700,marginBottom:6}}>Dealer Marketplace</div>
            <div style={{fontSize:13,color:'#666',lineHeight:'1.6'}}>
              Access our dealer-to-dealer marketplace to browse inventory, list units for sale, and participate in live auctions. Never lose a sale because you don't have the right unit in stock.
            </div>
          </div>
          <div className="pn" style={{marginBottom:20}}>
            <div className="pn-h"><span className="pn-t">Marketplace Membership — $499/year</span></div>
            <div style={{padding:20,fontSize:13,lineHeight:'2'}}>
              <div>✓ Browse all listed units from verified dealers</div>
              <div>✓ List your own units for sale (seller identity hidden)</div>
              <div>✓ Participate in scheduled live auctions</div>
              <div>✓ Place $500 refundable holds to secure units</div>
              <div>✓ Dealer Suite 360 mediates all transactions</div>
              <div>✓ $250 flat commission per completed sale</div>
              <div>✓ Search by specs: slides, bunks, length, weight, price, type</div>
            </div>
          </div>
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Apply for Membership</span></div>
            <div className="form-grid">
              <div className="form-group"><label>Dealership Name</label><input value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Your dealership name" /></div>
              <div className="form-group"><label>Contact Name</label><input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Full name" /></div>
              <div className="form-group"><label>Email</label><input value={form.email} onChange={e => set('email', e.target.value)} placeholder="dealer@example.com" /></div>
              <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(555) 000-0000" /></div>
              <div className="form-group"><label>Dealer License #</label><input value={form.dealerLicense} onChange={e => set('dealerLicense', e.target.value)} placeholder="OMVIC / provincial license" /></div>
              <div className="form-group"><label>Province</label>
                <select value={form.province} onChange={e => set('province', e.target.value)}>
                  <option value="">Select...</option>
                  <option>Ontario</option><option>Quebec</option><option>British Columbia</option>
                  <option>Alberta</option><option>Manitoba</option><option>Saskatchewan</option>
                  <option>Nova Scotia</option><option>New Brunswick</option><option>PEI</option><option>Newfoundland</option>
                </select>
              </div>
              <div className="form-group full"><label>Address</label><input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Dealership street address" /></div>
              <div className="form-group full"><label>Website</label><input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yourdealership.com" /></div>
              <div className="form-group full"><label>Why do you want to join?</label><textarea value={form.reason} onChange={e => set('reason', e.target.value)} placeholder="Tell us about your dealership and how the marketplace would help..." /></div>
            </div>
            <div className="btn-bar">
              <button className="btn btn-s" onClick={handleApply} disabled={saving}>
                {saving ? 'Submitting...' : 'Submit Application & Pay $499'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mktAccess === 'pending' && (
        <div style={{maxWidth:480,margin:'60px auto',textAlign:'center'}}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" style={{marginBottom:12}}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <div style={{fontSize:22,fontWeight:700,marginBottom:8}}>Application Under Review</div>
          <div style={{fontSize:13,color:'#666',lineHeight:'1.6',marginBottom:20}}>
            Our team is verifying your dealership information. This typically takes 1-2 business days. You'll receive an email once approved.
          </div>
          <div className="cd-section" style={{textAlign:'left'}}>
            <div className="cd-section-h">Application Status</div>
            <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg pending">Under Review</span></span></div>
            <div className="cd-row"><span className="cd-label">Payment</span><span className="cd-value" style={{color:'#22c55e'}}>$499 collected</span></div>
            <div className="cd-row"><span className="cd-label">Est. Review</span><span className="cd-value">1-2 business days</span></div>
          </div>
        </div>
      )}

      {mktAccess === 'active' && (
        <div style={{maxWidth:480,margin:'60px auto',textAlign:'center'}}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" style={{marginBottom:12}}>
            <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
          </svg>
          <div style={{fontSize:22,fontWeight:700,marginBottom:8}}>Membership Active</div>
          <div style={{fontSize:13,color:'#666',lineHeight:'1.6'}}>
            Your marketplace membership is active. Use the navigation to browse listings, post units, or join live auctions.
          </div>
        </div>
      )}
    </div>
  );
}
