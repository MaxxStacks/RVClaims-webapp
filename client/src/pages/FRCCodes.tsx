import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function FRCCodes() {
  const [frcMfr, setFrcMfr] = useState('Jayco');
  const [frcSearch, setFrcSearch] = useState('');
  const [frcCategory, setFrcCategory] = useState('');
  const [showAddFrc, setShowAddFrc] = useState(false);
  const [addFrcSaving, setAddFrcSaving] = useState(false);
  const [frcCodes, setFrcCodes] = useState<any[]>([]);
  const [addFrcForm, setAddFrcForm] = useState({ code: '', description: '', category: 'Structural', hours: '' });

  useEffect(() => {
    apiFetch<any>('/api/frc-codes').then(d => setFrcCodes(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const filteredFrcCodes = frcCodes.filter(c => {
    if (c.manufacturer && c.manufacturer !== frcMfr) return false;
    const s = frcSearch.toLowerCase();
    if (s && !c.code?.toLowerCase().includes(s) && !c.description?.toLowerCase().includes(s)) return false;
    if (frcCategory && c.category !== frcCategory) return false;
    return true;
  });

  const handleFrcCsvUpload = (_e: React.ChangeEvent<HTMLInputElement>) => {};

  const handleAddFrcCode = async () => {
    if (!addFrcForm.code) return;
    setAddFrcSaving(true);
    try {
      await apiFetch('/api/frc-codes', { method: 'POST', body: JSON.stringify({ ...addFrcForm, manufacturer: frcMfr }) });
      const d = await apiFetch<any>('/api/frc-codes');
      setFrcCodes(Array.isArray(d) ? d : []);
      setShowAddFrc(false);
      setAddFrcForm({ code: '', description: '', category: 'Structural', hours: '' });
    } catch {} finally {
      setAddFrcSaving(false);
    }
  };

  return (
    <div className="page active">
      <div style={{display:'flex',alignItems:'center',gap:0}}>
        <div className="tabs" style={{flex:1,borderBottom:'none'}}>
          {['Jayco','Forest River','Heartland','Keystone','Columbia NW'].map(m => (
            <div key={m} className={`tab ${frcMfr === m ? 'active' : ''}`} onClick={() => setFrcMfr(m)}>{m}</div>
          ))}
        </div>
        <div style={{display:'flex',gap:8,paddingRight:20}}>
          <label className="btn btn-o btn-sm" style={{cursor:'pointer'}}>
            Upload CSV<input type="file" accept=".csv" style={{display:'none'}} onChange={handleFrcCsvUpload} />
          </label>
          <button className="btn btn-p btn-sm" onClick={() => setShowAddFrc(v => !v)}>+ Add FRC Code</button>
        </div>
      </div>
      <div className="pn" style={{borderTop:'none',borderRadius:'0 0 8px 8px'}}>
        <div className="filter-bar">
          <input type="text" placeholder="Search FRC codes..." value={frcSearch} onChange={e => setFrcSearch(e.target.value)} />
          <select value={frcCategory} onChange={e => setFrcCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option>Structural</option><option>Plumbing</option><option>Electrical</option>
            <option>HVAC</option><option>Interior</option><option>Exterior</option>
          </select>
          <span style={{marginLeft:'auto',fontSize:12,color:'#888'}}>{filteredFrcCodes.length} code{filteredFrcCodes.length !== 1 ? 's' : ''} for {frcMfr}</span>
        </div>
        {showAddFrc && (
          <div style={{padding:'16px 20px',borderBottom:'1px solid #f0f0f0',background:'#fafafa'}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Add FRC Code — {frcMfr}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr 1fr 1fr',gap:12,marginBottom:12}}>
              <div className="form-group"><label>FRC Code</label><input placeholder="e.g. JC-WAR-9999" value={addFrcForm.code} onChange={e => setAddFrcForm(f => ({...f, code: e.target.value}))} /></div>
              <div className="form-group"><label>Description</label><input placeholder="Short description" value={addFrcForm.description} onChange={e => setAddFrcForm(f => ({...f, description: e.target.value}))} /></div>
              <div className="form-group"><label>Category</label><select value={addFrcForm.category} onChange={e => setAddFrcForm(f => ({...f, category: e.target.value}))}><option>Structural</option><option>Plumbing</option><option>Electrical</option><option>HVAC</option><option>Interior</option><option>Exterior</option></select></div>
              <div className="form-group"><label>Labor Hours</label><input type="number" step="0.5" placeholder="1.5" value={addFrcForm.hours} onChange={e => setAddFrcForm(f => ({...f, hours: e.target.value}))} /></div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-p btn-sm" disabled={addFrcSaving} onClick={handleAddFrcCode}>{addFrcSaving ? 'Saving...' : 'Save Code'}</button>
              <button className="btn btn-o btn-sm" onClick={() => setShowAddFrc(false)}>Cancel</button>
            </div>
          </div>
        )}
        <div className="tw"><table><thead><tr><th>Code</th><th>Description</th><th>Category</th><th>Hours</th><th>Used (30d)</th><th>Action</th></tr></thead><tbody>
          {filteredFrcCodes.map((c: any, i: number) => (
            <tr key={i}>
              <td style={{fontWeight:600,color:'var(--brand)'}}>{c.code}</td>
              <td>{c.description}</td>
              <td>{c.category}</td>
              <td>{c.hours}</td>
              <td>{c.used ?? '—'}</td>
              <td><button className="btn btn-o btn-sm">Edit</button></td>
            </tr>
          ))}
          {filteredFrcCodes.length === 0 && (
            <tr><td colSpan={6} style={{textAlign:'center',padding:32,color:'#888'}}>No FRC codes found. Upload a CSV or add codes manually.</td></tr>
          )}
        </tbody></table></div>
      </div>
    </div>
  );
}
