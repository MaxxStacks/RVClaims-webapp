// client/src/components/assist/AssistQuickReplies.tsx

interface Props {
  replies: string[];
  onSelect: (reply: string) => void;
}

export default function AssistQuickReplies({ replies, onSelect }: Props) {
  if (replies.length === 0) return null;

  return (
    <div
      style={{
        padding: "4px 14px 10px",
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        flexShrink: 0,
        background: "#F8F9FB",
        borderTop: "1px solid #E8ECF1",
      }}
    >
      <style>{`
        .assist-qr-btn {
          display: inline-flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #D1D9E6;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          font-family: Inter, sans-serif;
          color: #033280;
          cursor: pointer;
          transition: background 150ms ease, border-color 150ms ease, transform 100ms ease;
          white-space: nowrap;
        }
        .assist-qr-btn:hover {
          background: #F0F4FF;
          border-color: #033280;
        }
        .assist-qr-btn:active {
          transform: scale(0.97);
        }
        @keyframes assistQrFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .assist-qr-btn { transition: none; }
          .assist-qr-btn:active { transform: none; }
        }
      `}</style>

      {replies.map((reply, i) => (
        <button
          key={reply}
          onClick={() => onSelect(reply)}
          className="assist-qr-btn"
          style={{
            animation: `assistQrFadeIn 200ms ${i * 50}ms ease-out both`,
          }}
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
