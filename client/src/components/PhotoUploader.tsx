import { useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";

interface Props {
  scope: "claims" | "units";
  scopeId: string;
  photoType?: string;
  onUploadComplete?: (publicUrl: string) => void;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  publicUrl?: string;
  error?: string;
}

export default function PhotoUploader({ scope, scopeId, photoType = "general", onUploadComplete }: Props) {
  const { getToken } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const updateUpload = useCallback((id: string, patch: Partial<UploadingFile>) => {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  }, []);

  async function uploadOne(file: File): Promise<void> {
    const id = crypto.randomUUID();
    setUploads(prev => [...prev, { id, name: file.name, progress: 0, status: "uploading" }]);

    try {
      const token = await getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const presignRes = await fetch("/api/v6/uploads/presign", {
        method: "POST",
        headers,
        body: JSON.stringify({ scope, scopeId, filename: file.name, contentType: file.type, photoType }),
        credentials: "include",
      });
      if (!presignRes.ok) throw new Error(`Presign failed: ${presignRes.status}`);
      const { photoId, uploadUrl, publicUrl } = await presignRes.json();

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            updateUpload(id, { progress: Math.round((ev.loaded / ev.total) * 100) });
          }
        };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`R2 PUT ${xhr.status}`));
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(file);
      });

      const confirmRes = await fetch(`/api/v6/uploads/confirm/${photoId}`, {
        method: "POST", headers, credentials: "include",
      });
      if (!confirmRes.ok) throw new Error(`Confirm failed: ${confirmRes.status}`);

      updateUpload(id, { status: "done", progress: 100, publicUrl });
      onUploadComplete?.(publicUrl);
    } catch (err: any) {
      updateUpload(id, { status: "error", error: err.message });
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(uploadOne);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${dragOver ? "#033280" : "#e0e0e0"}`,
          borderRadius: 8,
          padding: 24,
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? "#eff6ff" : "#fafafa",
          transition: "all 150ms",
        }}
      >
        <div style={{ fontSize: 13, color: "#666" }}>
          Drag photos here or <span style={{ color: "#033280", fontWeight: 600 }}>click to browse</span>
        </div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>JPG, PNG, WebP, HEIC up to 10MB each</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={(e) => handleFiles(e.target.files)}
          style={{ display: "none" }}
        />
      </div>

      {uploads.length > 0 && (
        <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
          {uploads.map((u) => (
            <div key={u.id} style={{
              padding: "8px 12px",
              background: u.status === "error" ? "#fee" : u.status === "done" ? "#efe" : "#fafafa",
              borderRadius: 8,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <div style={{ flex: 1 }}>
                <div>{u.name}</div>
                {u.status === "uploading" && (
                  <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                    <div style={{ width: `${u.progress}%`, height: "100%", background: "#033280" }} />
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: u.status === "error" ? "#c0392b" : "#666" }}>
                {u.status === "uploading" ? `${u.progress}%` : u.status === "done" ? "Done" : `Error: ${u.error}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
