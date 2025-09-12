import { useState } from "react";
import { Menu, X, User, Building, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { LanguageToggle } from "@/components/language-toggle";
import mobileMenuLogoImage from "@assets/Industrial Trapton Logo Design (1) (1)_1756859327359.png";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const [location] = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const menuItems = [
    { href: "/about", label: t('navigation.about') },
    { href: "/services", label: t('navigation.services') },
    { href: "/claims-processing", label: t('navigation.claims') },
    { href: "/technology", label: t('navigation.technology') },
    { href: "/revenue-services", label: t('navigation.revenueServices') },
    { href: "/rv-coverage", label: t('navigation.rvCoverage') },
    { href: "/contact", label: t('navigation.contact') },
    { href: "/privacy-policy", label: t('privacyPolicyPage.title') }
  ];

  return (
    <>
      {/* Hamburger Button - Visible on all devices */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
        data-testid="button-pages-menu"
        aria-label="Open pages menu"
      >
        <Menu size={24} />
      </button>


      {/* Side Menu - Visible on ALL devices when open */}
      <div
        className={`fixed top-0 right-0 h-full w-80 border-l-2 border-primary/20 shadow-2xl transform transition-transform duration-300 ease-in-out z-[9999] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        data-testid="menu-pages-side"
        style={{ 
          backgroundColor: '#ffffff',
          background: '#ffffff'
        }}
      >
        <div className="flex flex-col h-full" style={{ backgroundColor: '#ffffff' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border" style={{ backgroundColor: '#ffffff' }}>
            <Link 
              href="/" 
              className="flex items-center"
              onClick={closeMenu}
              data-testid="link-pages-logo"
            >
              <img 
                src={mobileMenuLogoImage} 
                alt="RV Claims" 
                className="h-8 w-auto max-w-[200px]" 
                data-testid="img-mobile-menu-logo"
              />
            </Link>
            <button
              onClick={closeMenu}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
              data-testid="button-close-pages-menu"
              aria-label="Close pages menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 px-6 py-2 space-y-0.5" style={{ backgroundColor: '#ffffff' }}>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  location === item.href
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-primary/10 hover:text-primary hover:pl-6'
                }`}
                data-testid={`link-pages-${item.href.slice(1)}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Dealer Login Button */}
          <div className="px-6 py-3 border-t border-border" style={{ backgroundColor: '#ffffff' }}>
            <Link
              href="#"
              onClick={closeMenu}
              className="w-full flex items-center justify-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-all duration-200 shadow-sm hover:shadow-md mb-2"
              data-testid="button-dealer-login"
            >
              <Building className="mr-2" size={20} />
              {t('mobileMenu.dealerLogin')}
            </Link>
            <Link
              href="/client-login"
              onClick={closeMenu}
              className="w-full flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
              data-testid="button-client-login"
            >
              <User className="mr-2" size={20} />
              {t('mobileMenu.clientLogin')}
            </Link>
          </div>

          {/* Social Media Icons */}
          <div className="px-6 py-3 border-t border-border" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex justify-center">
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  data-testid="link-social-facebook"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  data-testid="link-social-linkedin"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  data-testid="link-social-twitter"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  data-testid="link-social-instagram"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}