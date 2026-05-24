// client/src/components/assist/AssistFAB.tsx
import { useState, useEffect } from "react";
import AssistPanel from "./AssistPanel";

export default function AssistFAB() {
  const [open, setOpen] = useState(false);
  const [pulsing, setPulsing] = useState(true);

  // Single pulse cycle on first load — remove ring after animation completes
  useEffect(() => {
    const timer = setTimeout(() => setPulsing(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {open && <AssistPanel onClose={() => setOpen(false)} />}

      <style>{`
        .assist-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #033280 0%, #044BA0 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(3, 50, 128, 0.35);
          z-index: 10000;
          transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1);
          animation: assistFabEntry 400ms ease-out both;
        }
        .assist-fab:hover {
          transform: scale(1.08);
          box-shadow: 0 12px 40px rgba(3, 50, 128, 0.5);
        }
        .assist-fab:active {
          transform: scale(0.95) !important;
          box-shadow: 0 4px 16px rgba(3, 50, 128, 0.25) !important;
        }
        @media (max-width: 767px) {
          .assist-fab {
            bottom: 16px;
            right: 16px;
            width: 48px;
            height: 48px;
          }
        }
        @keyframes assistFabEntry {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes assistPulseRing {
          0%   { transform: scale(0.92); opacity: 0.9; }
          70%  { transform: scale(1.5);  opacity: 0.1; }
          100% { transform: scale(0.92); opacity: 0;   }
        }
        .assist-fab-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .assist-fab-icon--open {
          transform: rotate(90deg);
        }
        @media (prefers-reduced-motion: reduce) {
          .assist-fab { animation: none; }
          .assist-fab:hover { transform: none; box-shadow: 0 8px 32px rgba(3,50,128,0.35); }
          .assist-fab:active { transform: none !important; }
          .assist-fab-icon { transition: none; }
        }
      `}</style>

      <button
        onClick={() => setOpen((o) => !o)}
        title="DS360 Assist"
        aria-label={open ? "Close DS360 Assist" : "Open DS360 Assist"}
        className="assist-fab"
      >
        {/* Single-cycle pulse ring on first load */}
        {pulsing && !open && (
          <span
            style={{
              position: "absolute",
              inset: -5,
              borderRadius: "50%",
              border: "2px solid #0cb22c",
              animation: "assistPulseRing 1.2s ease-out 1 forwards",
              pointerEvents: "none",
            }}
          />
        )}

        {/* MessageCircle icon when closed, X when open — rotates on toggle */}
        <span className={`assist-fab-icon${open ? " assist-fab-icon--open" : ""}`}>
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </span>
      </button>
    </>
  );
}
