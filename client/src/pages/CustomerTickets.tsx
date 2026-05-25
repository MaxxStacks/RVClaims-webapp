import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const CATEGORY_LABELS: Record<string, string> = {
  claim_warranty: 'Claim / Warranty',
  billing: 'Billing',
  parts_order: 'Parts Order',
  general: 'General',
  warranty_expiry: 'Warranty Expiry',
  fi_protection: 'F&I / Protection',
  feedback: 'Feedback',
};

const STATUS_COLORS: Record<string, string> = {
  open: 'submitted',
  waiting_dealer: 'pending',
  waiting_client: 'pending',
  action_needed: 'ur',
  resolved: 'active',
  closed: 'inactive',
};

export default function CustomerTickets() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const isOperator = user?.role === 'operator_admin' || user?.role === 'operator_staff';
  const isDealerOwner = user?.role === 'dealer_owner';
  const isDealerStaff = user?.role === 'dealer_staff';
  const isClient = user?.role === 'client';

  const [tickets, setTickets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTickets = async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (!isOperator && user?.dealershipId) params.set('dealershipId', user.dealershipId);
      const data = await apiFetch<any>(`/api/tickets?${params}`);
      setTickets(Array.isArray(data) ? data : data.tickets || []);
    } catch (err: any) {
      setDataError(err?.message || 'Unable to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, categoryFilter, user]);

  // Derive ticket-detail navigation base from URL
  const getDetailPath = (ticketId: string) => {
    const segs = location.split('/').filter(Boolean);
    // e.g. ['abc123', 'owner', 'customer-tickets'] or ['operator', 'admin', 'tickets']
    const base = segs.slice(0, -1).join('/');
    const last = segs[segs.length - 1];
    return `/${base}/${last}/${ticketId}`;
  };

  const openCounts = tickets.filter(t => t.status === 'open' || t.status === 'action_needed').length;
  const waitingCounts = tickets.filter(t => t.status === 'waiting_dealer' || t.status === 'waiting_client').length;
  const resolvedCounts = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  const [activeTab, setActiveTab] = useState<'open' | 'waiting' | 'resolved' | 'all'>('open');

  const tabFiltered = tickets.filter(t => {
    if (activeTab === 'open') return t.status === 'open' || t.status === 'action_needed';
    if (activeTab === 'waiting') return t.status === 'waiting_dealer' || t.status === 'waiting_client';
    if (activeTab === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  const displayed = tabFiltered.filter(t => {
    return !search || `${t.subject} ${t.ticketNumber} ${t.customerName || ''}`.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="page active">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
        <div style={{fontSize: 13, color: '#666'}}>
          {isClient
            ? 'Your support tickets. Create a ticket to discuss claims, billing, parts, or any question with your dealer.'
            : 'Support tickets from your customers. Auto-created from claims and service requests, or opened manually by customers.'
          }
        </div>
        {isClient && (
          <button className="btn btn-p btn-sm" onClick={() => navigate('tickets/new')}>+ New Ticket</button>
        )}
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'open' ? 'active' : ''}`} onClick={() => setActiveTab('open')}>Open ({openCounts})</div>
        <div className={`tab ${activeTab === 'waiting' ? 'active' : ''}`} onClick={() => setActiveTab('waiting')}>Waiting ({waitingCounts})</div>
        <div className={`tab ${activeTab === 'resolved' ? 'active' : ''}`} onClick={() => setActiveTab('resolved')}>Resolved ({resolvedCounts})</div>
        <div className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All ({tickets.length})</div>
      </div>

      <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="claim_warranty">Claim / Warranty</option>
            <option value="billing">Billing</option>
            <option value="parts_order">Parts Order</option>
            <option value="general">General</option>
            <option value="warranty_expiry">Warranty Expiry</option>
            <option value="fi_protection">F&I / Protection</option>
            <option value="feedback">Feedback</option>
          </select>
          {isOperator && (
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="waiting_dealer">Waiting — Dealer</option>
              <option value="waiting_client">Waiting — Customer</option>
              <option value="action_needed">Action Needed</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          )}
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Ticket #</th>
                {!isClient && <th>Customer</th>}
                <th>Subject</th>
                <th>Category</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={isClient ? 6 : 7} style={{textAlign: 'center', color: '#888', padding: 20}}>Loading...</td></tr>
              ) : dataError ? (
                <tr><td colSpan={isClient ? 6 : 7} style={{textAlign: 'center', color: '#e53e3e', padding: 20}}>{dataError}</td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan={isClient ? 6 : 7} style={{textAlign: 'center', color: '#888', padding: 20}}>No tickets found</td></tr>
              ) : displayed.map((t: any) => {
                const statusColor = STATUS_COLORS[t.status] || 'pending';
                const isActionable = t.status === 'open' || t.status === 'action_needed';
                return (
                  <tr key={t.id}>
                    <td style={{fontWeight: 500, color: 'var(--brand)'}}>
                      <span className="cid" onClick={() => navigate(getDetailPath(t.id))}>{t.ticketNumber || t.id?.slice(0, 8)}</span>
                    </td>
                    {!isClient && <td>{t.customerName || '—'}</td>}
                    <td style={{fontWeight: 500}}>{t.subject}</td>
                    <td><span style={{fontSize: 11, color: '#888'}}>{CATEGORY_LABELS[t.category] || t.category}</span></td>
                    <td><span className={`bg ${statusColor}`}>{t.status?.replace(/_/g, ' ')}</span></td>
                    <td style={{fontSize: 12}}>{t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('en-CA', {month: 'short', day: 'numeric'}) : '—'}</td>
                    <td>
                      {isActionable
                        ? <button className="btn btn-p btn-sm" onClick={() => navigate(getDetailPath(t.id))}>Reply</button>
                        : <button className="btn btn-o btn-sm" onClick={() => navigate(getDetailPath(t.id))}>View</button>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
