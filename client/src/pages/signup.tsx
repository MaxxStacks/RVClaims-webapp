import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import logoEN from "@assets/DS360_logo_en.png";
import logoFR from "@assets/DS360_logo_fr.png";

export default function Signup() {
  const { language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    dealershipName: "", dealershipEmail: "", phone: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement signup API call
    console.log("Signup:", formData);
  };

  const services = [
    { name: "Claims Processing", live: true },
    { name: "Warranty Management", live: true },
    { name: "Financing Solutions", live: false },
    { name: "F&I Services", live: false },
    { name: "Parts & Accessories", live: false },
    { name: "Digital Marketing", live: false },
    { name: "Dealer Marketplace", live: false },
    { name: "Live Auctions", live: false },
  ];

  const manufacturers = ["Jayco", "Forest River", "Heartland", "Keystone", "Columbia NW", "Midwest Auto"];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", border: "1px solid #e0e0e0", borderRadius: "8px",
    fontSize: "14px", fontFamily: "inherit", transition: "border-color 0.2s", background: "#fafafa",
    outline: "none",
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", minHeight: "100vh", display: "flex" }}>
      {/* Left Panel */}
      <div style={{
        width: "45%", background: "linear-gradient(145deg, #061b48 0%, #08235d 35%, #0c2f75 100%)",
        color: "white", padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "30px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.02)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "40px", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.5px", marginBottom: "16px" }}>
            Your Complete<br />Dealership Platform.
          </div>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "48px", maxWidth: "380px" }}>
            Process claims, grow revenue, and manage every aspect of your dealership — all in one place.
          </p>

          {/* Service Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "48px" }}>
            {services.map((s) => (
              <div key={s.name} style={{
                display: "flex", alignItems: "center", gap: "10px", padding: "11px 14px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.85)",
              }}>
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0,
                  background: s.live ? "#34d399" : "#fbbf24",
                }} />
                {s.name}
              </div>
            ))}
          </div>

          {/* Onboarding */}
          <div style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px", padding: "24px", marginBottom: "32px",
          }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.45)", marginBottom: "16px", fontWeight: 600 }}>
              How it works
            </div>
            {["Create your account", "We verify your dealership", "Choose your plan & services", "Go live — typically within 1 business day"].map((text, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: i < 3 ? "12px" : 0 }}>
                <span style={{
                  width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.6)", flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)" }}>{text}</span>
              </div>
            ))}
          </div>

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
      <div style={{ width: "55%", background: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 48px", borderBottom: "1px solid #f0f0f0" }}>
          <Link href="/">
            <img src={language === "en" ? logoEN : logoFR} alt="Dealer Suite 360" style={{ height: "72px", width: "auto" }} />
          </Link>
          <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← Back to site</Link>
        </div>

        {/* Form */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
          <div style={{ width: "100%", maxWidth: "440px" }}>
            <div style={{ fontSize: "26px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>Create your account</div>
            <p style={{ fontSize: "14px", color: "#888", marginBottom: "6px" }}>
              No credit card required.{" "}
              <Link href="/client-login" style={{ color: "#08235d", textDecoration: "none", fontWeight: 500 }}>Already have an account? Sign in</Link>
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>First Name</label>
                  <input type="text" placeholder="Jane" value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} style={inputStyle} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Last Name</label>
                  <input type="text" placeholder="Smith" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} style={inputStyle} required />
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Email Address</label>
                  <input type="email" placeholder="jane@yourdealership.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} style={inputStyle} required />
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} style={{ ...inputStyle, paddingRight: "40px" }} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Confirm Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showConfirm ? "text" : "password"} placeholder="Repeat password" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} style={{ ...inputStyle, paddingRight: "40px" }} required />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ height: "1px", background: "#eee", margin: "28px 0 4px" }} />
              <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.2px", color: "#999", fontWeight: 600, marginTop: "20px" }}>
                Dealership Information
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Dealership Name</label>
                  <input type="text" placeholder="Smith's RV Centre" value={formData.dealershipName} onChange={(e) => handleChange("dealershipName", e.target.value)} style={inputStyle} required />
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Dealership Email</label>
                  <input type="email" placeholder="info@dealership.com" value={formData.dealershipEmail} onChange={(e) => handleChange("dealershipEmail", e.target.value)} style={inputStyle} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px" }}>Phone <span style={{ color: "#999", fontWeight: 400 }}>(optional)</span></label>
                  <input type="tel" placeholder="(555) 000-0000" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} style={inputStyle} />
                </div>
              </div>

              <button type="submit" style={{
                width: "100%", padding: "14px", background: "#08235d", color: "white", border: "none",
                borderRadius: "8px", fontSize: "15px", fontWeight: 600, fontFamily: "inherit",
                cursor: "pointer", marginTop: "28px",
              }}>
                Create Account →
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px", fontSize: "12px", color: "#aaa" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Secured with 256-bit encryption
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#bbb", borderTop: "1px solid #f0f0f0" }}>
          <Link href="/privacy-policy" style={{ color: "#888", textDecoration: "none" }}>Privacy Policy</Link>
          {" · "}
          <Link href="/contact" style={{ color: "#888", textDecoration: "none" }}>Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
