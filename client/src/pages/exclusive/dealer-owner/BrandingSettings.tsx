import { useState } from 'react';

export default function BrandingSettings() {
  const [brandColor, setBrandColor] = useState('#08235d');
  const [accentColor, setAccentColor] = useState('#2563eb');

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Customer Portal Branding</span></div>
          <div className="form-grid">
            <div className="form-group full"><label>Dealership Name (shown to customers)</label><input defaultValue="Smith's RV Centre" /></div>
            <div className="form-group full"><label>Logo</label>
              <div className="upload-zone" style={{padding: 20}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 32, height: 32, color: '#ccc', marginBottom: 8}}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                <div style={{fontSize: 13, color: '#888'}}>Click to upload logo (PNG, SVG)</div>
              </div>
            </div>
            <div className="form-group"><label>Primary Color</label><div style={{display: 'flex', gap: 8, alignItems: 'center'}}><input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{width: 40, height: 40, border: '1px solid #e0e0e0', borderRadius: 8, padding: 4, cursor: 'pointer'}} /><input value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{width: 100, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'monospace'}} /></div></div>
            <div className="form-group"><label>Accent Color</label><div style={{display: 'flex', gap: 8, alignItems: 'center'}}><input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{width: 40, height: 40, border: '1px solid #e0e0e0', borderRadius: 8, padding: 4, cursor: 'pointer'}} /><input value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{width: 100, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'monospace'}} /></div></div>
            <div className="form-group full"><label>Welcome Message</label><textarea defaultValue="Welcome to your RV service portal. Track your warranty, claims, and services all in one place."></textarea></div>
          </div>
          <div className="btn-bar">
            <button className="btn btn-p" onClick={() => alert('Branding saved!')}>Save Branding</button>
            <button className="btn btn-o" onClick={() => alert('Preview opened')}>Preview</button>
            <button className="btn btn-o" style={{marginLeft: 'auto'}} onClick={() => { setBrandColor('#08235d'); setAccentColor('#2563eb'); }}>Restore Defaults</button>
          </div>
        </div>
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Custom Domain</span></div>
          <div style={{padding: 20}}>
            <div style={{fontSize: 13, color: '#666', marginBottom: 16, lineHeight: '1.5'}}>Set up a custom domain so your customers see your dealership's URL instead of dealersuite360.com. Example: <strong>portal.smithsrv.ca</strong></div>
            <div className="form-grid" style={{padding: 0}}>
              <div className="form-group full"><label>Custom Domain</label><input defaultValue="portal.smithsrv.ca" placeholder="portal.yourdealership.com" /></div>
              <div className="form-group full"><label>Status</label><div style={{display: 'flex', alignItems: 'center', gap: 8}}><span className="bg pending">Pending DNS</span><span style={{fontSize: 12, color: '#888'}}>CNAME record not detected</span></div></div>
              <div className="form-group full"><label>DNS Instructions</label><div style={{background: '#f5f6f8', padding: 14, borderRadius: 8, fontSize: 12, color: '#555', lineHeight: '1.6', fontFamily: "'SF Mono','Fira Code',monospace"}}>
                Add a CNAME record to your DNS:<br />
                <strong>Host:</strong> portal<br />
                <strong>Value:</strong> dealers.dealersuite360.com<br />
                <strong>TTL:</strong> 3600
              </div></div>
            </div>
          </div>
          <div className="btn-bar">
            <button className="btn btn-p" onClick={() => alert('DNS check initiated')}>Verify Domain</button>
            <button className="btn btn-o" onClick={() => alert('Domain settings saved')}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
