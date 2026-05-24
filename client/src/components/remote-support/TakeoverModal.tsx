// client/src/components/remote-support/TakeoverModal.tsx
// Shown to dealer when operator requests screen control

interface Props {
  onGrant: () => void;
  onDeny: () => void;
}

export default function TakeoverModal({ onGrant, onDeny }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "24px 28px",
          maxWidth: 360,
          width: "90%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 12, textAlign: "center" }}>🖱️</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 6, textAlign: "center" }}>
          Remote Control Request
        </div>
        <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, marginBottom: 20, textAlign: "center" }}>
          Your support agent is requesting to control your screen. They will be able to move your cursor and type.
          You can revoke control at any time.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onDeny}
            style={{
              flex: 1,
              background: "#f3f4f6",
              color: "#374151",
              border: "none",
              borderRadius: 8,
              padding: "10px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Deny
          </button>
          <button
            onClick={onGrant}
            style={{
              flex: 1,
              background: "#033280",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Allow Control
          </button>
        </div>
      </div>
    </div>
  );
}
