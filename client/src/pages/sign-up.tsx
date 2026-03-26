import { useState, useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle } from "lucide-react";
import logoEN from "@assets/DS360_logo_light.png";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", border: "1px solid #e0e0e0", borderRadius: "8px",
  fontSize: "14px", fontFamily: "inherit", transition: "border-color 0.2s", background: "#fafafa",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "13px", fontWeight: 500, color: "#333", marginBottom: "6px",
};

export default function SignUp() {
  const [formData, setFormData] = useState({
    dealershipName: "",
    contactName: "",
    email: "",
    phone: "",
    unitCount: "",
    interests: [] as string[],
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Request Access — Dealer Suite 360";
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckbox = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const benefits = [
    "Full A-Z claims processing handled by our expert team",
    "AI-powered FRC code matching cuts submission time by 60%",
    "One platform for claims, financing, F&I, parts, and more",
    "Dedicated onboarding specialist — live within 1 business day",
  ];

  const interests = [
    "Claims Processing",
    "Financing",
    "F&I Services",
    "Warranty Plans",
    "Marketplace",
    "All Services",
  ];

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", minHeight: "100vh", display: "flex" }}>
      {/* Left Panel */}
      <div style={{
        width: "45%", background: "linear-gradient(145deg, #061b48 0%, #08235d 35%, #0c2f75 100%)",
        color: "white", padding: "48px 56px", display: "flex", flexDirection: "column", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "420px", height: "420px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", bottom: "-100px", right: "30px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.02)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "2px", color: "rgba(255,255,255,0.45)", fontWeight: 600, marginBottom: "20px" }}>
            Get Started with DealerSuite360
          </div>
          <div style={{ fontSize: "38px", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.5px", marginBottom: "16px" }}>
            The Complete<br />Dealership Platform.
          </div>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "48px", maxWidth: "380px" }}>
            One subscription. Every service your dealership needs — claims, financing, F&I, parts, and marketing.
          </p>

          <div style={{ marginBottom: "48px" }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%", background: "rgba(52, 211, 153, 0.2)",
                  border: "1px solid rgba(52, 211, 153, 0.4)", display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0, marginTop: "2px",
                }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{b}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px", padding: "20px 24px",
          }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px", color: "rgba(255,255,255,0.4)", marginBottom: "12px", fontWeight: 600 }}>
              Trust Signals
            </div>
            {[
              "No credit card required to get started",
              "Free onboarding consultation included",
              "Response within 24 business hours",
            ].map((t, i) => (
              <div key={i} style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginBottom: i < 2 ? "8px" : 0 }}>
                ✓ {t}
              </div>
            ))}
          </div>

          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "32px" }}>
            © 2026 Dealer Suite 360 · dealersuite360.com
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: "55%", background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 48px", borderBottom: "1px solid #f0f0f0" }}>
          <Link href="/">
            <img src={logoEN} alt="Dealer Suite 360" style={{ height: "108px", width: "auto" }} />
          </Link>
          <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← Back to site</Link>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px" }}>
          {submitted ? (
            <div style={{ textAlign: "center", maxWidth: "400px" }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%", background: "#f0fdf4",
                border: "2px solid #bbf7d0", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 24px",
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><polyline points="4,12 9,17 20,6" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ fontSize: "26px", fontWeight: 700, color: "#111", marginBottom: "12px" }}>Request Received!</div>
              <p style={{ fontSize: "15px", color: "#666", lineHeight: 1.6, marginBottom: "28px" }}>
                Thank you, <strong>{formData.contactName}</strong>. Our team will review your request and reach out within 24 business hours to schedule your free onboarding consultation.
              </p>
              <Link href="/" style={{
                display: "inline-block", padding: "12px 28px", background: "#08235d", color: "white",
                borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: 600,
              }}>
                Return to Home
              </Link>
            </div>
          ) : (
            <div style={{ width: "100%", maxWidth: "480px" }}>
              <div style={{ fontSize: "26px", fontWeight: 700, color: "#111", marginBottom: "4px" }}>Request Access</div>
              <p style={{ fontSize: "14px", color: "#888", marginBottom: "28px" }}>
                No credit card required.{" "}
                <Link href="/client-login" style={{ color: "#08235d", textDecoration: "none", fontWeight: 500 }}>Already have an account? Sign in</Link>
              </p>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Dealership Name</label>
                  <input type="text" placeholder="Smith's RV Centre" value={formData.dealershipName}
                    onChange={(e) => handleChange("dealershipName", e.target.value)} style={inputStyle} required />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Contact Name</label>
                  <input type="text" placeholder="Jane Smith" value={formData.contactName}
                    onChange={(e) => handleChange("contactName", e.target.value)} style={inputStyle} required />
                </div>

                <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" placeholder="jane@dealership.com" value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)} style={inputStyle} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Phone <span style={{ color: "#999", fontWeight: 400 }}>(optional)</span></label>
                    <input type="tel" placeholder="(555) 000-0000" value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={labelStyle}>Number of Units in Inventory</label>
                  <select value={formData.unitCount} onChange={(e) => handleChange("unitCount", e.target.value)}
                    style={{ ...inputStyle, cursor: "pointer" }} required>
                    <option value="">Select range...</option>
                    <option value="<25">Less than 25 units</option>
                    <option value="25-50">25 – 50 units</option>
                    <option value="50-100">50 – 100 units</option>
                    <option value="100+">100+ units</option>
                  </select>
                </div>

                <div style={{ marginBottom: "28px" }}>
                  <label style={{ ...labelStyle, marginBottom: "12px" }}>Primary Interest <span style={{ color: "#999", fontWeight: 400 }}>(select all that apply)</span></label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {interests.map((interest) => (
                      <label key={interest} style={{
                        display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
                        border: `1px solid ${formData.interests.includes(interest) ? "#08235d" : "#e0e0e0"}`,
                        borderRadius: "8px", cursor: "pointer", fontSize: "13px", color: "#333",
                        background: formData.interests.includes(interest) ? "#f0f4ff" : "#fafafa",
                        transition: "all 0.15s",
                      }}>
                        <input type="checkbox" checked={formData.interests.includes(interest)}
                          onChange={() => handleCheckbox(interest)}
                          style={{ accentColor: "#08235d", width: "14px", height: "14px" }} />
                        {interest}
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" style={{
                  width: "100%", padding: "14px", background: "#08235d", color: "white", border: "none",
                  borderRadius: "8px", fontSize: "15px", fontWeight: 600, fontFamily: "inherit",
                  cursor: "pointer",
                }}>
                  Request Access →
                </button>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "16px", fontSize: "12px", color: "#aaa" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  Secured with 256-bit encryption
                </div>
              </form>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", padding: "20px", fontSize: "12px", color: "#bbb", borderTop: "1px solid #f0f0f0" }}>
          <Link href="/privacy-policy" style={{ color: "#888", textDecoration: "none" }}>Privacy Policy</Link>
          {" · "}
          <Link href="/terms-of-service" style={{ color: "#888", textDecoration: "none" }}>Terms of Service</Link>
          {" · "}
          <Link href="/contact" style={{ color: "#888", textDecoration: "none" }}>Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
