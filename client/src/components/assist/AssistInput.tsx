// client/src/components/assist/AssistInput.tsx

import { useState, type KeyboardEvent, useRef } from "react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
  onAttach?: (file: File) => void;
}

export default function AssistInput({ onSend, disabled = false, onAttach }: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    el.style.height = Math.min(el.scrollHeight, 112) + "px";
  };

  const hasText = value.trim().length > 0;
  const canSend = hasText && !disabled;

  return (
    <div
      style={{
        padding: "10px 14px 12px",
        borderTop: "1px solid #E8ECF1",
        background: "#FFFFFF",
        flexShrink: 0,
      }}
    >
      <style>{`
        .assist-input-wrap {
          position: relative;
          border-radius: 24px;
          background: #F3F5F8;
          border: 1px solid #E0E4EA;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .assist-input-wrap--focused {
          border-color: #033280;
          box-shadow: 0 0 0 3px rgba(3, 50, 128, 0.1);
        }
        .assist-attach-btn {
          position: absolute;
          left: 8px;
          bottom: 6px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
          transition: color 150ms ease;
        }
        .assist-attach-btn:hover { color: #033280; }
        .assist-textarea {
          display: block;
          width: 100%;
          resize: none;
          border: none;
          outline: none;
          background: transparent;
          padding: 10px 52px 10px 16px;
          font-size: 14px;
          font-family: Inter, sans-serif;
          line-height: 1.5;
          color: #1F2937;
          min-height: 40px;
          max-height: 112px;
          box-sizing: border-box;
          scrollbar-width: thin;
        }
        .assist-textarea::placeholder { color: #9CA3AF; }
        .assist-textarea:disabled { opacity: 0.6; cursor: not-allowed; }
        .assist-send-btn {
          position: absolute;
          right: 8px;
          bottom: 6px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 150ms ease, transform 100ms ease;
          flex-shrink: 0;
        }
        .assist-send-btn--active {
          background: #0cb22c;
        }
        .assist-send-btn--active:hover {
          background: #09a026;
        }
        .assist-send-btn--disabled {
          background: #D1D5DB;
          cursor: not-allowed;
        }
        .assist-send-btn--active:active {
          transform: scale(0.92);
        }
        @media (prefers-reduced-motion: reduce) {
          .assist-input-wrap { transition: none; }
          .assist-send-btn { transition: none; }
        }
      `}</style>

      {onAttach && (
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: "none" }}
          accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
          onChange={(e) => { if (e.target.files?.[0]) onAttach(e.target.files[0]); }}
        />
      )}
      <div className={`assist-input-wrap${focused ? " assist-input-wrap--focused" : ""}`}>
        {onAttach && (
          <button
            type="button"
            className="assist-attach-btn"
            title="Attach file"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
        )}
        <textarea
          ref={textareaRef}
          className="assist-textarea"
          style={onAttach ? { paddingLeft: 46 } : undefined}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Message DS360 Assist..."
          disabled={disabled}
          rows={1}
          aria-label="Chat message"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          title="Send"
          aria-label="Send message"
          className={`assist-send-btn${canSend ? " assist-send-btn--active" : " assist-send-btn--disabled"}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" fill="#fff" stroke="none" />
          </svg>
        </button>
      </div>
    </div>
  );
}
