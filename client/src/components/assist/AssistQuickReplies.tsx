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
        padding: "4px 12px 12px",
        overflowX: "auto",
        display: "flex",
        gap: 6,
        flexShrink: 0,
        scrollbarWidth: "none",
      }}
    >
      {replies.map((reply) => (
        <button
          key={reply}
          onClick={() => onSelect(reply)}
          style={{
            whiteSpace: "nowrap",
            background: "#fff",
            border: "1.5px solid #033280",
            color: "#033280",
            borderRadius: 20,
            padding: "5px 12px",
            fontSize: 12,
            fontFamily: "Inter, sans-serif",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = "#033280";
            (e.target as HTMLButtonElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = "#fff";
            (e.target as HTMLButtonElement).style.color = "#033280";
          }}
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
