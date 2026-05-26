// client/src/components/SignatureCapture.tsx — Reusable digital signature pad
// - Smooth bezier curves (midpoint algorithm)
// - Works on touch (mobile/tablet) AND mouse (desktop)
// - High-DPI / Retina aware via devicePixelRatio scaling
// - Fully controlled via props — NOT hardcoded to any page

import React, { useRef, useState, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SignatureData {
  signatureImageUrl: string;
  signerName: string;
  signerRole: string;
  timestamp: string;
  userAgent: string;
}

interface SignatureCaptureProps {
  signerRole: string;
  legalText: string;
  onSignatureComplete: (data: SignatureData) => void;
  defaultSignerName?: string;
  required?: boolean;
  disabled?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignatureCapture({
  signerRole,
  legalText,
  onSignatureComplete,
  defaultSignerName = "",
  required = false,
  disabled = false,
}: SignatureCaptureProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [signerName, setSignerName] = useState<string>(defaultSignerName);
  const [isSigned, setIsSigned] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const [prevPoint, setPrevPoint] = useState<{ x: number; y: number } | null>(null);
  const [nameError, setNameError] = useState<string>("");
  const [signError, setSignError] = useState<string>("");

  // ─── Canvas init & resize ─────────────────────────────────────────────────

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = container.offsetWidth || 600;
    const cssHeight = 150;

    // Set canvas pixel buffer to device resolution
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    // Set CSS display size
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale all draw calls by DPR
    ctx.scale(dpr, dpr);

    // Fill white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssWidth, cssHeight);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  useEffect(() => {
    const handleResize = () => {
      if (!isSigned) initCanvas();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSigned, initCanvas]);

  // ─── Canvas empty check ───────────────────────────────────────────────────

  const isEmpty = useCallback((): boolean => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return true;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < data.length; i += 4) {
      // If any pixel is not fully white, canvas has content
      if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) return false;
    }
    return true;
  }, []);

  // ─── Drawing helpers ──────────────────────────────────────────────────────

  const getCanvasPoint = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  const startDraw = useCallback(
    (x: number, y: number) => {
      if (disabled || isSigned) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      setPrevPoint({ x, y });
    },
    [disabled, isSigned]
  );

  const draw = useCallback(
    (x: number, y: number) => {
      if (!isDrawing || disabled || isSigned) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (!prevPoint) {
        ctx.lineTo(x, y);
        ctx.stroke();
        setPrevPoint({ x, y });
        return;
      }

      // Midpoint bezier algorithm for smooth curves
      const midX = (prevPoint.x + x) / 2;
      const midY = (prevPoint.y + y) / 2;

      ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
      ctx.stroke();

      // Start a new sub-path from the midpoint
      ctx.beginPath();
      ctx.moveTo(midX, midY);

      setPrevPoint({ x, y });
    },
    [isDrawing, disabled, isSigned, prevPoint]
  );

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    setPrevPoint(null);
  }, []);

  // ─── Mouse events ─────────────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPoint(e.clientX, e.clientY);
    startDraw(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasPoint(e.clientX, e.clientY);
    draw(x, y);
  };

  const handleMouseUp = () => endDraw();
  const handleMouseLeave = () => { if (isDrawing) endDraw(); };

  // ─── Touch events (addEventListener, not React props, for passive:false) ──

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const { x, y } = getCanvasPoint(touch.clientX, touch.clientY);
      startDraw(x, y);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const { x, y } = getCanvasPoint(touch.clientX, touch.clientY);
      draw(x, y);
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      endDraw();
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [getCanvasPoint, startDraw, draw, endDraw]);

  // ─── Clear ────────────────────────────────────────────────────────────────

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    setIsSigned(false);
    setSignatureData(null);
    setSignError("");
  };

  // ─── Accept & Sign ────────────────────────────────────────────────────────

  const handleAccept = () => {
    let valid = true;

    if (!signerName.trim()) {
      setNameError("Your name is required before signing.");
      valid = false;
    } else {
      setNameError("");
    }

    if (isEmpty()) {
      setSignError("Please draw your signature above before accepting.");
      valid = false;
    } else {
      setSignError("");
    }

    if (!valid) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageUrl = canvas.toDataURL("image/png", 1.0);
    const data: SignatureData = {
      signatureImageUrl: imageUrl,
      signerName: signerName.trim(),
      signerRole,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    setSignatureData(data);
    setIsSigned(true);
    onSignatureComplete(data);
  };

  // ─── Signed state (read-only) ─────────────────────────────────────────────

  if (isSigned && signatureData) {
    return (
      <div
        className="signature-capture-wrapper"
        style={{
          padding: "16px 20px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Green check */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>
            Signed by {signatureData.signerName} · {fmtTimestamp(signatureData.timestamp)}
          </div>
          <div style={{ fontSize: 11, color: "#4ade80", marginTop: 2 }}>
            Role: {signatureData.signerRole}
          </div>
        </div>
        <img
          src={signatureData.signatureImageUrl}
          alt="Signature"
          style={{ maxHeight: 48, maxWidth: 120, objectFit: "contain", background: "#fff", border: "1px solid #d1fae5", borderRadius: 4 }}
        />
      </div>
    );
  }

  // ─── Capture state ────────────────────────────────────────────────────────

  return (
    <div className="signature-capture-wrapper" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Signer Name */}
      <div>
        <input
          type="text"
          value={signerName}
          onChange={(e) => { setSignerName(e.target.value); setNameError(""); }}
          placeholder="Your name"
          disabled={disabled}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: `1px solid ${nameError ? "#f87171" : "#e0e0e0"}`,
            borderRadius: 6,
            fontSize: 13,
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {nameError && (
          <div style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{nameError}</div>
        )}
      </div>

      {/* Canvas */}
      <div ref={containerRef} style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            border: `2px solid ${signError ? "#f87171" : "#e5e7eb"}`,
            borderRadius: 8,
            cursor: disabled ? "not-allowed" : "crosshair",
            background: "#ffffff",
            display: "block",
            touchAction: "none",
            width: "100%",
            minHeight: 150,
          }}
        />
        {/* Ghost label when empty */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 12,
            color: "#d1d5db",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          Draw your signature above
        </div>
      </div>

      {signError && (
        <div style={{ fontSize: 11, color: "#dc2626", marginTop: -4 }}>{signError}</div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          style={{
            padding: "6px 14px",
            border: "1px solid #e0e0e0",
            borderRadius: 6,
            background: "transparent",
            fontSize: 12,
            color: "#555",
            cursor: disabled ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={disabled}
          style={{
            padding: "7px 18px",
            border: "none",
            borderRadius: 6,
            background: disabled ? "#d1fae5" : "#22c55e",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: disabled ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          Accept &amp; Sign
        </button>
      </div>

      {/* Legal text */}
      <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.5 }}>
        {legalText}
        {required && (
          <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>
        )}
      </div>
    </div>
  );
}
