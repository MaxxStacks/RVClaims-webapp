import { useLanguage } from "@/hooks/use-language";
import { LanguageToggle } from "@/components/language-toggle";
import { MobileMenu } from "@/components/mobile-menu";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import headerLogoImage from "@assets/Industrial Trapton Logo Design (1) (1)_1756855580448.png";
import travelTrailerIcon from "@assets/Travel Trailer_1756847838647.png";
import fifthWheelIcon from "@assets/Fifth Wheel_1756847838645.png";
import classCIcon from "@assets/Class C_1756847838644.png";
import vanCamperIcon from "@assets/Van Camper_1756847838648.png";
import classAIcon from "@assets/Class A_1756847838643.png";
import smallTrailerIcon from "@assets/Small Trailer_1756847838646.png";
import popUpIcon from "@assets/Pop Up_1756847838645.png";
import toyHaulerIcon from "@assets/Toy Hauler_1756847838646.png";
import truckCamperIcon from "@assets/Truck Camper_1756847838647.png";
import destinationTrailerIcon from "@assets/Destination Trailer_1756847838644.png";

export function Navigation() {
  const { t } = useLanguage();
  const [location] = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [rvCoverageOpen, setRvCoverageOpen] = useState(false);

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
      {/* Top Row - Logo Only */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-3">
            <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" data-testid="link-logo">
              <img 
                src={headerLogoImage} 
                alt="RV Claims Canada" 
                className="h-12 w-auto max-w-[280px]" 
                data-testid="img-header-logo"
              />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row - Full Menu Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 flex-1 justify-center">
            {/* Services Dropdown */}
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
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-border rounded-lg shadow-xl py-2 z-50">
                  <Link
                    href="/claims-processing"
                    className="block px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    data-testid="link-claims-processing"
                  >
                    <div className="font-medium">{t('mainServices.claims.title')}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">A-Z warranty claims management</div>
                  </Link>
                  <Link
                    href="/financing-services"
                    className="block px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    data-testid="link-financing-services"
                  >
                    <div className="font-medium">{t('mainServices.financing.title')}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Dealership financing support</div>
                  </Link>
                  <Link
                    href="/warranty-extended-services"
                    className="block px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    data-testid="link-warranty-extended"
                  >
                    <div className="font-medium">{t('mainServices.warranty.title')}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Protection packages</div>
                  </Link>
                  <Link
                    href="/fi-services"
                    className="block px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    data-testid="link-fi-services"
                  >
                    <div className="font-medium">{t('mainServices.fiServices.title')}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Finance & Insurance solutions</div>
                  </Link>
                </div>
              )}
            </div>

            {/* Warranty & Extended Services */}
            <Link 
              href="/warranty-extended-services"
              className={`transition-colors ${location === '/warranty-extended-services' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-warranty"
            >
              {t('navigation.warrantyExtended')}
            </Link>

            {/* Technology */}
            <Link 
              href="/technology"
              className={`transition-colors ${location === '/technology' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-technology"
            >
              {t('navigation.technology')}
            </Link>

            {/* Find a Dealer */}
            <Link 
              href="/find-dealer"
              className={`transition-colors ${location === '/find-dealer' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              data-testid="link-find-dealer"
            >
              {t('navigation.findDealer')}
            </Link>

            {/* RV Coverage Megamenu */}
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[800px] bg-white border border-border rounded-lg shadow-xl p-6 z-50">
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

            {/* Contact Button */}
            <Link 
              href="/contact"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              data-testid="button-contact"
            >
              {t('navigation.contact')}
            </Link>
          </div>

          {/* Language Toggle and Hamburger - All Screens */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
