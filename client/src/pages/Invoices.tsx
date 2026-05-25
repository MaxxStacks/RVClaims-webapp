import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

interface Invoice {
  id: string;
  invoiceNumber: string;
  dealershipId: string;
  dealershipName?: string;
  type?: string;
  description?: string;
  subtotal: string;
  taxAmount?: string;
  total: string;
  status: string;
  issuedAt?: string;
  createdAt: string;
  paidAt?: string;
  claimId?: string;
}

interface InvoiceSummary {
  outstanding: string;
  collectedMTD: string;
  pendingCount: number;
  totalInvoices: number;
}

export default function Invoices() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Role detection — matches ClaimDetail.tsx pattern
  const role = user?.role as string | undefined;
  const isOperatorAdmin = role === 'operator_admin';
  const isOperator = role === 'operator_admin' || role === 'operator_staff';
  const isDealerOwner = role === 'dealer_owner';
  const isFinancialManager = role === 'financial_manager';
  const hasAccess = isOperatorAdmin || isDealerOwner || isFinancialManager;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<InvoiceSummary>({
    outstanding: '0.00',
    collectedMTD: '0.00',
    pendingCount: 0,
    totalInvoices: 0,
  });
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dealerFilter, setDealerFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadInvoices = useCallback(async () => {
    if (!hasAccess) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (dealerFilter && isOperator) params.set('dealershipId', dealerFilter);
      // Dealer scoping is handled server-side via scopeToDealership middleware

      const d = await apiFetch<any>(`/api/invoices${params.toString() ? '?' + params.toString() : ''}`);
      const list: Invoice[] = Array.isArray(d.invoices) ? d.invoices : [];
      setInvoices(list);

      // Compute summary from returned invoices
      const outstanding = list
        .filter(i => ['sent', 'pending', 'overdue'].includes(i.status))
        .reduce((s, i) => s + parseFloat(i.total || '0'), 0);
      const now = new Date();
      const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const collectedMTD = list
        .filter(i => i.status === 'paid' && i.paidAt && new Date(i.paidAt) >= mtdStart)
        .reduce((s, i) => s + parseFloat(i.total || '0'), 0);
      const pendingCount = list.filter(i => ['sent', 'pending', 'overdue'].includes(i.status)).length;

      setSummary({
        outstanding: outstanding.toFixed(2),
        collectedMTD: collectedMTD.toFixed(2),
        pendingCount,
        totalInvoices: list.length,
      });
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  }, [hasAccess, statusFilter, dealerFilter, isOperator]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      await apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'paid' }),
      });
      showToast('Invoice marked as paid');
      await loadInvoices();
    } catch (err: any) {
      showToast(`Failed to mark paid: ${err?.message || 'Unknown error'}`);
    }
  };

  // Navigate to invoice detail — resolve base path from current location
  const navigateToDetail = (invoiceId: string) => {
    const segs = location.split('/');
    const invIdx = segs.indexOf('invoices');
    if (invIdx >= 0) {
      navigate(segs.slice(0, invIdx + 1).join('/') + '/' + invoiceId);
    } else {
      navigate(invoiceId);
    }
  };

  // Navigate to create invoice
  const navigateToCreate = () => {
    const segs = location.split('/');
    const invIdx = segs.indexOf('invoices');
    if (invIdx >= 0) {
      navigate(segs.slice(0, invIdx + 1).join('/') + '/new');
    } else {
      navigate('create-invoice');
    }
  };

  if (!hasAccess && !isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          You do not have permission to view invoices.
        </div>
      </div>
    );
  }

  // Filter by search text client-side
  const filtered = invoices.filter(inv => {
    if (!searchText) return true;
    const q = searchText.toLowerCase();
    return (
      (inv.invoiceNumber || '').toLowerCase().includes(q) ||
      (inv.dealershipName || '').toLowerCase().includes(q) ||
      (inv.status || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {toastMsg}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('invoices.outstanding')}</div>
          <div className="sc-v" style={{ color: '#dc2626' }}>${summary.outstanding}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('invoices.collectedMTD')}</div>
          <div className="sc-v" style={{ color: '#22c55e' }}>${summary.collectedMTD}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('invoices.pendingInvoices')}</div>
          <div className="sc-v">{summary.pendingCount}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('invoices.totalInvoices')}</div>
          <div className="sc-v">{summary.totalInvoices}</div>
        </div>
      </div>

      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">{t('invoices.allInvoices')}</span>
          {isOperatorAdmin && (
            <span className="pn-a" onClick={navigateToCreate}>+ {t('invoices.createInvoice')}</span>
          )}
        </div>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          {(isOperator || isFinancialManager) && (
            <select value={dealerFilter} onChange={e => setDealerFilter(e.target.value)}>
              <option value="">{t('common.allDealers')}</option>
            </select>
          )}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">{t('common.allStatuses')}</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>{t('invoices.invoice')}</th>
                {(isOperator || isFinancialManager) && <th>{t('common.dealer')}</th>}
                <th>{t('common.description')}</th>
                <th>{t('invoices.subtotal')}</th>
                <th>{t('invoices.tax')}</th>
                <th>{t('invoices.total')}</th>
                <th>{t('common.status')}</th>
                <th>{t('invoices.issued')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#888', padding: 20 }}>{t('common.loading')}</td>
                </tr>
              ) : dataError ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#dc2626', padding: 20 }}>{dataError}</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#888', padding: 20 }}>{t('invoices.noInvoices')}</td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigateToDetail(inv.id)}
                  >
                    <td style={{ fontWeight: 500 }}>{inv.invoiceNumber || inv.id.slice(0, 8)}</td>
                    {(isOperator || isFinancialManager) && (
                      <td>{inv.dealershipName || '—'}</td>
                    )}
                    <td>{inv.description || '—'}</td>
                    <td>{inv.subtotal ? `$${Number(inv.subtotal).toFixed(2)}` : '—'}</td>
                    <td>{inv.taxAmount ? `$${Number(inv.taxAmount).toFixed(2)}` : '—'}</td>
                    <td style={{ fontWeight: 600 }}>${Number(inv.total).toFixed(2)}</td>
                    <td>
                      <span className={`bg ${inv.status === 'paid' ? 'pay-recv' : inv.status}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td>
                      {inv.issuedAt || inv.createdAt
                        ? new Date(inv.issuedAt || inv.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                    <td
                      style={{ whiteSpace: 'nowrap' }}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="btn btn-o btn-sm"
                        style={{ marginRight: 4 }}
                        onClick={() => navigateToDetail(inv.id)}
                      >
                        {t('common.view')}
                      </button>
                      {isOperatorAdmin && inv.status !== 'paid' && (
                        <button
                          className="btn btn-s btn-sm"
                          onClick={() => handleMarkPaid(inv.id)}
                        >
                          {t('common.markPaid')}
                        </button>
                      )}
                    </td>
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
