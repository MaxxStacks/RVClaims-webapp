// client/src/pages/exclusive/supplier/SupplierSettings.tsx
// Route: /supplier/settings

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';

const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block',
  marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 11px', border: '1px solid #e2e8f0',
  borderRadius: 7, fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

export default function SupplierSettings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    companyName: '', contactName: '', phone: '', address: '',
    city: '', province: '', country: 'CA', website: '', description: '', logoUrl: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['supplierMe'],
    queryFn: () => apiFetch<any>('/api/suppliers/me'),
    retry: false,
  });

  useEffect(() => {
    if (data?.supplier) {
      const s = data.supplier;
      setForm({
        companyName: s.companyName ?? '',
        contactName: s.contactName ?? '',
        phone: s.phone ?? '',
        address: s.address ?? '',
        city: s.city ?? '',
        province: s.province ?? '',
        country: s.country ?? 'CA',
        website: s.website ?? '',
        description: s.description ?? '',
        logoUrl: s.logoUrl ?? '',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch('/api/suppliers/me', { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: t('common.savedOk') || 'Saved ✓' });
      qc.invalidateQueries({ queryKey: ['supplierMe'] });
    },
    onError: () => toast({ title: t('common.errorSaving') || 'Failed to save.', variant: 'destructive' }),
  });

  const supplier = data?.supplier;

  const subscriptionColor = (status: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      trial:     { color: '#d97706', bg: '#fef3c7' },
      active:    { color: '#16a34a', bg: '#dcfce7' },
      paused:    { color: '#64748b', bg: '#f1f5f9' },
      cancelled: { color: '#dc2626', bg: '#fee2e2' },
    };
    return map[status] ?? { color: '#64748b', bg: '#f1f5f9' };
  };

  const subBadge = supplier ? subscriptionColor(supplier.subscriptionStatus ?? 'trial') : null;

  return (
    <div style={{ padding: '28px 32px', maxWidth: 820, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 28 }}>
        {t('nav.settings') || 'Settings'}
      </h1>

      {/* Subscription Card */}
      {supplier && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 22px', marginBottom: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 12 }}>Subscription</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: subBadge?.bg, color: subBadge?.color }}>
              {(supplier.subscriptionStatus ?? 'trial').charAt(0).toUpperCase() + (supplier.subscriptionStatus ?? 'trial').slice(1)}
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>$99/month listing fee · Supplier Portal access</span>
          </div>
        </div>
      )}

      {/* Company Profile Form */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 18 }}>Company Profile</div>

        {isLoading ? (
          <div style={{ color: '#64748b', fontSize: 13 }}>{t('common.loading') || 'Loading…'}</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Company Name *</label>
                <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Contact Name</label>
                <input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>{t('common.phone') || 'Phone'}</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} style={inputStyle} placeholder="https://..." />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{t('common.address') || 'Address'}</label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>City</label>
                <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Province / State</label>
                <input value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} style={inputStyle}>
                  <option value="CA">Canada</option>
                  <option value="US">United States</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                style={{ ...inputStyle, height: 80, resize: 'vertical' }}
                placeholder="Brief description of your products and services..."
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Logo URL</label>
              <input value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} style={inputStyle} placeholder="https://..." />
            </div>
            <button
              onClick={() => updateMutation.mutate(form)}
              disabled={updateMutation.isPending}
              style={{
                padding: '9px 20px', background: '#033280', color: '#fff',
                border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {updateMutation.isPending ? t('common.saving') || 'Saving…' : t('common.save') || 'Save Changes'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
