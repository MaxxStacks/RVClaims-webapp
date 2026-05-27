import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { BarcodeDisplay, QRCodeDisplay, generateBarcodeString } from '@/lib/barcode';
import PrintButton from '@/components/PrintButton';
import PrintHeader from '@/components/PrintHeader';
import SignatureCapture, { type SignatureData } from '@/components/SignatureCapture';
import SignatureDisplay from '@/components/SignatureDisplay';
import { useSignatures, useSaveSignature } from '@/hooks/useSignatures';
import PaymentPlanModal from '@/components/PaymentPlanModal';

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
  sortOrder: number;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  dealershipId: string;
  claimId?: string;
  status: string;
  subtotal: string;
  taxRate?: string;
  taxAmount?: string;
  discount?: string;
  total: string;
  currency?: string;
  paymentMethod?: string;
  paymentTerms?: string;
  notes?: string;
  recurring?: string;
  dueDate?: string;
  paidAt?: string;
  issuedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InvoiceDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ invoiceId: string }>();

  // Extract invoiceId from params or URL path (same pattern as ClaimDetail.tsx)
  const invoiceId = params.invoiceId || (() => {
    const segments = location.split('/');
    const idx = segments.indexOf('invoices');
    return idx >= 0 ? segments[idx + 1] : null;
  })();

  const { user } = useAuth();
  const role = user?.role as string | undefined;
  const isOperatorAdmin = role === 'operator_admin';
  const isDealerOwner = role === 'dealer_owner';
  const isFinancialManager = role === 'financial_manager';
  const hasAccess = isOperatorAdmin || isDealerOwner || isFinancialManager;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentPlanOpen, setPaymentPlanOpen] = useState(false);

  // Payment plan threshold (default $500, can be customized per dealer)
  const PAYMENT_PLAN_THRESHOLD = (() => {
    try { return parseFloat(localStorage.getItem(`ds360-payment-plan-threshold-${user?.dealershipId}`) || '500') || 500; } catch { return 500; }
  })();
  const canOfferPaymentPlan = (isDealerOwner || isFinancialManager) &&
    invoice && parseFloat(invoice.total || '0') >= PAYMENT_PLAN_THRESHOLD;

  // Signatures
  const { data: invoiceSignatures = [] } = useSignatures('invoice', invoice?.id);
  const saveSignature = useSaveSignature();

  const handleInvoiceSignatureComplete = (data: SignatureData) => {
    if (!invoice?.id) return;
    saveSignature.mutate(
      {
        parentType: 'invoice',
        parentId: invoice.id,
        signerName: data.signerName,
        signerRole: 'customer',
        signatureImage: data.signatureImageUrl,
        userAgent: data.userAgent,
      },
      {
        onSuccess: () => showToast('Signature saved.'),
        onError: () => showToast('Failed to save signature.'),
      }
    );
  };

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadInvoice = useCallback(async () => {
    if (!invoiceId) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const d = await apiFetch<any>(`/api/invoices/${invoiceId}`);
      setInvoice(d.invoice || null);
      setLineItems(Array.isArray(d.lineItems) ? d.lineItems : []);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load invoice');
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => { loadInvoice(); }, [loadInvoice]);

  const handleMarkPaid = async () => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'paid' }),
      });
      showToast('Invoice marked as paid');
      await loadInvoice();
    } catch (err: any) {
      showToast(`Failed to mark paid: ${err?.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendInvoice = async () => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/invoices/${invoiceId}/send`, { method: 'POST' });
      showToast('Invoice sent to dealer');
      await loadInvoice();
    } catch (err: any) {
      showToast(`Failed to send: ${err?.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDraft = async () => {
    if (!invoice || invoice.status !== 'draft') return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' });
      showToast('Draft invoice deleted');
      handleBack();
    } catch (err: any) {
      showToast(`Failed to delete: ${err?.message || 'Unknown error'}`);
      setActionLoading(false);
    }
  };

  // Navigate back to invoices list
  const handleBack = () => {
    const segments = location.split('/');
    const idx = segments.indexOf('invoices');
    if (idx >= 0) {
      navigate(segments.slice(0, idx + 1).join('/'));
    } else {
      navigate(-1 as any);
    }
  };

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ fontSize: 14, color: '#888' }}>Loading invoice...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="page active">
        <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>
          You do not have permission to view this invoice.
        </div>
      </div>
    );
  }

  if (dataError || !invoice) {
    return (
      <div className="page active">
        <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>
          {dataError || 'Invoice not found.'}
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-o btn-sm" onClick={handleBack}>← Back to Invoices</button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = parseFloat(invoice.subtotal || '0');
  const taxAmount = parseFloat(invoice.taxAmount || '0');
  const discount = parseFloat(invoice.discount || '0');
  const total = parseFloat(invoice.total || '0');

  return (
    <div className="page active">
      {/* Print header — visible only in print output */}
      {/* Invoice gets special INVOICE title style */}
      <div className="invoice-print-header print-only">INVOICE</div>
      <PrintHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        subtitle={`${invoice.currency || 'CAD'} · ${invoice.paymentTerms || 'On Receipt'} · Status: ${invoice.status}`}
        barcodeString={invoice.id ? generateBarcodeString('invoice', invoice.id) : undefined}
      />

      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="detail-header">
        <button className="detail-back" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">{invoice.invoiceNumber}</div>
          <div className="detail-meta">
            Invoice · {invoice.currency || 'CAD'} · {invoice.paymentTerms || 'On Receipt'}
          </div>
        </div>
        <span className={`bg ${invoice.status === 'paid' ? 'pay-recv' : invoice.status}`} style={{ fontSize: 13, padding: '6px 16px' }}>
          {invoice.status}
        </span>

        {/* Operator Admin actions */}
        {isOperatorAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            {invoice.status === 'draft' && (
              <>
                <button
                  className="btn btn-p btn-sm"
                  onClick={handleSendInvoice}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Sending...' : 'Send to Dealer'}
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '6px 12px', fontSize: 12 }}
                  onClick={handleDeleteDraft}
                  disabled={actionLoading}
                >
                  Delete Draft
                </button>
              </>
            )}
            {['sent', 'pending', 'overdue'].includes(invoice.status) && (
              <button
                className="btn btn-p btn-sm"
                onClick={handleMarkPaid}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Mark as Paid'}
              </button>
            )}
          </div>
        )}

        {/* Dealer Owner payment button (coming soon) */}
        {isDealerOwner && ['sent', 'pending', 'overdue'].includes(invoice.status) && (
          <button
            className="btn btn-p btn-sm"
            onClick={() => showToast('Online payment integration coming in v2.2.0')}
          >
            Pay Now
          </button>
        )}
        {/* Offer Payment Plan button — visible to dealer owner / financial manager when invoice meets threshold */}
        {canOfferPaymentPlan && (
          <button
            className="btn btn-sm"
            onClick={() => setPaymentPlanOpen(true)}
            style={{ background: '#0cb22c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '6px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Offer Payment Plan
          </button>
        )}
        <PrintButton title={`Invoice — ${invoice.invoiceNumber || invoice.id?.slice(0, 8)}`} />
        {/* Barcode widget */}
        {invoice.id && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginLeft: 8, flexShrink: 0 }}>
            <BarcodeDisplay entityType="invoice" entityId={invoice.id} size="sm" />
            <QRCodeDisplay entityType="invoice" entityId={invoice.id} size={56} />
          </div>
        )}
      </div>

      <div className="cd-grid">
        {/* Left: Line items */}
        <div>
          <div className="cd-section">
            <div className="cd-section-h">Line Items ({lineItems.length})</div>
            {lineItems.length === 0 ? (
              <div style={{ padding: '16px 20px', fontSize: 13, color: '#888' }}>No line items on this invoice.</div>
            ) : (
              <div style={{ padding: '0 20px 16px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <th style={{ textAlign: 'left', padding: '10px 0', fontSize: 12, color: '#888', fontWeight: 500 }}>Description</th>
                      <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: 12, color: '#888', fontWeight: 500, width: 60 }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '10px 0', fontSize: 12, color: '#888', fontWeight: 500, width: 100 }}>Unit Price</th>
                      <th style={{ textAlign: 'right', padding: '10px 0', fontSize: 12, color: '#888', fontWeight: 500, width: 100 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                        <td style={{ padding: '10px 0', fontSize: 13 }}>{item.description}</td>
                        <td style={{ textAlign: 'center', padding: '10px 8px', fontSize: 13 }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '10px 0', fontSize: 13 }}>${Number(item.unitPrice).toFixed(2)}</td>
                        <td style={{ textAlign: 'right', padding: '10px 0', fontSize: 13, fontWeight: 500 }}>${Number(item.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div style={{ borderTop: '2px solid #f0f0f0', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: '#888' }}>Subtotal</span>
                <span style={{ width: 100, textAlign: 'right' }}>${subtotal.toFixed(2)}</span>
              </div>
              {taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#888' }}>Tax {invoice.taxRate ? `(${(parseFloat(invoice.taxRate) * 100).toFixed(0)}%)` : ''}</span>
                  <span style={{ width: 100, textAlign: 'right' }}>${taxAmount.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, marginBottom: 6, fontSize: 13 }}>
                  <span style={{ color: '#22c55e' }}>Discount</span>
                  <span style={{ width: 100, textAlign: 'right', color: '#22c55e' }}>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 32, paddingTop: 10, borderTop: '1px solid #f0f0f0', fontSize: 16, fontWeight: 700 }}>
                <span>Total <span style={{ fontWeight: 400, fontSize: 12, color: '#888' }}>{invoice.currency || 'CAD'}</span></span>
                <span style={{ width: 100, textAlign: 'right' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div style={{ borderTop: '1px solid #f0f0f0', padding: '14px 20px' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Notes / Terms</div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{invoice.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Invoice info */}
        <div>
          <div className="cd-section">
            <div className="cd-section-h">Invoice Info</div>
            <div className="cd-row">
              <span className="cd-label">Invoice #</span>
              <span className="cd-value" style={{ fontWeight: 600 }}>{invoice.invoiceNumber}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Status</span>
              <span className="cd-value">
                <span className={`bg ${invoice.status === 'paid' ? 'pay-recv' : invoice.status}`}>{invoice.status}</span>
              </span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Payment Terms</span>
              <span className="cd-value">{invoice.paymentTerms || 'On Receipt'}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Payment Method</span>
              <span className="cd-value">{invoice.paymentMethod?.replace(/_/g, ' ') || '—'}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Recurring</span>
              <span className="cd-value">{invoice.recurring?.replace(/_/g, ' ') || 'One-time'}</span>
            </div>
            {invoice.dueDate && (
              <div className="cd-row">
                <span className="cd-label">Due Date</span>
                <span className="cd-value">{new Date(invoice.dueDate).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
            <div className="cd-row">
              <span className="cd-label">Issued</span>
              <span className="cd-value">
                {invoice.issuedAt
                  ? new Date(invoice.issuedAt).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })
                  : 'Not sent yet'}
              </span>
            </div>
            {invoice.paidAt && (
              <div className="cd-row">
                <span className="cd-label">Paid On</span>
                <span className="cd-value" style={{ color: '#22c55e' }}>
                  {new Date(invoice.paidAt).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {invoice.claimId && (
            <div className="cd-section">
              <div className="cd-section-h">Related Claim</div>
              <div className="cd-row">
                <span className="cd-label">Claim ID</span>
                <span className="cd-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{invoice.claimId}</span>
              </div>
            </div>
          )}

          {/* ── Customer Acknowledgment Signature ── */}
          <div className="cd-section" style={{ marginTop: 12 }}>
            <div className="cd-section-h">Customer Acknowledgment</div>
            <div style={{ padding: '14px 16px' }}>
              {invoiceSignatures.filter(s => s.signerRole === 'customer').length > 0 ? (
                <SignatureDisplay
                  signatures={invoiceSignatures.filter(s => s.signerRole === 'customer')}
                  title="Acknowledged"
                />
              ) : (
                <SignatureCapture
                  signerRole="customer"
                  legalText="I acknowledge the charges listed on this invoice are correct and authorize payment."
                  onSignatureComplete={handleInvoiceSignatureComplete}
                  required={false}
                />
              )}
            </div>
          </div>

          <div className="cd-section">
            <div className="cd-section-h">Financials</div>
            <div className="cd-row">
              <span className="cd-label">Subtotal</span>
              <span className="cd-value">${subtotal.toFixed(2)}</span>
            </div>
            {taxAmount > 0 && (
              <div className="cd-row">
                <span className="cd-label">Tax</span>
                <span className="cd-value">${taxAmount.toFixed(2)}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="cd-row">
                <span className="cd-label">Discount</span>
                <span className="cd-value" style={{ color: '#22c55e' }}>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="cd-row">
              <span className="cd-label">Total</span>
              <span className="cd-value" style={{ fontWeight: 700, fontSize: 15 }}>${total.toFixed(2)} {invoice.currency || 'CAD'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Plan Modal */}
      <PaymentPlanModal
        isOpen={paymentPlanOpen}
        onClose={() => setPaymentPlanOpen(false)}
        onSuccess={() => showToast('Application submitted. The financing partner will review within 24 hours.')}
        serviceAmount={total}
        currency={(invoice.currency as 'CAD' | 'USD') || 'CAD'}
        serviceDescription={`Invoice ${invoice.invoiceNumber}`}
        invoiceId={invoice.id}
      />
    </div>
  );
}
