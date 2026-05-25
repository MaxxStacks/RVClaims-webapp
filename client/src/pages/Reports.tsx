import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import PrintButton from '@/components/PrintButton';
import PrintHeader from '@/components/PrintHeader';

interface RevenueReport {
  summary: {
    totalRevenue: string;
    outstanding: string;
    collectedMTD: string;
    totalInvoices: number;
    paidInvoices: number;
  };
  statusBreakdown: Record<string, { count: number; total: number }>;
  dealerBreakdown: Array<{
    dealershipId: string;
    dealershipName: string;
    total: number;
    count: number;
  }>;
}

interface FiCommission {
  summary: {
    totalDeals: number;
    completedDeals: number;
    totalRevenue: string;
    totalProductsSold: number;
    avgProductsPerDeal: string;
  };
}

export default function Reports() {
  const { user } = useAuth();

  const role = user?.role as string | undefined;
  const isOperatorAdmin = role === 'operator_admin';
  const isFinancialManager = role === 'financial_manager';
  const hasAccess = isOperatorAdmin || isFinancialManager;

  const [fiReport, setFiReport] = useState<FiCommission | null>(null);

  const [report, setReport] = useState<RevenueReport | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadReport = useCallback(async () => {
    if (!hasAccess) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      const [revData, fiData] = await Promise.all([
        apiFetch<any>(`/api/reports/revenue${params.toString() ? '?' + params.toString() : ''}`),
        apiFetch<any>('/api/fi/reports/commission').catch(() => null),
      ]);
      setReport(revData);
      if (fiData?.success) setFiReport(fiData);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load revenue report');
    } finally {
      setIsLoading(false);
    }
  }, [hasAccess, fromDate, toDate]);

  useEffect(() => { loadReport(); }, [loadReport]);

  if (!hasAccess && !isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          You do not have permission to view revenue reports.
        </div>
      </div>
    );
  }

  const summary = report?.summary;
  const totalRev = parseFloat(summary?.totalRevenue || '0');
  const outstanding = parseFloat(summary?.outstanding || '0');
  const collectedMTD = parseFloat(summary?.collectedMTD || '0');
  const totalInvoices = summary?.totalInvoices || 0;
  const paidInvoices = summary?.paidInvoices || 0;

  // Compute bar widths for source breakdown
  const statusRows = Object.entries(report?.statusBreakdown || {})
    .filter(([, v]) => v.total > 0)
    .sort(([, a], [, b]) => b.total - a.total);
  const maxStatusTotal = Math.max(...statusRows.map(([, v]) => v.total), 1);

  const dealerRows = (report?.dealerBreakdown || []).slice(0, 5);
  const maxDealerTotal = Math.max(...dealerRows.map(d => d.total), 1);

  const COLORS = ['var(--brand)', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'];

  const printDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page active">
      {/* Print header — visible only in print output */}
      <PrintHeader
        title="Revenue Report"
        subtitle={`${fromDate && toDate ? `${fromDate} to ${toDate}` : 'All time'} · ${printDate}`}
      />

      {/* Date filters + Print button */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>From</span>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>To</span>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
          />
        </div>
        {(fromDate || toDate) && (
          <button
            className="btn btn-o btn-sm"
            style={{ marginTop: 16 }}
            onClick={() => { setFromDate(''); setToDate(''); }}
          >
            Clear Filter
          </button>
        )}
        <div style={{ marginTop: 16, marginLeft: 8 }}>
          <PrintButton title={`Revenue Report — ${printDate}`} />
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc" style={{ padding: 24 }}>
          <div className="sc-l" style={{ marginBottom: 8 }}>Revenue (Collected)</div>
          <div className="sc-v">
            {isLoading ? '—' : `$${totalRev.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="sc-c">{totalInvoices} invoices total · {paidInvoices} paid</div>
        </div>
        <div className="sc" style={{ padding: 24 }}>
          <div className="sc-l" style={{ marginBottom: 8 }}>Outstanding</div>
          <div className="sc-v" style={{ color: outstanding > 0 ? '#dc2626' : 'inherit' }}>
            {isLoading ? '—' : `$${outstanding.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="sc-c">Pending + overdue invoices</div>
        </div>
        <div className="sc" style={{ padding: 24 }}>
          <div className="sc-l" style={{ marginBottom: 8 }}>Collected (MTD)</div>
          <div className="sc-v" style={{ color: '#22c55e' }}>
            {isLoading ? '—' : `$${collectedMTD.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="sc-c">Month-to-date payments received</div>
        </div>
      </div>

      {/* F&I Commission summary */}
      {fiReport && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            F&amp;I Services Summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { label: 'Total Deals',       value: String(fiReport.summary.totalDeals) },
              { label: 'Completed Deals',   value: String(fiReport.summary.completedDeals) },
              { label: 'F&I Revenue',       value: `$${parseFloat(fiReport.summary.totalRevenue).toLocaleString('en-CA')}` },
              { label: 'Avg Products/Deal', value: String(fiReport.summary.avgProductsPerDeal) },
            ].map(s => (
              <div key={s.label} className="sc" style={{ padding: 16 }}>
                <div className="sc-l" style={{ marginBottom: 6 }}>{s.label}</div>
                <div className="sc-v" style={{ fontSize: 20 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', color: '#888', fontSize: 13, padding: 32 }}>Loading report...</div>
      )}

      {dataError && (
        <div style={{ padding: '12px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {dataError}
        </div>
      )}

      {!isLoading && !dataError && (
        <div className="pg pg-2">
          {/* Status breakdown */}
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Revenue by Status</span></div>
            <div style={{ padding: 20 }}>
              {statusRows.length === 0 ? (
                <div style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>No revenue data</div>
              ) : (
                statusRows.map(([status, data], idx) => (
                  <div key={status} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ textTransform: 'capitalize' }}>{status.replace(/_/g, ' ')} <span style={{ color: '#aaa', fontSize: 11 }}>({data.count})</span></span>
                      <span style={{ fontWeight: 600 }}>${data.total.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4 }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.round((data.total / maxStatusTotal) * 100)}%`,
                        background: COLORS[idx % COLORS.length],
                        borderRadius: 4,
                      }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top dealers (operator admin only) */}
          {isOperatorAdmin && (
            <div className="pn">
              <div className="pn-h"><span className="pn-t">Top Dealers by Revenue</span></div>
              {dealerRows.length === 0 ? (
                <div style={{ padding: '14px 20px', fontSize: 13, color: '#888' }}>No paid invoices yet</div>
              ) : (
                dealerRows.map((dealer, idx) => (
                  <div key={dealer.dealershipId} style={{ padding: '14px 20px', borderBottom: idx < dealerRows.length - 1 ? '1px solid #f5f5f5' : 'none', display: 'flex', justifyContent: 'space-between', fontSize: 13, alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 500 }}>{dealer.dealershipName}</span>
                      <span style={{ color: '#aaa', fontSize: 11, marginLeft: 8 }}>{dealer.count} inv.</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>${dealer.total.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
