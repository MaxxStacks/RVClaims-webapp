import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function Products() {
  const [, navigate] = useLocation();
  const [opProducts, setOpProducts] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<any>('/api/v6/products').then(d => setOpProducts(Array.isArray(d) ? d : [])).catch(err => setDataError(err?.message || 'Failed to load'));
  }, []);

  return (
    <div className="page active">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <div>
          <div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Products & Services</div>
          <div style={{fontSize: 13, color: '#888'}}>Pre-configured items that auto-populate when creating invoices.</div>
        </div>
        <button className="btn btn-p btn-sm" onClick={() => navigate('add-product')}>+ Add Product / Service</button>
      </div>
      <div className="tabs"><div className="tab active">Subscriptions (2)</div><div className="tab">Claim Fees (3)</div><div className="tab">Service Add-ons (3)</div><div className="tab">Parts (4)</div><div className="tab">All</div></div>
      <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
        <div className="tw"><table><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Billing</th><th>Tax</th><th>Dealers</th><th>Status</th><th>Action</th></tr></thead><tbody>
          {opProducts.length === 0
            ? <tr><td colSpan={8} style={{textAlign:'center',color:'#888',padding:20}}>{dataError ? dataError : 'No products found'}</td></tr>
            : opProducts.map((p: any) => (
              <tr key={p.id}>
                <td style={{fontWeight: 500}}>{p.name}</td>
                <td><span className="mfr">{p.category || p.type || '—'}</span></td>
                <td>{p.price != null ? (p.billingType === 'percentage' ? `${p.price}%` : `$${Number(p.price).toFixed(2)}`) : 'Variable'}</td>
                <td>{p.billingCycle || p.billing || '—'}</td>
                <td>{p.taxRate ? `HST ${p.taxRate}%` : 'HST 13%'}</td>
                <td>{p.dealerCount ?? '—'}</td>
                <td><span className={`bg ${p.status === 'active' ? 'active' : 'pending'}`}>{p.status || 'active'}</span></td>
                <td><button className="btn btn-o btn-sm" onClick={() => navigate('edit-product')}>Edit</button></td>
              </tr>
            ))
          }
        </tbody></table></div>
      </div>
    </div>
  );
}
