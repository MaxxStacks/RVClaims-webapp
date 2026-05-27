// client/src/pages/exclusive/supplier/SupplierCatalog.tsx
// Route: /supplier/catalog

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { formatCurrency } from '@/lib/locale';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = [
  'exterior', 'interior', 'plumbing', 'electrical', 'appliances',
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

interface FormData {
  partNumber: string;
  name: string;
  description: string;
  category: string;
  manufacturer: string;
  price: string;
  currency: 'CAD' | 'USD';
  inStock: boolean;
  stockQuantity: string;
  leadTimeDays: string;
  imageUrl: string;
}

const defaultForm: FormData = {
  partNumber: '', name: '', description: '', category: 'other', manufacturer: '',
  price: '', currency: 'CAD', inStock: true, stockQuantity: '', leadTimeDays: '', imageUrl: '',
};

export default function SupplierCatalog() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  const { data, isLoading } = useQuery({
    queryKey: ['supplierMeCatalog'],
    queryFn: () => apiFetch<any>('/api/suppliers/me/catalog'),
    retry: false,
  });

  const items: any[] = data?.items ?? [];
  const activeCount = items.filter(i => i.isActive).length;

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch('/api/suppliers/me/catalog', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: 'Product added' });
      qc.invalidateQueries({ queryKey: ['supplierMeCatalog'] });
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast({ title: 'Error', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      apiFetch(`/api/suppliers/me/catalog/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: 'Product updated' });
      qc.invalidateQueries({ queryKey: ['supplierMeCatalog'] });
      setEditId(null);
      setShowForm(false);
      setForm(defaultForm);
    },
    onError: () => toast({ title: 'Error', variant: 'destructive' }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/suppliers/me/catalog/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: 'Product deactivated' });
      qc.invalidateQueries({ queryKey: ['supplierMeCatalog'] });
    },
    onError: () => toast({ title: 'Error', variant: 'destructive' }),
  });

  const openAdd = () => { setEditId(null); setForm(defaultForm); setShowForm(true); };
  const openEdit = (item: any) => {
    setEditId(item.id);
    setForm({
      partNumber: item.partNumber ?? '',
      name: item.name ?? '',
      description: item.description ?? '',
      category: item.category ?? 'other',
      manufacturer: item.manufacturer ?? '',
      price: item.price ?? '',
      currency: item.currency ?? 'CAD',
      inStock: item.inStock ?? true,
      stockQuantity: item.stockQuantity != null ? String(item.stockQuantity) : '',
      leadTimeDays: item.leadTimeDays != null ? String(item.leadTimeDays) : '',
      imageUrl: item.imageUrl ?? '',
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.partNumber || !form.name || !form.price) return;
    const body: Record<string, unknown> = {
      partNumber: form.partNumber,
      name: form.name,
      description: form.description || undefined,
      category: form.category,
      manufacturer: form.manufacturer || undefined,
      price: form.price,
      currency: form.currency,
      inStock: form.inStock,
      stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : undefined,
      leadTimeDays: form.leadTimeDays ? parseInt(form.leadTimeDays) : undefined,
      imageUrl: form.imageUrl || undefined,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, body });
    } else {
      createMutation.mutate(body);
    }
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: 4 }}>
            {t('supplier.catalog') || 'Product Catalog'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            {activeCount} active products
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{ padding: '9px 18px', background: '#033280', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          {t('supplier.addProduct') || '+ Add Product'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 18, marginTop: 0 }}>
            {editId ? 'Edit Product' : t('supplier.addProduct') || 'Add Product'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>{t('supplier.partNumber') || 'Part Number'} *</label>
              <input value={form.partNumber} onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))} style={inputStyle} placeholder="e.g. RV-EXT-001" />
            </div>
            <div>
              <label style={labelStyle}>{t('common.name') || 'Name'} *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Product name" />
            </div>
            <div>
              <label style={labelStyle}>Manufacturer</label>
              <input value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} style={inputStyle} placeholder="e.g. Lippert" />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, height: 72, resize: 'vertical' }} placeholder="Product description..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>{t('supplier.category') || 'Category'}</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} style={inputStyle} placeholder="0.00" />
            </div>
            <div>
              <label style={labelStyle}>Currency</label>
              <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value as 'CAD' | 'USD' }))} style={inputStyle}>
                <option value="CAD">CAD</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Stock Qty</label>
              <input type="number" min="0" value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} style={inputStyle} placeholder="—" />
            </div>
            <div>
              <label style={labelStyle}>{t('supplier.leadTime') || 'Lead Time (days)'}</label>
              <input type="number" min="0" value={form.leadTimeDays} onChange={e => setForm(f => ({ ...f, leadTimeDays: e.target.value }))} style={inputStyle} placeholder="—" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Image URL</label>
              <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} style={{ ...inputStyle, width: 300 }} placeholder="https://..." />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
              <input type="checkbox" id="inStock" checked={form.inStock} onChange={e => setForm(f => ({ ...f, inStock: e.target.checked }))} />
              <label htmlFor="inStock" style={{ fontSize: 13, color: '#475569', cursor: 'pointer' }}>{t('supplier.inStock') || 'In Stock'}</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              style={{ padding: '9px 20px', background: '#033280', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              {createMutation.isPending || updateMutation.isPending ? t('common.saving') || 'Saving…' : t('common.save') || 'Save'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(defaultForm); }}
              style={{ padding: '9px 16px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, cursor: 'pointer' }}
            >
              {t('common.cancel') || 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {[t('supplier.partNumber') || 'Part #', t('common.name') || 'Name', t('supplier.category') || 'Category',
                  'Price', t('supplier.inStock') || 'In Stock', t('supplier.leadTime') || 'Lead Time', 'Active', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} style={{ padding: '28px 14px', textAlign: 'center', color: '#94a3b8' }}>{t('common.loading') || 'Loading…'}</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '28px 14px', textAlign: 'center', color: '#94a3b8' }}>{t('common.noResults') || 'No products yet'}</td></tr>
              ) : items.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: item.isActive ? 1 : 0.55 }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#1e293b', fontWeight: 600 }}>{item.partNumber}</td>
                  <td style={{ padding: '10px 14px', color: '#1e293b' }}>{item.name}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: categoryColor(item.category ?? 'other') + '20', color: categoryColor(item.category ?? 'other') }}>
                      {item.category ?? 'other'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>
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
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                      background: item.isActive ? '#dcfce7' : '#f1f5f9', color: item.isActive ? '#16a34a' : '#64748b' }}>
                      {item.isActive ? t('common.active') || 'Active' : t('common.inactive') || 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => openEdit(item)}
                      style={{ padding: '5px 12px', background: '#eff6ff', color: '#033280', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                    >
                      {t('common.edit') || 'Edit'}
                    </button>
                    {item.isActive && (
                      <button
                        onClick={() => deactivateMutation.mutate(item.id)}
                        style={{ padding: '5px 12px', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box' };
