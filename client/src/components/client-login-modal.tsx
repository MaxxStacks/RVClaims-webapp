import { useState } from "react";
import { X, ArrowLeft, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface ClientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClientLoginModal({ isOpen, onClose }: ClientLoginModalProps) {
  const { t } = useLanguage();
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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center text-foreground mb-6">
        {t('clientLogin.title')}
      </h2>
      
      {/* Social Login Options */}
      <div className="space-y-3">
        <button
          onClick={() => handleSocialLogin('google')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-border rounded-lg font-medium text-foreground hover:bg-gray-50 transition-colors"
          data-testid="button-login-google"
        >
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>
          Continue with Google
        </button>

        <button
          onClick={() => handleSocialLogin('facebook')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-lg font-medium hover:bg-[#166FE5] transition-colors"
          data-testid="button-login-facebook"
        >
          <div className="w-5 h-5 bg-white rounded text-[#1877F2] text-xs font-bold flex items-center justify-center">f</div>
          Continue with Facebook
        </button>

        <button
          onClick={() => handleSocialLogin('linkedin')}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0A66C2] text-white rounded-lg font-medium hover:bg-[#095AA6] transition-colors"
          data-testid="button-login-linkedin"
        >
          <div className="w-5 h-5 bg-white rounded text-[#0A66C2] text-xs font-bold flex items-center justify-center">in</div>
          Continue with LinkedIn
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-muted-foreground">Or continue with</span>
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
        <h2 className="text-xl font-bold text-foreground">
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
        <h2 className="text-xl font-bold text-foreground">
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
              className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4" 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto"
        style={{ 
          backgroundColor: '#ffffff',
          position: 'relative'
        }}
        data-testid="modal-client-login"
      >
        <div className="sticky top-0 bg-white border-b border-border p-4 flex items-center justify-between">
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
            <h1 className="text-lg font-bold gradient-text">RVClaimTrack</h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
            data-testid="button-close-login-modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loginMethod === 'options' && renderLoginOptions()}
          {loginMethod === 'email' && renderEmailLogin()}
          {loginMethod === 'phone' && renderPhoneLogin()}
        </div>
      </div>
    </div>
  );
}