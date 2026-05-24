// client/src/components/assist/AccountManagerCard.tsx

interface AccountManager {
  name: string;
  email: string;
  phone?: string | null;
}

interface Props {
  manager: AccountManager | null;
  loading?: boolean;
  onCancel: () => void;
}

export default function AccountManagerCard({ manager, loading, onCancel }: Props) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderTop: "1px solid #e5e7eb",
        flexShrink: 0,
        background: "#fafafa",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#033280",
            fontFamily: "Inter, sans-serif",
          }}
        >
          ✉️ Your Account Manager
        </span>
        <button
          onClick={onCancel}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9ca3af",
            fontSize: 14,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {loading ? (
        <div
          style={{
            fontSize: 12,
            color: "#9ca3af",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            padding: "16px 0",
          }}
        >
          Loading…
        </div>
      ) : manager ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              background: "#f0f4ff",
              borderRadius: 8,
              border: "1px solid #dbeafe",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: "#033280",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "Inter, sans-serif",
                flexShrink: 0,
              }}
            >
              {manager.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#111827",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {manager.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                DS360 Account Manager
              </div>
            </div>
          </div>

          <a
            href={`mailto:${manager.email}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              fontSize: 12,
              color: "#033280",
              fontFamily: "Inter, sans-serif",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            <span>✉️</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {manager.email}
            </span>
          </a>

          {manager.phone && (
            <a
              href={`tel:${manager.phone}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                fontSize: 12,
                color: "#111827",
                fontFamily: "Inter, sans-serif",
                textDecoration: "none",
              }}
            >
              <span>📞</span> {manager.phone}
            </a>
          )}

          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "7px 0",
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
              color: "#6b7280",
              width: "100%",
            }}
          >
            Back
          </button>
        </div>
      ) : (
        <div
          style={{
            fontSize: 12,
            color: "#6b7280",
            fontFamily: "Inter, sans-serif",
            textAlign: "center",
            padding: "16px 0",
            lineHeight: 1.6,
          }}
        >
          <div>No account manager assigned yet.</div>
          <div style={{ marginTop: 4 }}>
            Contact{" "}
            <a
              href="mailto:support@dealersuite360.com"
              style={{ color: "#033280", fontWeight: 600 }}
            >
              support@dealersuite360.com
            </a>
          </div>
          <button
            onClick={onCancel}
            style={{
              marginTop: 10,
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "6px 20px",
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
