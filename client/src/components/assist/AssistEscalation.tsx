// client/src/components/assist/AssistEscalation.tsx

export type EscalationType = "ticket" | "live_chat" | "email_am" | "screen_share" | "contact";

const OPTIONS: {
  type: EscalationType;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  desc: string;
  comingSoon?: boolean;
}[] = [
  {
    type: "ticket",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
        <path d="M17 3l4 4-9.5 9.5-5 1 1-5L17 3z" />
      </svg>
    ),
    iconBg: "rgba(3, 50, 128, 0.08)",
    iconColor: "#033280",
    label: "Open a Support Ticket",
    desc: "We'll follow up within 2 hours",
  },
  {
    type: "live_chat",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    iconBg: "rgba(12, 178, 44, 0.08)",
    iconColor: "#0cb22c",
    label: "Start Live Chat",
    desc: "Chat with a support agent now",
  },
  {
    type: "email_am",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    iconBg: "rgba(59, 130, 246, 0.08)",
    iconColor: "#3B82F6",
    label: "Email Account Manager",
    desc: "Contact your dedicated AM",
  },
  {
    type: "screen_share",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    iconBg: "rgba(139, 92, 246, 0.08)",
    iconColor: "#8B5CF6",
    label: "Share My Screen",
    desc: "Let support see your screen",
  },
  {
    type: "contact",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    iconBg: "rgba(107, 114, 128, 0.08)",
    iconColor: "#6B7280",
    label: "Contact Support",
    desc: "support@dealersuite360.com",
  },
];

import React from "react";

interface Props {
  onSelect: (type: EscalationType) => void;
  onDismiss: () => void;
}

export default function AssistEscalation({ onSelect, onDismiss }: Props) {
  return (
    <div
      style={{
        padding: "10px 14px 14px",
        borderTop: "1px solid #E8ECF1",
        flexShrink: 0,
        background: "#FFFFFF",
        maxHeight: 320,
        overflowY: "auto",
      }}
    >
      <style>{`
        .assist-esc-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: #FFFFFF;
          border: 1px solid #E8ECF1;
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: border-color 150ms ease, box-shadow 150ms ease, transform 100ms ease;
          font-family: Inter, sans-serif;
        }
        .assist-esc-card:hover {
          border-color: #033280;
          box-shadow: 0 2px 8px rgba(3, 50, 128, 0.08);
          transform: translateY(-1px);
        }
        .assist-esc-card:active {
          transform: translateY(0);
          box-shadow: none;
        }
        .assist-esc-card--disabled {
          opacity: 0.55;
          cursor: default;
        }
        .assist-esc-card--disabled:hover {
          border-color: #E8ECF1;
          box-shadow: none;
          transform: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .assist-esc-card { transition: none; }
          .assist-esc-card:hover { transform: none; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          color: "#6B7280",
          fontFamily: "Inter, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}>
          Get Human Help
        </span>
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#9CA3AF",
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
            padding: "2px 4px",
            borderRadius: 4,
          }}
        >
          Dismiss
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => !opt.comingSoon && onSelect(opt.type)}
            className={`assist-esc-card${opt.comingSoon ? " assist-esc-card--disabled" : ""}`}
          >
            {/* Icon circle */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: opt.iconBg,
              color: opt.iconColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              {opt.icon}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1F2937",
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 1,
              }}>
                {opt.label}
                {opt.comingSoon && (
                  <span style={{
                    fontSize: 9,
                    background: "#F3F4F6",
                    color: "#9CA3AF",
                    padding: "1px 5px",
                    borderRadius: 4,
                    fontWeight: 500,
                    letterSpacing: "0.03em",
                  }}>
                    SOON
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 12,
                color: "#9CA3AF",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {opt.desc}
              </div>
            </div>

            {/* Chevron */}
            {!opt.comingSoon && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
