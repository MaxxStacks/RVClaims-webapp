import { useState, useRef } from 'react';

type Step = 'upload' | 'map' | 'preview' | 'result';

interface PreviewData {
  totalRows: number;
  headers: string[];
  autoMapping: Record<string, string>;
  preview: Record<string, string>[];
  availableFields: Record<string, string>;
}

interface ImportResult {
  importId: string;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  errorRows: number;
  errors: { row: number; error: string }[];
  status: string;
}

const ENTITY_TYPES = [
  { value: 'units',          label: 'Units (RV Inventory)' },
  { value: 'customers',      label: 'Customers / Users' },
  { value: 'claims',         label: 'Claims' },
  { value: 'warranty_plans', label: 'Warranty Plans' },
  { value: 'fi_deals',       label: 'F&I Deals' },
];

export default function ImportData() {
  const [step, setStep] = useState<Step>('upload');
  const [entityType, setEntityType] = useState('units');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload'); setFile(null); setPreview(null);
    setMapping({}); setResult(null); setError(null);
  };

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    setFile(f);
    setError(null);
  };

  const handleUploadPreview = async () => {
    if (!file) { setError('Please select a file'); return; }
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('entityType', entityType);
      const res = await fetch('/api/import/preview', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Preview failed'); }
      const data: PreviewData = await res.json();
      setPreview(data);
      setMapping(data.autoMapping);
      setStep('map');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!file || !preview) return;
    setLoading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('entityType', entityType);
      fd.append('columnMappings', JSON.stringify(mapping));
      const res = await fetch('/api/import/run', { method: 'POST', body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Import failed'); }
      const data: ImportResult = await res.json();
      setResult(data);
      setStep('result');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const mappedCount = Object.values(mapping).filter(Boolean).length;
  const progressPct = step === 'upload' ? 25 : step === 'map' ? 50 : step === 'preview' ? 75 : 100;

  return (
    <div className="page active">
      {/* Header */}
      <div className="pn" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Import Data</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              Upload a CSV or Excel file to import records into DS360
            </div>
          </div>
          {step !== 'upload' && (
            <button className="btn-o" onClick={reset} style={{ fontSize: 12 }}>
              ← Start Over
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {(['upload', 'map', 'preview', 'result'] as Step[]).map((s, i) => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: progressPct >= (i + 1) * 25 ? '#033280' : '#e0e0e0', transition: 'background 0.2s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888' }}>
            <span style={{ color: step === 'upload' ? '#033280' : undefined }}>1. Upload</span>
            <span style={{ color: step === 'map' ? '#033280' : undefined }}>2. Map Fields</span>
            <span style={{ color: step === 'preview' ? '#033280' : undefined }}>3. Preview</span>
            <span style={{ color: step === 'result' ? '#033280' : undefined }}>4. Result</span>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* ========== STEP 1: Upload ========== */}
      {step === 'upload' && (
        <div className="pn">
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 6 }}>
                What are you importing?
              </label>
              <select
                value={entityType}
                onChange={e => setEntityType(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d5dbe5', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', background: 'white' }}
              >
                {ENTITY_TYPES.map(et => (
                  <option key={et.value} value={et.value}>{et.label}</option>
                ))}
              </select>
            </div>

            <div
              style={{
                border: '2px dashed #d5dbe5', borderRadius: 10, padding: 40, textAlign: 'center',
                cursor: 'pointer', transition: 'border-color 0.2s',
              }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); }}
              onDrop={e => { e.preventDefault(); handleFileChange(e.dataTransfer.files[0] || null); }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                {file ? file.name : 'Drop your file here or click to browse'}
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB · ${entityType}` : 'Supports CSV, XLSX, XLS — up to 10 MB'}
              </div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={e => handleFileChange(e.target.files?.[0] || null)} />
            </div>

            {file && (
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <button className="btn-p" onClick={handleUploadPreview} disabled={loading}>
                  {loading ? 'Analyzing…' : 'Next: Map Fields →'}
                </button>
              </div>
            )}

            <div style={{ marginTop: 20, padding: '12px 14px', background: '#f8f9fb', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#444', marginBottom: 8 }}>Accepted file formats</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.7 }}>
                • <strong>CSV</strong> — Comma-separated values, UTF-8 encoding<br />
                • <strong>XLSX / XLS</strong> — Microsoft Excel workbooks<br />
                • First row must be a header row with column names<br />
                • DS360 will auto-detect field mappings where possible
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== STEP 2: Map Fields ========== */}
      {step === 'map' && preview && (
        <div className="pn">
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Column Mapping</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {preview.totalRows} rows detected · {mappedCount} of {preview.headers.length} columns mapped
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                <span style={{ background: '#e8f0fe', color: '#033280', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                  Auto-mapped: {Object.keys(preview.autoMapping).length}
                </span>
              </div>
            </div>

            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>CSV Column</th>
                    <th>Sample Value</th>
                    <th>Maps To</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.headers.map(h => (
                    <tr key={h}>
                      <td><code style={{ fontSize: 12, background: '#f5f5f5', padding: '1px 6px', borderRadius: 3 }}>{h}</code></td>
                      <td style={{ color: '#666', fontSize: 12 }}>{preview.preview[0]?.[h] || '—'}</td>
                      <td>
                        <select
                          value={mapping[h] || ''}
                          onChange={e => setMapping(m => ({ ...m, [h]: e.target.value }))}
                          style={{ padding: '4px 8px', border: '1px solid #d5dbe5', borderRadius: 4, fontSize: 12, fontFamily: 'inherit', background: 'white', minWidth: 160 }}
                        >
                          <option value="">— Skip this column —</option>
                          <optgroup label="DS360 Fields">
                            {Object.entries(preview.availableFields).map(([key, label]) => (
                              <option key={key} value={key}>{label} ({key})</option>
                            ))}
                          </optgroup>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-o" onClick={() => setStep('upload')}>← Back</button>
              <button className="btn-p" onClick={() => setStep('preview')}>
                Preview Import →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== STEP 3: Preview ========== */}
      {step === 'preview' && preview && (
        <div className="pn">
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Preview (first 5 rows)</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                Review how your data will be imported before committing. Unmapped columns will be stored as custom data.
              </div>
            </div>

            <div className="tw" style={{ marginBottom: 16 }}>
              <table>
                <thead>
                  <tr>
                    {Object.entries(mapping).filter(([, v]) => v).map(([col]) => (
                      <th key={col}>{col}</th>
                    ))}
                    <th style={{ color: '#888' }}>Custom Data</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.preview.map((row, i) => {
                    const mappedCols = new Set(Object.entries(mapping).filter(([, v]) => v).map(([k]) => k));
                    const unmapped = Object.entries(row).filter(([k]) => !mappedCols.has(k)).map(([k, v]) => `${k}: ${v}`);
                    return (
                      <tr key={i}>
                        {Object.entries(mapping).filter(([, v]) => v).map(([col]) => (
                          <td key={col} style={{ fontSize: 12 }}>{row[col] || '—'}</td>
                        ))}
                        <td style={{ fontSize: 11, color: '#888' }}>{unmapped.slice(0, 3).join(', ')}{unmapped.length > 3 ? ' …' : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#f8f9fb', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#444', fontWeight: 600, marginBottom: 6 }}>Import summary</div>
              <div className="cd-row"><span className="cd-label">File</span><span className="cd-value">{file?.name}</span></div>
              <div className="cd-row"><span className="cd-label">Entity type</span><span className="cd-value">{ENTITY_TYPES.find(e => e.value === entityType)?.label}</span></div>
              <div className="cd-row"><span className="cd-label">Total rows</span><span className="cd-value">{preview.totalRows}</span></div>
              <div className="cd-row"><span className="cd-label">Mapped columns</span><span className="cd-value">{mappedCount} of {preview.headers.length}</span></div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-o" onClick={() => setStep('map')}>← Back</button>
              <button className="btn-p" onClick={handleRun} disabled={loading}>
                {loading ? 'Importing…' : `Import ${preview.totalRows} Records`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== STEP 4: Result ========== */}
      {step === 'result' && result && (
        <div>
          <div className="pn" style={{ marginBottom: 12 }}>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: result.status === 'failed' ? '#fef2f2' : '#f0fdf4',
                }}>
                  {result.status === 'failed'
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {result.status === 'failed' ? 'Import Failed' : result.status === 'partial' ? 'Partial Import' : 'Import Complete'}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>Import ID: {result.importId}</div>
                </div>
              </div>

              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                <div className="sc"><div className="sc-h"><span className="sc-l">Total</span></div><div className="sc-v">{result.totalRows}</div></div>
                <div className="sc"><div className="sc-h"><span className="sc-l">Imported</span></div><div className="sc-v" style={{ color: '#16a34a' }}>{result.importedRows}</div></div>
                <div className="sc"><div className="sc-h"><span className="sc-l">Skipped</span></div><div className="sc-v" style={{ color: '#b45309' }}>{result.skippedRows}</div></div>
                <div className="sc"><div className="sc-h"><span className="sc-l">Errors</span></div><div className="sc-v" style={{ color: '#dc2626' }}>{result.errorRows}</div></div>
              </div>

              {result.errors.length > 0 && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#991b1b', marginBottom: 8 }}>Errors ({result.errors.length})</div>
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {result.errors.map((e, i) => (
                      <div key={i} style={{ fontSize: 12, color: '#7f1d1d', borderBottom: '1px solid #fecaca', padding: '4px 0' }}>
                        <strong>Row {e.row}:</strong> {e.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-p" onClick={reset}>Import Another File</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
