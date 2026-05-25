import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function CRM() {
  const [, navigate] = useLocation();
  const [crmView, setCrmView] = useState<'list' | 'kanban'>('list');
  const [crmSearch, setCrmSearch] = useState('');
  const [crmStageFilter, setCrmStageFilter] = useState('');
  const [crmCountryFilter, setCrmCountryFilter] = useState('');
  const [crmDealers, setCrmDealers] = useState<any[]>([]);
  const [crmDashboard, setCrmDashboard] = useState<any>(null);
  const [crmImportStatus, setCrmImportStatus] = useState('');
  const [dataError, setDataError] = useState('');

  useEffect(() => {
    apiFetch<any>('/api/crm/dealers').then(d => setCrmDealers(d.dealers || [])).catch(() => setDataError('Failed to load'));
    apiFetch<any>('/api/crm/dashboard').then(d => setCrmDashboard(d.dashboard || d)).catch(() => {});
  }, []);

  const sl = crmSearch.toLowerCase();
  const filtered = crmDealers.filter((d: any) => {
    if (sl && !d.name?.toLowerCase().includes(sl) && !d.city?.toLowerCase().includes(sl)) return false;
    if (crmStageFilter && d.pipelineStage !== crmStageFilter) return false;
    if (crmCountryFilter && d.country !== crmCountryFilter) return false;
    return true;
  });

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Listings</div><div className="sc-v">{crmDashboard?.totalListings ?? '—'}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Claimed</div><div className="sc-v" style={{ color: '#22c55e' }}>{crmDashboard?.claimed ?? '—'}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Verified (DS360)</div><div className="sc-v" style={{ color: '#3b82f6' }}>{crmDashboard?.verified ?? '—'}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Follow-ups Today</div><div className="sc-v" style={{ color: '#f59e0b' }}>{crmDashboard?.followUpsToday ?? '—'}</div></div>
      </div>
      <div className="tabs">
        <div className={`tab ${crmView === 'list' ? 'active' : ''}`} onClick={() => setCrmView('list')}>Dealer List</div>
        <div className={`tab ${crmView === 'kanban' ? 'active' : ''}`} onClick={() => setCrmView('kanban')}>Pipeline Kanban</div>
      </div>
      <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <div className="pn-h">
          <span className="pn-t">All Dealer Listings</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-o btn-sm" onClick={async () => {
              try {
                const res = await apiFetch('/api/crm/export', { method: 'POST' });
                const blob = res instanceof Response ? await res.blob() : new Blob([JSON.stringify(res)], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = 'dealers.csv'; a.click();
              } catch {}
            }}>Export CSV</button>
            <label className="btn btn-o btn-sm" style={{ cursor: 'pointer' }}>
              Import CSV
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={async e => {
                const f = e.target.files?.[0]; if (!f) return;
                setCrmImportStatus('Importing…');
                const fd = new FormData(); fd.append('file', f);
                try {
                  const d = await apiFetch<any>('/api/crm/import', { method: 'POST', body: fd });
                  setCrmImportStatus(`Imported ${d.imported}, skipped ${d.skipped}`);
                  const dd = await apiFetch<any>('/api/crm/dealers');
                  setCrmDealers(dd.dealers || []);
                } catch { setCrmImportStatus('Import failed'); }
                e.target.value = '';
              }} />
            </label>
          </div>
        </div>
        {crmImportStatus && <div style={{ padding: '8px 20px', fontSize: 12, color: '#555', borderBottom: '1px solid #f0f0f0' }}>{crmImportStatus}</div>}
        <div className="filter-bar">
          <input type="text" placeholder="Search dealers…" value={crmSearch} onChange={e => setCrmSearch(e.target.value)} />
          <select value={crmStageFilter} onChange={e => setCrmStageFilter(e.target.value)}>
            <option value="">All Stages</option>
            {['prospect', 'claimed_page', 'contacted', 'demo_scheduled', 'demo_done', 'negotiating', 'onboarded', 'active_customer', 'lost', 'not_interested'].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select value={crmCountryFilter} onChange={e => setCrmCountryFilter(e.target.value)}>
            <option value="">All Countries</option><option value="CA">Canada</option><option value="US">United States</option>
          </select>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr><th>Dealer</th><th>City</th><th>Province/State</th><th>Country</th><th>Stage</th><th>Claimed</th><th>Views</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#888', padding: 20 }}>{dataError || (crmDealers.length === 0 ? 'No listings yet. Import a CSV to get started.' : 'No results match your filters')}</td></tr>
                : filtered.map((d: any) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 500 }}>{d.name}</td>
                    <td>{d.city || '—'}</td>
                    <td>{d.stateProvince || '—'}</td>
                    <td><span className={`bg ${d.country === 'CA' ? 'submitted' : 'pending'}`}>{d.country || '—'}</span></td>
                    <td><span className="bg draft" style={{ textTransform: 'capitalize' }}>{(d.pipelineStage || 'prospect').replace(/_/g, ' ')}</span></td>
                    <td>{d.isClaimed ? <span className="bg pay-recv">Yes</span> : <span style={{ color: '#aaa' }}>No</span>}</td>
                    <td>{d.pageViews ?? 0}</td>
                    <td>
                      <button className="btn btn-p btn-sm" onClick={() => navigate('/operator/admin/crm/' + d.id)}>Open</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
