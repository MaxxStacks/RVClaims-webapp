import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { forgotPassword, registerBidder } from "@/lib/auth-api";
import { Link, useLocation } from "wouter";
import logoEN from "@assets/DS360_logo_light.png";
import logoFR from "@assets/DS360_logo_light.png";

export default function BidderLogin() {
  const { language } = useLanguage();
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [loginView, setLoginView] = useState<"form" | "forgot" | "forgot-sent">("form");

  // Register fields
  const [firstName, setFirstName]       = useState("");
  const [lastName, setLastName]         = useState("");
  const [regEmail, setRegEmail]         = useState("");
  const [phone, setPhone]               = useState("");
  const [province, setProvince]         = useState("");
  const [regPassword, setRegPassword]   = useState("");
  const [confirmPass, setConfirmPass]   = useState("");
  const [showRegPass, setShowRegPass]   = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail]     = useState(() => localStorage.getItem("ds360_bidder_email") || "");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [rememberMe, setRememberMe]     = useState(() => localStorage.getItem("ds360_bidder_remember") === "true");
  const [forgotEmail, setForgotEmail]   = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");

  const provinces = ["AB","BC","MB","NB","NL","NS","NT","NU","ON","PE","QC","SK","YT"];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid #e0e0e0", borderRadius: "8px",
    fontSize: "14px", fontFamily: "inherit", transition: "border-color 0.2s",
    background: "#fafafa", outline: "none", boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px",
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !regEmail || !province || !regPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    if (regPassword !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await registerBidder({ email: regEmail, password: regPassword, firstName, lastName, phone: phone || undefined, province });
      if (result.success) {
        setLocation("/bidder/dashboard");
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Registration failed. Please try again.");
    }
    setIsLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginEmail || !loginPassword) {
      setError("Please enter your email and password.");
      return;
    }
    if (rememberMe) {
      localStorage.setItem("ds360_bidder_remember", "true");
      localStorage.setItem("ds360_bidder_email", loginEmail);
    } else {
      localStorage.removeItem("ds360_bidder_remember");
      localStorage.removeItem("ds360_bidder_email");
    }
    setIsLoading(true);
    try {
      const result = await login(loginEmail, loginPassword, "bidder", rememberMe);
      if (result.success) {
        setLocation("/bidder/dashboard");
      } else {
        setError(result.message || "Invalid email or password");
      }
    } catch {
      setError("Invalid email or password");
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await forgotPassword(forgotEmail);
    } catch {
      // Always show sent view to avoid email enumeration
    }
    setForgotLoading(false);
    setLoginView("forgot-sent");
  };

  const features = [
    "No dealer license required — open to all registered bidders",
    "$250 hold placed on first bid — refunded automatically if you lose",
    "Dealer Suite 360 acts as escrow for every transaction",
    "Financing available for auction winners",
  ];

  return (
    <>
    <style>{`
      @media (max-width: 1023px) {
        .blp-left { display: none !important; }
        .blp-right { width: 100% !important; }
        .blp-header { padding: 14px 24px !important; }
        .blp-body { padding: 32px 24px !important; }
        .blp-row { flex-direction: column !important; }
      }
    `}</style>
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", minHeight: "100vh", display: "flex" }}>

      {/* ── LEFT PANEL ── */}
      <div className="blp-left" style={{
        width: "45%", background: "linear-gradient(145deg, #061b48 0%, #08235d 35%, #0c2f75 100%)",
        color: "white", padding: "48px 56px", display: "flex", flexDirection: "column",
        justifyContent: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "30px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.02)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "38px", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.5px", marginBottom: "16px" }}>
            Bid on Real RV Inventory<br />at Wholesale Prices.
          </div>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "40px", maxWidth: "380px" }}>
            Monthly public auction. Verified dealerships. Dealer Suite 360 handles all transactions — so you buy with confidence.
          </p>

          {/* Features */}
          <div style={{ marginBottom: "40px" }}>
            {features.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, marginTop: "1px",
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L3.5 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Next auction card */}
          <div style={{
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "10px", padding: "16px 20px", marginBottom: "40px",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 500, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "6px" }}>
              Next Public Auction
            </div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "white", marginBottom: "2px" }}>
              May 8, 2026
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)" }}>
              12:00 PM EDT · 24-hour window · 6 units listed
            </div>
          </div>

          {/* Manufacturer badges */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
            {["Jayco", "Forest River", "Heartland", "Keystone", "Columbia NW", "Midwest Auto"].map((m) => (
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

      {/* ── RIGHT PANEL ── */}
      <div className="blp-right" style={{ width: "55%", background: "#fff", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div className="blp-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 48px", borderBottom: "1px solid #f0f0f0" }}>
          <Link href="/">
            <img src={language === "en" ? logoEN : logoFR} alt="Dealer Suite 360" style={{ height: "65px", width: "auto" }} />
          </Link>
          <Link href="/live-auctions" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>
            ← Back to Live Auctions
          </Link>
        </div>

        {/* Form area */}
        <div className="blp-body" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
          <div style={{ width: "100%", maxWidth: "420px" }}>

            {/* ── REGISTER MODE ── */}
            {mode === "register" && (
              <>
                <div style={{ fontSize: "26px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>Create Bidder Account</div>
                <p style={{ fontSize: "14px", color: "#888", marginBottom: "28px" }}>
                  Free to register · No charge until you win
                </p>

                <form onSubmit={handleRegister}>
                  {/* First / Last name */}
                  <div className="blp-row" style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>First Name</label>
                      <input
                        type="text" placeholder="Jane" style={inputStyle} required
                        value={firstName} onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Last Name</label>
                      <input
                        type="text" placeholder="Smith" style={inputStyle} required
                        value={lastName} onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Email Address</label>
                    <input
                      type="email" placeholder="jane@example.com" style={inputStyle} required
                      value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>

                  {/* Phone + Province */}
                  <div className="blp-row" style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Phone</label>
                      <input
                        type="tel" placeholder="(555) 000-0000" style={inputStyle}
                        value={phone} onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Province <span style={{ color: "#dc2626" }}>*</span></label>
                      <select
                        style={{ ...inputStyle, cursor: "pointer" }} required
                        value={province} onChange={(e) => setProvince(e.target.value)}
                      >
                        <option value="">Select...</option>
                        {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Password / Confirm */}
                  <div className="blp-row" style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Password</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showRegPass ? "text" : "password"} placeholder="Min. 8 characters"
                          style={{ ...inputStyle, paddingRight: "40px" }} required
                          value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                        />
                        <button type="button" onClick={() => setShowRegPass(!showRegPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}>
                          {showRegPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Confirm Password</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showConfPass ? "text" : "password"} placeholder="Repeat password"
                          style={{ ...inputStyle, paddingRight: "40px" }} required
                          value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                        />
                        <button type="button" onClick={() => setShowConfPass(!showConfPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}>
                          {showConfPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
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
                    cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1,
                  }}>
                    {isLoading ? "Creating account..." : "Create Account & Continue →"}
                  </button>

                  <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#aaa" }}>
                    Already have an account?{" "}
                    <button type="button" onClick={() => { setMode("login"); setError(""); }} style={{ background: "none", border: "none", color: "#08235d", fontWeight: 600, cursor: "pointer", fontSize: "13px", fontFamily: "inherit", padding: 0 }}>
                      Sign in
                    </button>
                  </p>
                </form>
              </>
            )}

            {/* ── LOGIN MODE ── */}
            {mode === "login" && loginView === "form" && (
              <>
                <div style={{ fontSize: "26px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>Welcome Back</div>
                <p style={{ fontSize: "14px", color: "#888", marginBottom: "28px" }}>
                  Sign in to your bidder account
                </p>

                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" placeholder="jane@example.com" style={inputStyle} required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label style={labelStyle}>Password</label>
                      <button type="button" onClick={() => { setForgotEmail(loginEmail); setLoginView("forgot"); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#08235d", fontFamily: "inherit", padding: 0 }}>
                        Forgot password?
                      </button>
                    </div>
                    <div style={{ position: "relative" }}>
                      <input type={showLoginPass ? "text" : "password"} placeholder="Enter your password" style={{ ...inputStyle, paddingRight: "40px" }} required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}>
                        {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", cursor: "pointer" }}>
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: "15px", height: "15px", accentColor: "#08235d" }} />
                    <span style={{ fontSize: "13px", color: "#555" }}>Remember this device for 30 days</span>
                  </label>

                  {error && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px" }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={isLoading} style={{ width: "100%", padding: "14px", background: "#08235d", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.6 : 1 }}>
                    {isLoading ? "Signing in..." : "Sign In →"}
                  </button>

                  <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#aaa" }}>
                    New here?{" "}
                    <button type="button" onClick={() => { setMode("register"); setError(""); }} style={{ background: "none", border: "none", color: "#08235d", fontWeight: 600, cursor: "pointer", fontSize: "13px", fontFamily: "inherit", padding: 0 }}>
                      Create an account
                    </button>
                  </p>
                </form>
              </>
            )}

            {mode === "login" && loginView === "forgot" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                  <button onClick={() => { setLoginView("form"); setError(""); }} style={{ padding: "8px", borderRadius: "6px", border: "none", background: "none", cursor: "pointer", color: "#888" }}>
                    <ArrowLeft size={20} />
                  </button>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#08235d" }}>Reset Password</div>
                </div>
                <p style={{ fontSize: "14px", color: "#888", marginBottom: "24px" }}>Enter your email and we'll send you a reset link.</p>
                <form onSubmit={handleForgotPassword}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="jane@example.com" style={inputStyle} required />
                  </div>
                  <button type="submit" disabled={forgotLoading} style={{ width: "100%", padding: "14px", background: "#08235d", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, fontFamily: "inherit", cursor: "pointer", opacity: forgotLoading ? 0.5 : 1 }}>
                    {forgotLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </>
            )}

            {mode === "login" && loginView === "forgot-sent" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <CheckCircle2 size={28} style={{ color: "#22c55e", flexShrink: 0 }} />
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>Check your email</div>
                </div>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.6, marginBottom: "24px" }}>
                  If an account exists for <strong>{forgotEmail}</strong>, a reset link has been sent. Check your inbox and spam folder.
                </p>
                <button onClick={() => setLoginView("form")} style={{ width: "100%", padding: "13px", background: "none", color: "#08235d", border: "1px solid #e0e0e0", borderRadius: "8px", fontSize: "14px", fontWeight: 500, fontFamily: "inherit", cursor: "pointer" }}>
                  Back to Sign In
                </button>
              </>
            )}

          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#bbb", borderTop: "1px solid #f0f0f0" }}>
          <Link href="/live-auctions" style={{ color: "#888", textDecoration: "none" }}>← Live Auctions</Link>
          {" · "}
          <Link href="/privacy-policy" style={{ color: "#888", textDecoration: "none" }}>Privacy Policy</Link>
          {" · "}
          <Link href="/contact" style={{ color: "#888", textDecoration: "none" }}>Contact Us</Link>
        </div>
      </div>
    </div>
    </>
  );
}
