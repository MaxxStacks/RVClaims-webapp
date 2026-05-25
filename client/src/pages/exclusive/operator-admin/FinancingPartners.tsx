// client/src/pages/exclusive/operator-admin/FinancingPartners.tsx
// Operator-admin-only lender partner management.
// Full CRUD: add lender, edit (inline), deactivate.

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';

interface Lender {
  id: string;
  name: string;
  legalName: string | null;
  country: string;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  active: boolean;
  minLoanAmount: string | null;
  maxLoanAmount: string | null;
  minTermMonths: number | null;
  maxTermMonths: number | null;
  minCreditScore: number | null;
  createdAt: string;
}

function fmtCurrency(val: string | null | undefined): string {
  if (!val) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return `$${n.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function FinancingPartners() {
  const [lenders, setLenders]   = useState<Lender[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Toast
  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Add form
  const [showAddForm, setShowAddForm]   = useState(false);
  const [formName, setFormName]         = useState('');
  const [formEmail, setFormEmail]       = useState('');
  const [formPhone, setFormPhone]       = useState('');
  const [formWebsite, setFormWebsite]   = useState('');
  const [formCountry, setFormCountry]   = useState('Canada');
  const [formMinTerm, setFormMinTerm]   = useState('');
  const [formMaxTerm, setFormMaxTerm]   = useState('');
  const [formMinLoan, setFormMinLoan]   = useState('');
  const [formMaxLoan, setFormMaxLoan]   = useState('');
  const [formMinScore, setFormMinScore] = useState('');
  const [addSaving, setAddSaving]       = useState(false);

  // Edit inline
  const [editId, setEditId]             = useState<string | null>(null);
  const [editName, setEditName]         = useState('');
  const [editEmail, setEditEmail]       = useState('');
  const [editPhone, setEditPhone]       = useState('');
  const [editWebsite, setEditWebsite]   = useState('');
  const [editMinTerm, setEditMinTerm]   = useState('');
  const [editMaxTerm, setEditMaxTerm]   = useState('');
  const [editMinLoan, setEditMinLoan]   = useState('');
  const [editMaxLoan, setEditMaxLoan]   = useState('');
  const [editMinScore, setEditMinScore] = useState('');
  const [editSaving, setEditSaving]     = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const d = await apiFetch<any>('/api/financing/lenders');
      setLenders(Array.isArray(d.lenders) ? d.lenders : []);
    } catch (err: any) {
      console.error('FinancingPartners load error:', err?.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!formName.trim()) { showToast('Lender name is required'); return; }
    setAddSaving(true);
    try {
      await apiFetch('/api/financing/lenders', {
        method: 'POST',
        body: JSON.stringify({
          name: formName.trim(),
          contactEmail: formEmail.trim() || null,
          contactPhone: formPhone.trim() || null,
          website: formWebsite.trim() || null,
          country: formCountry,
          minTermMonths: formMinTerm ? parseInt(formMinTerm) : null,
          maxTermMonths: formMaxTerm ? parseInt(formMaxTerm) : null,
          minLoanAmount: formMinLoan || null,
          maxLoanAmount: formMaxLoan || null,
          minCreditScore: formMinScore ? parseInt(formMinScore) : null,
          active: true,
        }),
      });
      showToast('Lender added');
      setFormName(''); setFormEmail(''); setFormPhone(''); setFormWebsite(''); setFormCountry('Canada');
      setFormMinTerm(''); setFormMaxTerm(''); setFormMinLoan(''); setFormMaxLoan(''); setFormMinScore('');
      setShowAddForm(false);
      load();
    } catch (err: any) {
      showToast(err?.message || 'Failed to add lender');
    } finally {
      setAddSaving(false);
    }
  };

  const startEdit = (l: Lender) => {
    setEditId(l.id);
    setEditName(l.name);
    setEditEmail(l.contactEmail || '');
    setEditPhone(l.contactPhone || '');
    setEditWebsite(l.website || '');
    setEditMinTerm(l.minTermMonths ? String(l.minTermMonths) : '');
    setEditMaxTerm(l.maxTermMonths ? String(l.maxTermMonths) : '');
    setEditMinLoan(l.minLoanAmount || '');
    setEditMaxLoan(l.maxLoanAmount || '');
    setEditMinScore(l.minCreditScore ? String(l.minCreditScore) : '');
  };

  const handleSaveEdit = async () => {
    if (!editId || !editName.trim()) { showToast('Name is required'); return; }
    setEditSaving(true);
    try {
      await apiFetch(`/api/financing/lenders/${editId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName.trim(),
          contactEmail: editEmail.trim() || null,
          contactPhone: editPhone.trim() || null,
          website: editWebsite.trim() || null,
          minTermMonths: editMinTerm ? parseInt(editMinTerm) : null,
          maxTermMonths: editMaxTerm ? parseInt(editMaxTerm) : null,
          minLoanAmount: editMinLoan || null,
          maxLoanAmount: editMaxLoan || null,
          minCreditScore: editMinScore ? parseInt(editMinScore) : null,
        }),
      });
      showToast('Lender updated');
      setEditId(null);
      load();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update lender');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await apiFetch(`/api/financing/lenders/${id}`, { method: 'DELETE' });
      showToast('Lender deactivated');
      load();
    } catch (err: any) {
      showToast(err?.message || 'Failed to deactivate');
    }
  };

  const activeLenders   = lenders.filter(l => l.active).length;
  const inactiveLenders = lenders.filter(l => !l.active).length;

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#033280', color: '#fff',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>Active Lenders</div>
          <div className="sc-v" style={{ color: '#22c55e' }}>{activeLenders}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>Inactive Lenders</div>
          <div className="sc-v" style={{ color: '#9ca3af' }}>{inactiveLenders}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>Total Partners</div>
          <div className="sc-v">{lenders.length}</div>
        </div>
      </div>

      {/* Inline add form */}
      {showAddForm && (
        <div className="pn" style={{ marginBottom: 16, borderLeft: '3px solid #033280' }}>
          <div className="pn-h" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 16 }}>
            <span className="pn-t">New Lender Partner</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Lender Name *</label>
              <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. RBC Royal Bank" />
            </div>
            <div className="form-group">
              <label>Country</label>
              <select value={formCountry} onChange={e => setFormCountry(e.target.value)}>
                <option value="Canada">Canada</option>
                <option value="USA">USA</option>
                <option value="Both">Both</option>
              </select>
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="dealer@bank.ca" />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="1-800-xxx-xxxx" />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input value={formWebsite} onChange={e => setFormWebsite(e.target.value)} placeholder="https://…" />
            </div>
            <div className="form-group">
              <label>Min Credit Score</label>
              <input type="number" value={formMinScore} onChange={e => setFormMinScore(e.target.value)} placeholder="e.g. 600" />
            </div>
            <div className="form-group">
              <label>Min Term (months)</label>
              <input type="number" value={formMinTerm} onChange={e => setFormMinTerm(e.target.value)} placeholder="e.g. 24" />
            </div>
            <div className="form-group">
              <label>Max Term (months)</label>
              <input type="number" value={formMaxTerm} onChange={e => setFormMaxTerm(e.target.value)} placeholder="e.g. 240" />
            </div>
            <div className="form-group">
              <label>Min Loan ($)</label>
              <input type="number" value={formMinLoan} onChange={e => setFormMinLoan(e.target.value)} placeholder="10000" />
            </div>
            <div className="form-group">
              <label>Max Loan ($)</label>
              <input type="number" value={formMaxLoan} onChange={e => setFormMaxLoan(e.target.value)} placeholder="500000" />
            </div>
          </div>
          <div className="btn-bar">
            <button className="btn btn-p btn-sm" onClick={handleAdd} disabled={addSaving}>
              {addSaving ? 'Saving…' : 'Add Lender'}
            </button>
            <button className="btn btn-o btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">Financing Lenders</span>
          <button
            className="btn btn-p"
            style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={() => setShowAddForm(v => !v)}
          >
            {showAddForm ? 'Cancel' : '+ Add Lender'}
          </button>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#888', fontSize: 13 }}>Loading lenders…</div>
        ) : lenders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#888', fontSize: 13 }}>
            No lenders configured yet.
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-p btn-sm" onClick={() => setShowAddForm(true)}>
                + Add First Lender
              </button>
            </div>
          </div>
        ) : (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Lender</th>
                  <th>Country</th>
                  <th>Contact</th>
                  <th>Term Range</th>
                  <th>Loan Range</th>
                  <th>Min Score</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lenders.map(l => (
                  <>
                    <tr key={l.id} style={{ opacity: l.active ? 1 : 0.6 }}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{l.name}</div>
                        {l.legalName && l.legalName !== l.name && (
                          <div style={{ fontSize: 11, color: '#888' }}>{l.legalName}</div>
                        )}
                        {l.website && (
                          <a href={l.website} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#2563eb' }}>
                            {l.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>{l.country}</td>
                      <td style={{ fontSize: 12 }}>
                        {l.contactEmail && <div>{l.contactEmail}</div>}
                        {l.contactPhone && <div style={{ color: '#888' }}>{l.contactPhone}</div>}
                        {!l.contactEmail && !l.contactPhone && '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {l.minTermMonths && l.maxTermMonths
                          ? `${l.minTermMonths}–${l.maxTermMonths} mo`
                          : l.maxTermMonths ? `Up to ${l.maxTermMonths} mo` : '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {l.minLoanAmount && l.maxLoanAmount
                          ? `${fmtCurrency(l.minLoanAmount)} – ${fmtCurrency(l.maxLoanAmount)}`
                          : l.maxLoanAmount ? `Up to ${fmtCurrency(l.maxLoanAmount)}` : '—'}
                      </td>
                      <td style={{ fontSize: 12 }}>{l.minCreditScore || '—'}</td>
                      <td>
                        <span className={l.active ? 'bg ok' : 'bg'} style={{ fontSize: 11, padding: '2px 8px' }}>
                          {l.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className="btn btn-o btn-sm"
                            style={{ fontSize: 11 }}
                            onClick={() => editId === l.id ? setEditId(null) : startEdit(l)}
                          >
                            {editId === l.id ? 'Cancel' : 'Edit'}
                          </button>
                          {l.active && (
                            <button
                              className="btn btn-o btn-sm"
                              style={{ fontSize: 11 }}
                              onClick={() => handleDeactivate(l.id)}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Inline edit row */}
                    {editId === l.id && (
                      <tr key={`${l.id}-edit`}>
                        <td colSpan={8} style={{ background: '#f9fafb', padding: '16px 20px' }}>
                          <div className="form-grid">
                            <div className="form-group">
                              <label>Name *</label>
                              <input value={editName} onChange={e => setEditName(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Contact Email</label>
                              <input value={editEmail} onChange={e => setEditEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Contact Phone</label>
                              <input value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Website</label>
                              <input value={editWebsite} onChange={e => setEditWebsite(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Min Term (months)</label>
                              <input type="number" value={editMinTerm} onChange={e => setEditMinTerm(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Max Term (months)</label>
                              <input type="number" value={editMaxTerm} onChange={e => setEditMaxTerm(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Min Loan ($)</label>
                              <input type="number" value={editMinLoan} onChange={e => setEditMinLoan(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Max Loan ($)</label>
                              <input type="number" value={editMaxLoan} onChange={e => setEditMaxLoan(e.target.value)} />
                            </div>
                            <div className="form-group">
                              <label>Min Credit Score</label>
                              <input type="number" value={editMinScore} onChange={e => setEditMinScore(e.target.value)} />
                            </div>
                          </div>
                          <div className="btn-bar">
                            <button className="btn btn-p btn-sm" onClick={handleSaveEdit} disabled={editSaving}>
                              {editSaving ? 'Saving…' : 'Save Changes'}
                            </button>
                            <button className="btn btn-o btn-sm" onClick={() => setEditId(null)}>Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
