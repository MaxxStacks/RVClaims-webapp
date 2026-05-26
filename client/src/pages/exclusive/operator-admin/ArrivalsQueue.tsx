// client/src/pages/exclusive/operator-admin/ArrivalsQueue.tsx
// Operator view of all pending_arrival units awaiting DAF inspection.

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ArrivalUnit {
  id: string;
  vin: string;
  year?: number | null;
  manufacturer?: string | null;
  model?: string | null;
  dealershipId: string;
  dealerName?: string | null;
  arrivalDate?: string | null;
  dafDeadline?: string | null;
  assignedOperatorId?: string | null;
  isOverdue: boolean;
  status: string;
}

interface OperatorUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTimeRemaining(deadlineStr: string | null | undefined, isOverdue: boolean): string {
  if (!deadlineStr) return '—';
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffH = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
  const diffM = Math.abs(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

  if (isOverdue) return `${diffH}h ${diffM}m overdue`;
  if (diffH < 1) return `${diffM}m remaining`;
  return `${diffH}h ${diffM}m remaining`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-CA', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function useSimpleToast() {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);
  const show = (m: string) => {
    setMsg(m); setVisible(true);
    setTimeout(() => setVisible(false), 2800);
  };
  return { msg, visible, show };
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function ArrivalsQueue() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useSimpleToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [arrivals, setArrivals] = useState<ArrivalUnit[]>([]);
  const [operators, setOperators] = useState<OperatorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'' | 'overdue' | 'assigned' | 'unassigned'>('');
  const [filterDealer, setFilterDealer] = useState('');
  const [dealers, setDealers] = useState<{ id: string; name: string }[]>([]);

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAssignId, setBulkAssignId] = useState('');
  const [bulkAssigning, setBulkAssigning] = useState(false);

  // Per-row assign popover
  const [assignOpen, setAssignOpen] = useState<string | null>(null);
  const [rowAssignId, setRowAssignId] = useState('');
  const [rowAssigning, setRowAssigning] = useState(false);

  // Reminder
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadArrivals = useCallback(async () => {
    setLoading(true);
    setDataError(null);
    try {
      const params = new URLSearchParams();
      if (filterDealer) params.set('dealershipId', filterDealer);
      if (filterStatus === 'overdue') params.set('overdue', 'true');
      if (filterStatus === 'unassigned') params.set('assignedOperatorId', 'unassigned');
      const data = await apiFetch<any[]>(`/api/v6/units/arrivals?${params}`);
      setArrivals(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load arrivals');
    } finally {
      setLoading(false);
    }
  }, [filterDealer, filterStatus]);

  useEffect(() => { loadArrivals(); }, [loadArrivals]);

  // Refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadArrivals, 30000);
    return () => clearInterval(interval);
  }, [loadArrivals]);

  // Load operator staff list for assign dropdown
  useEffect(() => {
    apiFetch<any>('/api/v6/users?role=operator_staff&role=operator_admin')
      .then(d => {
        const list: OperatorUser[] = Array.isArray(d) ? d : d.users || [];
        setOperators(list.filter((o: OperatorUser) =>
          o.role === 'operator_admin' || o.role === 'operator_staff',
        ));
      })
      .catch(() => {});
  }, []);

  // Load dealer list for filter
  useEffect(() => {
    apiFetch<any>('/api/v6/dealerships')
      .then(d => {
        const list = Array.isArray(d) ? d : d.dealerships || [];
        setDealers(list.map((x: any) => ({ id: x.id, name: x.name })));
      })
      .catch(() => {});
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalPending = arrivals.length;
  const overdueCount = arrivals.filter(u => u.isOverdue).length;
  const assignedCount = arrivals.filter(u => !!u.assignedOperatorId).length;
  const unassignedCount = arrivals.filter(u => !u.assignedOperatorId).length;

  // ── Client-side filtering ──────────────────────────────────────────────────
  const filtered = arrivals.filter(u => {
    if (search) {
      const s = search.toLowerCase();
      if (
        !u.vin?.toLowerCase().includes(s) &&
        !u.dealerName?.toLowerCase().includes(s) &&
        !u.manufacturer?.toLowerCase().includes(s)
      ) return false;
    }
    if (filterStatus === 'assigned' && !u.assignedOperatorId) return false;
    if (filterStatus === 'unassigned' && !!u.assignedOperatorId) return false;
    return true;
  });

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(u => u.id)));
    }
  };

  // ── Row assign ────────────────────────────────────────────────────────────
  const handleRowAssign = async (unitId: string) => {
    if (!rowAssignId) return;
    setRowAssigning(true);
    try {
      await apiFetch(`/api/v6/units/${unitId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedOperatorId: rowAssignId }),
      });
      toast.show('Unit assigned successfully');
      setAssignOpen(null);
      setRowAssignId('');
      loadArrivals();
    } catch (err: any) {
      toast.show(err?.message || 'Failed to assign unit');
    } finally {
      setRowAssigning(false);
    }
  };

  // ── Bulk assign ───────────────────────────────────────────────────────────
  const handleBulkAssign = async () => {
    if (!bulkAssignId || selected.size === 0) return;
    setBulkAssigning(true);
    let successCount = 0;
    for (const unitId of Array.from(selected)) {
      try {
        await apiFetch(`/api/v6/units/${unitId}/assign`, {
          method: 'PATCH',
          body: JSON.stringify({ assignedOperatorId: bulkAssignId }),
        });
        successCount++;
      } catch {
        // continue
      }
    }
    toast.show(`Assigned ${successCount} unit${successCount !== 1 ? 's' : ''}`);
    setSelected(new Set());
    setBulkAssignId('');
    setBulkAssigning(false);
    loadArrivals();
  };

  // ── Send reminder ─────────────────────────────────────────────────────────
  const handleSendReminder = async (unitId: string, vin: string) => {
    setSendingReminder(unitId);
    try {
      await apiFetch(`/api/v6/units/${unitId}/send-daf-reminder`, { method: 'POST' });
      toast.show(`Reminder sent for VIN ${vin}`);
    } catch (err: any) {
      toast.show(err?.message || 'Failed to send reminder');
    } finally {
      setSendingReminder(null);
    }
  };

  // ── Operator display name ─────────────────────────────────────────────────
  const operatorName = (id: string | null | undefined) => {
    if (!id) return null;
    const op = operators.find(o => o.id === id);
    return op ? `${op.firstName} ${op.lastName}` : id.slice(0, 8) + '...';
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page active" style={{ position: 'relative' }}>
      {/* Toast */}
      {toast.visible && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8,
          fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: 3 }}>
              Arrivals Queue
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted, #64748b)' }}>
              Units pending DAF inspection — sorted by deadline
            </div>
          </div>
          <button className="btn btn-o btn-sm" onClick={loadArrivals} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Pending', value: totalPending, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Overdue', value: overdueCount, color: '#dc2626', bg: '#fef2f2' },
          { label: 'Assigned', value: assignedCount, color: '#d97706', bg: '#fffbeb' },
          { label: 'Unassigned', value: unassignedCount, color: '#64748b', bg: 'var(--bg-secondary, #f8fafc)' },
        ].map(card => (
          <div key={card.label} style={{
            background: card.bg, borderRadius: 10, padding: '14px 16px',
            border: `1px solid ${card.color}20`,
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search VIN or dealer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1 1 180px', padding: '8px 12px', border: '1px solid var(--border, #e0e0e0)',
            borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
            background: 'var(--bg-card, white)', color: 'var(--text, #333)',
          }}
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          style={{ padding: '8px 12px', border: '1px solid var(--border, #e0e0e0)', borderRadius: 8, fontSize: 13, background: 'var(--bg-card, white)', color: 'var(--text, #333)' }}
        >
          <option value="">All</option>
          <option value="overdue">Overdue</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>
        <select
          value={filterDealer}
          onChange={e => setFilterDealer(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid var(--border, #e0e0e0)', borderRadius: 8, fontSize: 13, background: 'var(--bg-card, white)', color: 'var(--text, #333)' }}
        >
          <option value="">All Dealers</option>
          {dealers.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
          padding: '10px 14px', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600 }}>
            {selected.size} selected
          </span>
          <span style={{ fontSize: 13, color: '#64748b' }}>Assign to:</span>
          <select
            value={bulkAssignId}
            onChange={e => setBulkAssignId(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #bfdbfe', borderRadius: 6, fontSize: 13, background: 'white' }}
          >
            <option value="">— select operator —</option>
            {operators.map(op => (
              <option key={op.id} value={op.id}>{op.firstName} {op.lastName}</option>
            ))}
          </select>
          <button
            className="btn btn-p btn-sm"
            onClick={handleBulkAssign}
            disabled={!bulkAssignId || bulkAssigning}
          >
            {bulkAssigning ? 'Assigning...' : 'Apply'}
          </button>
          <button className="btn btn-o btn-sm" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {/* Error */}
      {dataError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16, marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
          {dataError}
        </div>
      )}

      {/* Table */}
      <div className="pn">
        <div className="tw" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 36, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Dealer</th>
                <th>VIN</th>
                <th>Year / Make / Model</th>
                <th>Arrived</th>
                <th>DAF Deadline</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                    Loading arrivals...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                    {arrivals.length === 0 ? 'No pending arrivals' : 'No results match your filters'}
                  </td>
                </tr>
              ) : (
                filtered.map(unit => (
                  <tr
                    key={unit.id}
                    style={{
                      borderLeft: unit.isOverdue ? '3px solid #dc2626' : '3px solid transparent',
                      background: unit.isOverdue ? 'rgba(239,68,68,0.03)' : 'transparent',
                    }}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selected.has(unit.id)}
                        onChange={() => toggleSelect(unit.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text, #1e293b)' }}>
                        {unit.dealerName || '—'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#3b82f6' }}
                        onClick={() => navigate(`/operator/admin/units/${unit.id}`)}
                        title="View unit"
                      >
                        {unit.vin}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: '#64748b' }}>
                      {[unit.year, unit.manufacturer, unit.model].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td style={{ fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>
                      {formatDate(unit.arrivalDate)}
                    </td>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      <span style={{
                        color: unit.isOverdue ? '#dc2626' : '#64748b',
                        fontWeight: unit.isOverdue ? 700 : 400,
                      }}>
                        {formatTimeRemaining(unit.dafDeadline, unit.isOverdue)}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {unit.assignedOperatorId
                        ? <span style={{ color: '#16a34a', fontWeight: 600 }}>{operatorName(unit.assignedOperatorId)}</span>
                        : <span style={{ color: '#94a3b8', fontSize: 12 }}>Unassigned</span>
                      }
                    </td>
                    <td>
                      {unit.isOverdue ? (
                        <span style={{
                          background: '#fef2f2', color: '#dc2626',
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                        }}>
                          OVERDUE
                        </span>
                      ) : unit.assignedOperatorId ? (
                        <span style={{
                          background: '#fffbeb', color: '#d97706',
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                        }}>
                          Assigned
                        </span>
                      ) : (
                        <span style={{
                          background: '#fef2f2', color: '#dc2626',
                          fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                        }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', position: 'relative' }}>
                        {/* Assign */}
                        <div style={{ position: 'relative' }}>
                          <button
                            className="btn btn-o btn-sm"
                            onClick={() => {
                              setAssignOpen(assignOpen === unit.id ? null : unit.id);
                              setRowAssignId(unit.assignedOperatorId || '');
                            }}
                            style={{ fontSize: 11, padding: '4px 10px', height: 28 }}
                          >
                            Assign
                          </button>
                          {assignOpen === unit.id && (
                            <div style={{
                              position: 'absolute', top: 32, right: 0, zIndex: 1000,
                              background: 'var(--bg-card, white)', border: '1px solid var(--border, #e8e8e8)',
                              borderRadius: 8, padding: 12, minWidth: 220,
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                            }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
                                Assign to operator:
                              </div>
                              <select
                                value={rowAssignId}
                                onChange={e => setRowAssignId(e.target.value)}
                                style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, marginBottom: 8 }}
                              >
                                <option value="">— select —</option>
                                {operators.map(op => (
                                  <option key={op.id} value={op.id}>{op.firstName} {op.lastName}</option>
                                ))}
                              </select>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  className="btn btn-o btn-sm"
                                  onClick={() => { setAssignOpen(null); setRowAssignId(''); }}
                                  style={{ flex: 1 }}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="btn btn-p btn-sm"
                                  onClick={() => handleRowAssign(unit.id)}
                                  disabled={!rowAssignId || rowAssigning}
                                  style={{ flex: 1 }}
                                >
                                  {rowAssigning ? '...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Send reminder — for overdue or any pending */}
                        <button
                          className="btn btn-o btn-sm"
                          onClick={() => handleSendReminder(unit.id, unit.vin)}
                          disabled={sendingReminder === unit.id}
                          style={{ fontSize: 11, padding: '4px 10px', height: 28, color: '#d97706' }}
                          title="Send DAF reminder to dealer"
                        >
                          {sendingReminder === unit.id ? '...' : 'Remind'}
                        </button>

                        {/* View unit */}
                        <button
                          className="btn btn-o btn-sm"
                          onClick={() => navigate(`/operator/admin/units/${unit.id}`)}
                          style={{ fontSize: 11, padding: '4px 10px', height: 28 }}
                          title="View unit detail"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Close any open popover on click-away */}
      {assignOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          onClick={() => { setAssignOpen(null); setRowAssignId(''); }}
        />
      )}
    </div>
  );
}
