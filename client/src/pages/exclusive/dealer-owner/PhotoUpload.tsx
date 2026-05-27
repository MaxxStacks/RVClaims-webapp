import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

type PhotoCategory = 'daf' | 'pdi' | 'warranty' | 'general';

interface UploadedPhoto {
  id: string;
  publicUrl: string;
  filename: string;
  storageKey: string;
}

export default function PhotoUpload() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [photoCategory, setPhotoCategory] = useState<PhotoCategory>('warranty');
  const [dealerNotes, setDealerNotes] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [pushing, setPushing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Derive manufacturer from selected unit for display
  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const manufacturer = selectedUnit?.manufacturer || '';

  useEffect(() => {
    apiFetch<any>('/api/units')
      .then(d => setUnits(Array.isArray(d) ? d : []))
      .catch(() => setUnits([]));
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (!selectedUnitId) {
      showToast('Please select a unit first.');
      return;
    }

    setUploading(true);
    const newPhotos: UploadedPhoto[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`);

      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);

      try {
        // Step 1: Get presigned URL
        const presignRes = await apiFetch<any>('/api/uploads/presign', {
          method: 'POST',
          body: JSON.stringify({
            scope: 'units',
            scopeId: selectedUnitId,
            filename: file.name,
            contentType: file.type || 'image/jpeg',
            photoType: photoCategory,
          }),
        });

        // Step 2: Upload to storage via presigned URL
        const uploadRes = await fetch(presignRes.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type || 'image/jpeg' },
        });

        if (!uploadRes.ok) {
          throw new Error(`Upload failed: ${uploadRes.statusText}`);
        }

        // Step 3: Confirm upload to server
        await apiFetch('/api/uploads/confirm/' + presignRes.photoId, {
          method: 'POST',
        });

        newPhotos.push({
          id: presignRes.photoId,
          publicUrl: presignRes.publicUrl,
          filename: file.name,
          storageKey: '',
        });
      } catch (err: any) {
        showToast(`Failed to upload ${file.name}: ${err?.message || 'Unknown error'}`);
      }
    }

    setUploadedPhotos(prev => [...prev, ...newPhotos]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
    setUploadProgress(null);
    setUploading(false);

    if (newPhotos.length > 0) {
      showToast(`${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} uploaded successfully.`);
    }

    // Reset file input so same files can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePushToClaim = async () => {
    if (!selectedUnitId) {
      showToast('Please select a unit first.');
      return;
    }
    if (uploadedPhotos.length === 0) {
      showToast('Upload at least one photo before pushing to the queue.');
      return;
    }

    setPushing(true);
    try {
      const res = await apiFetch<any>('/api/batches', {
        method: 'POST',
        body: JSON.stringify({
          unitId: selectedUnitId,
          dealershipId: user?.dealershipId,
          claimType: photoCategory,
          dealerNotes: dealerNotes || undefined,
          photoCount: uploadedPhotos.length,
        }),
      });

      if (res.success && res.batch) {
        showToast('Photos pushed to operator queue!');
        // Brief delay so user sees the toast, then navigate
        setTimeout(() => navigate('../claims'), 1200);
      } else {
        showToast('Failed to push photos. Please try again.');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to push photos to claim queue.');
    } finally {
      setPushing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length > 0) {
      // Simulate file input change with dropped files
      const fakeEvent = { target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      await handleFileChange(fakeEvent);
    }
  };

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {toastMsg}
        </div>
      )}

      <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
        Select a unit, choose the claim type, upload your photos, and push to the operator for processing.
      </div>

      <div className="pn">
        {/* Header controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: 20, borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>Select Unit</label>
            <select
              value={selectedUnitId}
              onChange={e => setSelectedUnitId(e.target.value)}
              style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa' }}
            >
              <option value="">Select unit by VIN...</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.vin} — {u.year} {u.manufacturer} {u.model}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#555' }}>Claim Type / Photo Category</label>
            <select
              value={photoCategory}
              onChange={e => setPhotoCategory(e.target.value as PhotoCategory)}
              style={{ padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa' }}
            >
              <option value="daf">DAF (Dealer Arrival Form)</option>
              <option value="pdi">PDI (Pre-Delivery Inspection)</option>
              <option value="warranty">Warranty</option>
              <option value="general">General / Other</option>
            </select>
          </div>
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

        {/* Upload zone */}
        <div style={{ padding: '24px 20px' }}>
          <div
            className="upload-zone"
            style={{ cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4 }}>
              Drag photos here or click to browse
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              Upload all photos for this unit. JPG, PNG, HEIC accepted. Max 50 photos per batch.
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
              style={{ marginTop: 12, padding: '7px 16px', background: '#033280', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Take Photo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {uploadProgress && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#eff6ff', borderRadius: 8, fontSize: 13, color: '#1d4ed8' }}>
              {uploadProgress}
            </div>
          )}

          {/* Photo previews */}
          {(uploadedPhotos.length > 0 || previewUrls.length > 0) && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 12 }}>
                Uploaded Photos ({uploadedPhotos.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8 }}>
                {previewUrls.map((url, i) => (
                  <div
                    key={i}
                    style={{ aspectRatio: '1', background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888', position: 'relative', overflow: 'hidden' }}
                  >
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                    />
                    <button
                      onClick={() => handleRemovePhoto(i)}
                      style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                      title="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 6 }}>
            Describe what you see (optional but helpful)
          </div>
          <textarea
            value={dealerNotes}
            onChange={e => setDealerNotes(e.target.value)}
            placeholder="e.g. Sidewall damage on passenger side, roof leak near front vent, slide-out seal torn..."
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 70, resize: 'vertical', outline: 'none', background: '#fafafa' }}
          />
        </div>

        {/* Action bar */}
        <div className="btn-bar" style={{ borderTop: '2px solid #f0f0f0', background: '#fafbfe' }}>
          <button
            className="btn btn-s"
            style={{ fontSize: 14, padding: '12px 32px' }}
            onClick={handlePushToClaim}
            disabled={pushing || uploading || uploadedPhotos.length === 0}
          >
            {pushing ? 'Pushing...' : 'Push to Claim Queue →'}
          </button>
          <button
            className="btn btn-o"
            onClick={() => navigate('../claims')}
            disabled={pushing || uploading}
          >
            Cancel
          </button>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>
            {uploadedPhotos.length > 0
              ? `${uploadedPhotos.length} photo${uploadedPhotos.length > 1 ? 's' : ''} · ${photoCategory.toUpperCase()} · ${manufacturer || 'No unit selected'}`
              : 'No photos uploaded yet'}
          </div>
        </div>
      </div>
    </div>
  );
}
