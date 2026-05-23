import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function Invoices() {
  const [, navigate] = useLocation();
  const [opInvoices, setOpInvoices] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<any>('/api/invoices').then(d => setOpInvoices(d.invoices || [])).catch(err => setDataError(err?.message || 'Failed to load'));
  }, []);

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Outstanding</div><div className="sc-v" style={{color: '#dc2626'}}>$8,450</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Collected (MTD)</div><div className="sc-v" style={{color: '#22c55e'}}>$34,200</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Pending Invoices</div><div className="sc-v">12</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Wallet Balances</div><div className="sc-v">$15,800</div></div>
      </div>
      <div className="pn"><div className="pn-h"><span className="pn-t">All Invoices</span><span className="pn-a" onClick={() => navigate('create-invoice')}>+ Create Invoice</span></div>
        <div className="filter-bar"><input type="text" placeholder="Search invoices..." /><select><option>All Dealers</option></select><select><option>All Statuses</option><option>Pending</option><option>Paid</option><option>Overdue</option></select><select><option>All Types</option><option>Subscription</option><option>Claim Fee</option><option>Service Add-on</option><option>DAF/PDI Fee</option></select></div>
        <div className="tw"><table><thead><tr><th>Invoice</th><th>Dealer</th><th>Type</th><th>Description</th><th>Amount</th><th>Tax</th><th>Total</th><th>Status</th><th>Issued</th><th>Action</th></tr></thead><tbody>
          {opInvoices.length === 0
            ? <tr><td colSpan={10} style={{textAlign:'center',color:'#888',padding:20}}>{dataError ? dataError : 'No invoices found'}</td></tr>
            : opInvoices.map((inv: any) => (
              <tr key={inv.id}>
                <td style={{fontWeight: 500}}>{inv.invoiceNumber || inv.id}</td>
                <td>{inv.dealershipName || inv.dealership?.name || '—'}</td>
                <td>{inv.type || inv.invoiceType || '—'}</td>
                <td>{inv.description || '—'}</td>
                <td>{inv.amount ? `$${Number(inv.amount).toFixed(2)}` : '—'}</td>
                <td>{inv.taxAmount ? `$${Number(inv.taxAmount).toFixed(2)}` : '—'}</td>
                <td style={{fontWeight: 600}}>{inv.total ? `$${Number(inv.total).toFixed(2)}` : '—'}</td>
                <td><span className={`bg ${inv.status === 'paid' ? 'pay-recv' : inv.status}`}>{inv.status}</span></td>
                <td>{inv.issuedAt || inv.createdAt ? new Date(inv.issuedAt || inv.createdAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
                <td style={{whiteSpace:'nowrap'}}>
                  <button className="btn btn-o btn-sm" style={{marginRight:4}}>View</button>
                  {inv.status !== 'paid' && <button className="btn btn-s btn-sm" onClick={async () => { try { await apiFetch(`/api/invoices/${inv.id}`, { method: 'PUT', body: JSON.stringify({ status: 'paid' }) }); const d = await apiFetch<any>('/api/invoices'); setOpInvoices(d.invoices || []); } catch {} }}>Mark Paid</button>}
                </td>
              </tr>
            ))
          }
        </tbody></table></div></div>
    </div>
  );
}
