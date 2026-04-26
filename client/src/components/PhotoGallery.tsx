import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Props {
  claimId: string;
  refreshKey?: number;
}

export default function PhotoGallery({ claimId, refreshKey = 0 }: Props) {
  const [photos, setPhotos] = useState<any[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<any[]>(`/api/v6/uploads/by-claim/${claimId}`)
      .then(setPhotos)
      .catch(() => setPhotos([]));
  }, [claimId, refreshKey]);

  if (photos.length === 0) {
    return <div style={{ padding: 16, color: "#888", fontSize: 12, textAlign: "center" }}>No photos uploaded yet.</div>;
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
        {photos.map(p => (
          <div
            key={p.id}
            onClick={() => setLightbox(p.publicUrl)}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 6,
              backgroundImage: `url(${p.publicUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              cursor: "pointer",
              border: "1px solid #e5e7eb",
            }}
          />
        ))}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
            zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 20,
          }}
        >
          <img src={lightbox} style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 8 }} alt="Claim photo" />
        </div>
      )}
    </>
  );
}
