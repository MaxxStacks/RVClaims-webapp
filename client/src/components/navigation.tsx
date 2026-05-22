import { useLanguage } from "@/hooks/use-language";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { ServiceBadge } from "@/components/service-badge";
import { Link, useLocation } from "wouter";
import { ChevronDown, Shield, Truck, TrendingUp, CheckCircle2, ArrowRight, CreditCard, Briefcase, ShieldCheck, Zap, Wrench, MapPin } from "lucide-react";
import { useState } from "react";
import logoLight from "@assets/DS360_logo_light.png";
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
  const [claimsOpen, setClaimsOpen] = useState(false);
  const [financialOpen, setFinancialOpen] = useState(false);
  const [growthOpen, setGrowthOpen] = useState(false);
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
          <div className="flex justify-between items-center py-1">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" data-testid="link-logo">
              <img src={logoLight} alt="Dealer Suite 360" className="h-[60px] w-auto" data-testid="img-header-logo" />
            </Link>
            <div className="flex items-center gap-3">
              {/* Desktop-only: Dealer Login + Book a Demo */}
              <Link
                href="/login"
                className="hidden lg:block text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-sign-in-top"
              >
                Sign In
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

            {/* Claims Dropdown — links left, description panel right */}
            <div
              className="relative"
              onMouseEnter={() => setClaimsOpen(true)}
              onMouseLeave={() => setClaimsOpen(false)}
            >
              <div className="flex items-center gap-0.5">
                <Link
                  href="/claims-processing"
                  className={`text-muted-foreground hover:text-foreground transition-colors py-2 ${location === '/claims-processing' ? 'text-foreground' : ''}`}
                  data-testid="link-claims-nav"
                >
                  Claims
                </Link>
                <button
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors py-2 px-1"
                  data-testid="button-claims-dropdown"
                  onClick={() => setClaimsOpen(!claimsOpen)}
                >
                  <ChevronDown size={16} className={`transition-transform ${claimsOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {claimsOpen && (
                <div className="absolute top-full left-0 mt-1 w-[760px] bg-white border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="flex">
                    {/* Left: Service Links */}
                    <div className="flex-1 py-3 px-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 pt-1 pb-2">
                        Claims & Coverage
                      </div>
                      <Link
                        href="/claims-processing"
                        className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group"
                        data-testid="link-claims-processing"
                      >
                        <Shield size={17} className="text-primary flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-medium text-sm">{t('mainServices.claims.title')}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">DAF, PDI, Warranty, Extended Warranty, Insurance</div>
                        </div>
                      </Link>
                      <Link
                        href="/rv-types"
                        className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group"
                        data-testid="link-rv-types"
                      >
                        <Truck size={17} className="text-primary flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-medium text-sm">{t('navigation.rvCoverage')}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">All 10 RV types across 6 major manufacturers</div>
                        </div>
                      </Link>
                      <Link
                        href="/revenue-optimization"
                        className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors group"
                        data-testid="link-revenue-optimization"
                      >
                        <TrendingUp size={17} className="text-primary flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-medium text-sm">Revenue Optimization</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Maximize labor & parts recovery on every claim</div>
                        </div>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="w-px bg-border my-4" />

                    {/* Right: Description Panel */}
                    <div className="w-60 bg-gradient-to-br from-primary/10 to-primary/5 px-5 py-5 flex flex-col flex-shrink-0">
                      <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Live Now</div>
                      <h3 className="font-bold text-foreground text-sm leading-snug mb-2">
                        End-to-End RV Claims Processing
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Our expert team handles every claim type across all major manufacturers — maximizing your approval rates and recovering every dollar.
                      </p>
                      <div className="space-y-1.5 mb-5">
                        {['6 Major Manufacturers', 'All 10 RV Types', 'AI-Assisted Review', 'A-Z Management'].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs text-foreground">
                            <CheckCircle2 size={12} className="text-primary flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/sign-up"
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors mt-auto"
                        data-testid="link-claims-get-started"
                      >
                        Get Started
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Financial Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setFinancialOpen(true)}
              onMouseLeave={() => setFinancialOpen(false)}
            >
              <div className="flex items-center gap-0.5">
                <Link
                  href="/financing"
                  className={`text-muted-foreground hover:text-foreground transition-colors py-2 ${['/financing', '/fi-services', '/warranty-plans'].includes(location) ? 'text-foreground' : ''}`}
                  data-testid="link-financial-nav"
                >
                  Financial
                </Link>
                <button
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors py-2 px-1"
                  data-testid="button-financial-dropdown"
                  onClick={() => setFinancialOpen(!financialOpen)}
                >
                  <ChevronDown size={16} className={`transition-transform ${financialOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {financialOpen && (
                <div className="absolute top-full left-0 mt-1 w-[760px] bg-white border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="flex">
                    {/* Left: Service Links */}
                    <div className="flex-1 py-3 px-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 pt-1 pb-2">
                        Financial Services
                      </div>
                      <Link
                        href="/financing"
                        className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
                        data-testid="link-financing-services"
                      >
                        <CreditCard size={17} className="text-emerald-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {t('mainServices.financing.title')}
                            <ServiceBadge quarter="Q2" />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">Lender integration & approval optimization</div>
                        </div>
                      </Link>
                      <Link
                        href="/fi-services"
                        className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
                        data-testid="link-fi-services"
                      >
                        <Briefcase size={17} className="text-emerald-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {t('mainServices.fiServices.title')}
                            <ServiceBadge quarter="Q2" />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">Finance & Insurance outsourcing solutions</div>
                        </div>
                      </Link>
                      <Link
                        href="/warranty-plans"
                        className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors group"
                        data-testid="link-warranty-extended"
                      >
                        <ShieldCheck size={17} className="text-emerald-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {t('mainServices.warranty.title')}
                            <ServiceBadge quarter="Q2" />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">OEM & aftermarket protection packages</div>
                        </div>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="w-px bg-border my-4" />

                    {/* Right: Description Panel */}
                    <div className="w-60 bg-gradient-to-br from-emerald-50 to-green-50 px-5 py-5 flex flex-col flex-shrink-0">
                      <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Coming Q2 2026</div>
                      <h3 className="font-bold text-foreground text-sm leading-snug mb-2">
                        Full-Service Financial Management
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Complete financial solutions for modern RV dealerships — from lender integration to F&I outsourcing and warranty plan sales.
                      </p>
                      <div className="space-y-1.5 mb-5">
                        {['Lender Integration', 'F&I Outsourcing', 'Warranty Management', 'Revenue Reporting'].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs text-foreground">
                            <CheckCircle2 size={12} className="text-emerald-600 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/financing"
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors mt-auto"
                        data-testid="link-financial-learn-more"
                      >
                        Learn More
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Revenue Growth Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setGrowthOpen(true)}
              onMouseLeave={() => setGrowthOpen(false)}
            >
              <div className="flex items-center gap-0.5">
                <Link
                  href="/revenue-services"
                  className={`text-muted-foreground hover:text-foreground transition-colors py-2 ${['/revenue-services', '/technology', '/on-site-repairs', '/roadside-assistance'].includes(location) ? 'text-foreground' : ''}`}
                  data-testid="link-growth-nav"
                >
                  Growth
                </Link>
                <button
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors py-2 px-1"
                  data-testid="button-growth-dropdown"
                  onClick={() => setGrowthOpen(!growthOpen)}
                >
                  <ChevronDown size={16} className={`transition-transform ${growthOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {growthOpen && (
                <div className="absolute top-full left-0 mt-1 w-[760px] bg-white border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="flex">
                    {/* Left: Service Links */}
                    <div className="flex-1 py-3 px-2">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 pt-1 pb-2">
                        Revenue Growth
                      </div>
                      <Link
                        href="/revenue-services"
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                        data-testid="link-revenue-services"
                      >
                        <TrendingUp size={17} className="text-teal-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {t('navigation.revenueServices')}
                            <ServiceBadge quarter="Q3" />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">Marketing, parts & trade-in programs</div>
                        </div>
                      </Link>
                      <Link
                        href="/technology"
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                        data-testid="link-technology"
                      >
                        <Zap size={17} className="text-teal-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {t('navigation.technology')}
                            <ServiceBadge quarter="Q3" />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">AI-powered dealership tools</div>
                        </div>
                      </Link>
                      <Link
                        href="/on-site-repairs"
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                        data-testid="link-on-site-repairs"
                      >
                        <Wrench size={17} className="text-teal-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {t('navigation.onSiteRepairs')}
                            <ServiceBadge quarter="Q3" />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">Technician dispatched to your location</div>
                        </div>
                      </Link>
                      <Link
                        href="/roadside-assistance"
                        className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                        data-testid="link-roadside-assistance"
                      >
                        <MapPin size={17} className="text-teal-600 flex-shrink-0 mt-1" />
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {t('navigation.roadsideAssistance')}
                            <ServiceBadge quarter="Q4" />
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">24/7 emergency towing & roadside support</div>
                        </div>
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="w-px bg-border my-4" />

                    {/* Right: Description Panel */}
                    <div className="w-60 bg-gradient-to-br from-teal-50 to-cyan-50 px-5 py-5 flex flex-col flex-shrink-0">
                      <div className="text-xs font-bold text-teal-700 uppercase tracking-widest mb-2">Coming Q3 2026</div>
                      <h3 className="font-bold text-foreground text-sm leading-snug mb-2">
                        Your Complete Revenue Growth Engine
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Powerful tools to grow revenue across every department — marketing, AI technology, mobile service, and consumer support.
                      </p>
                      <div className="space-y-1.5 mb-5">
                        {['Digital Marketing & SEO', 'AI-Powered Tools', 'Mobile Service Dispatch', '24/7 Roadside Support'].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs text-foreground">
                            <CheckCircle2 size={12} className="text-teal-600 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/revenue-services"
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors mt-auto"
                        data-testid="link-growth-see-roadmap"
                      >
                        See Roadmap
                        <ArrowRight size={12} />
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
              <div className="flex items-center gap-0.5">
                <Link
                  href="/marketplace"
                  className={`text-muted-foreground hover:text-foreground transition-colors py-2 ${location === '/marketplace' ? 'text-foreground' : ''}`}
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

          {/* Right Side - Language Toggle and Hamburger */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
