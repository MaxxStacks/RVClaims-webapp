import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function DealerDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ dealerId: string }>();
  const { user } = useAuth();

  // ─── Extract dealerId from params or URL path ────────────────────────────
  const dealerId = params.dealerId || (() => {
    const segs = location.split('/');
    const dealersIdx = segs.indexOf('dealers');
    return dealersIdx >= 0 ? segs[dealersIdx + 1] : null;
  })();

  // ─── Role flags ──────────────────────────────────────────────────────────
  const isOperatorAdmin = user?.role === 'operator_admin';
  const isOperatorStaff = user?.role === 'operator_staff';
  const isOperator = isOperatorAdmin || isOperatorStaff;
  const isDealerOwner = user?.role === 'dealer_owner';
  const isDealerStaff = user?.role === 'dealer_staff';
  const isDealer = isDealerOwner || isDealerStaff;

  // Determine which tabs are visible
  const allTabs = ['Info', 'Modules', 'Pricing', 'Billing', 'Staff', 'Branding', 'Activity'];
  const visibleTabs = allTabs.filter(tab => {
    if (tab === 'Pricing') return isOperatorAdmin;
    if (tab === 'Billing') return isOperatorAdmin || isDealerOwner;
    if (tab === 'Branding') return isOperatorAdmin || isDealerOwner;
    if (tab === 'Activity') return isOperator;
    return true; // Info, Modules, Staff visible to all
  });

  const [activeTab, setActiveTab] = useState('Info');

  // ─── State ───────────────────────────────────────────────────────────────
  const [dealer, setDealer] = useState<any | null>(null);
  const [users_, setUsers_] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({});
  const [invoices, setInvoices] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Info edit state
  const [infoEdit, setInfoEdit] = useState<Record<string, string>>({});
  const [infoSaving, setInfoSaving] = useState(false);

  // Pricing state
  const [pricingForm, setPricingForm] = useState<Record<string, string>>({});
  const [pricingSaving, setPricingSaving] = useState(false);

  // Branding state
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#033280');
  const [primaryColorHex, setPrimaryColorHex] = useState('#033280');
  const [secondaryColor, setSecondaryColor] = useState('#0cb22c');
  const [secondaryColorHex, setSecondaryColorHex] = useState('#0cb22c');
  const [customDomain, setCustomDomain] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [brandingSaving, setBrandingSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  // Staff invite state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('dealer_staff');
  const [inviteSending, setInviteSending] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // ─── Base nav path ───────────────────────────────────────────────────────
  const basePath = location.startsWith('/operator/admin') ? '/operator/admin' : '/operator/staff';

  // ─── Load dealership detail ───────────────────────────────────────────────
  useEffect(() => {
    if (!dealerId) return;
    setIsLoading(true);
    const loadDetail = async () => {
      try {
        // Operator path: get full detail with users, modules, catalog, kpis
        if (isOperator) {
          const data = await apiFetch<any>(`/api/dealerships/${dealerId}`);
          const d = data.dealership || data;
          setDealer(d);
          setUsers_(data.users || []);
          setModules(data.modules || []);
          setCatalog(data.catalog || []);
          setKpis(data.kpis || {});
          populateDealerState(d);
        } else if (isDealer) {
          // Dealer: load their own dealership
          const data = await apiFetch<any>(`/api/dealerships/${dealerId}`);
          const d = data.dealership || data;
          setDealer(d);
          setModules(data.modules || []);
          setCatalog(data.catalog || []);
          populateDealerState(d);
        }
      } catch (err: any) {
        setDataError(err?.message || 'Failed to load dealership');
      } finally {
        setIsLoading(false);
      }
    };
    loadDetail();
  }, [dealerId]);

  // Load staff when Staff tab is active
  useEffect(() => {
    if (activeTab !== 'Staff' || !dealerId) return;
    apiFetch<any>(`/api/dealerships/${dealerId}/staff`)
      .then(d => setStaff(Array.isArray(d) ? d : d?.staff || []))
      .catch(() => {});
  }, [activeTab, dealerId]);

  // Load invoices when Billing tab is active
  useEffect(() => {
    if (activeTab !== 'Billing' || !dealerId) return;
    apiFetch<any>(`/api/invoices?dealershipId=${dealerId}`)
      .then(d => setInvoices(Array.isArray(d) ? d : d?.invoices || []))
      .catch(() => {});
  }, [activeTab, dealerId]);

  // Load pricing when Pricing tab is active
  useEffect(() => {
    if (activeTab !== 'Pricing' || !dealerId || !isOperatorAdmin) return;
    apiFetch<any>(`/api/dealerships/${dealerId}/pricing`)
      .then(d => {
        setPricing(d);
        setPricingForm({
          plan: d.plan || 'plan_a',
          monthlyFee: d.monthlyFee || '349.00',
          claimFeePercent: d.claimFeePercent || '10',
          claimFeeMin: d.claimFeeMin || '50',
          claimFeeMax: d.claimFeeMax || '500',
          dafFee: d.dafFee || '25',
          pdiFee: d.pdiFee || '15',
        });
      })
      .catch(() => {});
  }, [activeTab, dealerId, isOperatorAdmin]);

  const populateDealerState = (d: any) => {
    setInfoEdit({
      name: d.name || '',
      legalName: d.legalName || '',
      email: d.email || '',
      phone: d.phone || '',
      website: d.website || '',
      businessNumber: d.businessNumber || '',
      street: d.street || d.addressLine1 || '',
      city: d.city || '',
      province: d.province || d.stateProvince || '',
      postalCode: d.postalCode || '',
      contactName: d.contactName || '',
      contactEmail: d.contactEmail || '',
      contactPhone: d.contactPhone || '',
      contactTitle: d.contactTitle || '',
      notes: d.notes || '',
    });
    const pc = d.primaryColor || '#033280';
    const sc = d.secondaryColor || d.accentColor || '#0cb22c';
    setPrimaryColor(pc); setPrimaryColorHex(pc);
    setSecondaryColor(sc); setSecondaryColorHex(sc);
    setLogoUrl(d.logoUrl || '');
    setCustomDomain(d.customDomain || '');
    setWelcomeMessage(d.welcomeMessage || '');
  };

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleInfoSave = async () => {
    if (!dealerId) return;
    setInfoSaving(true);
    try {
      const updated = await apiFetch<any>(`/api/dealerships/${dealerId}`, {
        method: 'PATCH',
        body: JSON.stringify(infoEdit),
      });
      setDealer(updated);
      showToast('Dealership info saved');
    } catch {
      showToast('Failed to save info');
    } finally {
      setInfoSaving(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!dealerId) return;
    try {
      await apiFetch(`/api/dealerships/${dealerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setDealer((d: any) => d ? { ...d, status } : d);
      showToast(`Dealer ${status}`);
    } catch {
      showToast('Failed to update status');
    }
  };

  const handleModuleToggle = async (moduleKey: string, currentlyEnabled: boolean) => {
    if (!dealerId || !isOperatorAdmin) return;
    try {
      if (currentlyEnabled) {
        await apiFetch(`/api/dealerships/${dealerId}/modules/${moduleKey}`, { method: 'DELETE' });
        setModules(m => m.filter(x => x.moduleKey !== moduleKey));
      } else {
        await apiFetch(`/api/dealerships/${dealerId}/modules/${moduleKey}`, { method: 'POST', body: JSON.stringify({}) });
        setModules(m => [...m, { moduleKey, status: 'enabled' }]);
      }
      showToast(`Module ${currentlyEnabled ? 'disabled' : 'enabled'}`);
    } catch {
      showToast('Failed to update module');
    }
  };

  const handlePricingSave = async () => {
    if (!dealerId) return;
    setPricingSaving(true);
    try {
      await apiFetch(`/api/dealerships/${dealerId}/pricing`, {
        method: 'PATCH',
        body: JSON.stringify(pricingForm),
      });
      showToast('Pricing saved');
    } catch {
      showToast('Failed to save pricing');
    } finally {
      setPricingSaving(false);
    }
  };

  const handleBrandingSave = async () => {
    if (!dealerId) return;
    setBrandingSaving(true);
    try {
      await apiFetch(`/api/dealerships/${dealerId}/branding`, {
        method: 'PATCH',
        body: JSON.stringify({ logoUrl, primaryColor, secondaryColor, customDomain, welcomeMessage }),
      });
      showToast('Branding saved');
    } catch {
      showToast('Failed to save branding');
    } finally {
      setBrandingSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (dealerId) formData.append('dealershipId', dealerId);
      const res = await fetch('/api/uploads', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setLogoUrl(data.url || data.publicUrl || data.fileUrl || '');
        showToast('Logo uploaded');
      }
    } catch {
      showToast('Logo upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleInviteStaff = async () => {
    if (!inviteEmail || !dealerId) return;
    setInviteSending(true);
    try {
      await apiFetch(`/api/dealerships/${dealerId}/staff`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      showToast(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInvite(false);
      // Reload staff
      const d = await apiFetch<any>(`/api/dealerships/${dealerId}/staff`);
      setStaff(Array.isArray(d) ? d : d?.staff || []);
    } catch {
      showToast('Failed to send invitation');
    } finally {
      setInviteSending(false);
    }
  };

  const handleRemoveStaff = async (userId: string) => {
    if (!dealerId) return;
    try {
      await apiFetch(`/api/dealerships/${dealerId}/staff/${userId}`, { method: 'DELETE' });
      setStaff(s => s.filter(x => x.id !== userId));
      showToast('Staff member removed');
    } catch {
      showToast('Failed to remove staff');
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    if (!dealerId) return;
    try {
      await apiFetch(`/api/dealerships/${dealerId}/staff/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setStaff(s => s.map(x => x.id === userId ? { ...x, role } : x));
      showToast('Role updated');
    } catch {
      showToast('Failed to update role');
    }
  };

  // Color picker bidirectional sync
  const handlePrimaryPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryColor(e.target.value);
    setPrimaryColorHex(e.target.value);
  };
  const handlePrimaryHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryColorHex(e.target.value);
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setPrimaryColor(e.target.value);
  };
  const handleSecondaryPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecondaryColor(e.target.value);
    setSecondaryColorHex(e.target.value);
  };
  const handleSecondaryHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecondaryColorHex(e.target.value);
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setSecondaryColor(e.target.value);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return <div className="page active" style={{ textAlign: 'center', paddingTop: 60, color: '#888' }}>Loading…</div>;
  }

  if (dataError && !dealer) {
    return <div className="page active" style={{ textAlign: 'center', paddingTop: 60, color: '#dc2626' }}>{dataError}</div>;
  }

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="detail-header">
        {isOperator && (
          <button className="detail-back" onClick={() => navigate(`${basePath}/dealers`)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}
        <div className="detail-info">
          <div className="detail-title">{dealer?.name || '—'}</div>
          <div className="detail-meta">{dealer?.plan === 'plan_b' ? 'Plan B · Pre-Funded Wallet' : `Plan A · $${dealer?.monthlyFee || '349'}/mo`}</div>
        </div>
        <span className={`bg ${dealer?.status || 'active'}`} style={{ fontSize: 13, padding: '6px 16px' }}>{dealer?.status || '—'}</span>
        {isOperatorAdmin && dealer?.status === 'active' && (
          <button className="btn btn-d btn-sm" style={{ marginLeft: 12 }} onClick={() => handleStatusChange('suspended')}>Suspend</button>
        )}
        {isOperatorAdmin && dealer?.status === 'suspended' && (
          <button className="btn btn-s btn-sm" style={{ marginLeft: 12 }} onClick={() => handleStatusChange('active')}>Reactivate</button>
        )}
        {isOperatorAdmin && dealer?.status === 'pending' && (
          <button className="btn btn-s btn-sm" style={{ marginLeft: 12 }} onClick={() => handleStatusChange('active')}>Approve</button>
        )}
      </div>

      {/* KPI Cards */}
      {isOperator && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
          <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Units</div><div className="sc-v">{kpis.unitCount ?? '—'}</div></div>
          <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Claims</div><div className="sc-v">{kpis.claimCount ?? '—'}</div></div>
          <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Staff</div><div className="sc-v">{users_.length}</div></div>
          <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Modules</div><div className="sc-v" style={{ color: '#2563eb' }}>{modules.filter(m => m.status === 'enabled').length}</div></div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {visibleTabs.map(tab => (
          <div key={tab} className={`tab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</div>
        ))}
      </div>

      {/* ── TAB: INFO ── */}
      {activeTab === 'Info' && (
        <div className="pn">
          <div style={{ padding: '12px 20px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
            This information is shared with the dealer.
          </div>
          <div className="form-grid">
            <div className="form-group full" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}><label style={{ fontWeight: 600, fontSize: 13 }}>Business Information</label></div>
            {[
              { key: 'name', label: 'Dealership Name' },
              { key: 'legalName', label: 'Legal Name' },
              { key: 'email', label: 'Business Email' },
              { key: 'phone', label: 'Business Phone' },
              { key: 'website', label: 'Website' },
              { key: 'businessNumber', label: 'Business Number' },
            ].map(({ key, label }) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <input
                  value={infoEdit[key] || ''}
                  onChange={e => setInfoEdit(f => ({ ...f, [key]: e.target.value }))}
                  readOnly={!isOperatorAdmin && !isDealerOwner}
                  style={!isOperatorAdmin && !isDealerOwner ? { background: '#f9fafb', color: '#555' } : {}}
                />
              </div>
            ))}
            <div className="form-group full" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}><label style={{ fontWeight: 600, fontSize: 13 }}>Address</label></div>
            {[
              { key: 'street', label: 'Street' },
              { key: 'city', label: 'City' },
              { key: 'province', label: 'Province / State' },
              { key: 'postalCode', label: 'Postal Code' },
            ].map(({ key, label }) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <input
                  value={infoEdit[key] || ''}
                  onChange={e => setInfoEdit(f => ({ ...f, [key]: e.target.value }))}
                  readOnly={!isOperatorAdmin && !isDealerOwner}
                  style={!isOperatorAdmin && !isDealerOwner ? { background: '#f9fafb', color: '#555' } : {}}
                />
              </div>
            ))}
            <div className="form-group full" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}><label style={{ fontWeight: 600, fontSize: 13 }}>Primary Contact</label></div>
            {[
              { key: 'contactName', label: 'Name' },
              { key: 'contactEmail', label: 'Email' },
              { key: 'contactPhone', label: 'Phone' },
              { key: 'contactTitle', label: 'Title' },
            ].map(({ key, label }) => (
              <div key={key} className="form-group">
                <label>{label}</label>
                <input
                  value={infoEdit[key] || ''}
                  onChange={e => setInfoEdit(f => ({ ...f, [key]: e.target.value }))}
                  readOnly={!isOperatorAdmin && !isDealerOwner}
                  style={!isOperatorAdmin && !isDealerOwner ? { background: '#f9fafb', color: '#555' } : {}}
                />
              </div>
            ))}
            {isOperatorAdmin && (
              <>
                <div className="form-group full" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}><label style={{ fontWeight: 600, fontSize: 13 }}>Internal Notes (operator only)</label></div>
                <div className="form-group full">
                  <textarea
                    value={infoEdit.notes || ''}
                    onChange={e => setInfoEdit(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Internal notes about this dealership..."
                  />
                </div>
              </>
            )}
          </div>
          {(isOperatorAdmin || isDealerOwner) && (
            <div className="btn-bar">
              <button className="btn btn-p" onClick={handleInfoSave} disabled={infoSaving}>{infoSaving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: MODULES ── */}
      {activeTab === 'Modules' && (
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Service Modules</span></div>
          {!isOperatorAdmin && (
            <div style={{ padding: '10px 20px', background: '#fffbeb', borderBottom: '1px solid #fde68a', fontSize: 12, color: '#92400e' }}>
              Contact DS360 to change your active modules.
            </div>
          )}
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {catalog.map((mod: any) => {
              const isEnabled = modules.some(m => m.moduleKey === mod.moduleKey && m.status === 'enabled');
              const isBase = mod.isBaseRequired;
              return (
                <div key={mod.moduleKey} className="svc-card" style={{ opacity: isBase ? 1 : 1 }}>
                  <div className="svc-body">
                    <div className="svc-title">{mod.name}</div>
                    <div className="svc-meta">
                      <span className={`bg ${isEnabled ? 'active' : 'pending'}`}>{isEnabled ? 'Active' : 'Inactive'}</span>
                      {isBase && <span style={{ fontSize: 11, color: '#888' }}>Included</span>}
                    </div>
                  </div>
                  <div
                    className={`toggle${isEnabled ? ' on' : ''}`}
                    style={{ pointerEvents: isBase || !isOperatorAdmin ? 'none' : 'auto', opacity: isBase ? 0.4 : 1 }}
                    onClick={() => !isBase && isOperatorAdmin && handleModuleToggle(mod.moduleKey, isEnabled)}
                  />
                </div>
              );
            })}
            {catalog.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888', padding: 20 }}>No modules found</div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: PRICING (operator_admin only) ── */}
      {activeTab === 'Pricing' && isOperatorAdmin && (
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Pricing Overrides</span></div>
          <div className="form-grid">
            <div className="form-group">
              <label>Plan</label>
              <select value={pricingForm.plan || 'plan_a'} onChange={e => setPricingForm(f => ({ ...f, plan: e.target.value }))}>
                <option value="plan_a">Plan A — Monthly</option>
                <option value="plan_b">Plan B — Pre-Funded Wallet</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div className="form-group">
              <label>Monthly Fee ($)</label>
              <input type="number" value={pricingForm.monthlyFee || ''} onChange={e => setPricingForm(f => ({ ...f, monthlyFee: e.target.value }))} />
            </div>
            <div className="form-group full" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>Claim Fee Schedule</label>
            </div>
            <div className="form-group">
              <label>Per-Claim Fee (%)</label>
              <input type="number" value={pricingForm.claimFeePercent || ''} onChange={e => setPricingForm(f => ({ ...f, claimFeePercent: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Min Fee ($)</label>
              <input type="number" value={pricingForm.claimFeeMin || ''} onChange={e => setPricingForm(f => ({ ...f, claimFeeMin: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Max Fee Cap ($)</label>
              <input type="number" value={pricingForm.claimFeeMax || ''} onChange={e => setPricingForm(f => ({ ...f, claimFeeMax: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>DAF Fee ($)</label>
              <input type="number" value={pricingForm.dafFee || ''} onChange={e => setPricingForm(f => ({ ...f, dafFee: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>PDI Fee ($)</label>
              <input type="number" value={pricingForm.pdiFee || ''} onChange={e => setPricingForm(f => ({ ...f, pdiFee: e.target.value }))} />
            </div>
          </div>
          <div className="btn-bar">
            <button className="btn btn-p" onClick={handlePricingSave} disabled={pricingSaving}>{pricingSaving ? 'Saving…' : 'Save Pricing'}</button>
          </div>
        </div>
      )}

      {/* ── TAB: BILLING (operator_admin + dealer_owner) ── */}
      {activeTab === 'Billing' && (isOperatorAdmin || isDealerOwner) && (
        <div className="pn">
          <div className="pn-h">
            <span className="pn-t">Billing History</span>
            {isOperatorAdmin && (
              <span className="pn-a" onClick={() => navigate(`/operator/admin/invoices/new`)}>+ Create Invoice</span>
            )}
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr><th>Invoice #</th><th>Type</th><th>Description</th><th>Total</th><th>Status</th><th>Issued</th></tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No invoices found</td></tr>
                ) : invoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 500 }}>
                      <span className="cid" onClick={() => navigate(`${isOperator ? basePath : `/${dealerId}/owner`}/invoices/${inv.id}`)}>
                        {inv.invoiceNumber || inv.id?.slice(0, 8)}
                      </span>
                    </td>
                    <td>{inv.type || 'Claim Fee'}</td>
                    <td>{inv.description || inv.notes || '—'}</td>
                    <td>${parseFloat(inv.total || '0').toFixed(2)}</td>
                    <td><span className={`bg ${inv.status}`}>{inv.status}</span></td>
                    <td>{inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: STAFF ── */}
      {activeTab === 'Staff' && (
        <div className="pn">
          <div className="pn-h">
            <span className="pn-t">Staff Members</span>
            {(isOperatorAdmin || isDealerOwner) && (
              <span className="pn-a" onClick={() => setShowInvite(v => !v)}>+ Invite Staff</span>
            )}
          </div>

          {/* Invite form */}
          {showInvite && (isOperatorAdmin || isDealerOwner) && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', background: '#f8fafc', display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ margin: 0, minWidth: 200 }}>
                <label style={{ fontSize: 12 }}>Email Address</label>
                <input
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="staff@dealership.com"
                  type="email"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: 12 }}>Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  <option value="dealer_staff">Dealer Staff</option>
                  <option value="dealer_owner">Dealer Owner</option>
                </select>
              </div>
              <button className="btn btn-p btn-sm" onClick={handleInviteStaff} disabled={inviteSending || !inviteEmail}>
                {inviteSending ? 'Sending…' : 'Send Invitation'}
              </button>
              <button className="btn btn-o btn-sm" onClick={() => setShowInvite(false)}>Cancel</button>
            </div>
          )}

          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  {(isOperatorAdmin || isDealerOwner) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#888' }}>No staff found</td></tr>
                ) : staff.map((s: any) => {
                  const isOwner = s.role === 'dealer_owner' || s.role === 'operator_admin';
                  const roleBg = isOwner ? { background: '#eff6ff', color: 'var(--brand)' } : { background: '#f0fdf4', color: '#16a34a' };
                  const displayRole = s.role?.replace('_', ' ') || 'Staff';
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{[s.firstName, s.lastName].filter(Boolean).join(' ') || s.name || '—'}</td>
                      <td>{s.email}</td>
                      <td>
                        {(isOperatorAdmin || isDealerOwner) ? (
                          <select
                            value={s.role}
                            onChange={e => handleRoleChange(s.id, e.target.value)}
                            style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid #e0e0e0' }}
                          >
                            <option value="dealer_staff">Dealer Staff</option>
                            <option value="dealer_owner">Dealer Owner</option>
                          </select>
                        ) : (
                          <span className="bg" style={roleBg}>{displayRole}</span>
                        )}
                      </td>
                      <td><span className={`bg ${s.isActive ? 'active' : 'pending'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td>{s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—'}</td>
                      {(isOperatorAdmin || isDealerOwner) && (
                        <td>
                          <button
                            className="btn btn-o btn-sm"
                            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                            onClick={() => handleRemoveStaff(s.id)}
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: BRANDING (operator_admin + dealer_owner) ── */}
      {activeTab === 'Branding' && (isOperatorAdmin || isDealerOwner) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Portal Branding</span></div>
            <div className="form-grid">
              {/* Logo */}
              <div className="form-group full">
                <label>Logo</label>
                {logoUrl ? (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                    <img src={logoUrl} alt="Logo" style={{ height: 48, objectFit: 'contain', borderRadius: 4, border: '1px solid #e0e0e0' }} />
                    <button className="btn btn-o btn-sm" onClick={() => setLogoUrl('')}>Remove</button>
                  </div>
                ) : null}
                <label style={{ cursor: 'pointer' }}>
                  <div className="upload-zone" style={{ padding: 16, textAlign: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 28, height: 28, color: '#ccc', margin: '0 auto 6px', display: 'block' }}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                    <div style={{ fontSize: 12, color: '#888' }}>{logoUploading ? 'Uploading…' : 'Click to upload logo (PNG, SVG, JPG)'}</div>
                  </div>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                </label>
              </div>

              {/* Primary Color */}
              <div className="form-group">
                <label>Primary Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={primaryColor} onChange={handlePrimaryPickerChange} style={{ width: 40, height: 40, border: '1px solid #e0e0e0', borderRadius: 8, padding: 4, cursor: 'pointer' }} />
                  <input value={primaryColorHex} onChange={handlePrimaryHexChange} style={{ width: 100, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'monospace' }} placeholder="#033280" />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="form-group">
                <label>Secondary Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={secondaryColor} onChange={handleSecondaryPickerChange} style={{ width: 40, height: 40, border: '1px solid #e0e0e0', borderRadius: 8, padding: 4, cursor: 'pointer' }} />
                  <input value={secondaryColorHex} onChange={handleSecondaryHexChange} style={{ width: 100, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'monospace' }} placeholder="#0cb22c" />
                </div>
              </div>

              {/* Welcome Message */}
              <div className="form-group full">
                <label>Welcome Message</label>
                <textarea value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} placeholder="Welcome to your RV service portal..." />
              </div>
            </div>
            <div className="btn-bar">
              <button className="btn btn-p" onClick={handleBrandingSave} disabled={brandingSaving}>{brandingSaving ? 'Saving…' : 'Save Branding'}</button>
              <button className="btn btn-o" style={{ marginLeft: 'auto' }} onClick={() => { setPrimaryColor('#033280'); setPrimaryColorHex('#033280'); setSecondaryColor('#0cb22c'); setSecondaryColorHex('#0cb22c'); }}>Restore Defaults</button>
            </div>
          </div>

          <div className="pn">
            <div className="pn-h"><span className="pn-t">Custom Domain</span></div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 16, lineHeight: '1.5' }}>
                Set up a custom domain so customers see your dealership's URL instead of dealersuite360.com. Example: <strong>portal.smithsrv.ca</strong>
              </div>
              <div className="form-grid" style={{ padding: 0 }}>
                <div className="form-group full">
                  <label>Custom Domain</label>
                  <input value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="portal.yourdealership.com" />
                </div>
                <div className="form-group full">
                  <label>Status</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`bg ${dealer?.domainVerified ? 'active' : 'pending'}`}>{dealer?.domainVerified ? 'Verified' : 'Pending DNS'}</span>
                    {!dealer?.domainVerified && <span style={{ fontSize: 12, color: '#888' }}>CNAME record not detected</span>}
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
              <button className="btn btn-p" onClick={handleBrandingSave} disabled={brandingSaving}>Save Domain</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ACTIVITY (operators only) ── */}
      {activeTab === 'Activity' && isOperator && (
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Account Activity</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderBottom: '1px solid #f0f0f0' }}>
            {[
              { label: 'Member Since', value: dealer?.createdAt ? new Date(dealer.createdAt).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' }) : '—' },
              { label: 'Total Units', value: kpis.unitCount ?? '—' },
              { label: 'Total Claims', value: kpis.claimCount ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="cd-row" style={{ borderRight: '1px solid #f0f0f0' }}>
                <span className="cd-label">{label}</span>
                <span className="cd-value" style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            {[
              { label: 'Plan', value: dealer?.plan === 'plan_b' ? 'Plan B · Wallet' : 'Plan A · Monthly' },
              { label: 'Branding Tier', value: dealer?.brandingTier || 'base' },
              { label: 'Active Modules', value: modules.filter(m => m.status === 'enabled').length },
            ].map(({ label, value }) => (
              <div key={label} className="cd-row" style={{ borderRight: '1px solid #f0f0f0' }}>
                <span className="cd-label">{label}</span>
                <span className="cd-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
