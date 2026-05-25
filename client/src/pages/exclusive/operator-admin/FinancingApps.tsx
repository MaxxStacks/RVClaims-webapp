// client/src/pages/exclusive/operator-admin/FinancingApps.tsx
// Operator-admin-only financing applications overview.
// Delegates to the shared Financing.tsx page which is already role-aware.
// This page adds a quick summary + links to the shared page for consistency.

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

interface AppSummary {
  totalApplications: number;
  mtdApplications: number;
  approvedCount: number;
  approvalRate: string;
  totalVolume: string;
  avgLoan: string;
}

interface FinancingApp {
  id: string;
  applicationNumber: string;
  dealershipId: string;
  customerId: string;
  unitId: string | null;
  amountRequested: string;
  preferredTermMonths: number | null;
  status: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Draft',           cls: 'bg'            },
  submitted: { label: 'Submitted',       cls: 'bg info'       },
  shopping:  { label: 'Shopping Lenders',cls: 'bg in-progress'},
  approved:  { label: 'Approved',        cls: 'bg ok'         },
  declined:  { label: 'Declined',        cls: 'bg denied'     },
  completed: { label: 'Funded',          cls: 'bg active'     },
};

function statusBadge(status: string) {
  const m = STATUS_MAP[status] || { label: status, cls: 'bg' };
  return <span className={m.cls} style={{ fontSize: 11, padding: '2px 8px' }}>{m.label}</span>;
}

function fmtCurrency(val: string | null | undefined): string {
  if (!val) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return `$${n.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtDate(val: string): string {
  return new Date(val).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

export default function FinancingApps() {
  const [, navigate] = useLocation();
  const [apps, setApps]           = useState<FinancingApp[]>([]);
  const [summary, setSummary]     = useState<AppSummary | null>(null);
  const [dealers, setDealers]     = useState<any[]>([]);
  const [searchQ, setSearchQ]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dealerFilter, setDealerFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [appsData, reportData, dealersData] = await Promise.all([
        apiFetch<any>('/api/financing/applications'),
        apiFetch<any>('/api/financing/reports'),
        apiFetch<any>('/api/v6/dealerships').catch(() => []),
      ]);
      setApps(Array.isArray(appsData.applications) ? appsData.applications : []);
      setSummary(reportData.summary || null);
      setDealers(Array.isArray(dealersData) ? dealersData : dealersData.dealerships || []);
    } catch (err: any) {
      console.error('FinancingApps load error:', err?.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = apps.filter(a => {
    const matchQ = !searchQ ||
      a.applicationNumber.toLowerCase().includes(searchQ.toLowerCase()) ||
      a.customerId.toLowerCase().includes(searchQ.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    const matchDealer = !dealerFilter || a.dealershipId === dealerFilter;
    return matchQ && matchStatus && matchDealer;
  });

  const pendingCount   = apps.filter(a => a.status === 'submitted').length;
  const shoppingCount  = apps.filter(a => a.status === 'shopping').length;
  const approvedMTD    = summary?.approvedCount ?? 0;
  const totalMTDVol    = summary ? fmtCurrency(summary.totalVolume) : '—';

  return (
    <div className="page active">
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>Pending Review</div>
          <div className="sc-v" style={{ color: '#f59e0b' }}>{pendingCount}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>Shopping Lenders</div>
          <div className="sc-v" style={{ color: '#2563eb' }}>{shoppingCount}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>Approved (Total)</div>
          <div className="sc-v" style={{ color: '#22c55e' }}>{approvedMTD}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>Total Volume (Approved)</div>
          <div className="sc-v">{totalMTDVol}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by app #, customer…"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
        <select value={dealerFilter} onChange={e => setDealerFilter(e.target.value)}>
          <option value="">All Dealers</option>
          {dealers.map((d: any) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="shopping">Shopping</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
          <option value="completed">Funded</option>
        </select>
      </div>

      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">Financing Applications</span>
          <button
            className="btn btn-p"
            style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={() => navigate('/operator/admin/financing/new')}
          >
            + New Application
          </button>
        </div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#888', fontSize: 13 }}>Loading applications…</div>
        ) : (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>App #</th>
                  <th>Dealer ID</th>
                  <th>Customer</th>
                  <th>Unit</th>
                  <th>Amount</th>
                  <th>Term</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                      {searchQ || statusFilter || dealerFilter
                        ? 'No applications match your filters.'
                        : 'No financing applications yet.'}
                    </td>
                  </tr>
                ) : filtered.map(app => (
                  <tr
                    key={app.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/operator/admin/financing/${app.id}`)}
                  >
                    <td style={{ fontWeight: 500 }}>{app.applicationNumber}</td>
                    <td style={{ fontSize: 12, color: '#666' }}>{app.dealershipId.slice(0, 8)}…</td>
                    <td style={{ fontSize: 12 }}>{app.customerId.slice(0, 8)}…</td>
                    <td style={{ fontSize: 12, color: '#666' }}>{app.unitId ? app.unitId.slice(0, 8) + '…' : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{fmtCurrency(app.amountRequested)}</td>
                    <td style={{ fontSize: 12 }}>
                      {app.preferredTermMonths ? `${app.preferredTermMonths} mo` : '—'}
                    </td>
                    <td onClick={e => e.stopPropagation()}>{statusBadge(app.status)}</td>
                    <td style={{ fontSize: 12, color: '#888' }}>{fmtDate(app.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-o btn-sm"
                        style={{ fontSize: 11 }}
                        onClick={() => navigate(`/operator/admin/financing/${app.id}`)}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
