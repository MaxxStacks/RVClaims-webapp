// client/src/components/assist/TicketForm.tsx

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface Props {
  conversationId?: string;
  prefillDescription?: string;
  onSuccess: (ticketNumber: string) => void;
  onCancel: () => void;
}

const CATEGORIES = [
  "General Question",
  "Claims Issue",
  "Billing / Invoice",
  "Technical Problem",
  "Account Access",
  "Training Request",
  "Feature Request",
  "Other",
];

export default function TicketForm({ conversationId, prefillDescription, onSuccess, onCancel }: Props) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState(prefillDescription ?? "");
  const [category, setCategory] = useState("General Question");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await apiFetch<{ success: boolean; ticketNumber: string }>(
        "/api/assist/escalate/ticket",
        {
          method: "POST",
          body: JSON.stringify({
            conversationId,
            subject: subject.trim(),
            description: description.trim(),
            category,
            priority,
          }),
        }
      );
      if (data.success) {
        onSuccess(data.ticketNumber);
      } else {
        setError("Failed to create ticket. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "7px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 12,
    fontFamily: "Inter, sans-serif",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  };

  return (
    <div
      style={{
        padding: "10px 12px",
        borderTop: "1px solid #e5e7eb",
        flexShrink: 0,
        maxHeight: 340,
        overflowY: "auto",
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
          🎫 Open a Support Ticket
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

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <input
          placeholder="Subject *"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={inputStyle}
          required
        />

        <textarea
          placeholder="Describe your issue *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical", minHeight: 58 }}
          required
        />

        <div style={{ display: "flex", gap: 6 }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ ...inputStyle, flex: 2 }}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
            style={{ ...inputStyle, flex: 1 }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {error && (
          <div style={{ fontSize: 11, color: "#b91c1c", fontFamily: "Inter, sans-serif" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="submit"
            disabled={submitting || !subject.trim() || !description.trim()}
            style={{
              flex: 2,
              background: submitting ? "#9ca3af" : "#033280",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 0",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting…" : "Submit Ticket"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "8px 0",
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
