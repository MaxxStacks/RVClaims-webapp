import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import logoEN from "@assets/DS360_logo_en.png";
import logoFR from "@assets/DS360_logo_fr.png";

export default function CustomerLogin() {
  const { language } = useLanguage();
  const { login } = useAuth();
  const [, setLocation] = useLocation();
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
      const result = await login(email, password, "customer");
      if (result.success) {
        setLocation("/client/dashboard");
      } else {
        setError(result.message || "Invalid email or password");
      }
    } catch {
      setError("Invalid email or password");
    }
    setIsLoading(false);
  };

  const features = [
    { icon: "📋", text: "Track your warranty claims in real time" },
    { icon: "🛡️", text: "View your coverage, warranties, and protection plans" },
    { icon: "📦", text: "See parts orders and service updates" },
    { icon: "🎫", text: "Submit support tickets and get dealer responses" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid #e0e0e0", borderRadius: "8px",
    fontSize: "14px", fontFamily: "inherit", transition: "border-color 0.2s", background: "#fafafa", outline: "none",
  };

  return (
    <>
    <style>{`
      @media (max-width: 1023px) {
        .clp-left { display: none !important; }
        .clp-right { width: 100% !important; }
        .clp-header { padding: 14px 24px !important; }
        .clp-body { padding: 32px 24px !important; }
      }
    `}</style>
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", minHeight: "100vh", display: "flex" }}>
      {/* Left Panel */}
      <div className="clp-left" style={{
        width: "45%", background: "linear-gradient(145deg, #061b48 0%, #08235d 35%, #0c2f75 100%)",
        color: "white", padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "30px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.02)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "40px", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.5px", marginBottom: "16px" }}>
            Your RV.<br />Your Warranty.<br />All in One Place.
          </div>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "48px", maxWidth: "380px" }}>
            Access your RV warranty status, service history, and support — through your dealership's portal.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "48px" }}>
            {features.map((f) => (
              <div key={f.text} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{f.text}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            Your account is created by your dealership. Contact them if you haven't received your invitation.
          </p>

          <div style={{ marginTop: "24px", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
            © 2026 RV Claims Canada · Powered by Dealer Suite 360
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="clp-right" style={{ width: "55%", background: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="clp-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", borderBottom: "1px solid #f0f0f0" }}>
          <Link href="/">
            <img src={language === "en" ? logoEN : logoFR} alt="Dealer Suite 360" style={{ height: "72px", width: "auto" }} />
          </Link>
          <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← Back to site</Link>
        </div>

        {/* Login Area */}
        <div className="clp-body" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
          <div style={{ width: "100%", maxWidth: "400px" }}>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>Customer Sign In</div>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "32px" }}>Access your RV owner portal</p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ ...inputStyle, paddingRight: "40px" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%", padding: "14px", background: "#08235d", color: "white", border: "none",
                  borderRadius: "8px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit",
                  cursor: "pointer", opacity: isLoading ? 0.5 : 1,
                }}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#aaa" }}>
              Your account is set up by your dealership. Contact them for access.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#bbb", borderTop: "1px solid #f0f0f0" }}>
          Are you a dealer?{" "}
          <Link href="/dealer" style={{ color: "#08235d", textDecoration: "none", fontWeight: 500 }}>Sign in here</Link>
          {" · "}
          <Link href="/privacy-policy" style={{ color: "#888", textDecoration: "none" }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
    </>
  );
}
