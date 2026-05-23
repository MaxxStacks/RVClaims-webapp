import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function ProcessingQueue() {
  const [, navigate] = useLocation();
  const [opBatches, setOpBatches] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [queueSearch, setQueueSearch] = useState('');
  const [queueMfr, setQueueMfr] = useState('');
  const [queueType, setQueueType] = useState('');

  useEffect(() => {
    apiFetch<any>('/api/batches?status=uploaded').then(d => setOpBatches(d.batches || [])).catch(err => setDataError(err?.message || 'Failed to load'));
  }, []);

  const filteredBatches = opBatches.filter(b => {
    const s = queueSearch.toLowerCase();
    if (s && !b.unitId?.toLowerCase().includes(s) && !b.dealershipId?.toLowerCase().includes(s)) return false;
    if (queueMfr && b.manufacturer !== queueMfr) return false;
    if (queueType && b.claimType !== queueType) return false;
    return true;
  });

  return (
    <div className="page active">
      <div style={{padding: '14px 0 20px', fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>Dealers upload photos in bulk. You review, sort into issues, assign FRC codes, and build the claim.</div>
      <div className="pn"><div className="pn-h"><span className="pn-t">Incoming Photo Batches</span><span style={{fontSize: 12, color: '#888'}}>{opBatches.length} awaiting</span></div>
        <div className="filter-bar"><input type="text" placeholder="Search by VIN or dealer..." value={queueSearch} onChange={e => setQueueSearch(e.target.value)} /><select value={queueMfr} onChange={e => setQueueMfr(e.target.value)}><option value="">All Manufacturers</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Columbia NW</option></select><select value={queueType} onChange={e => setQueueType(e.target.value)}><option value="">All Types</option><option>DAF</option><option>PDI</option><option>Warranty</option><option>Extended</option></select></div>
        <div className="tw"><table><thead><tr><th>Batch</th><th>Dealer</th><th>VIN</th><th>Mfr</th><th>Type</th><th>Photos</th><th>Dealer Notes</th><th>Uploaded</th><th>Action</th></tr></thead><tbody>
          {filteredBatches.length === 0 ? (
            <tr><td colSpan={9} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : opBatches.length === 0 ? 'No batches in queue' : 'No results match your filters'}</td></tr>
          ) : filteredBatches.map((b: any) => (
            <tr key={b.id}><td style={{fontWeight:500,color:'var(--brand)'}}>{b.batchNumber}</td><td>{b.dealershipId?.slice(0,8)}…</td><td><span className="vin">{b.unitId?.slice(0,8)}…</span></td><td><span className="mfr">{b.claimType}</span></td><td>{b.claimType}</td><td><strong>{b.photoCount || 0}</strong></td><td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#666',fontSize:12}}>{b.dealerNotes || '—'}</td><td>{new Date(b.createdAt).toLocaleDateString()}</td><td><button className="btn btn-p btn-sm" onClick={() => navigate('batch-review')}>Review & Sort</button></td></tr>
          ))}
        </tbody></table></div>
      </div>
    </div>
  );
}
