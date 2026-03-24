import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { resetPassword } from "@/lib/auth-api";
import logoEN from "@assets/DS360_logo_light.png";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid #e0e0e0", borderRadius: "8px",
    fontSize: "14px", fontFamily: "inherit", background: "#fafafa", outline: "none",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or missing reset token. Please request a new reset link.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        setDone(true);
      } else {
        setError(res.message || "Reset failed. The link may have expired.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f6f8" }}>
      <div style={{ width: "100%", maxWidth: "440px", background: "#fff", borderRadius: "12px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", padding: "40px 40px 32px" }}>
        <div style={{ marginBottom: "28px" }}>
          <Link href="/">
            <img src={logoEN} alt="Dealer Suite 360" style={{ height: "36px", width: "auto", marginBottom: "24px" }} />
          </Link>
          {done ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <CheckCircle2 size={24} style={{ color: "#22c55e", flexShrink: 0 }} />
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#111" }}>Password updated</div>
              </div>
              <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6 }}>Your password has been reset successfully. You can now sign in with your new password.</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#111", marginBottom: "6px" }}>Set new password</div>
              <p style={{ fontSize: "14px", color: "#888" }}>Choose a strong password for your account.</p>
            </>
          )}
        </div>

        {done ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={() => setLocation("/client-login")} style={{ width: "100%", padding: "13px", background: "#08235d", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
              Sign In as Dealer
            </button>
            <button onClick={() => setLocation("/client")} style={{ width: "100%", padding: "13px", background: "none", color: "#08235d", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
              Sign In as Client
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>New Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" style={{ ...inputStyle, paddingRight: "40px" }} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter your password" style={{ ...inputStyle, paddingRight: "40px" }} required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={isLoading} style={{ width: "100%", padding: "13px", background: "#08235d", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1 }}>
              {isLoading ? "Updating..." : "Update Password"}
            </button>

            <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#888" }}>
              Remember it?{" "}
              <Link href="/client-login" style={{ color: "#08235d", textDecoration: "none", fontWeight: 500 }}>Back to sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
