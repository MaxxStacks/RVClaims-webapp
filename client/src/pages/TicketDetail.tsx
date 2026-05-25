import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import PrintButton from '@/components/PrintButton';
import PrintHeader from '@/components/PrintHeader';

const CATEGORY_LABELS: Record<string, string> = {
  claim_warranty: 'Claim / Warranty',
  billing: 'Billing',
  parts_order: 'Parts Order',
  general: 'General',
  warranty_expiry: 'Warranty Expiry',
  fi_protection: 'F&I / Protection',
  feedback: 'Feedback',
};

const CATEGORY_COLORS: Record<string, string> = {
  claim_warranty: '#2563eb',
  billing: '#7c3aed',
  parts_order: '#d97706',
  general: '#6b7280',
  warranty_expiry: '#dc2626',
  fi_protection: '#059669',
  feedback: '#0891b2',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'submitted',
  waiting_dealer: 'pending',
  waiting_client: 'pending',
  action_needed: 'ur',
  resolved: 'active',
  closed: 'inactive',
};

export default function TicketDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ ticketId?: string }>();
  const { user } = useAuth();

  const ticketId = params.ticketId || (() => {
    const segs = location.split('/').filter(Boolean);
    // Find the last occurrence of 'tickets' or 'customer-tickets'
    let idx = -1;
    for (let i = segs.length - 1; i >= 0; i--) {
      if (segs[i] === 'tickets' || segs[i] === 'customer-tickets') { idx = i; break; }
    }
    return idx >= 0 ? segs[idx + 1] : null;
  })();

  const isOperator = user?.role === 'operator_admin' || user?.role === 'operator_staff';
  const isOperatorAdmin = user?.role === 'operator_admin';
  const isDealerOwner = user?.role === 'dealer_owner';
  const isDealerStaff = user?.role === 'dealer_staff';
  const isClient = user?.role === 'client';

  const canChangeStatus = isOperatorAdmin || isDealerOwner;
  const canReply = isOperatorAdmin || isDealerOwner || isDealerStaff || isClient;

  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [replySending, setReplySending] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadTicket = useCallback(async () => {
    if (!ticketId) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const data = await apiFetch<any>(`/api/tickets/${ticketId}`);
      const t = data.ticket || data;
      setTicket(t);
      setMessages(data.messages || []);
      setNewStatus(t.status || '');
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load ticket');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => { loadTicket(); }, [loadTicket]);

  const handleReply = async () => {
    if (!replyText.trim()) { showToast('Reply cannot be empty'); return; }
    setReplySending(true);
    try {
      await apiFetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          message: replyText.trim(),
          isInternal: isClient ? false : isInternal,
        }),
      });
      setReplyText('');
      setIsInternal(false);
      await loadTicket();
    } catch (err: any) {
      showToast(err?.message || 'Failed to send reply');
    } finally {
      setReplySending(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus || newStatus === ticket?.status) { showToast('No status change'); return; }
    try {
      await apiFetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast('Status updated');
      await loadTicket();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status');
    }
  };

  const getBackPath = () => {
    const segs = location.split('/').filter(Boolean);
    let idx = -1;
    for (let i = segs.length - 1; i >= 0; i--) {
      if (segs[i] === 'tickets' || segs[i] === 'customer-tickets') { idx = i; break; }
    }
    if (idx >= 0) return '/' + segs.slice(0, idx + 1).join('/');
    return '../';
  };

  const getAuthorInitials = (msg: any) => {
    if (msg.senderName) return msg.senderName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    return '??';
  };

  const getAuthorRole = (msg: any) => {
    if (msg.isAutoMessage) return 'System';
    const role = msg.senderRole || '';
    if (role === 'client') return 'Customer';
    if (role.includes('dealer')) return 'Dealer';
    if (role.includes('operator')) return 'Support';
    return 'Staff';
  };

  const isCustomerMessage = (msg: any) => msg.senderRole === 'client';

  if (isLoading) return <div className="page active" style={{padding: 40, textAlign: 'center', color: '#888'}}>Loading ticket...</div>;
  if (dataError) return <div className="page active" style={{padding: 40, textAlign: 'center', color: '#e53e3e'}}>{dataError}</div>;

  const categoryColor = ticket ? (CATEGORY_COLORS[ticket.category] || '#6b7280') : '#6b7280';
  const statusColor = ticket ? (STATUS_COLORS[ticket.status] || 'pending') : 'pending';

  return (
    <div className="page active">
      {/* Print header — visible only in print output */}
      <PrintHeader
        title="Support Ticket"
        subtitle={`${ticket?.ticketNumber || ''} — ${ticket?.subject || ''}`}
      />

      {toastVisible && (
        <div style={{position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)'}}>
          {toastMsg}
        </div>
      )}

      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate(getBackPath())}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">{ticket?.ticketNumber || 'Ticket'} — {ticket?.subject || '—'}</div>
          <div className="detail-meta">
            {ticket?.customerName && <span>{ticket.customerName} · </span>}
            <span style={{color: categoryColor}}>{CATEGORY_LABELS[ticket?.category] || ticket?.category}</span>
            {ticket?.createdAt && <span> · {new Date(ticket.createdAt).toLocaleDateString('en-CA', {month: 'short', day: 'numeric', year: 'numeric'})}</span>}
          </div>
        </div>
        <span className={`bg ${statusColor}`} style={{fontSize: 13, padding: '6px 16px'}}>{ticket?.status?.replace(/_/g, ' ')}</span>
        <PrintButton title={`Ticket — ${ticket?.ticketNumber || ticket?.id?.slice(0, 8) || ''}`} />
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        {/* Conversation thread */}
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Conversation</span></div>
          <div className="comm-box" style={{margin: 0, border: 'none', borderRadius: 0}}>
            {messages.length === 0 ? (
              <div style={{padding: 24, textAlign: 'center', color: '#888', fontSize: 13}}>No messages yet</div>
            ) : messages.map((msg: any) => {
              const isCustomer = isCustomerMessage(msg);
              return (
                <div key={msg.id} className={`comm-msg${msg.isInternal ? ' internal-note' : ''}`} style={{background: msg.isInternal ? '#fffbeb' : isCustomer ? '#fff' : '#f0fdf4'}}>
                  <div className="comm-avatar" style={{background: isCustomer ? '#6b7280' : '#08235d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, width: 32, height: 32, borderRadius: '50%', flexShrink: 0}}>
                    {getAuthorInitials(msg)}
                  </div>
                  <div className="comm-content">
                    <div className="comm-name">
                      {msg.senderName || 'Unknown'}
                      <span style={{fontWeight: 400, color: '#888', fontSize: 11, marginLeft: 6}}>· {getAuthorRole(msg)}</span>
                      {msg.isInternal && <span style={{fontSize: 10, background: '#fef3c7', color: '#92400e', borderRadius: 4, padding: '2px 6px', marginLeft: 6}}>Internal Note</span>}
                    </div>
                    <div className="comm-text" style={{whiteSpace: 'pre-wrap'}}>{msg.message}</div>
                    <div className="comm-time">{new Date(msg.createdAt).toLocaleString('en-CA', {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reply box */}
          {canReply && (
            <div style={{padding: '16px 20px', borderTop: '1px solid #f0f0f0'}}>
              <textarea
                placeholder={isClient ? 'Send a message to your dealer...' : 'Reply to customer...'}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none', boxSizing: 'border-box'}}
              />
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8}}>
                <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                  {!isClient && (
                    <label style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', color: '#666'}}>
                      <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} />
                      Internal note (hidden from customer)
                    </label>
                  )}
                </div>
                <button className="btn btn-p btn-sm" onClick={handleReply} disabled={replySending}>
                  {replySending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Ticket Info */}
          <div className="cd-section">
            <div className="cd-section-h">Ticket Info</div>
            <div className="cd-row"><span className="cd-label">Ticket #</span><span className="cd-value">{ticket?.ticketNumber}</span></div>
            {ticket?.customerName && <div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">{ticket.customerName}</span></div>}
            <div className="cd-row">
              <span className="cd-label">Category</span>
              <span className="cd-value" style={{color: categoryColor, fontWeight: 500}}>{CATEGORY_LABELS[ticket?.category] || ticket?.category}</span>
            </div>
            <div className="cd-row"><span className="cd-label">Opened</span><span className="cd-value">{ticket?.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-CA', {month: 'short', day: 'numeric', year: 'numeric'}) : '—'}</span></div>
            {ticket?.resolvedAt && <div className="cd-row"><span className="cd-label">Resolved</span><span className="cd-value">{new Date(ticket.resolvedAt).toLocaleDateString('en-CA', {month: 'short', day: 'numeric'})}</span></div>}
            <div className="cd-row"><span className="cd-label">Messages</span><span className="cd-value">{messages.length}</span></div>
          </div>

          {/* Status control — dealers and operator_admin only */}
          {canChangeStatus && (
            <div className="cd-section">
              <div className="cd-section-h">Update Status</div>
              <div className="cd-row" style={{flexDirection: 'column', gap: 8, alignItems: 'stretch'}}>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  style={{padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit'}}
                >
                  <option value="open">Open</option>
                  <option value="waiting_dealer">Waiting — Dealer</option>
                  <option value="waiting_client">Waiting — Customer</option>
                  <option value="action_needed">Action Needed</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <button className="btn btn-p btn-sm" onClick={handleStatusChange} style={{width: '100%', justifyContent: 'center'}}>
                  Save Status
                </button>
              </div>
            </div>
          )}

          {/* Linked items */}
          {(ticket?.claimId || ticket?.partsOrderId || ticket?.unitId) && (
            <div className="cd-section">
              <div className="cd-section-h">Linked</div>
              {ticket.claimId && <div className="cd-row"><span className="cd-label">Claim</span><span className="cd-value cid" style={{cursor: 'pointer', color: 'var(--brand)'}} onClick={() => navigate('../claims/' + ticket.claimId)}>View Claim</span></div>}
              {ticket.partsOrderId && <div className="cd-row"><span className="cd-label">Parts</span><span className="cd-value cid" style={{cursor: 'pointer', color: 'var(--brand)'}} onClick={() => navigate('../parts/' + ticket.partsOrderId)}>View Order</span></div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
