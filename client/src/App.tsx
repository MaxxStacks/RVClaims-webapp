import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";
import { useEffect, lazy, Suspense } from "react";
import { PageTakeover, SamplePromoContent } from "@/components/page-takeover";

const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const Services = lazy(() => import("@/pages/services"));
const ClaimsProcessing = lazy(() => import("@/pages/claims-processing"));
const Technology = lazy(() => import("@/pages/technology"));
const RevenueServices = lazy(() => import("@/pages/revenue-services"));
const RvCoverage = lazy(() => import("@/pages/rv-coverage"));
const Contact = lazy(() => import("@/pages/contact"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const DealerLogin = lazy(() => import("@/pages/dealer-login"));
const Signup = lazy(() => import("@/pages/signup"));
const Financing = lazy(() => import("@/pages/financing"));
const WarrantyExtendedService = lazy(() => import("@/pages/warranty-extended-service"));
const FIServices = lazy(() => import("@/pages/fi-services"));
const NetworkMarketplace = lazy(() => import("@/pages/network-marketplace"));
const LiveAuctions = lazy(() => import("@/pages/live-auctions"));
const Pricing = lazy(() => import("@/pages/pricing"));
const OperatorLogin = lazy(() => import("@/pages/operator-login"));
const BidderLoginPage = lazy(() => import("@/pages/bidder-login"));
const BookDemo = lazy(() => import("@/pages/book-demo"));
const OnSiteRepairs = lazy(() => import("@/pages/on-site-repairs"));
const RoadsideAssistance = lazy(() => import("@/pages/roadside-assistance"));
const NewsPage = lazy(() => import("@/pages/news"));
const NewsArticlePage = lazy(() => import("@/pages/news-article"));
const NotFound = lazy(() => import("@/pages/not-found"));
const OperatorPortal = lazy(() => import("./portals/OperatorPortal"));
const DealerPortal = lazy(() => import("./portals/DealerPortal"));
const CustomerPortal = lazy(() => import("./portals/CustomerPortal"));
const BidderPortal = lazy(() => import("./portals/BidderPortal"));

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
        <Route path="/book-demo" component={BookDemo} />
        <Route path="/on-site-repairs" component={OnSiteRepairs} />
        <Route path="/roadside-assistance" component={RoadsideAssistance} />
        <Route path="/news" component={NewsPage} />
        <Route path="/news/:id" component={NewsArticlePage} />
        <Route path="/actualites" component={NewsPage} />
        <Route path="/actualites/:id" component={NewsArticlePage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const [location] = useLocation();
  // Portal sub-paths are isolated from the marketing layout.
  // /operator and /dealer (exact) still serve login pages.
  // /client (base) serves CustomerPortal — no separate customer login page.
  const isPortal = location.startsWith('/operator/') ||
                   location.startsWith('/dealer/') ||
                   location === '/client' ||
                   location.startsWith('/client/') ||
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
        <AuthProvider>
          <Suspense fallback={null}>
            <Switch>
              <Route path="/operator/:rest*" component={OperatorPortal} />
              <Route path="/dealer/:rest*" component={DealerPortal} />
              <Route path="/client" component={CustomerPortal} />
              <Route path="/client/:rest*" component={CustomerPortal} />
              <Route path="/portal">{() => <Redirect to="/client" />}</Route>
              <Route path="/portal/:rest*">{() => <Redirect to="/client" />}</Route>
              <Route path="/bidder" component={BidderPortal} />
              <Route path="/bidder/:rest*" component={BidderPortal} />
            </Switch>
          </Suspense>
        </AuthProvider>
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
              <Suspense fallback={null}>
                <Router />
              </Suspense>
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
