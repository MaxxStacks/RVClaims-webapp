// client/src/components/assist/AssistWorkflow.tsx

interface WorkflowStepDef {
  stepNumber: number;
  totalSteps: number;
  title: string;
  instruction: string;
  inputType: "text" | "select" | "multi-select" | "photo" | "confirm" | "none";
  inputLabel?: string;
  options?: string[];
  fieldKey: string;
}

interface Props {
  step: WorkflowStepDef;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function AssistWorkflow({ step, onSubmit, onCancel, disabled = false }: Props) {
  const progress = (step.stepNumber / step.totalSteps) * 100;

  return (
    <div
      style={{
        margin: "0 14px 10px",
        border: "1px solid #D1D9E6",
        borderRadius: 12,
        overflow: "hidden",
        flexShrink: 0,
        background: "#FFFFFF",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <style>{`
        .assist-wf-select-opt {
          display: block;
          width: 100%;
          text-align: left;
          background: #F8F9FB;
          border: 1px solid #E0E4EA;
          border-radius: 8px;
          padding: 9px 13px;
          font-size: 13px;
          font-family: Inter, sans-serif;
          cursor: pointer;
          color: #1F2937;
          transition: border-color 150ms ease, background 150ms ease;
        }
        .assist-wf-select-opt:hover:not(:disabled) {
          border-color: #033280;
          background: #F0F4FF;
        }
        .assist-wf-select-opt:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (prefers-reduced-motion: reduce) {
          .assist-wf-select-opt { transition: none; }
        }
      `}</style>

      {/* Progress bar — green fill */}
      <div style={{ background: "#E8ECF1", height: 4 }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#0cb22c",
            borderRadius: "0 2px 2px 0",
            transition: "width 400ms ease",
          }}
        />
      </div>

      <div style={{ padding: "10px 14px 12px" }}>
        {/* Step label */}
        <div style={{
          fontSize: 11,
          fontWeight: 500,
          color: "#6B7280",
          fontFamily: "Inter, sans-serif",
          marginBottom: 8,
          letterSpacing: "0.01em",
        }}>
          Step {step.stepNumber} of {step.totalSteps} — {step.title}
        </div>

        {/* Confirm */}
        {step.inputType === "confirm" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onSubmit("confirm")}
              disabled={disabled}
              style={{
                flex: 1,
                background: disabled ? "#D1D5DB" : "#033280",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "9px 0",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                cursor: disabled ? "not-allowed" : "pointer",
                fontWeight: 600,
                transition: "background 150ms",
              }}
            >
              {step.inputLabel ?? "Confirm"}
            </button>
            <button
              onClick={onCancel}
              disabled={disabled}
              style={{
                background: "none",
                border: "1px solid #E0E4EA",
                borderRadius: 8,
                padding: "9px 14px",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                cursor: disabled ? "not-allowed" : "pointer",
                color: "#6B7280",
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Select options */}
        {step.inputType === "select" && step.options && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {step.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onSubmit(opt)}
                disabled={disabled}
                className="assist-wf-select-opt"
              >
                {opt}
              </button>
            ))}
            <button
              onClick={onCancel}
              style={{
                background: "none",
                border: "none",
                fontSize: 11,
                color: "#9CA3AF",
                cursor: "pointer",
                marginTop: 4,
                textAlign: "left",
                fontFamily: "Inter, sans-serif",
                textDecoration: "underline",
              }}
            >
              Cancel workflow
            </button>
          </div>
        )}

        {/* Text / none — type in main input */}
        {(step.inputType === "text" || step.inputType === "none") && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#9CA3AF", fontFamily: "Inter, sans-serif" }}>
              Type your answer in the box below ↓
            </span>
            <button
              onClick={onCancel}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                fontSize: 11,
                color: "#9CA3AF",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                textDecoration: "underline",
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
