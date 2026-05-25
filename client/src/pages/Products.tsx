import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface Product {
  id: string;
  name: string;
  category: string;
  price?: string;
  pricingType?: string;
  billingFrequency?: string;
  taxRate?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export default function Products() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Role detection — only operator_admin has access to full products management
  const role = user?.role as string | undefined;
  const isOperatorAdmin = role === 'operator_admin';
  const isOperator = role === 'operator_admin' || role === 'operator_staff';
  const isFinancialManager = role === 'financial_manager';
  // financial_manager gets read-only view; all other roles get Access Denied
  const hasAccess = isOperatorAdmin || isFinancialManager;

  const [products, setProducts] = useState<Product[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadProducts = useCallback(async () => {
    if (!hasAccess && !isOperator) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('category', activeTab);
      const d = await apiFetch<any>(`/api/products${params.toString() ? '?' + params.toString() : ''}`);
      const list: Product[] = Array.isArray(d.products) ? d.products : Array.isArray(d) ? d : [];
      setProducts(list);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [hasAccess, isOperator, activeTab]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (productId: string) => {
    if (!isOperatorAdmin) return;
    setDeleteLoading(productId);
    try {
      await apiFetch(`/api/products/${productId}`, { method: 'DELETE' });
      showToast('Product deactivated');
      await loadProducts();
    } catch (err: any) {
      showToast(`Failed to deactivate: ${err?.message || 'Unknown error'}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Non-operator and non-financial-manager roles are denied
  if (!hasAccess && !isOperator) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          You do not have permission to view products.
        </div>
      </div>
    );
  }

  const TABS = [
    { key: 'all', label: 'All' },
    { key: 'subscription', label: 'Subscriptions' },
    { key: 'claim_fee', label: 'Claim Fees' },
    { key: 'service_addon', label: 'Service Add-ons' },
    { key: 'part', label: 'Parts' },
    { key: 'custom', label: 'Custom' },
  ];

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(p => p.category === activeTab);

  const tabCounts = Object.fromEntries(
    TABS.map(t => [t.key, t.key === 'all' ? products.length : products.filter(p => p.category === t.key).length])
  );

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {toastMsg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Products & Services</div>
          <div style={{ fontSize: 13, color: '#888' }}>Pre-configured items that auto-populate when creating invoices.</div>
        </div>
        {isOperatorAdmin && (
          <button className="btn btn-p btn-sm" onClick={() => navigate('products/new')}>
            + Add Product / Service
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab => (
          <div
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({tabCounts[tab.key] || 0})
          </div>
        ))}
      </div>

      <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Billing</th>
                <th>Tax</th>
                <th>Status</th>
                {!isFinancialManager && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isFinancialManager ? 6 : 7} style={{ textAlign: 'center', color: '#888', padding: 20 }}>
                    Loading products...
                  </td>
                </tr>
              ) : dataError ? (
                <tr>
                  <td colSpan={isFinancialManager ? 6 : 7} style={{ textAlign: 'center', color: '#dc2626', padding: 20 }}>
                    {dataError}
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={isFinancialManager ? 6 : 7} style={{ textAlign: 'center', color: '#888', padding: 20 }}>
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>
                      <span className="mfr">{(p.category || '').replace(/_/g, ' ')}</span>
                    </td>
                    <td>
                      {p.price != null
                        ? (p.pricingType === 'percentage' ? `${p.price}%` : `$${Number(p.price).toFixed(2)}`)
                        : 'Variable'}
                    </td>
                    <td>{(p.billingFrequency || '—').replace(/_/g, ' ')}</td>
                    <td>{p.taxRate || 'HST 13%'}</td>
                    <td>
                      <span className={`bg ${p.isActive ? 'active' : 'pending'}`}>
                        {p.isActive ? 'active' : 'inactive'}
                      </span>
                    </td>
                    {!isFinancialManager && (
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {isOperatorAdmin && (
                          <>
                            <button
                              className="btn btn-o btn-sm"
                              style={{ marginRight: 4 }}
                              onClick={() => navigate(`products/${p.id}/edit`)}
                            >
                              Edit
                            </button>
                            {p.isActive && (
                              <button
                                className="btn btn-sm"
                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '4px 10px', fontSize: 11 }}
                                onClick={() => handleDelete(p.id)}
                                disabled={deleteLoading === p.id}
                              >
                                {deleteLoading === p.id ? '...' : 'Deactivate'}
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
