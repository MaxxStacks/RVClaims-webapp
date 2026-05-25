import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function BrandingSettings() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isDealerOwner = user?.role === 'dealer_owner';

  // Derive dealerId from URL path /:dealerId/owner/branding
  const dealerId = user?.dealershipId || (() => {
    const segs = location.split('/').filter(Boolean);
    return segs[0] || null;
  })();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const [dealerName, setDealerName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#08235d');
  const [primaryColorHex, setPrimaryColorHex] = useState('#08235d');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [accentColorHex, setAccentColorHex] = useState('#2563eb');
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to your RV service portal. Track your warranty, claims, and services all in one place.');
  const [customDomain, setCustomDomain] = useState('');
  const [domainVerified, setDomainVerified] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  useEffect(() => {
    if (!dealerId) return;
    apiFetch<any>(`/api/v6/dealerships/${dealerId}`)
      .then(d => {
        const data = d.dealership || d;
        setDealerName(data.name || '');
        setLogoUrl(data.logoUrl || '');
        const pc = data.primaryColor || '#08235d';
        const ac = data.accentColor || data.secondaryColor || '#2563eb';
        setPrimaryColor(pc); setPrimaryColorHex(pc);
        setAccentColor(ac); setAccentColorHex(ac);
        setWelcomeMessage(data.welcomeMessage || welcomeMessage);
        setCustomDomain(data.customDomain || '');
        setDomainVerified(data.domainVerified || false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dealerId]);

  // Bidirectional color sync
  const handlePrimaryPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryColor(e.target.value);
    setPrimaryColorHex(e.target.value);
  };
  const handlePrimaryHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryColorHex(e.target.value);
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setPrimaryColor(e.target.value);
  };
  const handleAccentPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccentColor(e.target.value);
    setAccentColorHex(e.target.value);
  };
  const handleAccentHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccentColorHex(e.target.value);
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setAccentColor(e.target.value);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (dealerId) formData.append('dealershipId', dealerId);
      const res = await fetch('/api/v6/uploads', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.url || data.publicUrl || data.fileUrl || '');
        showToast('Logo uploaded');
      } else {
        showToast('Logo upload failed');
      }
    } catch {
      showToast('Logo upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!dealerId) return;
    setSaving(true);
    try {
      await apiFetch(`/api/v6/dealerships/${dealerId}/branding`, {
        method: 'PATCH',
        body: JSON.stringify({
          logoUrl,
          primaryColor,
          accentColor,
          secondaryColor: accentColor,
          welcomeMessage,
        }),
      });
      showToast('Branding saved');
    } catch {
      showToast('Failed to save branding');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDomain = async () => {
    if (!dealerId) return;
    setSaving(true);
    try {
      await apiFetch(`/api/v6/dealerships/${dealerId}/branding`, {
        method: 'PATCH',
        body: JSON.stringify({ customDomain }),
      });
      showToast('Domain settings saved');
    } catch {
      showToast('Failed to save domain');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = () => {
    setPrimaryColor('#08235d');
    setPrimaryColorHex('#08235d');
    setAccentColor('#2563eb');
    setAccentColorHex('#2563eb');
    showToast('Defaults restored — click Save to apply');
  };

  if (!isDealerOwner) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#dc2626', fontWeight: 600, fontSize: 16 }}>
        Access Denied — Dealer Owner role required
      </div>
    );
  }

  if (loading) {
    return <div className="page active" style={{ textAlign: 'center', paddingTop: 60, color: '#888' }}>Loading…</div>;
  }

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
          {toastMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Branding Panel */}
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Customer Portal Branding</span></div>
          <div className="form-grid">
            <div className="form-group full">
              <label>Dealership Name (shown to customers)</label>
              <input value={dealerName} onChange={e => setDealerName(e.target.value)} placeholder="Your Dealership Name" />
            </div>

            <div className="form-group full">
              <label>Logo</label>
              {logoUrl ? (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <img src={logoUrl} alt="Logo" style={{ height: 48, objectFit: 'contain', borderRadius: 4, border: '1px solid #e0e0e0' }} />
                  <button className="btn btn-o btn-sm" onClick={() => setLogoUrl('')}>Remove</button>
                </div>
              ) : null}
              <label style={{ cursor: 'pointer' }}>
                <div className="upload-zone" style={{ padding: 20 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 32, height: 32, color: '#ccc', marginBottom: 8, display: 'block', margin: '0 auto 8px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <div style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>
                    {logoUploading ? 'Uploading…' : 'Click to upload logo (PNG, SVG, JPG)'}
                  </div>
                </div>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
              </label>
            </div>

            <div className="form-group">
              <label>Primary Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={handlePrimaryPickerChange}
                  style={{ width: 40, height: 40, border: '1px solid #e0e0e0', borderRadius: 8, padding: 4, cursor: 'pointer' }}
                />
                <input
                  value={primaryColorHex}
                  onChange={handlePrimaryHexChange}
                  style={{ width: 100, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'monospace' }}
                  placeholder="#08235d"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Accent Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="color"
                  value={accentColor}
                  onChange={handleAccentPickerChange}
                  style={{ width: 40, height: 40, border: '1px solid #e0e0e0', borderRadius: 8, padding: 4, cursor: 'pointer' }}
                />
                <input
                  value={accentColorHex}
                  onChange={handleAccentHexChange}
                  style={{ width: 100, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'monospace' }}
                  placeholder="#2563eb"
                />
              </div>
            </div>

            <div className="form-group full">
              <label>Welcome Message</label>
              <textarea
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="btn-bar">
            <button className="btn btn-p" onClick={handleSaveBranding} disabled={saving}>{saving ? 'Saving…' : 'Save Branding'}</button>
            <button className="btn btn-o" style={{ marginLeft: 'auto' }} onClick={handleRestoreDefaults}>Restore Defaults</button>
          </div>
        </div>

        {/* Custom Domain Panel */}
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Custom Domain</span></div>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: '1.5' }}>
              Set up a custom domain so your customers see your dealership's URL instead of dealersuite360.com.{' '}
              Example: <strong>portal.smithsrv.ca</strong>
            </div>
            <div className="form-grid" style={{ padding: 0 }}>
              <div className="form-group full">
                <label>Custom Domain</label>
                <input
                  value={customDomain}
                  onChange={e => setCustomDomain(e.target.value)}
                  placeholder="portal.yourdealership.com"
                />
              </div>
              <div className="form-group full">
                <label>Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`bg ${domainVerified ? 'active' : 'pending'}`}>{domainVerified ? 'Verified' : 'Pending DNS'}</span>
                  {!domainVerified && <span style={{ fontSize: 12, color: '#888' }}>CNAME record not detected</span>}
                </div>
              </div>
              <div className="form-group full">
                <label>DNS Instructions</label>
                <div style={{ background: '#f5f6f8', padding: 14, borderRadius: 8, fontSize: 12, color: '#555', lineHeight: '1.6', fontFamily: "'SF Mono','Fira Code',monospace" }}>
                  Add a CNAME record to your DNS:<br />
                  <strong>Host:</strong> portal<br />
                  <strong>Value:</strong> dealers.dealersuite360.com<br />
                  <strong>TTL:</strong> 3600
                </div>
              </div>
            </div>
          </div>
          <div className="btn-bar">
            <button className="btn btn-p" onClick={handleSaveDomain} disabled={saving}>Save Domain</button>
          </div>
        </div>
      </div>
    </div>
  );
}
