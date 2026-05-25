// client/src/pages/FAndI.tsx — F&I Products & Deals
// Role-aware: operator_admin (full CRUD), operator_staff (view),
//             dealer_owner (view + create deal), dealer_staff (view),
//             financial_manager (view + commission summary)

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

interface FiProduct {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  billingFrequency: string;
  isActive: boolean;
  createdAt: string;
}

interface FiDeal {
  id: string;
  dealNumber: string;
  dealershipId: string;
  unitId: string | null;
  customerName: string;
  salePrice: string | null;
  financing: string | null;
  productsOffered: number;
  productsSold: number;
  revenue: string | null;
  dealerNotes: string | null;
  status: 'flagged' | 'recommending' | 'presented' | 'completed';
  createdAt: string;
}

interface CommissionReport {
  summary: {
    totalDeals: number;
    completedDeals: number;
    totalRevenue: string;
    totalProductsSold: number;
    avgProductsPerDeal: string;
  };
  statusBreakdown: Record<string, { count: number; revenue: number }>;
  dealerBreakdown: Array<{
    dealershipId: string;
    dealershipName: string;
    totalDeals: number;
    completedDeals: number;
    revenue: number;
  }>;
}

// Status badge helper
function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    flagged:      { label: 'Flagged',      cls: 'bg ow'         },
    recommending: { label: 'Recommending', cls: 'bg in-progress' },
    presented:    { label: 'Presented',    cls: 'bg info'        },
    completed:    { label: 'Completed',    cls: 'bg ok'          },
  };
  const m = map[status] || { label: status, cls: 'bg' };
  return <span className={m.cls} style={{ fontSize: 11, padding: '2px 8px' }}>{m.label}</span>;
}

export default function FAndI() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const role = user?.role as string | undefined;
  const isOperatorAdmin  = role === 'operator_admin';
  const isOperator       = role === 'operator_admin' || role === 'operator_staff';
  const isDealerOwner    = role === 'dealer_owner';
  const isDealerStaff    = role === 'dealer_staff';
  const isFinancialMgr   = role === 'financial_manager';
  const hasAccess        = isOperator || isDealerOwner || isDealerStaff || isFinancialMgr;

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]       = useState<'catalog' | 'deals' | 'report'>('catalog');
  const [products, setProducts]         = useState<FiProduct[]>([]);
  const [deals, setDeals]               = useState<FiDeal[]>([]);
  const [report, setReport]             = useState<CommissionReport | null>(null);
  const [searchQ, setSearchQ]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading]       = useState(true);
  const [dataError, setDataError]       = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg]           = useState('');
  const [toastVisible, setToastVisible]   = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Inline product form (operator_admin)
  const [showProductForm, setShowProductForm] = useState(false);
  const [pFormName, setPFormName]       = useState('');
  const [pFormDesc, setPFormDesc]       = useState('');
  const [pFormPrice, setPFormPrice]     = useState('');
  const [pFormFreq, setPFormFreq]       = useState('one_time');
  const [pFormSaving, setPFormSaving]   = useState(false);

  // Module gate check (client-side hint — server enforces)
  const [moduleEnabled, setModuleEnabled] = useState<boolean | null>(null);

  // AI Presenter launch
  const [showPresenterModal, setShowPresenterModal] = useState(false);
  const [presenterCustomerName, setPresenterCustomerName] = useState('');
  const [presenterCustomerEmail, setPresenterCustomerEmail] = useState('');
  const [presenterUnitId, setPresenterUnitId] = useState('');
  const [presenterProductIds, setPresenterProductIds] = useState<Set<string>>(new Set());
  const [presenterUnits, setPresenterUnits] = useState<any[]>([]);
  const [presenterLaunching, setPresenterLaunching] = useState(false);
  const [presenterSession, setPresenterSession] = useState<{ sessionUrl: string; sessionId: string } | null>(null);
  const [presenterLinkCopied, setPresenterLinkCopied] = useState(false);

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    try {
      const q = isOperatorAdmin ? '?includeInactive=true' : '';
      const d = await apiFetch<any>(`/api/fi/products${q}`);
      setProducts(Array.isArray(d.products) ? d.products : []);
    } catch (err: any) {
      console.error('F&I products load error:', err?.message);
    }
  }, [isOperatorAdmin]);

  const loadDeals = useCallback(async () => {
    try {
      const d = await apiFetch<any>('/api/fi-deals');
      setDeals(Array.isArray(d.fiDeals) ? d.fiDeals : []);
    } catch (err: any) {
      console.error('F&I deals load error:', err?.message);
    }
  }, []);

  const loadReport = useCallback(async () => {
    if (!isOperatorAdmin && !isFinancialMgr && !isDealerOwner) return;
    try {
      const d = await apiFetch<any>('/api/fi/reports/commission');
      setReport(d);
    } catch (err: any) {
      console.error('F&I report load error:', err?.message);
    }
  }, [isOperatorAdmin, isFinancialMgr, isDealerOwner]);

  const loadModuleStatus = useCallback(async () => {
    if (!user?.dealershipId || isOperator) {
      setModuleEnabled(true); // operators always have access
      return;
    }
    try {
      const d = await apiFetch<any>(`/api/dealerships/${user.dealershipId}/modules`);
      const modules: any[] = d.modules || [];
      const fi = modules.find((m: any) => m.moduleKey === 'ai_fi');
      setModuleEnabled(!fi || fi.status === 'enabled' || fi.status === 'trial');
    } catch {
      setModuleEnabled(true); // default open if endpoint not available
    }
  }, [user?.dealershipId, isOperator]);

  useEffect(() => {
    if (!hasAccess) { setIsLoading(false); return; }
    setIsLoading(true);
    setDataError(null);
    Promise.all([loadProducts(), loadDeals(), loadModuleStatus()])
      .catch((err: any) => setDataError(err?.message || 'Failed to load F&I data'))
      .finally(() => setIsLoading(false));
  }, [hasAccess, loadProducts, loadDeals, loadModuleStatus]);

  // Load units when presenter modal opens
  useEffect(() => {
    if (!showPresenterModal) return;
    const dealershipId = user?.dealershipId;
    apiFetch<any>(dealershipId ? `/api/v6/units?dealershipId=${dealershipId}&limit=50` : '/api/v6/units?limit=50')
      .then(d => setPresenterUnits(Array.isArray(d.units) ? d.units : []))
      .catch(() => setPresenterUnits([]));
  }, [showPresenterModal, user?.dealershipId]);

  useEffect(() => {
    if (activeTab === 'report' && report === null) loadReport();
  }, [activeTab, report, loadReport]);

  // ── Access guards ───────────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          You do not have permission to view F&amp;I services.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ color: '#888', fontSize: 14 }}>Loading F&amp;I data…</div>
      </div>
    );
  }

  if (moduleEnabled === false) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>F&amp;I Module Not Enabled</div>
          <div style={{ color: '#888', fontSize: 13 }}>
            Contact your operator to activate the F&amp;I Services module for your dealership.
          </div>
        </div>
      </div>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDeactivateProduct = async (id: string) => {
    try {
      await apiFetch(`/api/fi/products/${id}`, { method: 'DELETE' });
      showToast('Product deactivated');
      loadProducts();
    } catch (err: any) {
      showToast(err?.message || 'Failed to deactivate product');
    }
  };

  const handleCreateProduct = async () => {
    if (!pFormName.trim()) { showToast('Product name is required'); return; }
    setPFormSaving(true);
    try {
      await apiFetch('/api/fi/products', {
        method: 'POST',
        body: JSON.stringify({
          name: pFormName.trim(),
          description: pFormDesc.trim() || null,
          price: pFormPrice.trim() || null,
          billingFrequency: pFormFreq,
        }),
      });
      showToast('Product created');
      setPFormName(''); setPFormDesc(''); setPFormPrice(''); setPFormFreq('one_time');
      setShowProductForm(false);
      loadProducts();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create product');
    } finally {
      setPFormSaving(false);
    }
  };

  const handleLaunchPresenter = async () => {
    if (!presenterCustomerName.trim()) { showToast('Customer name is required'); return; }
    if (!presenterCustomerEmail.trim()) { showToast('Customer email is required'); return; }
    if (presenterProductIds.size === 0) { showToast('Select at least one product'); return; }
    setPresenterLaunching(true);
    try {
      const selectedProducts = products
        .filter(p => presenterProductIds.has(p.id) && p.isActive)
        .map(p => ({
          id: p.id, name: p.name,
          description: p.description || '',
          price: p.price || '0',
          category: 'other',
          features: [],
          objectionHandlers: {},
        }));
      const body: Record<string, unknown> = {
        customerName: presenterCustomerName.trim(),
        customerEmail: presenterCustomerEmail.trim(),
        products: selectedProducts,
        dealershipId: user?.dealershipId || '',
      };
      if (presenterUnitId) body.unitId = presenterUnitId;
      const data = await apiFetch<any>('/api/ai/fi-session', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (data.success && data.session) {
        setPresenterSession({ sessionUrl: data.session.sessionUrl, sessionId: data.session.sessionId });
      } else {
        showToast('Failed to create presenter session');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to launch presenter');
    } finally {
      setPresenterLaunching(false);
    }
  };

  const resetPresenterModal = () => {
    setShowPresenterModal(false);
    setPresenterCustomerName('');
    setPresenterCustomerEmail('');
    setPresenterUnitId('');
    setPresenterProductIds(new Set());
    setPresenterSession(null);
    setPresenterLinkCopied(false);
  };

  const handleDealStatusUpdate = async (dealId: string, status: string) => {
    try {
      await apiFetch(`/api/fi/deals/${dealId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showToast(`Deal marked as ${status}`);
      loadDeals();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update deal');
    }
  };

  // ── Filtered data ────────────────────────────────────────────────────────────
  const filteredProducts = products.filter(p =>
    !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchQ.toLowerCase())
  );

  const filteredDeals = deals.filter(d => {
    const matchQ = !searchQ || d.customerName.toLowerCase().includes(searchQ.toLowerCase()) ||
      d.dealNumber.toLowerCase().includes(searchQ.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchQ && matchStatus;
  });

  // ── Summary stats ────────────────────────────────────────────────────────────
  const activeDeals   = deals.filter(d => d.status !== 'completed').length;
  const completedMTD  = deals.filter(d => {
    if (d.status !== 'completed') return false;
    const c = new Date(d.createdAt);
    const now = new Date();
    return c.getMonth() === now.getMonth() && c.getFullYear() === now.getFullYear();
  }).length;
  const revenueMTD = deals
    .filter(d => d.status === 'completed' && (() => {
      const c = new Date(d.createdAt);
      const now = new Date();
      return c.getMonth() === now.getMonth() && c.getFullYear() === now.getFullYear();
    })())
    .reduce((s, d) => s + parseFloat(d.revenue || '0'), 0);
  const avgProducts = completedMTD > 0
    ? (deals.filter(d => d.status === 'completed')
        .reduce((s, d) => s + d.productsSold, 0) / completedMTD).toFixed(1)
    : '—';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#033280', color: '#fff',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{t('fi.fiServices')}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
            {isOperator
              ? 'Manage F&I product catalog, deals, and commission reports.'
              : 'View available protection products and manage customer deals.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isOperatorAdmin && (
            <button className="btn btn-o btn-sm" onClick={() => setShowProductForm(v => !v)}>
              {showProductForm ? 'Cancel' : '+ Add Product'}
            </button>
          )}
          {(isDealerOwner || isOperatorAdmin) && products.some(p => p.isActive) && (
            <button
              className="btn btn-o btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onClick={() => setShowPresenterModal(true)}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
              </svg>
              Launch AI Presenter
            </button>
          )}
          {(isDealerOwner || isOperatorAdmin) && (
            <button className="btn btn-p btn-sm" onClick={() => navigate('fi-new')}>
              + New F&amp;I Deal
            </button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>{t('fi.activeDeals')}</div><div className="sc-v" style={{ color: '#2563eb' }}>{activeDeals}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>{t('fi.completedMTD')}</div><div className="sc-v" style={{ color: '#22c55e' }}>{completedMTD}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>{t('fi.revenueMTD')}</div><div className="sc-v">${revenueMTD.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>{t('fi.avgProductsPerDeal')}</div><div className="sc-v">{avgProducts}</div></div>
      </div>

      {/* Inline product creation form (operator_admin) */}
      {isOperatorAdmin && showProductForm && (
        <div className="pn" style={{ marginBottom: 16, borderLeft: '3px solid #033280' }}>
          <div className="pn-h" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 16 }}>
            <span className="pn-t">New F&amp;I Product</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input value={pFormName} onChange={e => setPFormName(e.target.value)} placeholder="e.g. Extended Warranty (5yr)" />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input value={pFormPrice} onChange={e => setPFormPrice(e.target.value)} placeholder="e.g. 2495.00" />
            </div>
            <div className="form-group">
              <label>Billing Frequency</label>
              <select value={pFormFreq} onChange={e => setPFormFreq(e.target.value)}>
                <option value="one_time">One-Time</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Description</label>
              <textarea value={pFormDesc} onChange={e => setPFormDesc(e.target.value)} placeholder="Coverage details, terms, highlights…" rows={2} />
            </div>
          </div>
          <div className="btn-bar">
            <button className="btn btn-p btn-sm" onClick={handleCreateProduct} disabled={pFormSaving}>
              {pFormSaving ? 'Saving…' : 'Create Product'}
            </button>
            <button className="btn btn-o btn-sm" onClick={() => setShowProductForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #e8e8e8' }}>
        {[
          { id: 'catalog', label: t('fi.productCatalog') },
          { id: 'deals',   label: t('fi.deals') },
          ...(isOperatorAdmin || isFinancialMgr || isDealerOwner
            ? [{ id: 'report', label: t('fi.commissionReport') }]
            : []),
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 20px', border: 'none', background: 'none',
              fontFamily: 'inherit', fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? '#033280' : '#888',
              borderBottom: activeTab === tab.id ? '2px solid #033280' : '2px solid transparent',
              marginBottom: -2, cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search / filter bar */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder={activeTab === 'catalog' ? 'Search products…' : 'Search deals, customers…'}
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
        {activeTab === 'deals' && (
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">{t('common.allStatuses')}</option>
            <option value="flagged">Flagged</option>
            <option value="recommending">Recommending</option>
            <option value="presented">Presented</option>
            <option value="completed">Completed</option>
          </select>
        )}
      </div>

      {/* ── Tab: Product Catalog ── */}
      {activeTab === 'catalog' && (
        <div>
          {filteredProducts.length === 0 ? (
            <div className="pn" style={{ textAlign: 'center', padding: 32, color: '#888' }}>
              {searchQ ? 'No products match your search.' : 'No F&I products in catalog yet.'}
              {isOperatorAdmin && !searchQ && (
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-p btn-sm" onClick={() => setShowProductForm(true)}>
                    + Add First Product
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {filteredProducts.map(p => (
                <div key={p.id} className="pn" style={{
                  padding: 20,
                  opacity: p.isActive ? 1 : 0.55,
                  border: p.isActive ? '1px solid #e8e8e8' : '1px dashed #ccc',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    {!p.isActive && (
                      <span className="bg" style={{ fontSize: 10, padding: '2px 6px', background: '#f3f4f6', color: '#888' }}>Inactive</span>
                    )}
                  </div>
                  {p.description && (
                    <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5, marginBottom: 12 }}>{p.description}</div>
                  )}
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#033280', marginBottom: 4 }}>
                    {p.price ? `$${parseFloat(p.price).toLocaleString('en-CA')}` : '—'}
                    <span style={{ fontSize: 11, fontWeight: 400, color: '#888', marginLeft: 4 }}>
                      /{p.billingFrequency.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Operator Admin controls */}
                  {isOperatorAdmin && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      {p.isActive && (
                        <button
                          className="btn btn-o btn-sm"
                          style={{ fontSize: 11 }}
                          onClick={() => handleDeactivateProduct(p.id)}
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  )}

                  {/* Dealer Owner: offer to customer */}
                  {isDealerOwner && p.isActive && (
                    <button
                      className="btn btn-p btn-sm"
                      style={{ width: '100%', marginTop: 12, fontSize: 12 }}
                      onClick={() => navigate('fi-new')}
                    >
                      Offer to Customer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Deals ── */}
      {activeTab === 'deals' && (
        <div className="pn">
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>{t('fi.dealNumber')}</th>
                  {isOperator && <th>{t('common.dealer')}</th>}
                  <th>{t('financing.customer')}</th>
                  <th>{t('workOrders.unit')}</th>
                  <th>{t('fi.productsOffered')}</th>
                  <th>{t('fi.productsSold')}</th>
                  <th>{t('common.amount')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.length === 0 ? (
                  <tr>
                    <td colSpan={isOperator ? 9 : 8} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                      No F&amp;I deals found
                    </td>
                  </tr>
                ) : filteredDeals.map(deal => (
                  <tr key={deal.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`fi-detail/${deal.id}`)}>
                    <td style={{ fontWeight: 500 }}>{deal.dealNumber}</td>
                    {isOperator && <td style={{ fontSize: 12, color: '#666' }}>{deal.dealershipId.slice(0, 8)}…</td>}
                    <td>{deal.customerName}</td>
                    <td style={{ fontSize: 12, color: '#666' }}>{deal.unitId ? deal.unitId.slice(0, 8) + '…' : '—'}</td>
                    <td style={{ textAlign: 'center' }}>{deal.productsOffered}</td>
                    <td style={{ textAlign: 'center', color: '#22c55e', fontWeight: 600 }}>{deal.productsSold}</td>
                    <td style={{ fontWeight: 600 }}>
                      {deal.revenue ? `$${parseFloat(deal.revenue).toLocaleString('en-CA')}` : '—'}
                    </td>
                    <td onClick={e => e.stopPropagation()}>{statusBadge(deal.status)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn btn-o btn-sm"
                          style={{ fontSize: 11 }}
                          onClick={() => navigate(`fi-detail/${deal.id}`)}
                        >
                          {t('common.view')}
                        </button>
                        {/* Quick status transitions */}
                        {(isOperatorAdmin || isDealerOwner) && deal.status === 'flagged' && (
                          <button
                            className="btn btn-p btn-sm"
                            style={{ fontSize: 11 }}
                            onClick={() => handleDealStatusUpdate(deal.id, 'recommending')}
                          >
                            Start Recommending
                          </button>
                        )}
                        {(isOperatorAdmin || isDealerOwner) && deal.status === 'recommending' && (
                          <button
                            className="btn btn-p btn-sm"
                            style={{ fontSize: 11 }}
                            onClick={() => handleDealStatusUpdate(deal.id, 'presented')}
                          >
                            Mark Presented
                          </button>
                        )}
                        {(isOperatorAdmin || isDealerOwner) && deal.status === 'presented' && (
                          <button
                            className="btn btn-p btn-sm"
                            style={{ fontSize: 11 }}
                            onClick={() => handleDealStatusUpdate(deal.id, 'completed')}
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab: Commission Report ── */}
      {activeTab === 'report' && (
        <div>
          {report === null ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>Loading report…</div>
          ) : (
            <>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Deals',         value: String(report.summary.totalDeals) },
                  { label: 'Completed Deals',      value: String(report.summary.completedDeals) },
                  { label: 'Total Revenue',        value: `$${parseFloat(report.summary.totalRevenue).toLocaleString('en-CA')}` },
                  { label: 'Products Sold',        value: String(report.summary.totalProductsSold) },
                  { label: 'Avg Products / Deal',  value: String(report.summary.avgProductsPerDeal) },
                ].map(s => (
                  <div key={s.label} className="sc">
                    <div className="sc-l" style={{ marginBottom: 8 }}>{s.label}</div>
                    <div className="sc-v">{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Status breakdown */}
              <div className="pn" style={{ marginBottom: 16 }}>
                <div className="pn-h"><span className="pn-t">By Status</span></div>
                <div className="tw">
                  <table>
                    <thead><tr><th>Status</th><th>Count</th><th>Revenue</th></tr></thead>
                    <tbody>
                      {Object.entries(report.statusBreakdown).map(([s, v]) => (
                        <tr key={s}>
                          <td>{statusBadge(s)}</td>
                          <td>{v.count}</td>
                          <td>${v.revenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Per-dealer breakdown (operator_admin only) */}
              {isOperatorAdmin && report.dealerBreakdown.length > 0 && (
                <div className="pn">
                  <div className="pn-h"><span className="pn-t">Revenue by Dealer</span></div>
                  <div className="tw">
                    <table>
                      <thead><tr><th>Dealership</th><th>Total Deals</th><th>Completed</th><th>Revenue</th></tr></thead>
                      <tbody>
                        {report.dealerBreakdown.map(d => (
                          <tr key={d.dealershipId}>
                            <td style={{ fontWeight: 500 }}>{d.dealershipName}</td>
                            <td>{d.totalDeals}</td>
                            <td>{d.completedDeals}</td>
                            <td style={{ fontWeight: 600, color: '#22c55e' }}>
                              ${d.revenue.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {dataError && (
        <div style={{ marginTop: 16, padding: '10px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
          {dataError}
        </div>
      )}

      {/* ── AI Presenter Launch Modal ── */}
      {showPresenterModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) resetPresenterModal(); }}
        >
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {/* Modal header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#033280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Launch AI F&I Presenter</span>
              </div>
              <button onClick={resetPresenterModal} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: 24 }}>
              {!presenterSession ? (
                <>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Customer Name *</label>
                      <input value={presenterCustomerName} onChange={e => setPresenterCustomerName(e.target.value)} placeholder="Full name" />
                    </div>
                    <div className="form-group">
                      <label>Customer Email *</label>
                      <input type="email" value={presenterCustomerEmail} onChange={e => setPresenterCustomerEmail(e.target.value)} placeholder="customer@email.com" />
                    </div>
                    <div className="form-group full">
                      <label>Unit (optional)</label>
                      <select value={presenterUnitId} onChange={e => setPresenterUnitId(e.target.value)}>
                        <option value="">Select unit…</option>
                        {presenterUnits.map((u: any) => (
                          <option key={u.id} value={u.id}>
                            {[u.year, u.manufacturer || u.make, u.model].filter(Boolean).join(' ')} — {u.vin}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group full">
                      <label>Products to Present *</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto', padding: '4px 0' }}>
                        {products.filter(p => p.isActive).map(p => (
                          <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 12px', borderRadius: 8, background: presenterProductIds.has(p.id) ? '#f0f4ff' : '#f9f9f9', border: presenterProductIds.has(p.id) ? '1px solid #c7d7ff' : '1px solid transparent', transition: 'all 0.15s' }}>
                            <input
                              type="checkbox"
                              checked={presenterProductIds.has(p.id)}
                              onChange={e => {
                                setPresenterProductIds(prev => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(p.id); else next.delete(p.id);
                                  return next;
                                });
                              }}
                              style={{ width: 16, height: 16, accentColor: '#033280', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                              {p.price && <div style={{ fontSize: 12, color: '#033280', fontWeight: 600 }}>${parseFloat(p.price).toLocaleString('en-CA')}</div>}
                            </div>
                          </label>
                        ))}
                        {products.filter(p => p.isActive).length === 0 && (
                          <div style={{ fontSize: 13, color: '#888', padding: '8px 0' }}>No active products in catalog.</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="btn-bar" style={{ marginTop: 20 }}>
                    <button
                      className="btn btn-p"
                      onClick={handleLaunchPresenter}
                      disabled={presenterLaunching}
                    >
                      {presenterLaunching ? 'Generating Link…' : 'Generate Presenter Link'}
                    </button>
                    <button className="btn btn-o" onClick={resetPresenterModal}>Cancel</button>
                  </div>
                </>
              ) : (
                /* Session created — show link */
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>✓</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Presenter Link Ready!</div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
                    Share this link with {presenterCustomerName}. It expires in 7 days.
                  </div>

                  {/* Session status tracker */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {['Link Created', 'Sent to Customer', 'Presentation Active', 'Completed'].map((step, i) => (
                      <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: i === 0 ? '#22c55e' : '#e2e8f0',
                          color: i === 0 ? '#fff' : '#94a3b8',
                        }}>
                          {i === 0 ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: 11, color: i === 0 ? '#16a34a' : '#94a3b8', fontWeight: i === 0 ? 600 : 400 }}>{step}</span>
                        {i < 3 && <span style={{ color: '#cbd5e1', fontSize: 10 }}>→</span>}
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', marginBottom: 16, wordBreak: 'break-all', fontSize: 12, color: '#444', textAlign: 'left', border: '1px solid #e2e8f0' }}>
                    {presenterSession.sessionUrl}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-p btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => {
                        navigator.clipboard.writeText(presenterSession.sessionUrl).then(() => {
                          setPresenterLinkCopied(true);
                          setTimeout(() => setPresenterLinkCopied(false), 2000);
                        });
                      }}
                    >
                      {presenterLinkCopied ? '✓ Copied!' : 'Copy Link'}
                    </button>
                    <button className="btn btn-o btn-sm" style={{ flex: 1 }} onClick={resetPresenterModal}>Done</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
