import { useState } from "react";
import { ArrowLeft, Mail, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck, FileCheck2, Camera, ClipboardList, Wrench, Car, BarChart3, Banknote } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import logoEN from "@assets/Official_RVclaims_logo_en.webp";
import logoFR from "@assets/Official_RVclaims_logo_fr.webp";

type LoginStep = "options" | "email";

const MANUFACTURERS = [
  "Jayco",
  "Forest River",
  "Heartland",
  "Keystone",
  "Columbia NW",
  "Midwest Auto",
];

const FEATURE_ICONS = [FileCheck2, ClipboardList, Wrench, Car, BarChart3, ShieldCheck, Banknote];

export default function ClientLogin() {
  const { t, language } = useLanguage();
  const { login, isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<LoginStep>("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isAuthenticated && user) {
    setLocation("/dealer/dashboard");
    return null;
  }

  const handleSocialLogin = (provider: string) => {
    // OAuth — Phase 2
    console.log(`Social login with ${provider} not yet configured`);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    const result = await login(email, password, "dealer");
    setIsSubmitting(false);
    if (!result.success) {
      setErrorMessage(result.message ?? "Invalid email or password");
    }
  };

  // ─── Left brand panel ────────────────────────────────────────────────────────

  const features = (t("dealerLoginPage.features") as unknown as { text: string }[]);

  const BrandPanel = () => (
    <div className="hidden lg:flex lg:w-[55%] bg-primary flex-col justify-between p-12 relative overflow-hidden">
      {/* Decorative background circles */}
      <div className="absolute top-[-80px] right-[-80px] w-[320px] h-[320px] rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-[240px] h-[240px] rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-white/[0.03] pointer-events-none" />

      <div>
        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
          {t("dealerLoginPage.headline").split(". ").map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 ? "." : ""}<br /></span>
          ))}
        </h1>
        <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-sm">
          {t("dealerLoginPage.subheadline")}
        </p>

        {/* Feature list */}
        <ul className="space-y-4">
          {features.map(({ text }, i) => {
            const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
            return (
              <li key={text} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Icon size={16} className="text-white" />
                </div>
                <span className="text-white/85 text-sm">{text}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Manufacturer badges + footer */}
      <div>
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-3">
          {t("dealerLoginPage.manufacturersLabel")}
        </p>
        <div className="flex flex-wrap gap-2 mb-8">
          {MANUFACTURERS.map((m) => (
            <span
              key={m}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/15"
            >
              {m}
            </span>
          ))}
        </div>
        <p className="text-white/40 text-xs">
          © {new Date().getFullYear()} RV Claims Canada · {t("dealerLoginPage.footer")}
        </p>
      </div>
    </div>
  );

  // ─── Right form panel ─────────────────────────────────────────────────────────

  const renderOptions = () => (
    <div className="space-y-5">
      {/* Mobile logo */}
      <div className="lg:hidden mb-6">
        <img
          src={language === "en" ? logoEN : logoFR}
          alt="RV Claims Canada"
          style={{ height: "72px", width: "auto" }}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-primary mb-1">{t("dealerLoginPage.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("dealerLoginPage.subtitle")}
        </p>
      </div>

      {/* Social */}
      <div className="space-y-3 pt-1">
        <button
          onClick={() => handleSocialLogin("google")}
          className="w-full flex items-center px-4 py-3 bg-white border border-border rounded-lg font-medium text-foreground hover:bg-muted/40 transition-colors shadow-sm"
          data-testid="button-login-google"
        >
          <div className="w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
            <FontAwesomeIcon icon={faGoogle} className="w-5 h-5 text-[#4285F4]" />
          </div>
          <span className="flex-1 text-center">{t("dealerLoginPage.continueGoogle")}</span>
        </button>

        <button
          onClick={() => handleSocialLogin("linkedin")}
          className="w-full flex items-center px-4 py-3 bg-white border border-border rounded-lg font-medium text-foreground hover:bg-muted/40 transition-colors shadow-sm"
          data-testid="button-login-linkedin"
        >
          <div className="w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">
            <FontAwesomeIcon icon={faLinkedinIn} className="w-5 h-5 text-[#0A66C2]" />
          </div>
          <span className="flex-1 text-center">{t("dealerLoginPage.continueLinkedIn")}</span>
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-muted-foreground">{t("dealerLoginPage.orDivider")}</span>
        </div>
      </div>

      <button
        onClick={() => { setErrorMessage(null); setStep("email"); }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md"
        data-testid="button-login-email"
      >
        <Mail size={18} />
        {t("dealerLoginPage.continueEmail")}
      </button>

      <p className="text-xs text-muted-foreground text-center pt-2">
        {t("dealerLoginPage.credentialsNote")}
      </p>
    </div>
  );

  const renderEmailForm = () => (
    <div className="space-y-5">
      {/* Mobile logo */}
      <div className="lg:hidden mb-6">
        <img
          src={language === "en" ? logoEN : logoFR}
          alt="RV Claims Canada"
          style={{ height: "72px", width: "auto" }}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => { setStep("options"); setErrorMessage(null); }}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
          data-testid="button-back-to-options"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-primary">{t("dealerLoginPage.title")}</h2>
          <p className="text-xs text-muted-foreground">{t("dealerLoginPage.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4 pt-1">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            {t("dealerLoginPage.emailLabel")}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-background text-sm transition-shadow"
            placeholder={t("dealerLoginPage.emailPlaceholder")}
            required
            autoComplete="email"
            data-testid="input-email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              {t("dealerLoginPage.passwordLabel")}
            </label>
            <button type="button" className="text-xs text-primary hover:underline">
              {t("dealerLoginPage.forgotPassword")}
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary bg-background text-sm transition-shadow"
              placeholder={t("dealerLoginPage.passwordPlaceholder")}
              required
              autoComplete="current-password"
              data-testid="input-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-toggle-password"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <span className="text-destructive text-xs mt-0.5">●</span>
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
          data-testid="button-submit-email-login"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          {isSubmitting ? t("dealerLoginPage.submitting") : t("dealerLoginPage.submit")}
        </button>
      </form>

      {/* Trust indicator */}
      <div className="flex items-center justify-center gap-1.5 pt-2">
        <CheckCircle2 size={13} className="text-muted-foreground/60" />
        <span className="text-xs text-muted-foreground/60">{t("dealerLoginPage.encryption")}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      {/* Right panel */}
      <div className="flex-1 lg:w-[45%] flex flex-col bg-white">
        {/* Top bar — desktop only, shows nav logo + home link */}
        <div className="hidden lg:flex items-center justify-between px-10 py-5 border-b border-border/60">
          <img
            src={language === "en" ? logoEN : logoFR}
            alt="RV Claims Canada"
            style={{ height: "72px", width: "auto" }}
            data-testid="img-login-page-logo"
          />
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            data-testid="button-back-home"
          >
            ← Back to site
          </Link>
        </div>

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-border/60">
          {step !== "options" && (
            <button
              onClick={() => setStep("options")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <Link href="/" className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to site
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-14">
          <div className="w-full max-w-[400px]">
            {step === "options" && renderOptions()}
            {step === "email" && renderEmailForm()}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 lg:px-14 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            {t("dealerLoginPage.operatorPrompt")}{" "}
            <Link href="/operator" className="text-primary hover:underline">
              {t("dealerLoginPage.operatorLink")}
            </Link>
            {" · "}
            <Link href="/privacy-policy" className="hover:text-foreground transition-colors">
              {t("dealerLoginPage.privacyPolicy")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
