// client/src/components/assist/AssistFAB.tsx
// Floating action button + chat panel for DS360 Assist (dealer_owner + dealer_staff only)

import { useState, useEffect } from "react";
import AssistPanel from "./AssistPanel";

export default function AssistFAB() {
  const [open, setOpen] = useState(false);
  const [pulsing, setPulsing] = useState(true);

  // Green pulse attention-grab — stops after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setPulsing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {open && <AssistPanel onClose={() => setOpen(false)} />}

      <button
        onClick={() => setOpen((o) => !o)}
        title="DS360 Assist"
        aria-label="Open DS360 Assist"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#033280",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(3,50,128,0.35)",
          zIndex: 10000,
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(3,50,128,0.45)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(3,50,128,0.35)";
        }}
      >
        {/* Pulse ring — green, fades after 3s */}
        {pulsing && !open && (
          <span
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: "50%",
              border: "3px solid #0cb22c",
              animation: "assistPulse 1s ease-out infinite",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Icon toggles between sparkle (closed) and X (open) */}
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )}
      </button>

      <style>{`
        @keyframes assistPulse {
          0%   { transform: scale(0.95); opacity: 1; }
          70%  { transform: scale(1.35); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0; }
        }
      `}</style>
    </>
  );
}
