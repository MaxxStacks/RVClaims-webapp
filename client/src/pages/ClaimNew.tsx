import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

type ClaimType = 'daf' | 'pdi' | 'warranty' | 'extended_warranty' | 'insurance';

export default function ClaimNew() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [claimType, setClaimType] = useState<ClaimType | ''>('');
  const [dealerNotes, setDealerNotes] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [unitsLoading, setUnitsLoading] = useState(true);

  // Derive manufacturer from selected unit
  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const manufacturer = selectedUnit?.manufacturer || '';

  useEffect(() => {
    apiFetch<any>('/api/units')
      .then(d => setUnits(Array.isArray(d) ? d : []))
      .catch(() => setUnits([]))
      .finally(() => setUnitsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId || !claimType) {
      setErrorMsg('Please select a unit and claim type.');
      return;
    }
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await apiFetch<any>('/api/claims', {
        method: 'POST',
        body: JSON.stringify({
          unitId: selectedUnitId,
          dealershipId: user?.dealershipId,
          type: claimType,
          dealerNotes: dealerNotes || undefined,
          estimatedAmount: estimatedAmount ? parseFloat(estimatedAmount) : undefined,
        }),
      });
      // Navigate to the new claim's detail page
      // PortalRoutes has /:dealerId/owner/claims/:claimId — go up to claims list, then into detail
      const claimId = res.id;
      // Navigate relative to current URL segment
      navigate(`../claims/${claimId}`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page active">
      <form onSubmit={handleSubmit}>
        <div className="pn" style={{ marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>New Warranty Claim</div>
            <div style={{ fontSize: 13, color: '#666' }}>Select a unit and claim type to create a draft claim. You can upload photos after creation.</div>
          </div>

          {errorMsg && (
            <div style={{ padding: '12px 20px', background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: 20 }}>
            {/* Unit selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>Select Unit <span style={{ color: '#dc2626' }}>*</span></label>
              {unitsLoading ? (
                <div style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, color: '#888', background: '#fafafa' }}>Loading units...</div>
              ) : (
                <select
                  value={selectedUnitId}
                  onChange={e => setSelectedUnitId(e.target.value)}
                  required
                  style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa' }}
                >
                  <option value="">Select unit by VIN...</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.vin} — {u.year} {u.manufacturer} {u.model}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Claim type selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>Claim Type <span style={{ color: '#dc2626' }}>*</span></label>
              <select
                value={claimType}
                onChange={e => setClaimType(e.target.value as ClaimType)}
                required
                style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa' }}
              >
                <option value="">Select type...</option>
                <option value="daf">DAF (Dealer Arrival Form)</option>
                <option value="pdi">PDI (Pre-Delivery Inspection)</option>
                <option value="warranty">Warranty</option>
                <option value="extended_warranty">Extended Warranty</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>

            {/* Manufacturer (auto-populated) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>Manufacturer</label>
              <input
                value={manufacturer}
                readOnly
                placeholder="Auto-populated from unit"
                style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, background: '#f3f4f6', color: manufacturer ? '#333' : '#aaa' }}
              />
            </div>
          </div>

          {/* Unit info preview */}
          {selectedUnit && (
            <div style={{ padding: '12px 20px', background: '#f0f9ff', borderTop: '1px solid #bae6fd', borderBottom: '1px solid #bae6fd', fontSize: 13, display: 'flex', gap: 24, alignItems: 'center' }}>
              <div><span style={{ color: '#888', marginRight: 6 }}>VIN:</span><span style={{ fontFamily: 'monospace', fontWeight: 500 }}>{selectedUnit.vin}</span></div>
              {selectedUnit.stockNumber && <div><span style={{ color: '#888', marginRight: 6 }}>Stock #:</span><span>{selectedUnit.stockNumber}</span></div>}
              {selectedUnit.year && <div><span style={{ color: '#888', marginRight: 6 }}>Year:</span><span>{selectedUnit.year}</span></div>}
              <div><span style={{ color: '#888', marginRight: 6 }}>Status:</span><span className={`bg ${selectedUnit.status || 'on_lot'}`}>{selectedUnit.status || '—'}</span></div>
            </div>
          )}

          {/* Notes & amount */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, padding: 20, borderTop: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>Dealer Notes (optional)</label>
              <textarea
                value={dealerNotes}
                onChange={e => setDealerNotes(e.target.value)}
                placeholder="Describe the issues you are claiming — this helps the operator assign FRC codes..."
                style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 80, resize: 'vertical', outline: 'none', background: '#fafafa' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>Estimated Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estimatedAmount}
                onChange={e => setEstimatedAmount(e.target.value)}
                placeholder="0.00"
                style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa' }}
              />
              <div style={{ fontSize: 11, color: '#888', lineHeight: '1.4' }}>
                Rough estimate for budgeting. Operator will confirm actual amounts.
              </div>
            </div>
          </div>

          <div className="btn-bar" style={{ borderTop: '2px solid #f0f0f0', background: '#fafbfe' }}>
            <button type="submit" className="btn btn-p" disabled={submitting || !selectedUnitId || !claimType}>
              {submitting ? 'Creating...' : 'Create Draft Claim'}
            </button>
            <button type="button" className="btn btn-o" onClick={() => navigate('../claims')}>
              Cancel
            </button>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>
              A draft will be created. Upload photos before submitting to the operator.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
