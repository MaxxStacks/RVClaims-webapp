import { useState } from "react";
import { Menu, X, User, Building, Linkedin, Facebook, Youtube, Instagram, Twitter } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { LanguageToggle } from "@/components/language-toggle";
import headerLogoImage from "@assets/Industrial Trapton Logo Design (1) (1)_1756855580448.png";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();
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
          <div className="border-b border-border" style={{ backgroundColor: '#ffffff' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-[var(--header-height)]">
            <Link 
              href="/" 
              className="flex items-center"
              onClick={closeMenu}
              data-testid="link-pages-logo"
            >
              <img 
                src={headerLogoImage} 
                alt="RV Claims" 
                className="h-[var(--logo-height)] w-auto max-w-[280px]" 
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
            </div>
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

          {/* Login Section */}
          <div className="p-4 border-t-2 border-primary/20" style={{ backgroundColor: '#f8fafc' }}>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-0.5 text-left">{t('mobileMenu.loginHeading')}</h3>
              <p className="text-xs text-muted-foreground mb-3 text-left">{t('mobileMenu.loginSubtext')}</p>
              <div className="space-y-2">
                <a
                  href={`https://portal.rvclaims.ca/dealer/${language}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-primary/20 text-primary rounded-lg font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg group"
                  data-testid="button-dealer-login"
                >
                  <Building className="group-hover:scale-110 transition-transform" size={20} />
                  <span>{t('mobileMenu.dealer')}</span>
                </a>
                <a
                  href={`https://portal.rvclaims.ca/client/${language}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-xl group"
                  data-testid="button-client-login"
                >
                  <User className="group-hover:scale-110 transition-transform" size={20} />
                  <span>{t('mobileMenu.client')}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Social Media Icons */}
          <div className="px-6 py-3 border-t border-border" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex justify-center">
              <div className="flex gap-2">
                <a
                  href="#"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                  data-testid="link-social-linkedin"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                  data-testid="link-social-facebook"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                  data-testid="link-social-youtube"
                  aria-label="YouTube"
                >
                  <Youtube size={24} />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                  data-testid="link-social-instagram"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="#"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                  data-testid="link-social-twitter"
                  aria-label="Twitter"
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}