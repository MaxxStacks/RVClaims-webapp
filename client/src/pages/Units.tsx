import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function Units() {
  const [, navigate] = useLocation();
  const [opUnits, setOpUnits] = useState<any[]>([]);
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [unitsSearch, setUnitsSearch] = useState('');
  const [unitsMfr, setUnitsMfr] = useState('');
  const [unitsDealer, setUnitsDealer] = useState('');
  const [unitsStatus, setUnitsStatus] = useState('');

  useEffect(() => {
    apiFetch<any>('/api/v6/units').then(d => setOpUnits(Array.isArray(d) ? d : [])).catch(err => setDataError(err?.message || 'Failed to load'));
    apiFetch<any>('/api/v6/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const filteredUnits = opUnits.filter(u => {
    const s = unitsSearch.toLowerCase();
    if (s && !u.vin?.toLowerCase().includes(s) && !u.stockNumber?.toLowerCase().includes(s) && !u.customerName?.toLowerCase().includes(s)) return false;
    if (unitsMfr && u.manufacturer !== unitsMfr) return false;
    if (unitsDealer && u.dealershipId !== unitsDealer) return false;
    if (unitsStatus && u.status !== unitsStatus) return false;
    return true;
  });

  return (
    <div className="page active">
      <div className="pn"><div className="filter-bar"><input type="text" placeholder="Search VIN, stock #, customer..." value={unitsSearch} onChange={e => setUnitsSearch(e.target.value)} /><select value={unitsMfr} onChange={e => setUnitsMfr(e.target.value)}><option value="">All Manufacturers</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Columbia NW</option></select><select value={unitsDealer} onChange={e => setUnitsDealer(e.target.value)}><option value="">All Dealers</option>{opDealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select><select value={unitsStatus} onChange={e => setUnitsStatus(e.target.value)}><option value="">All Statuses</option><option value="on_lot">On Lot</option><option value="delivered">Delivered</option><option value="in_service">In Service</option></select><div style={{marginLeft: 'auto'}}><button className="btn btn-p btn-sm" onClick={() => navigate('add-unit')}>+ Add Unit</button></div></div>
        <div className="tw"><table><thead><tr><th>VIN</th><th>Stock #</th><th>Year</th><th>Make / Model</th><th>Dealer</th><th>Customer</th><th>Claims</th><th>DAF</th><th>PDI</th><th>Status</th></tr></thead><tbody>
          {filteredUnits.length === 0 ? (
            <tr><td colSpan={10} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : opUnits.length === 0 ? 'No units found' : 'No results match your filters'}</td></tr>
          ) : filteredUnits.map((u: any) => (
            <tr key={u.id}><td><span className="cid" onClick={() => navigate('unit-detail')}>{u.vin}</span></td><td>{u.stockNumber || '—'}</td><td>{u.year || '—'}</td><td><span className="mfr">{u.manufacturer}</span> {u.model}</td><td>{u.dealershipId?.slice(0,8)}…</td><td>{u.customerName || '—'}</td><td>—</td><td><span className={`bg ${u.dafCompleted ? 'authorized' : 'pending'}`}>{u.dafCompleted ? 'Done' : 'Pending'}</span></td><td><span className={`bg ${u.pdiCompleted ? 'authorized' : 'pending'}`}>{u.pdiCompleted ? 'Done' : 'Pending'}</span></td><td><span className="bg active">{u.status}</span></td></tr>
          ))}
        </tbody></table></div></div>
    </div>
  );
}
