import { useLanguage } from "@/hooks/use-language";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { ServiceBadge } from "@/components/service-badge";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import logoLight from "@assets/DS360_logo_light.png";

export function Navigation() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      {/* Top Row - Logo and Action Buttons */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-1">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" data-testid="link-logo">
              <img src={logoLight} alt="Dealer Suite 360" className="h-[60px] w-auto" data-testid="img-header-logo" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/client-login"
                className="hidden lg:block text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-dealer-login-top"
              >
                {t('navigation.dealerLogin')}
              </Link>
              <Link href="/book-demo" className="hidden lg:block">
                <button
                  className="px-4 py-2 border border-primary text-primary text-sm font-semibold rounded-lg hover:bg-primary/10 transition-colors"
                  data-testid="button-book-demo"
                >
                  {t('navigation.bookDemo')}
                </button>
              </Link>
              <Link href="/sign-up">
                <button
                  className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
                  data-testid="button-sign-up"
                >
                  {t('navigation.signUp')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Full Menu Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">

            {/* Home */}
            <Link
              href="/"
              className={`text-sm transition-colors py-2 ${location === '/' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-home-nav"
            >
              Home
            </Link>

            {/* About */}
            <Link
              href="/about"
              className={`text-sm transition-colors py-2 ${location === '/about' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-about-nav"
            >
              {t('navigation.about')}
            </Link>

            {/* Services Dropdown — 2-column mega-menu */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <div className="flex items-center gap-0.5">
                <Link
                  href="/services"
                  className={`text-sm text-muted-foreground hover:text-foreground transition-colors py-2 ${location === '/services' ? 'text-foreground font-medium' : ''}`}
                  data-testid="link-services-nav"
                >
                  {t('navigation.services')}
                </Link>
                <button
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors py-2 px-1"
                  data-testid="button-services-dropdown"
                  onClick={() => setServicesOpen(!servicesOpen)}
                >
                  <ChevronDown size={16} className={`transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-[680px] bg-white border border-border rounded-lg shadow-xl py-3 z-50">
                  <div className="grid grid-cols-2">
                    {/* Column 1: Core Services */}
                    <div className="border-r border-border/50">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 pt-3 pb-1">
                        Core Services
                      </div>
                      <Link href="/claims-processing" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-claims-processing">
                        <div className="font-medium">Claims Processing</div>
                        <div className="text-xs text-muted-foreground mt-0.5">A-Z warranty claims management</div>
                      </Link>
                      <Link href="/financing" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-financing-services">
                        <div className="font-medium flex items-center gap-2">{t('mainServices.financing.title')} <ServiceBadge quarter="Q2" /></div>
                        <div className="text-xs text-muted-foreground mt-0.5">Dealership financing support</div>
                      </Link>
                      <Link href="/fi-services" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-fi-services">
                        <div className="font-medium flex items-center gap-2">{t('mainServices.fiServices.title')} <ServiceBadge quarter="Q2" /></div>
                        <div className="text-xs text-muted-foreground mt-0.5">Finance &amp; Insurance solutions</div>
                      </Link>
                      <Link href="/warranty-plans" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-warranty-extended">
                        <div className="font-medium flex items-center gap-2">Warranty &amp; Extended Service <ServiceBadge quarter="Q2" /></div>
                        <div className="text-xs text-muted-foreground mt-0.5">Protection packages</div>
                      </Link>
                      <Link href="/revenue-services" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-revenue-services">
                        <div className="font-medium flex items-center gap-2">{t('navigation.revenueServices')} <ServiceBadge quarter="Q3" /></div>
                        <div className="text-xs text-muted-foreground mt-0.5">Marketing, parts &amp; trade-in</div>
                      </Link>
                      <Link href="/rv-types" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-rv-types">
                        <div className="font-medium">RV Coverage</div>
                        <div className="text-xs text-muted-foreground mt-0.5">10 RV types, all manufacturers</div>
                      </Link>
                    </div>

                    {/* Column 2: Supporting Services */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 pt-3 pb-1">
                        Supporting Services
                      </div>
                      <Link href="/parts-components" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-parts-components">
                        <div className="font-medium flex items-center gap-2">Parts &amp; Components <ServiceBadge quarter="Q3" /></div>
                        <div className="text-xs text-muted-foreground mt-0.5">Inventory &amp; accessories</div>
                      </Link>
                      <Link href="/marketing-services" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-marketing-services">
                        <div className="font-medium flex items-center gap-2">Marketing Services <ServiceBadge quarter="Q3" /></div>
                        <div className="text-xs text-muted-foreground mt-0.5">Digital marketing &amp; lead gen</div>
                      </Link>
                      <Link href="/consignment-services" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-consignment-services">
                        <div className="font-medium flex items-center gap-2">Consignment Services <ServiceBadge quarter="Q3" /></div>
                        <div className="text-xs text-muted-foreground mt-0.5">Trade-in &amp; consignment programs</div>
                      </Link>
                      <Link href="/services/techflow" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-techflow">
                        <div className="font-medium flex items-center gap-2">TechFlow <ServiceBadge quarter="Q3" /></div>
                        <div className="text-xs text-muted-foreground mt-0.5">Service department workflow</div>
                      </Link>
                      <Link href="/on-site-repairs" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-on-site-repairs">
                        <div className="font-medium flex items-center gap-2">{t('navigation.onSiteRepairs')} <ServiceBadge quarter="Q3" /></div>
                        <div className="text-xs text-muted-foreground mt-0.5">Technician dispatched to location</div>
                      </Link>
                      <Link href="/roadside-assistance" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-roadside-assistance">
                        <div className="font-medium flex items-center gap-2">{t('navigation.roadsideAssistance')} <ServiceBadge quarter="Q4" /></div>
                        <div className="text-xs text-muted-foreground mt-0.5">24/7 emergency towing &amp; support</div>
                      </Link>
                      <Link href="/ai-fi-presenter" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-ai-fi-presenter">
                        <div className="font-medium flex items-center gap-2">AI F&amp;I Presenter <ServiceBadge quarter="Q4" /></div>
                        <div className="text-xs text-muted-foreground mt-0.5">Live AI video sales tool</div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Products Dropdown — 2-column mega-menu */}
            <div
              className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <div className="flex items-center gap-0.5">
                <Link
                  href="/fi-services"
                  className={`text-sm text-muted-foreground hover:text-foreground transition-colors py-2`}
                  data-testid="link-products-nav"
                >
                  Products
                </Link>
                <button
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors py-2 px-1"
                  data-testid="button-products-dropdown"
                  onClick={() => setProductsOpen(!productsOpen)}
                >
                  <ChevronDown size={16} className={`transition-transform ${productsOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {productsOpen && (
                <div className="absolute top-full left-0 mt-1 w-[520px] bg-white border border-border rounded-lg shadow-xl py-3 z-50">
                  <div className="grid grid-cols-2">
                    {/* Column 1: F&I Products */}
                    <div className="border-r border-border/50">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 pt-3 pb-1">
                        F&amp;I Products
                      </div>
                      <Link href="/gap-insurance" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-gap-insurance">
                        <div className="font-medium">GAP Insurance</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Guaranteed asset protection</div>
                      </Link>
                      <Link href="/extended-warranty" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-extended-warranty">
                        <div className="font-medium">Extended Warranty</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Post-OEM coverage plans</div>
                      </Link>
                      <Link href="/protection-plans" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-protection-plans">
                        <div className="font-medium">Protection Plans</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Comprehensive coverage bundles</div>
                      </Link>
                    </div>

                    {/* Column 2: Protection Plans */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 pt-3 pb-1">
                        Protection Plans
                      </div>
                      <Link href="/appearance-protection" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-appearance-protection">
                        <div className="font-medium">Appearance Protection</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Paint, fabric &amp; interior shield</div>
                      </Link>
                      <Link href="/tire-wheel" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-tire-wheel">
                        <div className="font-medium">Tire &amp; Wheel</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Road hazard protection</div>
                      </Link>
                      <Link href="/roadside-travel-protection" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-roadside-travel">
                        <div className="font-medium">Roadside &amp; Travel</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Emergency travel protection</div>
                      </Link>
                      <Link href="/specialty-protection" className="block px-5 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-specialty-protection">
                        <div className="font-medium">Specialty Protection</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Slideout, awning &amp; more</div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Marketplace Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMarketplaceOpen(true)}
              onMouseLeave={() => setMarketplaceOpen(false)}
            >
              <div className="flex items-center gap-0.5">
                <Link
                  href="/marketplace"
                  className={`text-sm text-muted-foreground hover:text-foreground transition-colors py-2 ${location === '/marketplace' ? 'text-foreground font-medium' : ''}`}
                  data-testid="link-marketplace-nav"
                >
                  {t('navigation.marketplace')}
                </Link>
                <button
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors py-2 px-1"
                  data-testid="button-marketplace-dropdown"
                  onClick={() => setMarketplaceOpen(!marketplaceOpen)}
                >
                  <ChevronDown size={16} className={`transition-transform ${marketplaceOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {marketplaceOpen && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-border rounded-lg shadow-xl py-3 z-50">
                  <Link href="/dealer-exchange" className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-dealer-exchange">
                    <div className="font-medium">Dealer Exchange</div>
                    <div className="text-xs text-muted-foreground mt-1">Dealer-to-dealer inventory network</div>
                  </Link>
                  <Link href="/live-auctions" className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-live-auctions">
                    <div className="font-medium flex items-center gap-2">Live Auctions <ServiceBadge quarter="Q3" /></div>
                    <div className="text-xs text-muted-foreground mt-1">Monthly 48-hour public auctions</div>
                  </Link>
                  <Link href="/bidder-portal" className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors" data-testid="link-bidder-portal-nav">
                    <div className="font-medium">Bidder Portal</div>
                    <div className="text-xs text-muted-foreground mt-1">Register &amp; bid on units</div>
                  </Link>
                </div>
              )}
            </div>

            {/* Technology */}
            <Link
              href="/technology"
              className={`text-sm transition-colors py-2 ${location === '/technology' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-technology-nav"
            >
              {t('navigation.technology')}
            </Link>

            {/* Pricing */}
            <Link
              href="/pricing"
              className={`text-sm transition-colors py-2 ${location === '/pricing' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-pricing"
            >
              {t('navigation.pricing')}
            </Link>
          </div>

          {/* Right Side - Contact Button, Language Toggle and Hamburger */}
          <div className="flex items-center space-x-4">
            <Link
              href="/contact"
              className="hidden lg:block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm"
              data-testid="button-contact"
            >
              {t('navigation.contact')}
            </Link>
            <LanguageToggle />
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
