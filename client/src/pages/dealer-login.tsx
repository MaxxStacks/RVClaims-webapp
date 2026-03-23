import { useState } from "react";
import { Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import logoEN from "@assets/DS360_logo_en.png";
import logoFR from "@assets/DS360_logo_fr.png";

export default function DealerLogin() {
  const { language } = useLanguage();
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [loginMethod, setLoginMethod] = useState<"options" | "email">("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement OAuth
    console.log(`Login with ${provider}`);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await login(email, password, "dealer");
      if (result.success) {
        setLocation("/dealer/dashboard");
      } else {
        setError(result.message || "Invalid email or password");
      }
    } catch {
      setError("Invalid email or password");
    }
    setIsLoading(false);
  };

  const manufacturers = ["Jayco", "Forest River", "Heartland", "Keystone", "Columbia NW", "Midwest Auto"];

  const stats = [
    { value: "6", label: "Manufacturers supported" },
    { value: "15+", label: "Years of expertise" },
    { value: "94%", label: "Claim approval rate" },
    { value: "16+", label: "Services available" },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid #e0e0e0", borderRadius: "8px",
    fontSize: "14px", fontFamily: "inherit", transition: "border-color 0.2s", background: "#fafafa", outline: "none",
  };

  return (
    <>
    <style>{`
      @media (max-width: 1023px) {
        .dlp-left { display: none !important; }
        .dlp-right { width: 100% !important; }
        .dlp-header { padding: 14px 24px !important; }
        .dlp-body { padding: 32px 24px !important; }
      }
    `}</style>
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", minHeight: "100vh", display: "flex" }}>
      {/* Left Panel */}
      <div className="dlp-left" style={{
        width: "45%", background: "linear-gradient(145deg, #061b48 0%, #08235d 35%, #0c2f75 100%)",
        color: "white", padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "30px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.02)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "40px", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.5px", marginBottom: "16px" }}>
            Your Dealership.<br />One Platform.
          </div>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "48px", maxWidth: "380px" }}>
            Claims, financing, parts, marketing, and more — manage everything from a single dashboard.
          </p>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "48px" }}>
            {stats.map((stat) => (
              <div key={stat.label} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px", padding: "16px 18px",
              }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "white", marginBottom: "2px" }}>{stat.value}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            From <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>warranty claims</strong> and{" "}
            <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>F&I products</strong> to{" "}
            <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>live auctions</strong> and{" "}
            <strong style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>dealer marketplace</strong> — we're building the operating system for RV dealerships.
          </p>

          <a href="/services" style={{
            display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 20px",
            borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)",
            fontSize: "13px", fontWeight: 500, textDecoration: "none", background: "transparent",
            marginBottom: "40px",
          }}>Explore all services →</a>

          {/* Manufacturers */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
            {manufacturers.map((m) => (
              <span key={m} style={{
                padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.08)",
                fontSize: "11px", fontWeight: 500, color: "rgba(255,255,255,0.55)",
              }}>{m}</span>
            ))}
            <span style={{
              padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.12)",
              fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.7)",
            }}>+ More</span>
          </div>

          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
            © 2026 Dealer Suite 360 · Powered by Dealer Suite 360
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="dlp-right" style={{ width: "55%", background: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div className="dlp-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", borderBottom: "1px solid #f0f0f0" }}>
          <Link href="/">
            <img src={language === "en" ? logoEN : logoFR} alt="Dealer Suite 360" style={{ height: "72px", width: "auto" }} />
          </Link>
          <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← Back to site</Link>
        </div>

        {/* Login Area */}
        <div className="dlp-body" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
          <div style={{ width: "100%", maxWidth: "400px" }}>
            {loginMethod === "options" ? (
              <>
                <div style={{ fontSize: "26px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>Dealer Sign In</div>
                <p style={{ fontSize: "14px", color: "#888", marginBottom: "32px" }}>Access your dealership dashboard and services</p>

                {/* Google */}
                <button onClick={() => handleSocialLogin("google")} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  padding: "13px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px",
                  fontWeight: 500, color: "#333", background: "#fff", cursor: "pointer", fontFamily: "inherit",
                  marginBottom: "12px",
                }}>
                  <FontAwesomeIcon icon={faGoogle} style={{ width: "20px", height: "20px", color: "#08235d" }} />
                  Continue with Google
                </button>

                {/* LinkedIn */}
                <button onClick={() => handleSocialLogin("linkedin")} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  padding: "13px", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px",
                  fontWeight: 500, color: "#333", background: "#fff", cursor: "pointer", fontFamily: "inherit",
                  marginBottom: "12px",
                }}>
                  <FontAwesomeIcon icon={faLinkedinIn} style={{ width: "20px", height: "20px", color: "#0A66C2" }} />
                  Continue with LinkedIn
                </button>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "20px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "#eee" }} />
                  <span style={{ fontSize: "12px", color: "#bbb" }}>or</span>
                  <div style={{ flex: 1, height: "1px", background: "#eee" }} />
                </div>

                {/* Email */}
                <button onClick={() => setLoginMethod("email")} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  padding: "14px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
                  color: "white", background: "#08235d", cursor: "pointer", fontFamily: "inherit",
                }}>
                  <Mail size={18} />
                  Continue with Email
                </button>

                <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#aaa" }}>
                  Credentials are provided by Dealer Suite 360 upon signup.
                </p>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <button onClick={() => { setLoginMethod("options"); setError(""); }} style={{
                    padding: "8px", borderRadius: "6px", border: "none", background: "none",
                    cursor: "pointer", color: "#888",
                  }}>
                    <ArrowLeft size={20} />
                  </button>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#08235d" }}>Sign in with Email</div>
                </div>

                <form onSubmit={handleEmailLogin}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dealership.com" style={inputStyle} required />
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
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#bbb", borderTop: "1px solid #f0f0f0" }}>
          Operator?{" "}
          <Link href="/operator" style={{ color: "#08235d", textDecoration: "none", fontWeight: 500 }}>Sign in here</Link>
          {" · "}
          <Link href="/privacy-policy" style={{ color: "#888", textDecoration: "none" }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
    </>
  );
}
