// client/src/components/assist/AssistWorkflow.tsx — Renders the current workflow step UI

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
        margin: "8px 12px",
        border: "1.5px solid #033280",
        borderRadius: 8,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Progress bar */}
      <div style={{ background: "#e8eef8", height: 3 }}>
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#033280",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div style={{ padding: "10px 14px" }}>
        {/* Step label */}
        <div
          style={{
            fontSize: 11,
            color: "#6b7280",
            fontFamily: "Inter, sans-serif",
            marginBottom: 6,
          }}
        >
          Step {step.stepNumber} of {step.totalSteps} — {step.title}
        </div>

        {/* Input based on type */}
        {step.inputType === "confirm" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onSubmit("confirm")}
              disabled={disabled}
              style={{
                flex: 1,
                background: disabled ? "#9ca3af" : "#033280",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 0",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                cursor: disabled ? "not-allowed" : "pointer",
                fontWeight: 600,
              }}
            >
              {step.inputLabel ?? "Confirm"}
            </button>
            <button
              onClick={onCancel}
              disabled={disabled}
              style={{
                background: "none",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                cursor: disabled ? "not-allowed" : "pointer",
                color: "#6b7280",
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {step.inputType === "select" && step.options && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {step.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onSubmit(opt)}
                disabled={disabled}
                style={{
                  textAlign: "left",
                  background: "#f9fafb",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 13,
                  fontFamily: "Inter, sans-serif",
                  cursor: disabled ? "not-allowed" : "pointer",
                  color: "#111827",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!disabled) {
                    (e.target as HTMLButtonElement).style.borderColor = "#033280";
                    (e.target as HTMLButtonElement).style.background = "#f0f4ff";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.borderColor = "#d1d5db";
                  (e.target as HTMLButtonElement).style.background = "#f9fafb";
                }}
              >
                {opt}
              </button>
            ))}
            <button
              onClick={onCancel}
              disabled={disabled}
              style={{
                background: "none",
                border: "none",
                fontSize: 11,
                color: "#9ca3af",
                cursor: "pointer",
                marginTop: 2,
                textAlign: "left",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Cancel workflow
            </button>
          </div>
        )}

        {(step.inputType === "text" || step.inputType === "none") && (
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "Inter, sans-serif" }}>
              Type your answer above ↑
            </span>
            <button
              onClick={onCancel}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                fontSize: 11,
                color: "#9ca3af",
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
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
