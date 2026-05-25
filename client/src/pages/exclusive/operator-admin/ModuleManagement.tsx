// client/src/pages/exclusive/operator-admin/ModuleManagement.tsx
// Operator Admin — Module catalog management with adoption stats
// Route: /operator/admin/modules

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';

interface ModuleStat {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  category: string;
  monthlyPrice: string | null;
  perTransactionFee: string | null;
  isBase: boolean;
  isActive: boolean;
  sortOrder: number;
  subscriberCount: number;
  monthlyRevenue: number;
}

interface ServiceModule {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  features: string[] | null;
  category: string;
  monthlyPrice: string | null;
  perTransactionFee: string | null;
  setupFee: string | null;
  icon: string | null;
  isBase: boolean;
  isActive: boolean;
  sortOrder: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Claims:     { bg: '#e0f2fe', color: '#0369a1' },
  Finance:    { bg: '#dcfce7', color: '#15803d' },
  Operations: { bg: '#fef3c7', color: '#b45309' },
  Sales:      { bg: '#ede9fe', color: '#6d28d9' },
  Support:    { bg: '#fce7f3', color: '#be185d' },
};

const CATEGORIES = ['Claims', 'Finance', 'Operations', 'Sales', 'Support'];

function fmt(n: number) {
  return n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
}

export default function ModuleManagement() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editingModule, setEditingModule] = useState<ServiceModule | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', slug: '', tagline: '', description: '', features: '',
    icon: '', category: 'Claims', monthlyPrice: '0', perTransactionFee: '',
    setupFee: '', isBase: false, sortOrder: 0, isActive: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['moduleStats'],
    queryFn: () => apiFetch<{ stats: ModuleStat[] }>('/api/modules/stats'),
    staleTime: 2 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ServiceModule> }) =>
      apiFetch(`/api/modules/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moduleStats'] });
      queryClient.invalidateQueries({ queryKey: ['serviceModules'] });
      setEditingModule(null);
      toast({ title: 'Module updated.' });
    },
    onError: () => toast({ title: 'Failed to update module.', variant: 'destructive' }),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const featuresArr = payload.features.split('\n').map(s => s.trim()).filter(Boolean);
      return apiFetch('/api/modules', {
        method: 'POST',
        body: JSON.stringify({ ...payload, features: featuresArr }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moduleStats'] });
      queryClient.invalidateQueries({ queryKey: ['serviceModules'] });
      setShowAddForm(false);
      resetForm();
      toast({ title: 'Module created.' });
    },
    onError: () => toast({ title: 'Failed to create module.', variant: 'destructive' }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiFetch(`/api/modules/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moduleStats'] });
      queryClient.invalidateQueries({ queryKey: ['serviceModules'] });
      toast({ title: 'Module status updated.' });
    },
    onError: () => toast({ title: 'Failed to update status.', variant: 'destructive' }),
  });

  const resetForm = () => setFormData({
    name: '', slug: '', tagline: '', description: '', features: '',
    icon: '', category: 'Claims', monthlyPrice: '0', perTransactionFee: '',
    setupFee: '', isBase: false, sortOrder: 0, isActive: true,
  });

  const startEdit = (m: ServiceModule) => {
    setEditingModule(m);
    setFormData({
      name: m.name, slug: m.slug, tagline: m.tagline || '', description: m.description || '',
      features: (m.features || []).join('\n'), icon: m.icon || '',
      category: m.category, monthlyPrice: m.monthlyPrice || '0',
      perTransactionFee: m.perTransactionFee || '', setupFee: m.setupFee || '',
      isBase: m.isBase, sortOrder: m.sortOrder, isActive: m.isActive,
    });
  };

  const handleSave = () => {
    if (!editingModule) return;
    const featuresArr = formData.features.split('\n').map(s => s.trim()).filter(Boolean);
    updateMutation.mutate({
      id: editingModule.id,
      updates: { ...formData, features: featuresArr },
    });
  };

  const stats = data?.stats || [];
  const totalRevenue = stats.reduce((s, m) => s + m.monthlyRevenue, 0);
  const totalSubscribers = stats.reduce((s, m) => s + m.subscriberCount, 0);
  const activeModules = stats.filter(m => m.isActive).length;

  const set = (k: keyof typeof formData, v: any) => setFormData(f => ({ ...f, [k]: v }));

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', border: '1px solid var(--border,#e0e0e0)',
    borderRadius: 6, fontSize: 13, fontFamily: 'inherit',
    background: 'var(--bg-input,#fff)', color: 'var(--text,#333)',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 };

  return (
    <div className="page active">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Active Modules</div><div className="sc-v" style={{ color: '#2563eb' }}>{activeModules}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Subscribers</div><div className="sc-v" style={{ color: '#22c55e' }}>{totalSubscribers}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Monthly Catalog Revenue</div><div className="sc-v" style={{ color: '#f59e0b' }}>{fmt(totalRevenue)}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Modules</div><div className="sc-v">{stats.length}</div></div>
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text, #1a1a1a)' }}>
            {t('modules.moduleManagement')}
          </div>
          <div style={{ fontSize: 13, color: '#888' }}>{t('modules.moduleManagementSubtitle')}</div>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingModule(null); resetForm(); }}
          className="btn btn-p btn-sm"
        >
          + {t('modules.addModule')}
        </button>
      </div>

      {/* Add / Edit Form */}
      {(showAddForm || editingModule) && (
        <div className="pn" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--text, #1a1a1a)' }}>
            {editingModule ? t('modules.editModule') : t('modules.addModule')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} value={formData.name} onChange={e => set('name', e.target.value)} placeholder="Module name" />
            </div>
            <div>
              <label style={labelStyle}>Slug *</label>
              <input style={inputStyle} value={formData.slug} onChange={e => set('slug', e.target.value)} placeholder="e.g. fi-services" disabled={!!editingModule} />
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select style={inputStyle} value={formData.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Monthly Price ($)</label>
              <input style={inputStyle} type="number" min="0" step="1" value={formData.monthlyPrice} onChange={e => set('monthlyPrice', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Per Transaction Fee ($)</label>
              <input style={inputStyle} type="number" min="0" value={formData.perTransactionFee} onChange={e => set('perTransactionFee', e.target.value)} placeholder="Leave blank if none" />
            </div>
            <div>
              <label style={labelStyle}>Sort Order</label>
              <input style={inputStyle} type="number" min="0" value={formData.sortOrder} onChange={e => set('sortOrder', Number(e.target.value))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Tagline</label>
              <input style={inputStyle} value={formData.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Short marketing tagline" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Description (use blank lines to separate paragraphs)</label>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }} value={formData.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Features (one per line)</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={formData.features} onChange={e => set('features', e.target.value)} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="isBase" checked={formData.isBase} onChange={e => set('isBase', e.target.checked)} />
              <label htmlFor="isBase" style={{ fontSize: 13, color: '#555', cursor: 'pointer' }}>Base module (always included)</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => set('isActive', e.target.checked)} />
              <label htmlFor="isActive" style={{ fontSize: 13, color: '#555', cursor: 'pointer' }}>Active (visible in catalog)</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setEditingModule(null); setShowAddForm(false); resetForm(); }}
              style={{ padding: '8px 16px', border: '1px solid var(--border,#e0e0e0)', borderRadius: 6, background: 'none', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={editingModule ? handleSave : () => createMutation.mutate(formData)}
              disabled={updateMutation.isPending || createMutation.isPending}
              className="btn btn-p btn-sm"
            >
              {(updateMutation.isPending || createMutation.isPending) ? t('common.saving') : t('modules.saveModule')}
            </button>
          </div>
        </div>
      )}

      {/* Module table */}
      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">{t('modules.allModules')}</span>
        </div>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>{t('common.loading')}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border,#e0e0e0)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#888', fontWeight: 600 }}>Module</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', color: '#888', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#888', fontWeight: 600 }}>Price/mo</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#888', fontWeight: 600 }}>{t('modules.subscribers')}</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', color: '#888', fontWeight: 600 }}>{t('modules.monthlyRevenue')}</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', color: '#888', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', color: '#888', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((m) => {
                const cat = CATEGORY_COLORS[m.category] || { bg: '#f3f4f6', color: '#6b7280' };
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border,#e0e0e0)' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text,#1a1a1a)' }}>{m.name}</div>
                      {m.tagline && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{m.tagline}</div>}
                      {m.isBase && <span style={{ fontSize: 10, padding: '1px 5px', background: '#e0f2fe', color: '#0369a1', borderRadius: 3, fontWeight: 600, marginTop: 3, display: 'inline-block' }}>BASE</span>}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, background: cat.bg, color: cat.color }}>{m.category}</span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>
                      {m.isBase ? '—' : `$${parseFloat(m.monthlyPrice || '0').toFixed(0)}`}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#2563eb' }}>{m.subscriberCount}</span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: '#22c55e' }}>{fmt(m.monthlyRevenue)}</span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                        background: m.isActive ? '#dcfce7' : '#f3f4f6',
                        color: m.isActive ? '#15803d' : '#6b7280',
                      }}>
                        {m.isActive ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          onClick={() => startEdit(m as unknown as ServiceModule)}
                          className="btn btn-sm"
                          style={{ padding: '4px 10px', fontSize: 11 }}
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => toggleActiveMutation.mutate({ id: m.id, isActive: !m.isActive })}
                          style={{
                            padding: '4px 10px', fontSize: 11, borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit',
                            border: `1px solid ${m.isActive ? '#dc2626' : '#22c55e'}`,
                            background: 'none',
                            color: m.isActive ? '#dc2626' : '#22c55e',
                          }}
                        >
                          {m.isActive ? t('modules.deactivate') : t('modules.activate')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
