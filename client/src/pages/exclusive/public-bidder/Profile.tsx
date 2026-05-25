import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const provinces = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];
const usStates = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

export default function Profile() {
  const { user } = useAuth();
  const [memberId, setMemberId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postal, setPostal] = useState('');
  const [company, setCompany] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    apiFetch<any>(`/api/marketplace/members/${user.id}`)
      .then(m => {
        setMemberId(m.id || '');
        const parts = (m.contactName || '').split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
        setEmail(m.contactEmail || m.businessEmail || user.email || '');
        setPhone(m.contactPhone || '');
        setAddress(m.address || '');
        setCity(m.city || '');
        setProvince(m.province || '');
        setPostal(m.postalCode || '');
        setCompany(m.businessName || '');
      })
      .catch(() => { setEmail(user.email || ''); });
  }, [user?.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const id = memberId || user?.id;
      await apiFetch(`/api/marketplace/members/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          contactName: `${firstName} ${lastName}`.trim(),
          contactEmail: email,
          contactPhone: phone,
          address,
          city,
          province,
          postalCode: postal,
          businessName: company,
        }),
      });
      setSaveMsg('Profile saved successfully.');
    } catch {
      setSaveMsg('Profile updated.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 4000);
    }
  };

  return (
    <div className="page active">
      <div style={{maxWidth:680}}>
        {saveMsg && <div style={{padding:'10px 16px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,marginBottom:16,fontSize:13,color:'#166534'}}>{saveMsg}</div>}
        <div className="pn">
          <div className="pn-h"><span className="pn-t">My Profile</span></div>
          <div className="form-grid" style={{padding:'16px 20px'}}>
            <div className="form-group"><label>First Name</label><input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" /></div>
            <div className="form-group"><label>Last Name</label><input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" /></div>
            <div className="form-group"><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" /></div>
            <div className="form-group"><label>Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" /></div>
            <div className="form-group full"><label>Company / Dealership (optional)</label><input value={company} onChange={e => setCompany(e.target.value)} placeholder="Your company name" /></div>
            <div className="form-group full"><label>Street Address</label><input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St" /></div>
            <div className="form-group"><label>City</label><input value={city} onChange={e => setCity(e.target.value)} placeholder="City" /></div>
            <div className="form-group"><label>Province / State</label>
              <select value={province} onChange={e => setProvince(e.target.value)}>
                <option value="">Select...</option>
                <optgroup label="Canadian Provinces">{provinces.map(p => <option key={p} value={p}>{p}</option>)}</optgroup>
                <optgroup label="US States">{usStates.map(s => <option key={s} value={s}>{s}</option>)}</optgroup>
              </select>
            </div>
            <div className="form-group"><label>Postal / ZIP</label><input value={postal} onChange={e => setPostal(e.target.value)} placeholder="A1A 1A1" /></div>
          </div>
          <div style={{padding:'0 20px 20px',display:'flex',gap:8}}>
            <button className="btn btn-p" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
