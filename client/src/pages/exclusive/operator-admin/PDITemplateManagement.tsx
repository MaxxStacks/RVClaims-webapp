// client/src/pages/exclusive/operator-admin/PDITemplateManagement.tsx
// Operator Admin — CRUD management for PDI checklist templates.
// Templates are grouped by unitType → section → items (sorted by sortOrder).

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';

// ─── Types ─────────────────────────────────────────────────────────────────

interface PDITemplate {
  id: string;
  unitType: string;
  section: string;
  itemName: string;
  sortOrder: number;
  isDefault: boolean;
  createdAt: string | null;
}

interface SectionGroup {
  name: string;
  items: PDITemplate[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const UNIT_TYPES = ['travel_trailer', 'fifth_wheel', 'class_a', 'class_c', 'van_camper', 'truck_camper', 'pop_up', 'toy_hauler'];

function sectionLabel(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Toast ─────────────────────────────────────────────────────────────────

interface ToastState { msg: string; type: 'error' | 'success' }

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }): React.ReactElement {
  return (
    <div
      style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: toast.type === 'error' ? '#dc2626' : '#16a34a',
        color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 14,
        fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
      }}
      onClick={onDismiss}
    >
      {toast.msg}
    </div>
  );
}

// ─── Add Item inline form ───────────────────────────────────────────────────

interface AddItemFormProps {
  unitType: string;
  section: string;
  existingSortMax: number;
  onSaved: () => void;
  onCancel: () => void;
  t: (k: string) => string;
}

function AddItemForm({ unitType, section, existingSortMax, onSaved, onCancel, t }: AddItemFormProps): React.ReactElement {
  const [itemName, setItemName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const name = itemName.trim();
    if (!name) { setError(t('pdi.itemNameRequired')); return; }
    setSaving(true);
    setError('');
    try {
      await apiFetch('/api/pdi/templates', {
        method: 'POST',
        body: JSON.stringify({ unitType, section, itemName: name, sortOrder: existingSortMax + 10 }),
      });
      onSaved();
    } catch (err: any) {
      setError(err?.message || 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderTop: '1px solid #f0f4ff' }}>
      <input
        autoFocus
        value={itemName}
        onChange={e => { setItemName(e.target.value); setError(''); }}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
        placeholder={t('pdi.newItemPlaceholder')}
        style={{
          flex: 1, padding: '6px 10px', border: `1px solid ${error ? '#dc2626' : '#e0e0e0'}`,
          borderRadius: 6, fontSize: 13, fontFamily: 'inherit',
        }}
      />
      <button className="btn btn-p btn-sm" onClick={handleSave} disabled={saving}>
        {saving ? t('common.saving') : t('common.add')}
      </button>
      <button className="btn btn-o btn-sm" onClick={onCancel}>{t('common.cancel')}</button>
      {error && <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>}
    </div>
  );
}

// ─── Add Section inline form ────────────────────────────────────────────────

interface AddSectionFormProps {
  unitType: string;
  onSaved: () => void;
  onCancel: () => void;
  t: (k: string) => string;
}

function AddSectionForm({ unitType, onSaved, onCancel, t }: AddSectionFormProps): React.ReactElement {
  const [sectionName, setSectionName] = useState('');
  const [firstItem, setFirstItem] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const sec = sectionName.trim().toLowerCase().replace(/\s+/g, '_');
    const item = firstItem.trim();
    if (!sec) { setError(t('pdi.sectionNameRequired')); return; }
    if (!item) { setError(t('pdi.firstItemRequired')); return; }
    setSaving(true);
    setError('');
    try {
      await apiFetch('/api/pdi/templates', {
        method: 'POST',
        body: JSON.stringify({ unitType, section: sec, itemName: item, sortOrder: 10 }),
      });
      onSaved();
    } catch (err: any) {
      setError(err?.message || 'Failed to add section');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        padding: '12px 16px', background: '#f0f7ff', border: '1px solid #bfdbfe',
        borderRadius: 8, marginBottom: 12,
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 10 }}>{t('pdi.addSection')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <label style={{ fontSize: 12, color: '#374151', display: 'block', marginBottom: 3 }}>{t('pdi.sectionName')}</label>
          <input
            autoFocus
            value={sectionName}
            onChange={e => { setSectionName(e.target.value); setError(''); }}
            placeholder="e.g. roof_inspection"
            style={{ width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Use lowercase with underscores</div>
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#374151', display: 'block', marginBottom: 3 }}>{t('pdi.firstItem')}</label>
          <input
            value={firstItem}
            onChange={e => { setFirstItem(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
            placeholder={t('pdi.newItemPlaceholder')}
            style={{ width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
        {error && <div style={{ fontSize: 12, color: '#dc2626' }}>{error}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-p btn-sm" onClick={handleSave} disabled={saving}>
            {saving ? t('common.saving') : t('pdi.createSection')}
          </button>
          <button className="btn btn-o btn-sm" onClick={onCancel}>{t('common.cancel')}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PDITemplateManagement(): React.ReactElement {
  const { t } = useLanguage();
  const [unitType, setUnitType] = useState('travel_trailer');
  const [templates, setTemplates] = useState<PDITemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null); // section name
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Load templates ──────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>(`/api/pdi/templates?unitType=${encodeURIComponent(unitType)}`);
      setTemplates(Array.isArray(data.templates) ? data.templates : []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [unitType]);

  useEffect(() => { load(); }, [load]);

  // ── Group by section ────────────────────────────────────────────────────
  const sections: SectionGroup[] = [];
  const sectionMap = new Map<string, PDITemplate[]>();
  for (const item of templates) {
    if (!sectionMap.has(item.section)) sectionMap.set(item.section, []);
    sectionMap.get(item.section)!.push(item);
  }
  sectionMap.forEach((items, name) => {
    sections.push({ name, items: [...items].sort((a, b) => a.sortOrder - b.sortOrder) });
  });

  // ── Inline edit save ────────────────────────────────────────────────────
  const handleEditSave = async (id: string) => {
    const name = editValue.trim();
    if (!name) return;
    try {
      await apiFetch(`/api/pdi/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ itemName: name }),
      });
      setEditingId(null);
      setEditValue('');
      load();
      setToast({ msg: t('common.saved'), type: 'success' });
    } catch (err: any) {
      setToast({ msg: err?.message || 'Save failed', type: 'error' });
    }
  };

  // ── Sort order update ───────────────────────────────────────────────────
  const handleSortChange = async (id: string, value: string) => {
    const n = parseInt(value, 10);
    if (isNaN(n)) return;
    try {
      await apiFetch(`/api/pdi/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ sortOrder: n }),
      });
      load();
    } catch (err: any) {
      setToast({ msg: err?.message || 'Sort update failed', type: 'error' });
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await apiFetch(`/api/pdi/templates/${id}`, { method: 'DELETE' });
      load();
      setToast({ msg: t('common.deleted'), type: 'success' });
    } catch (err: any) {
      setToast({ msg: err?.message || 'Delete failed', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page active">
      {/* Page header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>{t('pdi.pdiTemplates')}</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
            {t('pdi.templatesSubtitle')}
          </div>
        </div>
        <button
          className="btn btn-p btn-sm"
          onClick={() => { setShowAddSection(true); setAddingItemTo(null); }}
          disabled={showAddSection}
        >
          + {t('pdi.addSection')}
        </button>
      </div>

      {/* Unit type tabs */}
      <div className="tabs" style={{ paddingLeft: 8 }}>
        {UNIT_TYPES.map(ut => (
          <div
            key={ut}
            className={`tab${unitType === ut ? ' active' : ''}`}
            onClick={() => { setUnitType(ut); setAddingItemTo(null); setShowAddSection(false); setEditingId(null); }}
          >
            {sectionLabel(ut)}
          </div>
        ))}
      </div>

      {/* Content area */}
      <div style={{ padding: '16px 24px 48px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: 40 }}>{t('common.loading')}</div>
        ) : (
          <>
            {/* Add section form */}
            {showAddSection && (
              <AddSectionForm
                unitType={unitType}
                onSaved={() => { setShowAddSection(false); load(); setToast({ msg: t('pdi.sectionAdded'), type: 'success' }); }}
                onCancel={() => setShowAddSection(false)}
                t={t}
              />
            )}

            {sections.length === 0 && !showAddSection && (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#9ca3af' }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{t('pdi.noTemplates')}</div>
                <div style={{ fontSize: 13, marginBottom: 20 }}>{t('pdi.noTemplatesHint')}</div>
                <button className="btn btn-p btn-sm" onClick={() => setShowAddSection(true)}>
                  + {t('pdi.addSection')}
                </button>
              </div>
            )}

            {sections.map(section => (
              <div key={section.name} className="card" style={{ marginBottom: 12 }}>
                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {sectionLabel(section.name)}
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0 }}>
                      ({section.items.length} {t('pdi.items')})
                    </span>
                  </div>
                  <button
                    className="btn btn-o btn-sm"
                    onClick={() => { setAddingItemTo(section.name); setShowAddSection(false); }}
                    disabled={addingItemTo === section.name}
                    style={{ fontSize: 12 }}
                  >
                    + {t('pdi.addItem')}
                  </button>
                </div>

                {/* Items */}
                <div style={{ padding: '0 16px' }}>
                  {section.items.map((item, idx) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 0',
                        borderTop: idx > 0 ? '1px solid #f9fafb' : 'none',
                      }}
                    >
                      {/* Sort order */}
                      <input
                        type="number"
                        defaultValue={item.sortOrder}
                        onBlur={e => handleSortChange(item.id, e.target.value)}
                        style={{
                          width: 48, padding: '4px 6px', border: '1px solid #e0e0e0', borderRadius: 5,
                          fontSize: 12, fontFamily: 'monospace', textAlign: 'center',
                        }}
                        title={t('pdi.sortOrder')}
                      />

                      {/* Item name — edit inline or display */}
                      {editingId === item.id ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleEditSave(item.id);
                            if (e.key === 'Escape') { setEditingId(null); setEditValue(''); }
                          }}
                          onBlur={() => handleEditSave(item.id)}
                          style={{ flex: 1, padding: '5px 8px', border: '1px solid #2563eb', borderRadius: 5, fontSize: 13, fontFamily: 'inherit' }}
                        />
                      ) : (
                        <div
                          style={{ flex: 1, fontSize: 13, color: '#374151', cursor: 'text' }}
                          onClick={() => { setEditingId(item.id); setEditValue(item.itemName); }}
                          title={t('pdi.clickToEdit')}
                        >
                          {item.itemName}
                          {item.isDefault && (
                            <span style={{ marginLeft: 6, fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>default</span>
                          )}
                        </div>
                      )}

                      {/* Delete */}
                      <button
                        style={{
                          background: 'none', border: 'none', color: '#e5e7eb', fontSize: 18, cursor: 'pointer',
                          padding: '2px 4px', borderRadius: 4, lineHeight: 1,
                          transition: 'color 0.15s',
                        }}
                        title={t('common.delete')}
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item.id)}
                        onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#e5e7eb')}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Add item form */}
                  {addingItemTo === section.name && (
                    <AddItemForm
                      unitType={unitType}
                      section={section.name}
                      existingSortMax={Math.max(0, ...section.items.map(i => i.sortOrder))}
                      onSaved={() => { setAddingItemTo(null); load(); setToast({ msg: t('pdi.itemAdded'), type: 'success' }); }}
                      onCancel={() => setAddingItemTo(null)}
                      t={t}
                    />
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
