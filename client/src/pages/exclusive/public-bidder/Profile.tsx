import { useState } from 'react';

const provinces = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

export default function Profile() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [address, setAddress]     = useState('');
  const [city, setCity]           = useState('');
  const [province, setProvince]   = useState('');
  const [postal, setPostal]       = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const handleSave = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="page active">
      <div style={{maxWidth: 720}}>
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Personal Information</span></div>
          <div style={{padding: '20px 24px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f0f0f0'}}>
              <div style={{width: 64, height: 64, borderRadius: '50%', background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0}}>
                {firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : 'JD'}
              </div>
              <div>
                <div style={{fontSize: 15, fontWeight: 600, marginBottom: 4}}>{firstName && lastName ? `${firstName} ${lastName}` : 'Your Name'}</div>
                <button className="btn btn-o btn-sm">Upload Photo</button>
              </div>
            </div>

            <div className="form-grid c3" style={{gap: 16}}>
              <div className="form-group"><label>First Name</label><input placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
              <div className="form-group"><label>Last Name</label><input placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Address</label></div>
              <div className="form-group full"><label>Street Address</label><input placeholder="123 Main Street" value={address} onChange={e => setAddress(e.target.value)} /></div>
              <div className="form-group"><label>City</label><input placeholder="Toronto" value={city} onChange={e => setCity(e.target.value)} /></div>
              <div className="form-group"><label>Province</label>
                <select value={province} onChange={e => setProvince(e.target.value)}>
                  <option value="">Select...</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Postal Code</label><input placeholder="M5V 2T6" value={postal} onChange={e => setPostal(e.target.value)} /></div>
              <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Contact</label></div>
              <div className="form-group"><label>Phone</label><input type="tel" placeholder="(555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            </div>

            <div className="btn-bar" style={{marginTop: 20}}>
              <button className="btn btn-s" onClick={handleSave}>{profileSaved ? '✓ Saved' : 'Save Changes'}</button>
              <button className="btn btn-o" onClick={() => { setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setAddress(''); setCity(''); setProvince(''); setPostal(''); }}>Clear</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
