import { useState } from "react";
import { Mail, Eye, EyeOff, ArrowLeft, FileText, TrendingUp, Users, Building2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import logoEN from "@assets/DS360_logo_en.png";
import logoFR from "@assets/DS360_logo_fr.png";

export default function OperatorLogin() {
  const { language } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      // TODO: Implement real auth — only accept operator_admin and operator_staff roles
      console.log("Operator login:", { email, password });
    } catch {
      setError("Invalid credentials");
    }
    setIsLoading(false);
  };

  const stats = [
    { Icon: FileText, label: "Claims processed", value: "12,400+" },
    { Icon: TrendingUp, label: "Approval rate", value: "94.2%" },
    { Icon: Users, label: "Active dealers", value: "180+" },
    { Icon: Building2, label: "Manufacturers", value: "6" },
  ];

  const capabilities = [
    "Claims processing", "FRC management", "Photo review", "Dealer onboarding",
    "Billing & invoicing", "Service modules", "User management", "Analytics & reporting",
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid #e0e0e0", borderRadius: "8px",
    fontSize: "14px", fontFamily: "inherit", transition: "border-color 0.2s", background: "#fafafa", outline: "none",
  };

  return (
    <>
    <style>{`
      @media (max-width: 1023px) {
        .olp-left { display: none !important; }
        .olp-right { width: 100% !important; }
        .olp-header { padding: 14px 24px !important; }
        .olp-body { padding: 32px 24px !important; }
      }
    `}</style>
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", minHeight: "100vh", display: "flex" }}>
      {/* Left Panel */}
      <div className="olp-left" style={{
        width: "45%", background: "linear-gradient(145deg, #061b48 0%, #08235d 35%, #0c2f75 100%)",
        color: "white", padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "30px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.02)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{
            display: "inline-block", padding: "5px 14px", borderRadius: "9999px",
            border: "1px solid rgba(255,255,255,0.15)", fontSize: "11px", textTransform: "uppercase",
            letterSpacing: "1.5px", fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: "24px",
          }}>Operations Portal</span>

          <div style={{ fontSize: "40px", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.5px", marginBottom: "12px" }}>
            Command Centre.
          </div>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "40px", maxWidth: "380px" }}>
            Manage every claim, dealer, and service across the entire Dealer Suite 360 platform.
          </p>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "40px" }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px", padding: "16px 18px",
              }}>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <stat.Icon size={14} strokeWidth={2} style={{ color: "rgba(255,255,255,0.4)" }} />
                  {stat.label}
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "white" }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Capabilities */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px", marginBottom: "24px" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: "16px" }}>
              Platform capabilities
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
              {capabilities.map((cap) => (
                <div key={cap} style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                  {cap}
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginTop: "16px" }}>
            © 2026 Dealer Suite 360 · Dealer Suite 360 · Authorized Staff Only
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="olp-right" style={{ width: "55%", background: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="olp-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", borderBottom: "1px solid #f0f0f0" }}>
          <Link href="/">
            <img src={language === "en" ? logoEN : logoFR} alt="Dealer Suite 360" style={{ height: "72px", width: "auto" }} />
          </Link>
          <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← Back to site</Link>
        </div>

        {/* Login Area */}
        <div className="olp-body" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
          <div style={{ width: "100%", maxWidth: "380px", textAlign: "center" }}>
            {!showForm ? (
              <>
                <span style={{
                  display: "inline-block", padding: "6px 16px", borderRadius: "9999px",
                  border: "1px solid #e0e0e0", fontSize: "11px", textTransform: "uppercase",
                  letterSpacing: "1.2px", fontWeight: 600, color: "#888", marginBottom: "24px",
                }}>Authorized access only</span>

                <div style={{ fontSize: "26px", fontWeight: 700, color: "#111", marginBottom: "6px" }}>Operator Sign In</div>
                <p style={{ fontSize: "14px", color: "#888", marginBottom: "36px" }}>Access the operations backend</p>

                <button onClick={() => setShowForm(true)} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  padding: "14px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
                  color: "white", background: "#08235d", cursor: "pointer", fontFamily: "inherit",
                }}>
                  <Mail size={18} />
                  Continue with Email
                </button>

                <div style={{ marginTop: "24px", padding: "16px", background: "#f8f8f8", borderRadius: "8px" }}>
                  <p style={{ fontSize: "12px", color: "#666", fontWeight: 500, marginBottom: "2px" }}>Dealer Suite 360 staff only.</p>
                  <p style={{ fontSize: "12px", color: "#999", lineHeight: 1.5 }}>Unauthorized access attempts are logged and monitored.</p>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <button onClick={() => { setShowForm(false); setError(""); }} style={{
                    padding: "8px", borderRadius: "6px", border: "none", background: "none",
                    cursor: "pointer", color: "#888",
                  }}>
                    <ArrowLeft size={20} />
                  </button>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#08235d" }}>Operator Sign In</div>
                </div>

                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dealersuite360.com" style={inputStyle} required />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Password</label>
                    <div style={{ position: "relative" }}>
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" style={{ ...inputStyle, paddingRight: "40px" }} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={isLoading} style={{
                    width: "100%", padding: "14px", background: "#08235d", color: "white", border: "none",
                    borderRadius: "8px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit",
                    cursor: "pointer", opacity: isLoading ? 0.5 : 1,
                  }}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </button>
                </form>

                <div style={{ marginTop: "16px", padding: "16px", background: "#f8f8f8", borderRadius: "8px", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#999" }}>Unauthorized access attempts are logged and monitored.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#bbb", borderTop: "1px solid #f0f0f0" }}>
          Dealer login?{" "}
          <Link href="/client-login" style={{ color: "#08235d", textDecoration: "none", fontWeight: 500 }}>Sign in here</Link>
          {" · "}
          <Link href="/privacy-policy" style={{ color: "#888", textDecoration: "none" }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
    </>
  );
}
