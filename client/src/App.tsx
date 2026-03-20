import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect } from "react";
import { PageTakeover, SamplePromoContent } from "@/components/page-takeover";
import Home from "@/pages/home";
import About from "@/pages/about";
import Services from "@/pages/services";
import ClaimsProcessing from "@/pages/claims-processing";
import Technology from "@/pages/technology";
import RevenueServices from "@/pages/revenue-services";
import RvCoverage from "@/pages/rv-coverage";
import Contact from "@/pages/contact";
import PrivacyPolicy from "@/pages/privacy-policy";
import DealerLogin from "@/pages/dealer-login";
import Signup from "@/pages/signup";
import Financing from "@/pages/financing";
import WarrantyExtendedService from "@/pages/warranty-extended-service";
import FIServices from "@/pages/fi-services";
import NetworkMarketplace from "@/pages/network-marketplace";
import LiveAuctions from "@/pages/live-auctions";
import Pricing from "@/pages/pricing";
import OperatorLogin from "@/pages/operator-login";
import BidderLoginPage from "@/pages/bidder-login";
import NotFound from "@/pages/not-found";
import OperatorPortal from "./portals/OperatorPortal";
import DealerPortal from "./portals/DealerPortal";
import CustomerPortal from "./portals/CustomerPortal";
import BidderPortal from "./portals/BidderPortal";

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <PageTakeover delay={1000} dismissalDays={7}>
        <SamplePromoContent />
      </PageTakeover>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/services" component={Services} />
        <Route path="/claims-processing" component={ClaimsProcessing} />
        <Route path="/technology" component={Technology} />
        <Route path="/revenue-services" component={RevenueServices} />
        {/* SEO-optimized URLs — old URLs redirect permanently */}
        <Route path="/rv-types" component={RvCoverage} />
        <Route path="/rv-coverage">{() => <Redirect to="/rv-types" />}</Route>
        <Route path="/warranty-plans" component={WarrantyExtendedService} />
        <Route path="/warranty-extended-service">{() => <Redirect to="/warranty-plans" />}</Route>
        <Route path="/contact" component={Contact} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/dealer" component={DealerLogin} />
        <Route path="/client-login" component={DealerLogin} />
        <Route path="/signup" component={Signup} />
        <Route path="/financing" component={Financing} />
        <Route path="/fi-services" component={FIServices} />
        <Route path="/network-marketplace" component={NetworkMarketplace} />
        <Route path="/live-auctions" component={LiveAuctions} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/operator" component={OperatorLogin} />
        <Route path="/bidder-login" component={BidderLoginPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const [location] = useLocation();
  // Portal sub-paths are isolated from the marketing layout.
  // /operator and /dealer (exact) still serve login pages.
  // /portal (base) serves CustomerPortal — no separate customer login page.
  const isPortal = location.startsWith('/operator/') ||
                   location.startsWith('/dealer/') ||
                   location === '/portal' ||
                   location.startsWith('/portal/') ||
                   location === '/bidder' ||
                   location.startsWith('/bidder/');

  // portal.css sets body{display:flex;background:...} globally.
  // Reset those overrides on marketing/login pages.
  useEffect(() => {
    if (isPortal) {
      document.body.style.display = '';
      document.body.style.background = '';
      document.body.style.minHeight = '';
    } else {
      document.body.style.display = 'block';
      document.body.style.background = '';
      document.body.style.minHeight = '';
    }
  }, [isPortal]);

  if (isPortal) {
    return (
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route path="/operator/:rest*" component={OperatorPortal} />
          <Route path="/dealer/:rest*" component={DealerPortal} />
          <Route path="/portal" component={CustomerPortal} />
          <Route path="/portal/:rest*" component={CustomerPortal} />
          <Route path="/bidder" component={BidderPortal} />
          <Route path="/bidder/:rest*" component={BidderPortal} />
        </Switch>
      </QueryClientProvider>
    );
  }

  return (
    <div className="overflow-x-hidden w-full">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
