import { useState, FormEvent } from "react";
import { Menu, X, User, Building, Linkedin, Facebook, Youtube, Instagram, Twitter, ChevronRight, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { LanguageToggle } from "@/components/language-toggle";
import { useToast } from "@/hooks/use-toast";
import logoEN from "@assets/rvclaims_logo_en_1761203145359.png";
import logoFR from "@assets/rvclaims_logo_fr_1761203145359.png";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const { toast } = useToast();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setExpandedMenu(null);
  };

  const searchableContent = [
    { title: t('mainServices.claims.title'), description: 'A-Z warranty claims management', path: '/claims-processing', keywords: ['warranty', 'claims', 'processing', 'management'] },
    { title: t('mainServices.financing.title'), description: 'Flexible financing solutions', path: '/financing', keywords: ['financing', 'finance', 'payment', 'loan'] },
    { title: t('mainServices.warranty.title'), description: 'Extended warranty programs', path: '/warranty', keywords: ['warranty', 'extended', 'protection', 'coverage'] },
    { title: t('mainServices.fi.title'), description: 'F&I services and solutions', path: '/fi-services', keywords: ['f&i', 'finance', 'insurance', 'services'] },
    { title: t('navigation.aboutUs'), description: 'Learn about RV Claims Canada', path: '/about', keywords: ['about', 'company', 'team', 'history'] },
    { title: t('navigation.contact'), description: 'Get in touch with us', path: '/contact', keywords: ['contact', 'email', 'phone', 'reach'] },
  ];

  const [searchResults, setSearchResults] = useState<typeof searchableContent>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    
    if (value.trim().length > 0) {
      const query = value.toLowerCase();
      const results = searchableContent.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
      setSearchResults(results);
      setShowResults(true);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // Form submission already handled by real-time search
  };

  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenu(expandedMenu === menuKey ? null : menuKey);
  };

  const mainServicesItems = [
    { href: "/claims-processing", label: t('mainServices.claims.title'), desc: "A-Z warranty claims" },
    { href: "/financing-services", label: t('mainServices.financing.title'), desc: "Dealership financing" },
    { href: "/warranty-extended-services", label: t('mainServices.warranty.title'), desc: "Protection packages" },
    { href: "/fi-services", label: t('mainServices.fiServices.title'), desc: "F&I solutions" }
  ];

  const supportingServicesItems = [
    { href: "/parts", label: t('navigation.parts'), desc: "Parts & components" },
    { href: "/marketing-services", label: t('navigation.marketing'), desc: "Digital marketing" },
    { href: "/consignment-services", label: t('navigation.consignment'), desc: "Trade-in programs" }
  ];

  const findDealerItems = [
    { href: "/roadside-assistance", label: t('navigation.roadsideAssistance'), desc: "24/7 support" },
    { href: "/extended-warranty", label: t('navigation.extendedWarranty'), desc: "Protection plans" },
    { href: "/protection-plans", label: t('navigation.protectionPlans'), desc: "Coverage options" }
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
        className={`fixed top-0 right-0 h-screen w-96 border-l-2 border-primary/20 shadow-2xl transform transition-transform duration-300 ease-in-out z-[9999] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        data-testid="menu-pages-side"
        style={{ 
          backgroundColor: '#ffffff',
          background: '#ffffff'
        }}
      >
        <div className="flex flex-col h-screen" style={{ backgroundColor: '#ffffff' }}>
          {/* Logo Row - Mobile Only */}
          <div className="md:hidden border-b border-border/50" style={{ backgroundColor: '#ffffff' }}>
            <div className="px-4 sm:px-6">
              <div className="flex justify-between items-center py-3">
                <Link href="/" onClick={closeMenu} className="flex items-center hover:opacity-90 transition-opacity">
                  <img 
                    src={language === 'en' ? logoEN : logoFR} 
                    alt="RV Claims Canada" 
                    className="h-16 w-auto max-w-[400px]" 
                    style={{ imageRendering: '-webkit-optimize-contrast' }}
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Search Header */}
          <div className="border-b border-border/50" style={{ backgroundColor: '#ffffff' }}>
            <div className="px-4 sm:px-6">
              <div className="flex justify-between items-center h-14 gap-4">
                <div className="relative flex-1">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      placeholder={t('navigation.searchPlaceholder')}
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      data-testid="input-search"
                    />
                  </form>
                  
                  {/* Search Results Dropdown */}
                  {showResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <>
                          <div className="px-4 py-2 border-b border-border bg-gray-50">
                            <p className="text-xs text-muted-foreground">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found</p>
                          </div>
                          {searchResults.map((result, index) => (
                            <Link
                              key={index}
                              href={result.path}
                              onClick={() => {
                                setShowResults(false);
                                setSearchQuery("");
                                closeMenu();
                              }}
                              className="block px-4 py-3 hover:bg-primary/5 border-b border-border/50 last:border-b-0 transition-colors"
                              data-testid={`link-search-result-${index}`}
                            >
                              <div className="font-medium text-sm text-foreground">{result.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">{result.description}</div>
                            </Link>
                          ))}
                        </>
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2.5 rounded-md bg-primary hover:bg-primary/90 transition-all duration-200"
                  data-testid="button-close-pages-menu"
                  aria-label="Close pages menu"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div 
            className="flex-1 px-6 py-4 space-y-1" 
            style={{ 
              backgroundColor: '#f8fafc'
            }}
          >
            {/* Main Services with Submenu */}
            <div>
              <button
                onClick={() => toggleSubmenu('mainServices')}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-base font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                style={{ color: '#1e293b' }}
                data-testid="button-main-services"
              >
                <span>{t('navigation.mainServices')}</span>
                <ChevronRight size={16} className={`transition-transform ${expandedMenu === 'mainServices' ? 'rotate-90' : ''}`} />
              </button>
              {expandedMenu === 'mainServices' && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {mainServicesItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="block px-4 py-2 rounded-lg text-sm hover:bg-primary/5 hover:text-primary transition-colors"
                      data-testid={`link-${item.href.slice(1)}`}
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Supporting Services with Submenu */}
            <div>
              <button
                onClick={() => toggleSubmenu('supportingServices')}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-base font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                style={{ color: '#1e293b' }}
                data-testid="button-supporting-services"
              >
                <span>{t('navigation.supportingServices')}</span>
                <ChevronRight size={16} className={`transition-transform ${expandedMenu === 'supportingServices' ? 'rotate-90' : ''}`} />
              </button>
              {expandedMenu === 'supportingServices' && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {supportingServicesItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="block px-4 py-2 rounded-lg text-sm hover:bg-primary/5 hover:text-primary transition-colors"
                      data-testid={`link-${item.href.slice(1)}`}
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Find a Dealer with Submenu */}
            <div>
              <button
                onClick={() => toggleSubmenu('findDealer')}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-base font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                style={{ color: '#1e293b' }}
                data-testid="button-find-dealer"
              >
                <span>{t('navigation.findDealer')}</span>
                <ChevronRight size={16} className={`transition-transform ${expandedMenu === 'findDealer' ? 'rotate-90' : ''}`} />
              </button>
              {expandedMenu === 'findDealer' && (
                <div className="ml-4 mt-1 space-y-0.5">
                  {findDealerItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className="block px-4 py-2 rounded-lg text-sm hover:bg-primary/5 hover:text-primary transition-colors"
                      data-testid={`link-${item.href.slice(1)}`}
                    >
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Standalone Items */}
            <Link
              href="/about"
              onClick={closeMenu}
              className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                location === '/about'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary hover:pl-6'
              }`}
              data-testid="link-pages-about"
            >
              {t('navigation.about')}
            </Link>

            <Link
              href="/contact"
              onClick={closeMenu}
              className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                location === '/contact'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary hover:pl-6'
              }`}
              data-testid="link-pages-contact"
            >
              {t('navigation.contact')}
            </Link>

            <Link
              href="/privacy-policy"
              onClick={closeMenu}
              className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                location === '/privacy-policy'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary hover:pl-6'
              }`}
              data-testid="link-pages-privacy-policy"
            >
              {t('privacyPolicyPage.title')}
            </Link>

            <Link
              href="/live-auctions"
              onClick={closeMenu}
              className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                location === '/live-auctions'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary hover:pl-6'
              }`}
              data-testid="link-pages-live-auctions"
            >
              {t('navigation.liveAuctions')}
            </Link>

            <Link
              href="/contact"
              onClick={closeMenu}
              className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                location === '/careers'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary hover:pl-6'
              }`}
              data-testid="link-pages-careers"
            >
              {t('navigation.careers')}
            </Link>
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
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                  data-testid="link-social-linkedin"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                  data-testid="link-social-facebook"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a
                  href="https://www.youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                  data-testid="link-social-youtube"
                  aria-label="YouTube"
                >
                  <Youtube size={24} />
                </a>
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                  data-testid="link-social-instagram"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://www.twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
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
