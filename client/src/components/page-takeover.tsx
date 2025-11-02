import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toyHaulerImage from "@assets/generated_images/Modern_luxury_toy_hauler_2050a416.png";

interface PageTakeoverProps {
  delay?: number; // Delay in milliseconds before showing
  storageKey?: string; // localStorage key for tracking dismissal
  dismissalDays?: number; // Number of days before showing again
  children: React.ReactNode;
}

export function PageTakeover({ 
  delay = 5000, 
  storageKey = "page-takeover-dismissed",
  dismissalDays = 7,
  children 
}: PageTakeoverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Check if popup was previously dismissed
    const dismissedUntil = localStorage.getItem(storageKey);
    if (dismissedUntil) {
      const dismissedDate = new Date(dismissedUntil);
      if (new Date() < dismissedDate) {
        return; // Don't show if still within dismissal period
      }
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setShouldRender(true);
      // Small additional delay for animation
      setTimeout(() => setIsVisible(true), 50);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, storageKey]);

  useEffect(() => {
    // Lock body scroll when modal is visible
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  useEffect(() => {
    // ESC key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  const handleClose = () => {
    // Set dismissal date in localStorage
    const dismissalDate = new Date();
    dismissalDate.setDate(dismissalDate.getDate() + dismissalDays);
    localStorage.setItem(storageKey, dismissalDate.toISOString());

    // Trigger exit animation
    setIsVisible(false);
    setTimeout(() => setShouldRender(false), 300);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking the overlay itself, not the modal content
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center px-4 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleOverlayClick}
      data-testid="page-takeover-overlay"
    >
      {/* Overlay Background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Container */}
      <div
        className={`relative bg-white rounded-lg max-w-4xl w-full overflow-hidden shadow-2xl transition-all duration-300 ease-out ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
        data-testid="page-takeover-modal"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 transition-all duration-200 shadow-md hover:shadow-lg"
          aria-label="Close popup"
          data-testid="button-close-takeover"
        >
          <X size={24} />
        </button>

        {/* Modal Content */}
        {children}
      </div>
    </div>
  );
}

// Sample content component for demonstration
export function SamplePromoContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5">
      {/* Left Column - 60% */}
      <div className="md:col-span-3 p-12">
        {/* Badge */}
        <div className="inline-block mb-6">
          <span className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full">
            Limited Time Offer
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Spring RV Season Special
        </h2>

        {/* Bullet Points */}
        <ul className="space-y-4 mb-8">
          <li className="flex items-start text-lg text-gray-700">
            <span className="text-primary mr-3 mt-1">✓</span>
            <span>Free claims assessment for all new clients</span>
          </li>
          <li className="flex items-start text-lg text-gray-700">
            <span className="text-primary mr-3 mt-1">✓</span>
            <span>Expert bilingual support in English & French</span>
          </li>
          <li className="flex items-start text-lg text-gray-700">
            <span className="text-primary mr-3 mt-1">✓</span>
            <span>90% authorization rate on warranty claims</span>
          </li>
        </ul>

        {/* CTA Button */}
        <button className="w-full bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg">
          Get Started Today
        </button>

        {/* Fine Print */}
        <p className="text-sm text-gray-500 mt-4 text-center">
          Offer valid until June 30, 2025. Terms and conditions apply.
        </p>
      </div>

      {/* Right Column - 40% (Image) */}
      <div className="md:col-span-2 relative min-h-[400px] md:min-h-0">
        <img 
          src={toyHaulerImage} 
          alt="Modern Toy Hauler RV" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            imageRendering: 'crisp-edges',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}
        />
      </div>
    </div>
  );
}
