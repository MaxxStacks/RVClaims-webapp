import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function MktMembers() {
  const [, navigate] = useLocation();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberTab, setMemberTab] = useState<'active' | 'pending' | 'expired' | 'all'>('active');
  const [memberSearch, setMemberSearch] = useState('');

  useEffect(() => {
    apiFetch<any[]>('/api/marketplace/members')
      .then(d => setMembers(Array.isArray(d) ? d : []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const active = members.filter(m => m.membershipStatus === 'active' || m.status === 'active');
  const pending = members.filter(m => m.membershipStatus === 'pending' || m.status === 'pending');
  const expired = members.filter(m => m.membershipStatus === 'expired' || m.status === 'expired');

  const ms = memberSearch.toLowerCase();
  const filter = (list: any[]) => !ms ? list : list.filter(m =>
    (m.businessName || '').toLowerCase().includes(ms) ||
    (m.contactName || '').toLowerCase().includes(ms) ||
    (m.province || '').toLowerCase().includes(ms) ||
    (m.membershipPlan || m.plan || '').toLowerCase().includes(ms)
  );

  const annualRevenue = active.length * 499;

  return (
    <div className="page active">
      <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:16,marginBottom:20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Total Members</div><div className="sc-v">{members.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Pending</div><div className="sc-v" style={{color:'#d97706'}}>{pending.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Active</div><div className="sc-v" style={{color:'#22c55e'}}>{active.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Annual Revenue</div><div className="sc-v">{annualRevenue ? `$${annualRevenue.toLocaleString()}` : '$0'}</div></div>
      </div>

      <div className="tabs">
        <div className={`tab ${memberTab === 'active' ? 'active' : ''}`} onClick={() => setMemberTab('active')}>Active ({active.length})</div>
        <div className={`tab ${memberTab === 'pending' ? 'active' : ''}`} onClick={() => setMemberTab('pending')}>Pending ({pending.length})</div>
        <div className={`tab ${memberTab === 'expired' ? 'active' : ''}`} onClick={() => setMemberTab('expired')}>Expired ({expired.length})</div>
        <div className={`tab ${memberTab === 'all' ? 'active' : ''}`} onClick={() => setMemberTab('all')}>All ({members.length})</div>
      </div>

      <div className="pn" style={{borderTop:'none',borderRadius:'0 0 8px 8px'}}>
        <div className="filter-bar">
          <input type="text" placeholder="Search dealers..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
        </div>
        {loading && <div style={{padding:32,textAlign:'center',color:'#888'}}>Loading...</div>}

        {!loading && (memberTab === 'active' || memberTab === 'all') && (
          <div>
            {memberTab === 'all' && <div style={{padding:'10px 20px',background:'#f0fdf4',borderBottom:'1px solid #bbf7d0',fontSize:12,fontWeight:600,color:'#166534'}}>Active Members</div>}
            <div className="tw"><table><thead><tr><th>Dealership</th><th>Contact</th><th>Province</th><th>Plan</th><th>Listings</th><th>Purchases</th><th>Status</th><th>Action</th></tr></thead><tbody>
              {filter(active).length === 0 ? (
                <tr><td colSpan={8} style={{textAlign:'center',color:'#888',padding:16}}>No results</td></tr>
              ) : filter(active).map(m => (
                <tr key={m.id}>
                  <td style={{fontWeight:500}}><span className="cid" onClick={() => navigate(`/operator/admin/marketplace/members/${m.id}`)}>{m.businessName || '—'}</span></td>
                  <td>{m.contactName || '—'}<br /><span style={{fontSize:11,color:'#888'}}>{m.contactEmail || m.businessEmail || ''}</span></td>
                  <td>{m.province || '—'}</td>
                  <td style={{fontSize:11,color:'#555'}}>{m.membershipPlan || m.plan || 'Network Marketplace'}</td>
                  <td>{m.listingCount ?? m.listings ?? 0}</td>
                  <td>{m.purchaseCount ?? m.purchases ?? 0}</td>
                  <td><span className="bg active">Active</span></td>
                  <td><button className="btn btn-o btn-sm" onClick={() => navigate(`/operator/admin/marketplace/members/${m.id}`)}>Manage</button></td>
                </tr>
              ))}
            </tbody></table></div>
          </div>
        )}

        {!loading && (memberTab === 'pending' || memberTab === 'all') && (
          <div>
            {memberTab === 'all' && <div style={{padding:'10px 20px',background:'#fffbeb',borderBottom:'1px solid #fef3c7',fontSize:12,fontWeight:600,color:'#92400e'}}>Pending Verification</div>}
            <div className="tw"><table><thead><tr><th>Dealership</th><th>Contact</th><th>Province</th><th>Applied</th><th>License #</th><th>Status</th><th>Action</th></tr></thead><tbody>
              {filter(pending).length === 0 ? (
                <tr><td colSpan={7} style={{textAlign:'center',color:'#888',padding:16}}>No results</td></tr>
              ) : filter(pending).map(m => (
                <tr key={m.id}>
                  <td style={{fontWeight:500,color:'#d97706'}}>{m.businessName || '—'} ★</td>
                  <td>{m.contactName || '—'}<br /><span style={{fontSize:11,color:'#888'}}>{m.contactEmail || m.businessEmail || ''}</span></td>
                  <td>{m.province || '—'}</td>
                  <td>{m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
                  <td>{m.dealerLicense || '—'}</td>
                  <td><span className="bg pending">Pending</span></td>
                  <td><button className="btn btn-s btn-sm" onClick={() => navigate(`/operator/admin/marketplace/members/${m.id}`)}>Verify</button></td>
                </tr>
              ))}
            </tbody></table></div>
          </div>
        )}

        {!loading && (memberTab === 'expired' || memberTab === 'all') && (
          <div>
            {memberTab === 'all' && <div style={{padding:'10px 20px',background:'#fef2f2',borderBottom:'1px solid #fecaca',fontSize:12,fontWeight:600,color:'#991b1b'}}>Expired</div>}
            <div className="tw"><table><thead><tr><th>Dealership</th><th>Contact</th><th>Province</th><th>Expired</th><th>Status</th><th>Action</th></tr></thead><tbody>
              {filter(expired).length === 0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',color:'#888',padding:16}}>No expired members</td></tr>
              ) : filter(expired).map(m => (
                <tr key={m.id}>
                  <td style={{fontWeight:500}}>{m.businessName || '—'}</td>
                  <td>{m.contactName || '—'}<br /><span style={{fontSize:11,color:'#888'}}>{m.contactEmail || ''}</span></td>
                  <td>{m.province || '—'}</td>
                  <td>{m.renewalDate || m.expiresAt ? new Date(m.renewalDate || m.expiresAt).toLocaleDateString() : '—'}</td>
                  <td><span className="bg denied">Expired</span></td>
                  <td><button className="btn btn-o btn-sm">Send Renewal</button></td>
                </tr>
              ))}
            </tbody></table></div>
          </div>
        )}
      </div>
    </div>
  );
}
