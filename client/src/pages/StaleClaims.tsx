import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function StaleClaims() {
  const [, navigate] = useLocation();
  const [opClaims, setOpClaims] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/api/claims').then(d => setOpClaims(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const handleFollowUp = (_id: string, _num: string) => {};

  const now = Date.now();
  const staleClaims = opClaims.filter((c: any) => c.updatedAt && (now - new Date(c.updatedAt).getTime()) > 36 * 3600 * 1000);

  return (
    <div className="page active">
      <div className="pn"><div style={{padding: '16px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: 13, color: '#92400e'}}>Claims with no update in 36+ hours.</div>
        <div className="tw"><table><thead><tr><th>Claim #</th><th>Dealer</th><th>Mfr</th><th>Status</th><th>Last Updated</th><th>Stale For</th><th>Action</th></tr></thead><tbody>
          {staleClaims.length === 0
            ? <tr><td colSpan={7} style={{textAlign:'center',color:'#888',padding:20}}>No stale claims</td></tr>
            : staleClaims.map((c: any) => {
              const staleHrs = Math.floor((now - new Date(c.updatedAt).getTime()) / 3600000);
              return (
                <tr key={c.id}>
                  <td><span className="cid" onClick={() => navigate('claim-detail')}>{c.claimNumber}</span></td>
                  <td>{c.dealershipName || c.dealership?.name || '—'}</td>
                  <td><span className="mfr">{c.manufacturer}</span></td>
                  <td><span className={`bg ${c.status}`}>{c.status}</span></td>
                  <td>{new Date(c.updatedAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'})}</td>
                  <td style={{color: staleHrs > 60 ? '#dc2626' : '#d97706', fontWeight: 600}}>{staleHrs}h</td>
                  <td><button className="btn btn-p btn-sm" onClick={() => handleFollowUp(c.id, c.claimNumber)}>Follow Up</button></td>
                </tr>
              );
            })
          }
        </tbody></table></div></div>
    </div>
  );
}
