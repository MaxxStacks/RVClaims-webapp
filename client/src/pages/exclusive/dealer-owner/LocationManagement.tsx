// client/src/pages/exclusive/dealer-owner/LocationManagement.tsx
// Route: /:dealerId/owner/locations

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import type { Location } from '@/contexts/LocationContext';

interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  locationId: string | null;
}

interface LocationStats {
  units: number;
  claims: number;
  workOrders: number;
  activeStaff: number;
}

const PROVINCES = [
  'AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT',
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

export default function LocationManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const dealershipId = user?.dealershipId as string;

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', address: '', city: '', province: '', postalCode: '', phone: '', email: '', managerUserId: '',
  });

  // ─── Data fetches ────────────────────────────────────────────────────────
  const { data: locsData, isLoading: locsLoading } = useQuery({
    queryKey: ['locations', dealershipId],
    queryFn: () => apiFetch<{ locations: Location[] }>(`/api/dealerships/${dealershipId}/locations`),
    enabled: !!dealershipId,
  });
  const locations: Location[] = locsData?.locations ?? [];

  const { data: staffData } = useQuery({
    queryKey: ['dealership-staff', dealershipId],
    queryFn: () => apiFetch<{ users: StaffUser[] }>(`/api/v6/users?dealershipId=${dealershipId}&role=dealer_staff`),
    enabled: !!dealershipId,
  });
  const staff: StaffUser[] = staffData?.users ?? [];

  const { data: dealershipData } = useQuery({
    queryKey: ['dealership-detail', dealershipId],
    queryFn: () => apiFetch<{ dealership: { multiLocationEnabled: boolean; crossLocationInventory: boolean } }>(`/api/v6/dealerships/${dealershipId}`),
    enabled: !!dealershipId,
  });
  const multiEnabled = dealershipData?.dealership?.multiLocationEnabled ?? false;
  const crossInventory = dealershipData?.dealership?.crossLocationInventory ?? false;

  // Stats per location
  const statsQueries = locations.map((loc) => ({
    queryKey: ['location-stats', dealershipId, loc.id],
    queryFn: () => apiFetch<LocationStats>(`/api/dealerships/${dealershipId}/locations/${loc.id}/stats`),
    enabled: !!dealershipId && locations.length > 0,
    staleTime: 60000,
  }));

  // ─── Mutations ───────────────────────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: (data: typeof form) =>
      apiFetch<{ location: Location }>(`/api/dealerships/${dealershipId}/locations`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', dealershipId] });
      qc.invalidateQueries({ queryKey: ['dealership-locations', dealershipId] });
      setShowAddForm(false);
      setForm({ name: '', address: '', city: '', province: '', postalCode: '', phone: '', email: '', managerUserId: '' });
      toast({ title: t('location.add'), description: `$149/month ${t('location.locationFee')}` });
    },
    onError: (e: any) => {
      toast({ title: 'Error', description: e?.message || 'Failed to add location', variant: 'destructive' });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof form> }) =>
      apiFetch(`/api/dealerships/${dealershipId}/locations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', dealershipId] });
      qc.invalidateQueries({ queryKey: ['dealership-locations', dealershipId] });
      setEditingId(null);
      toast({ title: t('location.edit'), description: 'Location updated' });
    },
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/dealerships/${dealershipId}/locations/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', dealershipId] });
      qc.invalidateQueries({ queryKey: ['dealership-locations', dealershipId] });
      toast({ title: t('location.deactivate'), description: 'Location deactivated' });
    },
  });

  const assignStaffMut = useMutation({
    mutationFn: ({ userId, assignedLocationId }: { userId: string; assignedLocationId: string | null }) =>
      apiFetch(`/api/dealerships/${dealershipId}/locations/staff/staff`, {
        method: 'PATCH',
        body: JSON.stringify({ userId, assignedLocationId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealership-staff', dealershipId] });
    },
  });

  const settingsMut = useMutation({
    mutationFn: (settings: { multiLocationEnabled?: boolean; crossLocationInventory?: boolean }) =>
      apiFetch(`/api/dealerships/${dealershipId}/locations/settings/multi-location`, {
        method: 'PATCH',
        body: JSON.stringify(settings),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dealership-detail', dealershipId] });
      toast({ title: t('common.saved'), description: 'Settings updated' });
    },
  });

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    createMut.mutate(form);
  }

  function handleEditSubmit(e: React.FormEvent, locId: string) {
    e.preventDefault();
    updateMut.mutate({ id: locId, data: form });
  }

  function startEdit(loc: Location) {
    setEditingId(loc.id);
    setForm({
      name: loc.name,
      address: loc.address ?? '',
      city: loc.city ?? '',
      province: loc.province ?? '',
      postalCode: loc.postalCode ?? '',
      phone: loc.phone ?? '',
      email: loc.email ?? '',
      managerUserId: loc.managerUserId ?? '',
    });
  }

  // ─── Form fields ─────────────────────────────────────────────────────────
  const LocationForm = ({ onSubmit, submitLabel, loading }: { onSubmit: (e: React.FormEvent) => void; submitLabel: string; loading: boolean }) => (
    <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
      <div style={{ gridColumn: '1/-1' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>{t('location.name')} *</label>
        <input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
          placeholder="e.g. Downtown Branch"
          style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' as const }}
        />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>{t('location.address')}</label>
        <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="123 Main St" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>City</label>
        <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Toronto" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Province / State</label>
        <select value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' as const }}>
          <option value="">Select…</option>
          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Postal / Zip Code</label>
        <input value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="M5V 3A8" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Phone</label>
        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(416) 555-0100" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Email</label>
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="branch@dealership.com" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' as const }} />
      </div>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>{t('location.manager')}</label>
        <select value={form.managerUserId} onChange={e => setForm(f => ({ ...f, managerUserId: e.target.value }))} style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' as const }}>
          <option value="">— {t('location.unassigned')} —</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
        </select>
      </div>
      <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
        <button type="button" onClick={() => { setShowAddForm(false); setEditingId(null); }} style={{ padding: '8px 16px', border: '1px solid #e0e0e0', borderRadius: 6, background: 'none', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
          {t('common.cancel')}
        </button>
        <button type="submit" disabled={loading} style={{ padding: '8px 20px', border: 'none', borderRadius: 6, background: '#033280', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
          {loading ? '…' : submitLabel}
        </button>
      </div>
    </form>
  );

  if (locsLoading) return <div className="page active" style={{ padding: 40, textAlign: 'center', color: '#888' }}>{t('common.loading')}</div>;

  return (
    <div className="page active">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: 4 }}>{t('location.title')}</div>
        <div style={{ fontSize: 13, color: '#888' }}>Manage dealership locations, staff assignments, and cross-location settings.</div>
      </div>

      {/* ─── LOCATIONS GRID ─── */}
      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text, #1e293b)' }}>Locations</div>
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); setForm({ name: '', address: '', city: '', province: '', postalCode: '', phone: '', email: '', managerUserId: '' }); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#033280', color: '#fff', border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {t('location.add')}
        </button>
      </div>

      {/* Add location form */}
      {showAddForm && (
        <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid #e0e0e0', borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#033280', marginBottom: 2 }}>{t('location.add')}</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{t('location.locationFee')}: $149/month per additional location</div>
          <LocationForm onSubmit={handleAddSubmit} submitLabel={t('location.add')} loading={createMut.isPending} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
        {locations.map((loc) => (
          <div key={loc.id} style={{ background: 'var(--bg-card, #fff)', border: `1px solid ${loc.isMain ? '#c7d4f0' : '#e0e0e0'}`, borderRadius: 10, padding: 18, position: 'relative' }}>
            {loc.isMain && (
              <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, background: '#033280', color: '#fff', borderRadius: 4, padding: '2px 7px', fontWeight: 700 }}>{t('location.main')}</span>
            )}
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: 4, paddingRight: loc.isMain ? 56 : 0 }}>{loc.name}</div>
            {(loc.address || loc.city) && (
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                {[loc.address, loc.city, loc.province].filter(Boolean).join(', ')}
              </div>
            )}
            {loc.phone && <div style={{ fontSize: 12, color: '#888' }}>{loc.phone}</div>}

            {editingId === loc.id ? (
              <LocationForm onSubmit={(e) => handleEditSubmit(e, loc.id)} submitLabel={t('common.save')} loading={updateMut.isPending} />
            ) : (
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  onClick={() => startEdit(loc)}
                  style={{ padding: '5px 12px', border: '1px solid #c7d4f0', borderRadius: 6, background: 'none', fontSize: 12, cursor: 'pointer', color: '#033280', fontWeight: 600, fontFamily: 'inherit' }}
                >
                  {t('location.edit')}
                </button>
                {!loc.isMain && (
                  <button
                    onClick={() => { if (confirm(`Deactivate "${loc.name}"?`)) deactivateMut.mutate(loc.id); }}
                    style={{ padding: '5px 12px', border: '1px solid #fca5a5', borderRadius: 6, background: 'none', fontSize: 12, cursor: 'pointer', color: '#dc2626', fontFamily: 'inherit' }}
                  >
                    {t('location.deactivate')}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {locations.length === 0 && !showAddForm && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#888', fontSize: 14 }}>
            {t('location.noLocations')}
          </div>
        )}
      </div>

      {/* ─── STAFF ASSIGNMENT ─── */}
      {staff.length > 0 && (
        <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid #e0e0e0', borderRadius: 10, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text, #1e293b)', marginBottom: 16 }}>{t('location.staffAssignment')}</div>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>{t('location.assignedTo')}</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</td>
                    <td style={{ color: '#888', fontSize: 12 }}>{s.role}</td>
                    <td>
                      <select
                        defaultValue={s.locationId ?? ''}
                        onChange={(e) => assignStaffMut.mutate({ userId: s.id, assignedLocationId: e.target.value || null })}
                        style={{ padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 5, fontSize: 12, fontFamily: 'inherit' }}
                      >
                        <option value="">— {t('location.unassigned')} (main) —</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── SETTINGS ─── */}
      <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid #e0e0e0', borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text, #1e293b)', marginBottom: 16 }}>Location Settings</div>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          {/* Multi-Location Mode */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #1e293b)' }}>{t('location.multiLocationMode')}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Shows the location switcher in the app bar when you have 2+ locations.</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 40, height: 22, flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={multiEnabled}
                onChange={(e) => settingsMut.mutate({ multiLocationEnabled: e.target.checked })}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
              <span style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                background: multiEnabled ? '#033280' : '#ccc', borderRadius: 22, transition: '0.2s',
              }}>
                <span style={{
                  position: 'absolute', content: '', height: 16, width: 16, left: multiEnabled ? 20 : 3, bottom: 3,
                  background: '#fff', borderRadius: '50%', transition: '0.2s',
                }} />
              </span>
            </label>
          </div>

          {/* Cross-Location Inventory */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #1e293b)' }}>{t('location.crossLocationInventory')}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Staff can view (but not edit) inventory from other locations.</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: 40, height: 22, flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={crossInventory}
                onChange={(e) => settingsMut.mutate({ crossLocationInventory: e.target.checked })}
                style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
              />
              <span style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                background: crossInventory ? '#033280' : '#ccc', borderRadius: 22, transition: '0.2s',
              }}>
                <span style={{
                  position: 'absolute', content: '', height: 16, width: 16, left: crossInventory ? 20 : 3, bottom: 3,
                  background: '#fff', borderRadius: '50%', transition: '0.2s',
                }} />
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
