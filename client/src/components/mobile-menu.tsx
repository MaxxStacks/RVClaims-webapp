import { useState, FormEvent } from "react";
import logoLight from "@assets/DS360_logo_light.png";
import { Menu, X, Building, User, Gavel, Linkedin, Facebook, Youtube, Instagram, Twitter, ChevronRight, Search } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { LanguageToggle } from "@/components/language-toggle";
import { ServiceBadge } from "@/components/service-badge";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  const [location] = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => {
    setIsOpen(false);
    setExpandedMenu(null);
  };

  const toggleSubmenu = (menuKey: string) => {
    setExpandedMenu(expandedMenu === menuKey ? null : menuKey);
  };

  // Search index
  const searchableContent = [
    { title: "Claims Processing", path: "/claims-processing" },
    { title: "Financing Services", path: "/financing" },
    { title: "F&I Services", path: "/fi-services" },
    { title: "Warranty & Extended Service", path: "/warranty-plans" },
    { title: "Revenue Services", path: "/revenue-services" },
    { title: "RV Coverage", path: "/rv-types" },
    { title: "TechFlow", path: "/services/techflow" },
    { title: "On-Site Repairs", path: "/on-site-repairs" },
    { title: "Roadside Assistance", path: "/roadside-assistance" },
    { title: "Parts & Components", path: "/parts-components" },
    { title: "Marketing Services", path: "/marketing-services" },
    { title: "Consignment Services", path: "/consignment-services" },
    { title: "AI F&I Presenter", path: "/ai-fi-presenter" },
    { title: "GAP Insurance", path: "/gap-insurance" },
    { title: "Extended Warranty", path: "/extended-warranty" },
    { title: "Protection Plans", path: "/protection-plans" },
    { title: "Appearance Protection", path: "/appearance-protection" },
    { title: "Tire & Wheel", path: "/tire-wheel" },
    { title: "Roadside & Travel Protection", path: "/roadside-travel-protection" },
    { title: "Specialty Protection", path: "/specialty-protection" },
    { title: "Dealer Exchange", path: "/dealer-exchange" },
    { title: "Live Auctions", path: "/live-auctions" },
    { title: "Bidder Portal", path: "/bidder-portal" },
    { title: "Technology", path: "/technology" },
    { title: "Technology Platform", path: "/technology-platform" },
    { title: "Dealer Portal", path: "/dealer-portal" },
    { title: "Client Portal", path: "/client-portal" },
    { title: "Mobile App", path: "/mobile-app" },
    { title: "Revenue Optimization", path: "/revenue-optimization" },
    { title: "Free Dealer Analysis", path: "/free-dealer-analysis" },
    { title: "About Us", path: "/about" },
    { title: "Careers", path: "/careers" },
    { title: "Partnerships", path: "/partnerships" },
    { title: "Testimonials", path: "/testimonials" },
    { title: "Pricing", path: "/pricing" },
    { title: "Contact", path: "/contact" },
    { title: "Sign Up", path: "/sign-up" },
    { title: "Claim Guides", path: "/claim-guides" },
    { title: "Industry Reports", path: "/industry-reports" },
    { title: "Webinars", path: "/webinars" },
    { title: "Knowledge Base", path: "/knowledge-base" },
    { title: "Dealer Training", path: "/dealer-training" },
    { title: "Help Center", path: "/help-center" },
    { title: "Documentation", path: "/documentation" },
    { title: "API Access", path: "/api-access" },
    { title: "System Status", path: "/system-status" },
    { title: "Dealer Integration", path: "/dealer-integration" },
    { title: "Expert Consultation", path: "/expert-consultation" },
  ];

  const [searchResults, setSearchResults] = useState<typeof searchableContent>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length > 0) {
      const q = value.toLowerCase();
      setSearchResults(searchableContent.filter(item => item.title.toLowerCase().includes(q)));
      setShowResults(true);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const handleSearch = (e: FormEvent) => { e.preventDefault(); };

  const servicesItems = [
    { href: "/claims-processing", label: "Claims Processing", desc: "A-Z warranty claims management" },
    { href: "/financing", label: "Financing Services", desc: "Dealership financing support", badge: "Q2" },
    { href: "/warranty-plans", label: "Warranty & Extended Service", desc: "Protection packages", badge: "Q2" },
    { href: "/fi-services", label: "F&I Services", desc: "Finance & Insurance solutions", badge: "Q2" },
    { href: "/revenue-services", label: "Revenue Services", desc: "Marketing, parts & trade-in", badge: "Q3" },
    { href: "/rv-types", label: "RV Coverage", desc: "10 RV types, all manufacturers" },
    { href: "/services/techflow", label: "TechFlow", desc: "Service department workflow", badge: "Q3" },
    { href: "/on-site-repairs", label: "On-Site Repairs", desc: "Technician dispatched to location", badge: "Q3" },
    { href: "/roadside-assistance", label: "Roadside Assistance", desc: "24/7 emergency towing", badge: "Q4" },
    { href: "/parts-components", label: "Parts & Components", desc: "Inventory & accessories", badge: "Q3" },
    { href: "/marketing-services", label: "Marketing Services", desc: "Digital marketing & lead gen", badge: "Q3" },
    { href: "/consignment-services", label: "Consignment Services", desc: "Trade-in & consignment programs", badge: "Q3" },
    { href: "/ai-fi-presenter", label: "AI F&I Presenter", desc: "Live AI video sales tool", badge: "Q4" },
  ];

  const productsItems = [
    { href: "/gap-insurance", label: "GAP Insurance", desc: "Guaranteed asset protection" },
    { href: "/extended-warranty", label: "Extended Warranty", desc: "Post-OEM coverage plans" },
    { href: "/protection-plans", label: "Protection Plans", desc: "Comprehensive coverage bundles" },
    { href: "/appearance-protection", label: "Appearance Protection", desc: "Paint, fabric & interior shield" },
    { href: "/tire-wheel", label: "Tire & Wheel", desc: "Road hazard protection" },
    { href: "/roadside-travel-protection", label: "Roadside & Travel Protection", desc: "Emergency travel protection" },
    { href: "/specialty-protection", label: "Specialty Protection", desc: "Slideout, awning & more" },
  ];

  const marketplaceItems = [
    { href: "/dealer-exchange", label: "Dealer Exchange", desc: "Dealer-to-dealer inventory network" },
    { href: "/live-auctions", label: "Live Auctions", desc: "Monthly 48-hour public auctions", badge: "Q3" },
    { href: "/bidder-portal", label: "Bidder Portal", desc: "Register & bid on units" },
  ];

  const platformItems = [
    { href: "/technology", label: "Technology", desc: "AI-powered platform overview" },
    { href: "/technology-platform", label: "Technology Platform", desc: "Platform architecture & integrations" },
    { href: "/dealer-portal", label: "Dealer Portal", desc: "Dealer-facing dashboard" },
    { href: "/client-portal", label: "Client Portal", desc: "Customer-facing portal" },
    { href: "/mobile-app", label: "Mobile App", desc: "iOS & Android app" },
    { href: "/revenue-optimization", label: "Revenue Optimization", desc: "Maximize claim revenue" },
    { href: "/free-dealer-analysis", label: "Free Dealer Analysis", desc: "No-cost performance audit" },
  ];

  const companyItems = [
    { href: "/about", label: "About Us" },
    { href: "/careers", label: "Careers" },
    { href: "/partnerships", label: "Partnerships" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
    { href: "/sign-up", label: "Sign Up" },
  ];

  const resourcesItems = [
    { href: "/claim-guides", label: "Claim Guides" },
    { href: "/industry-reports", label: "Industry Reports" },
    { href: "/webinars", label: "Webinars" },
    { href: "/knowledge-base", label: "Knowledge Base" },
    { href: "/dealer-training", label: "Dealer Training" },
  ];

  const supportItems = [
    { href: "/help-center", label: "Help Center" },
    { href: "/documentation", label: "Documentation" },
    { href: "/api-access", label: "API Access" },
    { href: "/system-status", label: "System Status" },
    { href: "/dealer-integration", label: "Dealer Integration" },
    { href: "/expert-consultation", label: "Expert Consultation" },
  ];

  type NavCategory = {
    key: string;
    label: string;
    items: Array<{ href: string; label: string; desc?: string; badge?: string }>;
  };

  const categories: NavCategory[] = [
    { key: "services", label: "DS360 Services", items: servicesItems },
    { key: "products", label: "DS360 Products", items: productsItems },
    { key: "marketplace", label: "Marketplace", items: marketplaceItems },
    { key: "platform", label: "Platform", items: platformItems },
    { key: "company", label: "Company", items: companyItems },
    { key: "resources", label: "Resources", items: resourcesItems },
    { key: "support", label: "Support", items: supportItems },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors"
        data-testid="button-pages-menu"
        aria-label="Open pages menu"
      >
        <Menu size={24} />
      </button>

      {/* Side Menu */}
      <div
        className={`fixed top-0 right-0 h-screen w-96 max-w-[95vw] border-l-2 border-primary/20 shadow-2xl transform transition-transform duration-300 ease-in-out z-[9999] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        data-testid="menu-pages-side"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="flex flex-col h-screen" style={{ backgroundColor: '#ffffff' }}>
          {/* Logo Row - Mobile Only */}
          <div className="md:hidden border-b border-border/50" style={{ backgroundColor: '#ffffff' }}>
            <div className="px-4 sm:px-6">
              <div className="flex justify-between items-center py-1">
                <Link href="/" onClick={closeMenu} className="flex items-center hover:opacity-90 transition-opacity">
                  <img src={logoLight} alt="Dealer Suite 360" className="h-[54px] w-auto" />
                </Link>
              </div>
            </div>
          </div>

          {/* Search Header */}
          <div className="border-b border-border/50" style={{ backgroundColor: '#ffffff' }}>
            <div className="px-4 sm:px-6">
              <div className="flex justify-between items-center min-h-[72px] py-3 gap-4">
                <div className="relative flex-1">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      placeholder="Search pages..."
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      data-testid="input-search"
                    />
                  </form>
                  {showResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        searchResults.map((result, i) => (
                          <Link
                            key={i}
                            href={result.path}
                            onClick={() => { setShowResults(false); setSearchQuery(""); closeMenu(); }}
                            className="block px-4 py-2.5 hover:bg-primary/5 border-b border-border/50 last:border-b-0 transition-colors"
                          >
                            <div className="font-medium text-sm text-foreground">{result.title}</div>
                          </Link>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-center">
                          <p className="text-sm text-muted-foreground">No results for "{searchQuery}"</p>
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

          {/* Menu Items — scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1" style={{ backgroundColor: '#f8fafc' }}>
            {categories.map((cat) => (
              <div key={cat.key}>
                <button
                  onClick={() => toggleSubmenu(cat.key)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                  style={{ color: '#1e293b' }}
                  data-testid={`button-cat-${cat.key}`}
                >
                  <span>{cat.label}</span>
                  <ChevronRight size={15} className={`transition-transform flex-shrink-0 ${expandedMenu === cat.key ? 'rotate-90' : ''}`} />
                </button>
                {expandedMenu === cat.key && (
                  <div className="ml-3 mt-0.5 space-y-0.5">
                    {cat.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className={`block px-4 py-2 rounded-lg text-sm hover:bg-primary/5 hover:text-primary transition-colors ${location === item.href ? 'bg-primary/5 text-primary' : 'text-foreground'}`}
                        data-testid={`link-menu-${item.href.replace(/\//g, '-').slice(1)}`}
                      >
                        <div className="font-medium flex items-center gap-2 flex-wrap">
                          {item.label}
                          {item.badge && <ServiceBadge quarter={item.badge as any} />}
                        </div>
                        {item.desc && <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Login Section */}
          <div className="px-4 pt-3 pb-2 border-t-2 border-primary/20 flex-shrink-0" style={{ backgroundColor: '#f8fafc' }}>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-3">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-0.5">{t('mobileMenu.loginHeading')}</h3>
              <p className="text-xs text-muted-foreground mb-2">{t('mobileMenu.loginSubtext')}</p>
              <div className="grid grid-cols-3 gap-1.5">
                <Link href="/client-login" onClick={closeMenu} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all" data-testid="button-dealer-login">
                  <Building size={14} />
                  <span>Dealer</span>
                </Link>
                <Link href="/client" onClick={closeMenu} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-card text-foreground border border-border rounded-lg text-xs font-semibold hover:bg-primary/5 hover:border-primary/40 transition-all" data-testid="button-client-portal">
                  <User size={14} />
                  <span>Client</span>
                </Link>
                <Link href="/bidder" onClick={closeMenu} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-card text-foreground border border-border rounded-lg text-xs font-semibold hover:bg-primary/5 hover:border-primary/40 transition-all" data-testid="button-bidder-portal">
                  <Gavel size={14} />
                  <span>Bidder</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Social + Language */}
          <div className="px-4 py-2.5 border-t border-border flex-shrink-0 flex items-center justify-between" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex gap-1">
              {[
                { href: "https://www.linkedin.com", icon: <Linkedin size={18} />, label: "LinkedIn" },
                { href: "https://www.facebook.com", icon: <Facebook size={18} />, label: "Facebook" },
                { href: "https://www.youtube.com", icon: <Youtube size={20} />, label: "YouTube" },
                { href: "https://www.instagram.com", icon: <Instagram size={18} />, label: "Instagram" },
                { href: "https://www.twitter.com", icon: <Twitter size={18} />, label: "Twitter" },
              ].map(({ href, icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center">
                  {icon}
                </a>
              ))}
            </div>
            <LanguageToggle />
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[9998]"
          onClick={closeMenu}
        />
      )}
    </>
  );
}
