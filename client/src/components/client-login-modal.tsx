import { useState } from "react";
import { X, ArrowLeft, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import loginModalLogoImage from "@assets/Industrial Trapton Logo Design (1) (1)_1756859327359.png";

interface ClientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientLoginModal({ isOpen, onClose }: ClientLoginModalProps) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [loginMethod, setLoginMethod] = useState<'options' | 'email' | 'phone'>('options');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSocialLogin = (provider: string) => {
    // TODO: Integrate with actual OAuth providers
    console.log(`Login with ${provider}`);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement email login
    console.log('Email login:', { email, password });
  };

  const handlePhoneLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement phone login
    console.log('Phone login:', { phone, password });
  };

  const renderLoginOptions = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary mb-2">
          {t('clientLogin.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          Access your RV claims dashboard and manage your dealership account
        </p>
      </div>
      
      {/* Social Login Options */}
      <div className="space-y-3">
        <button
          onClick={() => handleSocialLogin('google')}
          className="w-full flex items-center justify-center px-4 py-3 bg-card border border-border rounded-lg font-medium text-foreground hover:bg-muted/50 transition-colors shadow-sm"
          data-testid="button-login-google"
        >
          <div className="flex items-center">
            <div className="w-6 h-6 flex items-center justify-center mr-4">
              <FontAwesomeIcon icon={faGoogle} className="w-5 h-5 text-primary" />
            </div>
            <span>Continue with Google</span>
          </div>
        </button>


        <button
          onClick={() => handleSocialLogin('linkedin')}
          className="w-full flex items-center justify-center px-4 py-3 bg-card border border-border rounded-lg font-medium text-foreground hover:bg-muted/50 transition-colors shadow-sm"
          data-testid="button-login-linkedin"
        >
          <div className="flex items-center">
            <div className="w-6 h-6 flex items-center justify-center mr-4">
              <FontAwesomeIcon icon={faLinkedinIn} className="w-5 h-5 text-primary" />
            </div>
            <span>Continue with LinkedIn</span>
          </div>
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Email and Phone Options */}
      <div className="space-y-3">
        <button
          onClick={() => setLoginMethod('email')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          data-testid="button-login-email"
        >
          <Mail size={20} />
          Continue with Email
        </button>

        <button
          onClick={() => setLoginMethod('phone')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          data-testid="button-login-phone"
        >
          <Phone size={20} />
          Continue with Phone
        </button>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-6">
        {t('clientLogin.credentialsNote')}
      </p>
    </div>
  );

  const renderEmailLogin = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setLoginMethod('options')}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
          data-testid="button-back-to-options"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-primary">
          {t('clientLogin.emailLogin')}
        </h2>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            placeholder="Enter your email"
            required
            data-testid="input-email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              placeholder="Enter your password"
              required
              data-testid="input-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-toggle-password"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          data-testid="button-submit-email-login"
        >
          Sign In
        </button>
      </form>
    </div>
  );

  const renderPhoneLogin = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setLoginMethod('options')}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
          data-testid="button-back-to-options-phone"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-primary">
          {t('clientLogin.phoneLogin')}
        </h2>
      </div>

      <form onSubmit={handlePhoneLogin} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
            placeholder="+1 (555) 123-4567"
            required
            data-testid="input-phone"
          />
        </div>

        <div>
          <label htmlFor="phone-password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="phone-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              placeholder="Enter your password"
              required
              data-testid="input-phone-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="button-toggle-phone-password"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          data-testid="button-submit-phone-login"
        >
          Sign In
        </button>
      </form>
    </div>
  );

  return (
    <div 
      className={`fixed inset-0 z-[10000] ${isMobile ? 'bg-white' : 'flex items-center justify-center p-4 bg-black/50'}`}
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh'
      }}
    >
      <div 
        className={`bg-background shadow-2xl w-full overflow-y-auto ${
          isMobile 
            ? 'h-full' 
            : 'rounded-xl max-w-md max-h-[85vh] border border-border'
        }`}
        data-testid="modal-client-login"
      >
        <div className={`sticky top-0 bg-background border-b border-border flex items-center justify-between ${
          isMobile ? 'p-4 pt-8' : 'p-4'
        }`}>
          <div className="flex items-center gap-3">
            {loginMethod !== 'options' && (
              <button
                onClick={() => setLoginMethod('options')}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
                data-testid="button-back-main"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <img 
              src={loginModalLogoImage} 
              alt="RV Claims" 
              className="h-6 w-auto max-w-[160px]" 
              data-testid="img-login-modal-logo"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
            data-testid="button-close-login-modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className={`${isMobile ? 'p-4 pb-8' : 'p-6'}`}>
          {loginMethod === 'options' && renderLoginOptions()}
          {loginMethod === 'email' && renderEmailLogin()}
          {loginMethod === 'phone' && renderPhoneLogin()}
        </div>
      </div>
    </div>
  );
}