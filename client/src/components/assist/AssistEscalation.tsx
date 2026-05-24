// client/src/components/assist/AssistEscalation.tsx

export type EscalationType = "ticket" | "live_chat" | "email_am" | "screen_share" | "contact";

const OPTIONS: {
  type: EscalationType;
  emoji: string;
  label: string;
  desc: string;
  comingSoon?: boolean;
}[] = [
  { type: "ticket",       emoji: "🎫", label: "Open a Support Ticket", desc: "We'll follow up within 2 hours" },
  { type: "live_chat",    emoji: "💬", label: "Start Live Chat",         desc: "Chat with a support agent now" },
  { type: "email_am",     emoji: "✉️", label: "Email Account Manager",   desc: "Contact your dedicated AM" },
  { type: "screen_share", emoji: "🖥️", label: "Share My Screen",         desc: "Let support see your screen", comingSoon: true },
  { type: "contact",      emoji: "📞", label: "Contact Support",          desc: "support@dealersuite360.com" },
];

interface Props {
  onSelect: (type: EscalationType) => void;
  onDismiss: () => void;
}

export default function AssistEscalation({ onSelect, onDismiss }: Props) {
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
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#6b7280",
            fontFamily: "Inter, sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Get Human Help
        </span>
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9ca3af",
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
            padding: "2px 4px",
          }}
        >
          Dismiss
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => !opt.comingSoon && onSelect(opt.type)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 10px",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 7,
              cursor: opt.comingSoon ? "default" : "pointer",
              textAlign: "left",
              width: "100%",
              opacity: opt.comingSoon ? 0.6 : 1,
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!opt.comingSoon) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#033280";
                (e.currentTarget as HTMLButtonElement).style.background = "#f0f4ff";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb";
              (e.currentTarget as HTMLButtonElement).style.background = "#fff";
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1 }}>{opt.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#111827",
                  fontFamily: "Inter, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                {opt.label}
                {opt.comingSoon && (
                  <span
                    style={{
                      fontSize: 9,
                      background: "#f3f4f6",
                      color: "#9ca3af",
                      padding: "1px 5px",
                      borderRadius: 4,
                      fontWeight: 500,
                      letterSpacing: "0.03em",
                    }}
                  >
                    SOON
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  fontFamily: "Inter, sans-serif",
                  marginTop: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {opt.desc}
              </div>
            </div>
            {!opt.comingSoon && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="2.5"
                style={{ flexShrink: 0 }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
