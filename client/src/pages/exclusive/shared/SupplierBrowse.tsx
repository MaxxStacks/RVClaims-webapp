// client/src/pages/exclusive/shared/SupplierBrowse.tsx
// Route: /:dealerId/owner/suppliers, /:dealerId/parts-manager/suppliers
// Dealer-side supplier catalog browser + order placement

import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { formatCurrency } from '@/lib/locale';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  'all', 'exterior', 'interior', 'plumbing', 'electrical', 'appliances',
  'hvac', 'structural', 'accessories', 'chemicals', 'tools', 'other',
];

const categoryColor = (cat: string) => {
  const map: Record<string, string> = {
    exterior: '#0891b2', interior: '#7c3aed', plumbing: '#0369a1',
    electrical: '#d97706', appliances: '#16a34a', hvac: '#dc2626',
    structural: '#475569', accessories: '#8b5cf6', chemicals: '#0cb22c',
    tools: '#b45309', other: '#64748b',
  };
  return map[cat] ?? '#64748b';
};

interface CartItem {
  catalogItemId: string;
  quantity: number;
  name: string;
  partNumber: string;
  price: string;
  currency: string;
  supplierName: string;
  supplierId: string;
}

export default function SupplierBrowse() {
  const { dealerId } = useParams<{ dealerId: string }>();
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [tab, setTab] = useState<'catalog' | 'directory'>('catalog');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [showCart, setShowCart] = useState(false);

  const queryParams = new URLSearchParams();
  if (search) queryParams.set('q', search);
  if (category !== 'all') queryParams.set('category', category);
  if (inStockOnly) queryParams.set('inStockOnly', 'true');

  const { data, isLoading } = useQuery({
    queryKey: ['supplierCatalog', search, category, inStockOnly],
    queryFn: () => apiFetch<any>(`/api/suppliers/catalog?${queryParams.toString()}`),
    retry: false,
  });

  const items: any[] = data?.items ?? [];
  const suppliersList: any[] = data?.suppliers ?? [];

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(c => c.catalogItemId === item.id);
      if (existing) {
        return prev.map(c => c.catalogItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, {
        catalogItemId: item.id,
        quantity: 1,
        name: item.name,
        partNumber: item.partNumber,
        price: item.price,
        currency: item.currency ?? 'CAD',
        supplierName: item.supplier?.companyName ?? 'Unknown Supplier',
        supplierId: item.supplierId,
      }];
    });
  };

  const removeFromCart = (catalogItemId: string) => {
    setCart(prev => prev.filter(c => c.catalogItemId !== catalogItemId));
  };

  const updateQty = (catalogItemId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(catalogItemId); return; }
    setCart(prev => prev.map(c => c.catalogItemId === catalogItemId ? { ...c, quantity: qty } : c));
  };

  const cartTotal = cart.reduce((sum, c) => sum + parseFloat(c.price) * c.quantity, 0);
  const cartCurrency = cart[0]?.currency ?? 'CAD';

  // Group cart by supplier for multi-supplier orders
  const cartBySupplier = cart.reduce((acc: Record<string, CartItem[]>, item) => {
    if (!acc[item.supplierId]) acc[item.supplierId] = [];
    acc[item.supplierId].push(item);
    return acc;
  }, {});

  const placeMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch('/api/suppliers/orders/place', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: (data: any) => {
      toast({
        title: `${t('supplier.orderPlaced') || 'Order placed!'} ${data.orderNumber}`,
        description: `Order ${data.orderNumber} has been sent to the supplier.`,
      });
      setCart([]);
      setShowCart(false);
      qc.invalidateQueries({ queryKey: ['supplierCatalog'] });
    },
    onError: () => toast({ title: 'Error placing order', variant: 'destructive' }),
  });

  const placeOrder = () => {
    // Place one order per supplier
    const supplierIds = Object.keys(cartBySupplier);
    for (const supplierId of supplierIds) {
      const supplierItems = cartBySupplier[supplierId];
      placeMutation.mutate({
        supplierId,
        items: supplierItems.map(i => ({ catalogItemId: i.catalogItemId, quantity: i.quantity })),
        shippingAddress: shippingAddress || undefined,
      });
    }
  };

  // Find items with same part number from multiple suppliers (price comparison)
  const partNumberGroups = items.reduce((acc: Record<string, any[]>, item) => {
    if (!acc[item.partNumber]) acc[item.partNumber] = [];
    acc[item.partNumber].push(item);
    return acc;
  }, {});
  const compareItems = Object.values(partNumberGroups).filter(group => group.length > 1);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: 4 }}>
            {t('supplier.browse') || 'Supplier Catalog'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Browse parts from verified suppliers</p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={() => setShowCart(s => !s)}
            style={{
              padding: '9px 18px', background: '#0cb22c', color: '#fff', border: 'none',
              borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', position: 'relative',
            }}
          >
            Cart ({cart.length}) — {formatCurrency(cartTotal, cartCurrency as any)}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 0 }}>
        {[
          { id: 'catalog', label: t('supplier.catalog') || 'Catalog' },
          { id: 'directory', label: 'Supplier Directory' },
          ...(compareItems.length > 0 ? [{ id: 'compare', label: t('supplier.compare') || 'Compare' }] : []),
        ].map(tab2 => (
          <button
            key={tab2.id}
            onClick={() => setTab(tab2.id as any)}
            style={{
              padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === tab2.id ? 600 : 400,
              color: tab === tab2.id ? '#033280' : '#64748b',
              borderBottom: tab === tab2.id ? '2px solid #033280' : '2px solid transparent',
              marginBottom: -1,
            }}
          >{tab2.label}</button>
        ))}
      </div>

      {/* Cart Drawer */}
      {showCart && cart.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', marginBottom: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 16, marginTop: 0 }}>
            {t('supplier.placeOrder') || 'Place Order'}
          </h3>
          {cart.map(item => (
            <div key={item.catalogItemId} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{item.partNumber} · {item.supplierName}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="number" min="1" value={item.quantity}
                  onChange={e => updateQty(item.catalogItemId, parseInt(e.target.value) || 0)}
                  style={{ width: 52, padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, textAlign: 'center' }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', minWidth: 80, textAlign: 'right' }}>
                  {formatCurrency(parseFloat(item.price) * item.quantity, item.currency as any)}
                </span>
                <button onClick={() => removeFromCart(item.catalogItemId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16, padding: '0 4px' }}>×</button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Shipping Address
            </label>
            <input
              value={shippingAddress}
              onChange={e => setShippingAddress(e.target.value)}
              placeholder="Enter shipping address..."
              style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
              Total: {formatCurrency(cartTotal, cartCurrency as any)}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowCart(false)} style={{ padding: '9px 16px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}>
                {t('common.cancel') || 'Cancel'}
              </button>
              <button
                onClick={placeOrder}
                disabled={placeMutation.isPending}
                style={{ padding: '9px 20px', background: '#0cb22c', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                {placeMutation.isPending ? 'Placing…' : t('supplier.placeOrder') || 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Tab */}
      {tab === 'catalog' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`${t('supplier.browse') || 'Search parts across all verified suppliers…'}`}
              style={{ flex: '1 1 320px', padding: '9px 14px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none' }}
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13 }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
              <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
              In Stock Only
            </label>
          </div>

          {/* Results */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    {['Part Name', 'Part #', 'Supplier', 'Category', 'Price', t('supplier.inStock') || 'In Stock',
                      t('supplier.leadTime') || 'Lead Time', t('supplier.placeOrder') || 'Order'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={8} style={{ padding: '28px 14px', textAlign: 'center', color: '#94a3b8' }}>{t('common.loading') || 'Loading…'}</td></tr>
                  ) : items.length === 0 ? (
                    <tr><td colSpan={8} style={{ padding: '28px 14px', textAlign: 'center', color: '#94a3b8' }}>{t('common.noResults') || 'No products found'}</td></tr>
                  ) : items.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 500, color: '#1e293b' }}>{item.name}</td>
                      <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>{item.partNumber}</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{item.supplier?.companyName ?? '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: categoryColor(item.category ?? 'other') + '20', color: categoryColor(item.category ?? 'other') }}>
                          {item.category ?? 'other'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#0f172a' }}>
                        {formatCurrency(item.price, (item.currency ?? 'CAD') as any)} <span style={{ color: '#94a3b8', fontSize: 10 }}>{item.currency}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                          background: item.inStock ? '#dcfce7' : '#fee2e2', color: item.inStock ? '#16a34a' : '#dc2626' }}>
                          {item.inStock ? t('supplier.inStock') || 'In Stock' : t('supplier.outOfStock') || 'Out of Stock'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>
                        {item.leadTimeDays != null ? `${item.leadTimeDays}d` : '—'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <button
                          onClick={() => { addToCart(item); setShowCart(true); }}
                          disabled={!item.inStock}
                          style={{
                            padding: '5px 12px', background: item.inStock ? '#033280' : '#f1f5f9',
                            color: item.inStock ? '#fff' : '#94a3b8',
                            border: 'none', borderRadius: 6, fontSize: 12, cursor: item.inStock ? 'pointer' : 'not-allowed',
                            fontWeight: 500,
                          }}
                        >
                          + {t('supplier.placeOrder') || 'Order'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Directory Tab */}
      {tab === 'directory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {suppliersList.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: 40, fontSize: 13 }}>
              No verified suppliers yet
            </div>
          ) : suppliersList.map((sup: any) => (
            <div key={sup.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px' }}>
              {sup.logoUrl ? (
                <img src={sup.logoUrl} alt={sup.companyName} style={{ height: 40, objectFit: 'contain', marginBottom: 10 }} />
              ) : (
                <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 8, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>◫</div>
              )}
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{sup.companyName}</div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: '#dcfce7', color: '#16a34a' }}>
                {t('supplier.verified') || 'Verified'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Compare Tab */}
      {(tab as string) === 'compare' && (
        <div>
          {compareItems.map((group: any[]) => (
            <div key={group[0].partNumber} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, marginBottom: 16, overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, fontSize: 13, color: '#1e293b' }}>
                {group[0].partNumber} — {group[0].name}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${group.length}, 1fr)`, gap: 0 }}>
                {group.map((item: any) => (
                  <div key={item.id} style={{ padding: '14px 18px', borderRight: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{item.supplier?.companyName}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                      {formatCurrency(item.price, (item.currency ?? 'CAD') as any)}
                    </div>
                    <button
                      onClick={() => { addToCart(item); setShowCart(true); }}
                      style={{ padding: '6px 14px', background: '#033280', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                    >
                      {t('supplier.placeOrder') || 'Order'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
