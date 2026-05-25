import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import PrintButton from '@/components/PrintButton';
import PrintHeader from '@/components/PrintHeader';

export default function Units() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  // ─── Role flags ───────────────────────────────────────────────────────────
  const isOperatorAdmin = user?.role === 'operator_admin';
  const isOperatorStaff = user?.role === 'operator_staff';
  const isOperator = isOperatorAdmin || isOperatorStaff;
  const isDealerOwner = user?.role === 'dealer_owner';
  const isDealerStaff = user?.role === 'dealer_staff';
  const isDealer = isDealerOwner || isDealerStaff;
  const isServiceManager = user?.role === 'service_manager';
  const isShopManager = user?.role === 'shop_manager';
  const isPartsManager = user?.role === 'parts_dept';

  const canAddUnit = isDealerOwner || isOperatorAdmin;
  const canEditUnit = isDealerOwner || isOperatorAdmin;
  const canDeleteUnit = isDealerOwner || isOperatorAdmin;
  const showDealerFilter = isOperator;

  // ─── State ────────────────────────────────────────────────────────────────
  const [units, setUnits] = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [searchVin, setSearchVin] = useState('');
  const [filterMfr, setFilterMfr] = useState('');
  const [filterDealer, setFilterDealer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // ─── Load units ───────────────────────────────────────────────────────────
  const loadUnits = useCallback(async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const params = new URLSearchParams();
      // Dealer/service/shop/parts roles: scoped by dealershipId on the server
      // We pass explicit search params for filtering
      if (searchVin) params.set('search', searchVin);
      if (filterMfr) params.set('manufacturer', filterMfr);
      if (filterStatus) params.set('status', filterStatus);
      const data = await apiFetch<any>(`/api/v6/units?${params}`);
      setUnits(Array.isArray(data) ? data : data.units || []);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load units');
    } finally {
      setIsLoading(false);
    }
  }, [searchVin, filterMfr, filterStatus]);

  // Load dealer list for operator filter
  useEffect(() => {
    if (showDealerFilter) {
      apiFetch<any>('/api/v6/dealerships')
        .then(d => setDealers(Array.isArray(d) ? d : d.dealerships || []))
        .catch(() => {});
    }
  }, [showDealerFilter]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  // Client-side dealer filter (operator only)
  const filteredUnits = filterDealer
    ? units.filter(u => u.dealershipId === filterDealer)
    : units;

  // ─── Navigate to unit detail ───────────────────────────────────────────────
  const goToUnit = (unitId: string) => {
    const segments = location.split('/').filter(Boolean);
    const unitsIdx = segments.indexOf('units');
    if (unitsIdx >= 0) {
      const base = '/' + segments.slice(0, unitsIdx + 1).join('/');
      navigate(`${base}/${unitId}`);
    } else {
      navigate(`units/${unitId}`);
    }
  };

  // ─── Navigate to add unit ──────────────────────────────────────────────────
  const goToAddUnit = () => {
    const segments = location.split('/').filter(Boolean);
    const unitsIdx = segments.indexOf('units');
    if (unitsIdx >= 0) {
      const base = '/' + segments.slice(0, unitsIdx).join('/');
      // Dealer owner: /:dealerId/owner/units/new — operator: /operator/admin/units/new
      navigate(`${base}/units/new`);
    } else {
      navigate('units/new');
    }
  };

  // ─── Delete unit ──────────────────────────────────────────────────────────
  const handleDelete = async (unitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this unit? This cannot be undone.')) return;
    try {
      await apiFetch(`/api/v6/units/${unitId}`, { method: 'DELETE' });
      showToast('Unit deleted');
      loadUnits();
    } catch (err: any) {
      showToast(`Failed to delete: ${err?.message || 'Unknown error'}`);
    }
  };

  const printDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page active">
      {/* Print header — visible only in print output */}
      <PrintHeader
        title="Unit Inventory Report"
        subtitle={`${filteredUnits.length} unit${filteredUnits.length !== 1 ? 's' : ''} · ${printDate}`}
      />

      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {toastMsg}
        </div>
      )}

      <div className="pn">
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search VIN, stock #, make, model..."
            value={searchVin}
            onChange={e => setSearchVin(e.target.value)}
          />
          <select value={filterMfr} onChange={e => setFilterMfr(e.target.value)}>
            <option value="">{t('common.allManufacturers')}</option>
            <option>Jayco</option>
            <option>Forest River</option>
            <option>Heartland</option>
            <option>Keystone</option>
            <option>Columbia NW</option>
            <option>Midwest Auto</option>
          </select>
          {showDealerFilter && (
            <select value={filterDealer} onChange={e => setFilterDealer(e.target.value)}>
              <option value="">{t('common.allDealers')}</option>
              {dealers.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">{t('common.allStatuses')}</option>
            <option value="in_inventory">In Inventory</option>
            <option value="sold">Sold</option>
            <option value="in_service">In Service</option>
            <option value="consigned">Consigned</option>
          </select>
          {/* Scan Unit — visible to all dealer/tech roles */}
          {isDealer && (
            <button
              className="btn btn-o btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => {
                const segs = location.split('/').filter(Boolean);
                const scanPath = segs.length >= 2 ? `/${segs[0]}/${segs[1]}/scan` : '/scan';
                navigate(scanPath);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <path d="M14 14h7v7h-7z"/>
              </svg>
              {t('scanner.scanUnit')}
            </button>
          )}
          <PrintButton title={`Unit Inventory Report — ${printDate}`} />
          {canAddUnit && (
            <div style={{ marginLeft: isDealer ? 0 : 'auto' }}>
              <button className="btn btn-p btn-sm" onClick={goToAddUnit}>
                + {t('units.newUnit')}
              </button>
            </div>
          )}
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>{t('units.vin')}</th>
                <th>{t('units.stockNumber')}</th>
                <th>{t('units.year')}</th>
                <th>{t('units.makeModel')}</th>
                {showDealerFilter && <th>{t('common.dealer')}</th>}
                <th>{t('common.type')}</th>
                <th>{t('units.claimsCount')}</th>
                <th>{t('units.warranty')}</th>
                <th>{t('common.status')}</th>
                {canEditUnit && <th style={{ width: 80 }}>{t('common.actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={showDealerFilter ? 10 : 9} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                    {t('common.loading')}
                  </td>
                </tr>
              ) : dataError ? (
                <tr>
                  <td colSpan={showDealerFilter ? 10 : 9} style={{ textAlign: 'center', padding: 24, color: '#dc2626' }}>
                    {dataError}
                  </td>
                </tr>
              ) : filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={showDealerFilter ? 10 : 9} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                    {t('units.noUnits')}
                  </td>
                </tr>
              ) : filteredUnits.map((u: any) => (
                <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => goToUnit(u.id)}>
                  <td>
                    <span className="cid" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {u.vin || '—'}
                    </span>
                  </td>
                  <td>{u.stockNumber || '—'}</td>
                  <td>{u.year || '—'}</td>
                  <td>
                    <span className="mfr">{u.manufacturer || u.make || '—'}</span>
                    {u.model ? ` ${u.model}` : ''}
                  </td>
                  {showDealerFilter && (
                    <td style={{ fontSize: 12, color: '#666' }}>
                      {dealers.find((d: any) => d.id === u.dealershipId)?.name || u.dealershipId?.slice(0, 8) + '…' || '—'}
                    </td>
                  )}
                  <td style={{ fontSize: 12 }}>{u.rvType || '—'}</td>
                  <td style={{ textAlign: 'center' }}>—</td>
                  <td>
                    <span className={`bg ${u.mfrWarrantyStatus || 'none'}`} style={{ fontSize: 11 }}>
                      {u.mfrWarrantyStatus || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`bg ${u.status?.replace(/_/g, '-') || 'active'}`} style={{ fontSize: 11 }}>
                      {u.status?.replace(/_/g, ' ') || '—'}
                    </span>
                  </td>
                  {canEditUnit && (
                    <td onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 6, padding: '8px 12px' }}>
                      <button
                        className="btn btn-o btn-sm"
                        style={{ fontSize: 11, padding: '3px 8px' }}
                        onClick={e => { e.stopPropagation(); goToUnit(u.id); }}
                      >
                        {t('common.view')}
                      </button>
                      {canDeleteUnit && (
                        <button
                          className="btn btn-sm"
                          style={{ fontSize: 11, padding: '3px 8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                          onClick={e => handleDelete(u.id, e)}
                        >
                          {t('common.delete')}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
