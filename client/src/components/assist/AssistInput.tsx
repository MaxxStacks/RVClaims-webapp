// client/src/components/assist/AssistInput.tsx

import { useState, type KeyboardEvent, useRef, useEffect } from "react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function AssistInput({ onSend, disabled = false }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        padding: "12px 16px",
        borderTop: "1px solid #e5e7eb",
        background: "#fff",
        borderRadius: "0 0 12px 12px",
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Ask DS360 Assist anything..."
        disabled={disabled}
        rows={1}
        style={{
          flex: 1,
          resize: "none",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 13,
          fontFamily: "Inter, sans-serif",
          outline: "none",
          lineHeight: 1.5,
          maxHeight: 120,
          minHeight: 36,
          color: "#111827",
          background: disabled ? "#f9fafb" : "#fff",
          opacity: disabled ? 0.7 : 1,
          overflowY: "auto",
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        title="Send message"
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: disabled || !value.trim() ? "#d1d5db" : "#033280",
          border: "none",
          cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.15s",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}
