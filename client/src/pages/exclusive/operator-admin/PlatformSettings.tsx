import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

type ConnStatus = Record<string, boolean>;

const SECTION_DEFAULTS = {
  general: { platformName: 'Dealer Suite 360', supportEmail: 'support@dealersuite360.com', supportPhone: '(888) 443-2204', defaultLanguage: 'English', currency: 'CAD ($)', timezone: 'Eastern', staleClaimThreshold: '36', platformUrl: 'https://dealersuite360.com' },
  'claim-fees': { feeType: 'Percentage of approved amount', feeRate: '10', minFee: '$50.00', maxFee: '$500.00', dafFee: '$25.00', pdiFee: '$15.00', whenToInvoice: 'Auto on claim close' },
  billing: { taxRate: 'HST 13% (Ontario)', taxRegistration: 'RT 0001', paymentProcessor: 'Stripe', stripeMode: 'Test Mode', defaultPaymentTerms: 'Net 15', invoicePrefix: 'INV-', nextInvoiceNum: '0090', invoiceFooter: 'Payment is due within 15 days of invoice date. Late payments may incur a 2% monthly service charge.' },
  notifications: { newPhotoBatch: 'Push + Email', claimStatusChanged: 'Push + Email', staleClaimAlert: 'Push + Email', newDealerSignup: 'Push + Email', fromName: 'Dealer Suite 360', replyToEmail: 'support@dealersuite360.com' },
};

export default function PlatformSettings() {
  const [tab, setTab] = useState('general');
  const [general, setGeneral] = useState({ ...SECTION_DEFAULTS.general });
  const [fees, setFees] = useState({ ...SECTION_DEFAULTS['claim-fees'] });
  const [billing, setBilling] = useState({ ...SECTION_DEFAULTS.billing });
  const [notifSettings, setNotifSettings] = useState({ ...SECTION_DEFAULTS.notifications });
  const [connStatus, setConnStatus] = useState<ConnStatus>({});
  const [connLoading, setConnLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [feedback, setFeedback] = useState<Record<string, 'saved' | 'error'>>({});

  useEffect(() => {
    apiFetch<any>('/api/settings').then(d => {
      const s = d.settings || {};
      if (s.general) setGeneral(prev => ({ ...prev, ...s.general }));
      if (s['claim-fees']) setFees(prev => ({ ...prev, ...s['claim-fees'] }));
      if (s.billing) setBilling(prev => ({ ...prev, ...s.billing }));
      if (s.notifications) setNotifSettings(prev => ({ ...prev, ...s.notifications }));
    }).catch(() => {});
    apiFetch<any>('/api/settings/connection-status').then(d => {
      if (d.status) setConnStatus(d.status);
    }).catch(() => {}).finally(() => setConnLoading(false));
  }, []);

  const saveSection = async (key: string, value: object) => {
    setSaving(key);
    try {
      await apiFetch(`/api/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) });
      setFeedback(f => ({ ...f, [key]: 'saved' }));
      setTimeout(() => setFeedback(f => { const n = { ...f }; delete n[key]; return n; }), 2500);
    } catch {
      setFeedback(f => ({ ...f, [key]: 'error' }));
      setTimeout(() => setFeedback(f => { const n = { ...f }; delete n[key]; return n; }), 3000);
    } finally {
      setSaving('');
    }
  };

  const FeedbackLine = ({ sectionKey }: { sectionKey: string }) => {
    if (!feedback[sectionKey]) return null;
    return (
      <div style={{ padding: '0 20px 8px', fontSize: 13, color: feedback[sectionKey] === 'saved' ? '#0cb22c' : '#dc2626' }}>
        {feedback[sectionKey] === 'saved' ? 'Settings saved ✓' : 'Failed to save. Please try again.'}
      </div>
    );
  };

  const connIcon = (connected: boolean) => (
    <div style={{ width: 40, height: 40, borderRadius: 8, background: connected ? '#e6f9ed' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: connected ? '#0cb22c' : '#9ca3af' }} />
    </div>
  );

  const integrations = [
    { key: 'stripe', name: 'Stripe', desc: 'Payment processing and billing', envKey: 'STRIPE_SECRET_KEY' },
    { key: 'sendgrid', name: 'SendGrid / SMTP', desc: 'Email sending for invoices and notifications', envKey: 'SENDGRID_API_KEY' },
    { key: 'anthropic', name: 'Anthropic API (Claude)', desc: 'AI chatbot, FRC suggestions, document scanning', envKey: 'ANTHROPIC_API_KEY' },
    { key: 'tavus', name: 'Tavus / D-ID', desc: 'AI F&I Video Presenter', envKey: 'TAVUS_API_KEY', comingSoon: true },
    { key: 'clerk', name: 'Clerk', desc: 'Authentication and user management', envKey: 'CLERK_SECRET_KEY' },
    { key: 'neon', name: 'Neon PostgreSQL', desc: 'Primary database connection', envKey: 'DATABASE_URL' },
  ];

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        <div>
          <div className={`settings-link${tab === 'general' ? ' active' : ''}`} onClick={() => setTab('general')}>General</div>
          <div className={`settings-link${tab === 'fees' ? ' active' : ''}`} onClick={() => setTab('fees')}>Claim Fee Defaults</div>
          <div className={`settings-link${tab === 'billing' ? ' active' : ''}`} onClick={() => setTab('billing')}>Billing Configuration</div>
          <div className={`settings-link${tab === 'notifications' ? ' active' : ''}`} onClick={() => setTab('notifications')}>Notifications</div>
          <div className={`settings-link${tab === 'integrations' ? ' active' : ''}`} onClick={() => setTab('integrations')}>Integrations</div>
        </div>
        <div>

          {/* GENERAL */}
          <div style={{ display: tab === 'general' ? 'block' : 'none' }} className="pn">
            <div className="pn-h"><span className="pn-t">General Settings</span></div>
            <div className="form-grid">
              <div className="form-group"><label>Platform Name</label><input value={general.platformName} onChange={e => setGeneral(g => ({ ...g, platformName: e.target.value }))} /></div>
              <div className="form-group"><label>Support Email</label><input value={general.supportEmail} onChange={e => setGeneral(g => ({ ...g, supportEmail: e.target.value }))} /></div>
              <div className="form-group"><label>Support Phone</label><input value={general.supportPhone} onChange={e => setGeneral(g => ({ ...g, supportPhone: e.target.value }))} /></div>
              <div className="form-group"><label>Default Language</label><select value={general.defaultLanguage} onChange={e => setGeneral(g => ({ ...g, defaultLanguage: e.target.value }))}><option>English</option><option>French</option></select></div>
              <div className="form-group"><label>Currency</label><select value={general.currency} onChange={e => setGeneral(g => ({ ...g, currency: e.target.value }))}><option>CAD ($)</option><option>USD ($)</option></select></div>
              <div className="form-group"><label>Timezone</label><select value={general.timezone} onChange={e => setGeneral(g => ({ ...g, timezone: e.target.value }))}><option>Eastern</option><option>Central</option><option>Mountain</option><option>Pacific</option></select></div>
              <div className="form-group"><label>Stale Claim Threshold (hrs)</label><input type="number" value={general.staleClaimThreshold} onChange={e => setGeneral(g => ({ ...g, staleClaimThreshold: e.target.value }))} /></div>
              <div className="form-group"><label>Platform URL</label><input value={general.platformUrl} onChange={e => setGeneral(g => ({ ...g, platformUrl: e.target.value }))} /></div>
            </div>
            <FeedbackLine sectionKey="general" />
            <div className="btn-bar">
              <button className="btn btn-p" onClick={() => saveSection('general', general)} disabled={saving === 'general'}>{saving === 'general' ? 'Saving…' : 'Save'}</button>
              <button className="btn btn-o" onClick={() => setGeneral({ ...SECTION_DEFAULTS.general })}>Reset</button>
            </div>
          </div>

          {/* CLAIM FEE DEFAULTS */}
          <div style={{ display: tab === 'fees' ? 'block' : 'none' }} className="pn">
            <div className="pn-h"><span className="pn-t">Claim Fee Defaults</span><span style={{ fontSize: 12, color: '#888' }}>Platform defaults. Override per dealer.</span></div>
            <div className="form-grid">
              <div className="form-group full" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}><label style={{ fontWeight: 600, fontSize: 13 }}>Claim Processing Fee</label></div>
              <div className="form-group"><label>Default Fee Type</label><select value={fees.feeType} onChange={e => setFees(f => ({ ...f, feeType: e.target.value }))}><option>Percentage of approved amount</option><option>Flat fee per claim</option></select></div>
              <div className="form-group"><label>Default Rate (%)</label><input type="number" value={fees.feeRate} onChange={e => setFees(f => ({ ...f, feeRate: e.target.value }))} /></div>
              <div className="form-group"><label>Minimum Fee</label><input value={fees.minFee} onChange={e => setFees(f => ({ ...f, minFee: e.target.value }))} /></div>
              <div className="form-group"><label>Maximum Fee Cap</label><input value={fees.maxFee} onChange={e => setFees(f => ({ ...f, maxFee: e.target.value }))} /></div>
              <div className="form-group full" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}><label style={{ fontWeight: 600, fontSize: 13 }}>Inspection Fees</label></div>
              <div className="form-group"><label>DAF Inspection Fee</label><input value={fees.dafFee} onChange={e => setFees(f => ({ ...f, dafFee: e.target.value }))} /></div>
              <div className="form-group"><label>PDI Processing Fee</label><input value={fees.pdiFee} onChange={e => setFees(f => ({ ...f, pdiFee: e.target.value }))} /></div>
              <div className="form-group full" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}><label style={{ fontWeight: 600, fontSize: 13 }}>Fee Billing Rules</label></div>
              <div className="form-group"><label>When to Invoice</label><select value={fees.whenToInvoice} onChange={e => setFees(f => ({ ...f, whenToInvoice: e.target.value }))}><option>Auto on claim close</option><option>Manual only</option><option>Monthly batch</option></select></div>
            </div>
            <FeedbackLine sectionKey="claim-fees" />
            <div className="btn-bar">
              <button className="btn btn-p" onClick={() => saveSection('claim-fees', fees)} disabled={saving === 'claim-fees'}>{saving === 'claim-fees' ? 'Saving…' : 'Save'}</button>
              <button className="btn btn-o" onClick={() => setFees({ ...SECTION_DEFAULTS['claim-fees'] })}>Reset to Defaults</button>
            </div>
          </div>

          {/* BILLING */}
          <div style={{ display: tab === 'billing' ? 'block' : 'none' }} className="pn">
            <div className="pn-h"><span className="pn-t">Billing Configuration</span></div>
            <div className="form-grid">
              <div className="form-group"><label>Default Tax Rate</label><select value={billing.taxRate} onChange={e => setBilling(b => ({ ...b, taxRate: e.target.value }))}><option>HST 13% (Ontario)</option><option>GST 5%</option><option>GST 5% + QST 9.975% (Quebec)</option></select></div>
              <div className="form-group"><label>Tax Registration #</label><input value={billing.taxRegistration} onChange={e => setBilling(b => ({ ...b, taxRegistration: e.target.value }))} placeholder="HST/GST number" /></div>
              <div className="form-group"><label>Payment Processor</label><select value={billing.paymentProcessor} onChange={e => setBilling(b => ({ ...b, paymentProcessor: e.target.value }))}><option>Stripe</option><option>Manual / Offline</option></select></div>
              <div className="form-group"><label>Stripe Mode</label><select value={billing.stripeMode} onChange={e => setBilling(b => ({ ...b, stripeMode: e.target.value }))}><option>Test Mode</option><option>Live Mode</option></select></div>
              <div className="form-group"><label>Default Payment Terms</label><select value={billing.defaultPaymentTerms} onChange={e => setBilling(b => ({ ...b, defaultPaymentTerms: e.target.value }))}><option>On Receipt</option><option>Net 15</option><option>Net 30</option></select></div>
              <div className="form-group"><label>Invoice Prefix</label><input value={billing.invoicePrefix} onChange={e => setBilling(b => ({ ...b, invoicePrefix: e.target.value }))} /></div>
              <div className="form-group"><label>Next Invoice #</label><input type="number" value={billing.nextInvoiceNum} onChange={e => setBilling(b => ({ ...b, nextInvoiceNum: e.target.value }))} /></div>
              <div className="form-group full"><label>Invoice Footer / Terms</label><textarea value={billing.invoiceFooter} onChange={e => setBilling(b => ({ ...b, invoiceFooter: e.target.value }))} style={{ minHeight: 80 }}></textarea></div>
            </div>
            <FeedbackLine sectionKey="billing" />
            <div className="btn-bar">
              <button className="btn btn-p" onClick={() => saveSection('billing', billing)} disabled={saving === 'billing'}>{saving === 'billing' ? 'Saving…' : 'Save'}</button>
              <button className="btn btn-o" onClick={() => setBilling({ ...SECTION_DEFAULTS.billing })}>Reset</button>
            </div>
          </div>

          {/* NOTIFICATIONS */}
          <div style={{ display: tab === 'notifications' ? 'block' : 'none' }} className="pn">
            <div className="pn-h"><span className="pn-t">Notification Settings</span></div>
            <div className="form-grid">
              <div className="form-group full" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}><label style={{ fontWeight: 600, fontSize: 13 }}>Operator Notifications</label></div>
              <div className="form-group"><label>New photo batch uploaded</label><select value={notifSettings.newPhotoBatch} onChange={e => setNotifSettings(n => ({ ...n, newPhotoBatch: e.target.value }))}><option>Push + Email</option><option>Push only</option><option>Off</option></select></div>
              <div className="form-group"><label>Claim status changed</label><select value={notifSettings.claimStatusChanged} onChange={e => setNotifSettings(n => ({ ...n, claimStatusChanged: e.target.value }))}><option>Push + Email</option><option>Push only</option><option>Off</option></select></div>
              <div className="form-group"><label>Stale claim alert</label><select value={notifSettings.staleClaimAlert} onChange={e => setNotifSettings(n => ({ ...n, staleClaimAlert: e.target.value }))}><option>Push + Email</option><option>Push only</option><option>Off</option></select></div>
              <div className="form-group"><label>New dealer signup</label><select value={notifSettings.newDealerSignup} onChange={e => setNotifSettings(n => ({ ...n, newDealerSignup: e.target.value }))}><option>Push + Email</option><option>Push only</option><option>Off</option></select></div>
              <div className="form-group full" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}><label style={{ fontWeight: 600, fontSize: 13 }}>Email Configuration</label></div>
              <div className="form-group"><label>From Name</label><input value={notifSettings.fromName} onChange={e => setNotifSettings(n => ({ ...n, fromName: e.target.value }))} /></div>
              <div className="form-group"><label>Reply-To Email</label><input value={notifSettings.replyToEmail} onChange={e => setNotifSettings(n => ({ ...n, replyToEmail: e.target.value }))} /></div>
            </div>
            <FeedbackLine sectionKey="notifications" />
            <div className="btn-bar">
              <button className="btn btn-p" onClick={() => saveSection('notifications', notifSettings)} disabled={saving === 'notifications'}>{saving === 'notifications' ? 'Saving…' : 'Save'}</button>
              <button className="btn btn-o" onClick={() => setNotifSettings({ ...SECTION_DEFAULTS.notifications })}>Reset</button>
            </div>
          </div>

          {/* INTEGRATIONS */}
          <div style={{ display: tab === 'integrations' ? 'block' : 'none' }} className="pn">
            <div className="pn-h"><span className="pn-t">Integrations</span></div>
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {connLoading ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Checking connection status…</div>
              ) : integrations.map(intg => {
                const connected = connStatus[intg.key] === true;
                return (
                  <div key={intg.key} className="pn" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', opacity: intg.comingSoon ? 0.6 : 1 }}>
                    {connIcon(connected)}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{intg.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{intg.desc}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {intg.comingSoon ? (
                          <span className="bg pending">Coming Soon</span>
                        ) : connected ? (
                          <span className="bg active">Connected</span>
                        ) : (
                          <span className="bg" style={{ background: '#fef2f2', color: '#dc2626' }}>Not Connected</span>
                        )}
                        {!intg.comingSoon && !connected && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{intg.envKey} not set</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
