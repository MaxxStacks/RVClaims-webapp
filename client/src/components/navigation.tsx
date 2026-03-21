import { useLanguage } from "@/hooks/use-language";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { ServiceBadge } from "@/components/service-badge";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import logoEN from "@assets/Official_RVclaims_logo_en.webp";
import logoFR from "@assets/Official_RVclaims_logo_fr.webp";
import travelTrailerIcon from "@assets/Travel Trailer_1756847838647.webp";
import fifthWheelIcon from "@assets/Fifth Wheel_1756847838645.webp";
import classCIcon from "@assets/Class C_1756847838644.webp";
import vanCamperIcon from "@assets/Van Camper_1756847838648.webp";
import classAIcon from "@assets/Class A_1756847838643.webp";
import smallTrailerIcon from "@assets/Small Trailer_1756847838646.webp";
import popUpIcon from "@assets/Pop Up_1756847838645.webp";
import toyHaulerIcon from "@assets/Toy Hauler_1756847838646.webp";
import truckCamperIcon from "@assets/Truck Camper_1756847838647.webp";
import destinationTrailerIcon from "@assets/Destination Trailer_1756847838644.webp";

export function Navigation() {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [rvCoverageOpen, setRvCoverageOpen] = useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);

  const rvTypes = [
    { icon: travelTrailerIcon, name: t('rvTypes.travelTrailer'), testId: 'travel-trailer' },
    { icon: fifthWheelIcon, name: t('rvTypes.fifthWheel'), testId: 'fifth-wheel' },
    { icon: classCIcon, name: t('rvTypes.classC'), testId: 'class-c' },
    { icon: vanCamperIcon, name: t('rvTypes.vanCamper'), testId: 'van-camper' },
    { icon: classAIcon, name: t('rvTypes.classA'), testId: 'class-a' },
    { icon: smallTrailerIcon, name: t('rvTypes.smallTrailer'), testId: 'small-trailer' },
    { icon: popUpIcon, name: t('rvTypes.popUp'), testId: 'pop-up' },
    { icon: toyHaulerIcon, name: t('rvTypes.toyHauler'), testId: 'toy-hauler' },
    { icon: truckCamperIcon, name: t('rvTypes.truckCamper'), testId: 'truck-camper' },
    { icon: destinationTrailerIcon, name: t('rvTypes.destinationTrailer'), testId: 'destination-trailer' }
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      {/* Top Row - Logo and Action Buttons */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" data-testid="link-logo">
              <img
                src={language === 'en' ? logoEN : logoFR}
                alt="RV Claims Canada"
                style={{ height: "72px", width: "auto" }}
                data-testid="img-header-logo"
              />
            </Link>
            <div className="flex items-center gap-3">
              {/* Desktop-only: Dealer Login + Book a Demo */}
              <Link
                href="/dealer"
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
              {/* Always visible: Sign Up */}
              <Link href="/signup">
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

            {/* Services Dropdown — 3-column mega-menu */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors py-2"
                data-testid="button-services-dropdown"
              >
                {t('navigation.services')}
                <ChevronDown size={16} className={`transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-[900px] bg-white border border-border rounded-lg shadow-xl py-3 z-50">
                  <div className="grid grid-cols-3">
                    {/* Column 1: Core Claims */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 pt-3 pb-1">
                        Core Claims
                      </div>
                      <Link
                        href="/claims-processing"
                        className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        data-testid="link-claims-processing"
                      >
                        <div className="font-medium">{t('mainServices.claims.title')}</div>
                        <div className="text-xs text-muted-foreground mt-1">A-Z warranty claims management</div>
                      </Link>
                      <Link
                        href="/rv-types"
                        className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        data-testid="link-rv-types"
                      >
                        <div className="font-medium">{t('navigation.rvCoverage')}</div>
                        <div className="text-xs text-muted-foreground mt-1">10 RV types, all manufacturers</div>
                      </Link>
                    </div>

                    {/* Column 2: Financial Services */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 pt-3 pb-1">
                        Financial Services
                      </div>
                      <Link
                        href="/financing"
                        className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        data-testid="link-financing-services"
                      >
                        <div className="font-medium flex items-center gap-2">
                          {t('mainServices.financing.title')}
                          <ServiceBadge quarter="Q2" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Dealership financing support</div>
                      </Link>
                      <Link
                        href="/fi-services"
                        className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        data-testid="link-fi-services"
                      >
                        <div className="font-medium flex items-center gap-2">
                          {t('mainServices.fiServices.title')}
                          <ServiceBadge quarter="Q2" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Finance & Insurance solutions</div>
                      </Link>
                      <Link
                        href="/warranty-plans"
                        className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        data-testid="link-warranty-extended"
                      >
                        <div className="font-medium flex items-center gap-2">
                          {t('mainServices.warranty.title')}
                          <ServiceBadge quarter="Q2" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Protection packages</div>
                      </Link>
                    </div>

                    {/* Column 3: Revenue Growth */}
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-5 pt-3 pb-1">
                        Revenue Growth
                      </div>
                      <Link
                        href="/revenue-services"
                        className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        data-testid="link-revenue-services"
                      >
                        <div className="font-medium flex items-center gap-2">
                          {t('navigation.revenueServices')}
                          <ServiceBadge quarter="Q3" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Marketing, parts & trade-in programs</div>
                      </Link>
                      <Link
                        href="/technology"
                        className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        data-testid="link-technology"
                      >
                        <div className="font-medium flex items-center gap-2">
                          {t('navigation.technology')}
                          <ServiceBadge quarter="Q3" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">AI-powered dealership tools</div>
                      </Link>
                      <Link
                        href="/on-site-repairs"
                        className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        data-testid="link-on-site-repairs"
                      >
                        <div className="font-medium flex items-center gap-2">
                          {t('navigation.onSiteRepairs')}
                          <ServiceBadge quarter="Q3" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Technician dispatched to your location</div>
                      </Link>
                      <Link
                        href="/roadside-assistance"
                        className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        data-testid="link-roadside-assistance"
                      >
                        <div className="font-medium flex items-center gap-2">
                          {t('navigation.roadsideAssistance')}
                          <ServiceBadge quarter="Q4" />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">24/7 emergency towing & roadside support</div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RV Coverage Megamenu — zero changes */}
            <div
              className="relative"
              onMouseEnter={() => setRvCoverageOpen(true)}
              onMouseLeave={() => setRvCoverageOpen(false)}
            >
              <button
                className={`flex items-center gap-1 transition-colors py-2 ${location === '/rv-coverage' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                data-testid="button-rv-coverage-megamenu"
              >
                {t('navigation.rvCoverage')}
                <ChevronDown size={16} className={`transition-transform ${rvCoverageOpen ? 'rotate-180' : ''}`} />
              </button>

              {rvCoverageOpen && (
                <div className="absolute top-full left-0 mt-1 w-[800px] bg-white border border-border rounded-lg shadow-xl p-6 z-50">
                  <div className="grid grid-cols-5 gap-6">
                    {rvTypes.map((rv) => (
                      <Link
                        key={rv.testId}
                        href="/rv-coverage"
                        className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-primary/10 transition-colors group"
                        data-testid={`link-rv-${rv.testId}`}
                      >
                        <img
                          src={rv.icon}
                          alt={rv.name}
                          className="w-16 h-16 mb-2 object-contain group-hover:scale-110 transition-transform"
                        />
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">{rv.name}</span>
                      </Link>
                    ))}
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
              <button
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors py-2"
                data-testid="button-marketplace-dropdown"
              >
                {t('navigation.marketplace')}
                <ChevronDown size={16} className={`transition-transform ${marketplaceOpen ? 'rotate-180' : ''}`} />
              </button>

              {marketplaceOpen && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-border rounded-lg shadow-xl py-3 z-50">
                  <Link
                    href="/network-marketplace"
                    className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    data-testid="link-network-marketplace"
                  >
                    <div className="font-medium">{t('navigation.networkMarketplace')}</div>
                    <div className="text-xs text-muted-foreground mt-1">Dealer-to-dealer inventory with escrow</div>
                  </Link>
                  <Link
                    href="/live-auctions"
                    className="block px-5 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    data-testid="link-live-auctions"
                  >
                    <div className="font-medium flex items-center gap-2">
                      {t('navigation.liveAuctions')}
                      <ServiceBadge quarter="Q3" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Monthly 48-hour public auctions</div>
                  </Link>
                </div>
              )}
            </div>

            {/* News */}
            <Link
              href={language === 'fr' ? '/actualites' : '/news'}
              className={`transition-colors ${location === '/news' || location === '/actualites' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-news"
            >
              {t('navigation.news')}
            </Link>

            {/* About */}
            <Link
              href="/about"
              className={`transition-colors ${location === '/about' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-about"
            >
              {t('navigation.about')}
            </Link>

            {/* Pricing */}
            <Link
              href="/pricing"
              className={`transition-colors ${location === '/pricing' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-pricing"
            >
              {t('navigation.pricing')}
            </Link>
          </div>

          {/* Right Side - Contact Button, Language Toggle and Hamburger */}
          <div className="flex items-center space-x-4">
            {/* Contact Button - Desktop Only */}
            <Link
              href="/contact"
              className="hidden lg:block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
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
