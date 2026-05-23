import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function CustomerTickets() {
  const [, navigate] = useLocation();
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketTab, setTicketTab] = useState<'open'|'waiting'|'resolved'|'all'>('open');
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/tickets').then(setTickets).catch(() => setDataError('Unable to load tickets'));
  }, []);

  return (
    <div className="page active">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <div style={{fontSize: 13, color: '#666'}}>Support tickets from your customers. Auto-created from claims and service requests, or opened manually by customers.</div>
      </div>
      <div className="tabs">
        <div className={`tab ${ticketTab === 'open' ? 'active' : ''}`} onClick={() => setTicketTab('open')}>Open (3)</div>
        <div className={`tab ${ticketTab === 'waiting' ? 'active' : ''}`} onClick={() => setTicketTab('waiting')}>Waiting on Customer (1)</div>
        <div className={`tab ${ticketTab === 'resolved' ? 'active' : ''}`} onClick={() => setTicketTab('resolved')}>Resolved (4)</div>
        <div className={`tab ${ticketTab === 'all' ? 'active' : ''}`} onClick={() => setTicketTab('all')}>All</div>
      </div>
      <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
        <div className="filter-bar">
          <input type="text" placeholder="Search tickets..." />
          <select><option>All Categories</option><option>Claim / Warranty</option><option>Billing</option><option>Parts Order</option><option>General</option><option>Warranty Expiry</option><option>Protection Plans</option><option>Feedback</option></select>
          <select><option>All Customers</option><option>Robert Martin</option><option>Daniel Tremblay</option><option>Marie Bouchard</option><option>Lisa Wong</option></select>
        </div>
        <div className="tw"><table><thead><tr><th>Ticket</th><th>Customer</th><th>Subject</th><th>Category</th><th>Related</th><th>Status</th><th>Updated</th><th>Action</th></tr></thead><tbody>
          {tickets.length === 0 ? (
            <tr><td colSpan={8} style={{textAlign: 'center', color: '#888', padding: 20}}>{dataError ? dataError : 'No tickets found'}</td></tr>
          ) : tickets.map((t: any) => {
            const isOpen = t.status === 'open';
            const statusClass = isOpen ? 'submitted' : t.status === 'resolved' ? 'active' : 'pending';
            return (
              <tr key={t.id}>
                <td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => navigate('cust-ticket-detail')}>{t.ticketNumber || t.id}</span></td>
                <td>{t.customerName || '—'}</td>
                <td style={{fontWeight: 500}}>{t.subject}</td>
                <td><span style={{fontSize: 11, color: '#888'}}>{t.category}</span></td>
                <td style={{fontSize: 12, color: '#888'}}>{t.relatedClaimNumber || '—'}</td>
                <td><span className={`bg ${statusClass}`}>{t.status}</span></td>
                <td>{t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('en-CA', {month: 'short', day: 'numeric'}) : '—'}</td>
                <td>{isOpen ? <button className="btn btn-p btn-sm" onClick={() => navigate('cust-ticket-detail')}>Reply</button> : <button className="btn btn-o btn-sm" onClick={() => navigate('cust-ticket-detail')}>View</button>}</td>
              </tr>
            );
          })}
        </tbody></table></div>
      </div>
    </div>
  );
}
