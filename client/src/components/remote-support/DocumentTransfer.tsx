// client/src/components/remote-support/DocumentTransfer.tsx
// Two-tab UI for sending and receiving files between dealers and operators

import { useState, useRef, useCallback, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Transfer {
  id: string;
  senderName: string | null;
  senderType: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  message: string | null;
  status: string;
  createdAt: string;
  downloadedAt: string | null;
}

interface Props {
  dealerId?: string | null;
  operatorMode?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("word")) return "📝";
  if (mimeType.includes("excel") || mimeType === "text/csv") return "📊";
  if (mimeType === "application/zip") return "🗜️";
  return "📎";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DocumentTransfer({ dealerId, operatorMode = false }: Props) {
  const [tab, setTab] = useState<"send" | "received">("send");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [received, setReceived] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadReceived = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ success: boolean; transfers: Transfer[] }>(
        `/api/transfers?direction=received&limit=20`
      );
      if (data.success) setReceived(data.transfers);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "received") loadReceived();
  }, [tab, loadReceived]);

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("File exceeds 25MB limit.");
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
    setUploadSuccess(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (message.trim()) formData.append("message", message.trim().slice(0, 200));
      if (dealerId) formData.append("dealerId", dealerId);

      // Get auth token
      const token = await window.Clerk?.session?.getToken();

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 80) + 10);
      };

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadProgress(100);
            resolve();
          } else {
            reject(new Error(xhr.responseText));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.open("POST", "/api/transfers/upload");
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.send(formData);
      });

      setUploadSuccess(selectedFile.name);
      setSelectedFile(null);
      setMessage("");
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [selectedFile, message, dealerId]);

  const handleDownload = useCallback(async (transferId: string) => {
    window.open(`/api/transfers/${transferId}/download`, "_blank");
    setReceived((prev) => prev.map((t) => t.id === transferId ? { ...t, status: "downloaded" } : t));
  }, []);

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
        {(["send", "received"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "10px 0", background: "none", border: 0,
              borderBottom: tab === t ? "2px solid #033280" : "2px solid transparent",
              color: tab === t ? "#033280" : "#6b7280", fontSize: 12, fontWeight: tab === t ? 600 : 400, cursor: "pointer",
            }}
          >
            {t === "send" ? (operatorMode ? "Send to Dealer" : "Send") : "Received"}
          </button>
        ))}
      </div>

      {tab === "send" && (
        <div style={{ padding: 16 }}>
          {/* Drop zone */}
          {!selectedFile && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragOver ? "#033280" : "#d1d5db"}`,
                borderRadius: 8, height: 100, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", cursor: "pointer",
                background: isDragOver ? "#eff6ff" : "#fafafa", marginBottom: 12,
                transition: "all 0.15s",
              }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={isDragOver ? "#033280" : "#9ca3af"} strokeWidth={2} style={{ marginBottom: 6 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span style={{ fontSize: 12, color: isDragOver ? "#033280" : "#6b7280", fontWeight: 500 }}>
                Drop files here or click to browse
              </span>
              <span style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>Max 25MB · PDF, images, documents accepted</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
            onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
          />

          {/* Selected file */}
          {selectedFile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{fileTypeIcon(selectedFile.type)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{formatBytes(selectedFile.size)}</div>
              </div>
              <button onClick={() => setSelectedFile(null)} style={{ background: "none", border: 0, color: "#9ca3af", cursor: "pointer", fontSize: 16, padding: "2px 4px" }}>×</button>
            </div>
          )}

          {/* Message */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            placeholder="Add a message (optional)"
            rows={2}
            style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, resize: "none", boxSizing: "border-box", fontFamily: "Inter, sans-serif", color: "#374151", outline: "none" }}
          />
          <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 10, textAlign: "right" }}>{message.length}/200</div>

          {/* Progress */}
          {uploading && uploadProgress > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${uploadProgress}%`, background: "#033280", transition: "width 0.2s" }} />
              </div>
              <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>{uploadProgress}%</div>
            </div>
          )}

          {uploadError && <div style={{ fontSize: 11, color: "#b91c1c", marginBottom: 8 }}>{uploadError}</div>}
          {uploadSuccess && (
            <div style={{ fontSize: 11, color: "#15803d", marginBottom: 8 }}>
              ✅ "{uploadSuccess}" sent successfully.
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            style={{
              width: "100%", background: !selectedFile || uploading ? "#e5e7eb" : "#15803d",
              color: !selectedFile || uploading ? "#9ca3af" : "white",
              border: "none", borderRadius: 7, padding: "9px 0", fontSize: 12, fontWeight: 600,
              cursor: !selectedFile || uploading ? "default" : "pointer",
            }}
          >
            {uploading ? "Uploading…" : (operatorMode ? "Send to Dealer" : "Send to DS360 Support")}
          </button>
        </div>
      )}

      {tab === "received" && (
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>Loading…</div>
          ) : received.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>No documents received yet.</div>
          ) : (
            received.map((t) => (
              <div key={t.id} style={{ padding: "12px 16px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{fileTypeIcon(t.fileType)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.fileName}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{formatBytes(t.fileSize)} · {t.senderName || "Support"} · {timeAgo(t.createdAt)}</div>
                  {t.message && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, fontStyle: "italic" }}>"{t.message}"</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 8, textTransform: "uppercase",
                    background: t.status === "downloaded" ? "#f3f4f6" : "#eff6ff",
                    color: t.status === "downloaded" ? "#9ca3af" : "#033280",
                  }}>
                    {t.status === "downloaded" ? "Downloaded" : "New"}
                  </span>
                  <button
                    onClick={() => handleDownload(t.id)}
                    style={{ fontSize: 11, color: "#033280", background: "none", border: "1px solid #bfdbfe", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}
                  >
                    Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
