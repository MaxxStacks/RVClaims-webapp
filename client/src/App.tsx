import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { AuthProvider } from "@/hooks/use-auth";
import { AuthenticateWithRedirectCallback, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useEffect, useState, lazy, Suspense } from "react";
import AssistFAB from "@/components/assist/AssistFAB";
import ScreenShareBanner from "@/components/remote-support/ScreenShareBanner";
import ScreenShareRequestToast from "@/components/remote-support/ScreenShareRequestToast";
import { RemoteSupportProvider } from "@/contexts/RemoteSupportContext";
import { wsClient } from "@/lib/websocket";

const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const Services = lazy(() => import("@/pages/services"));
const ClaimsProcessing = lazy(() => import("@/pages/claims-processing"));
const Technology = lazy(() => import("@/pages/technology"));
const RevenueServices = lazy(() => import("@/pages/revenue-services"));
const RvCoverage = lazy(() => import("@/pages/rv-coverage"));
const Contact = lazy(() => import("@/pages/contact"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const LoginPage = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const PortalRouter = lazy(() => import("@/pages/portal-router"));
const FinancingServices = lazy(() => import("@/pages/financing-services"));
const WarrantyExtendedService = lazy(() => import("@/pages/warranty-extended-service"));
const FIServices = lazy(() => import("@/pages/fi-services"));
const NetworkMarketplace = lazy(() => import("@/pages/network-marketplace"));
const LiveAuctions = lazy(() => import("@/pages/live-auctions"));
const Pricing = lazy(() => import("@/pages/pricing"));
const BookDemo = lazy(() => import("@/pages/book-demo"));
const OnSiteRepairs = lazy(() => import("@/pages/on-site-repairs"));
const RoadsideAssistance = lazy(() => import("@/pages/roadside-assistance"));
const NewsPage = lazy(() => import("@/pages/news"));
const NewsArticlePage = lazy(() => import("@/pages/news-article"));
const BlogPage = lazy(() => import("@/pages/blog"));
const BlogPostPage = lazy(() => import("@/pages/blog-post"));
const DealersPage = lazy(() => import("@/pages/dealers"));
const DealerListingPage = lazy(() => import("@/pages/dealer-listing"));
const DealerClaimPage = lazy(() => import("@/pages/dealer-claim"));
const DealerDashboardPage = lazy(() => import("@/pages/dealer-dashboard"));
const SignUpRequest = lazy(() => import("@/pages/sign-up"));
const DevAccess = lazy(() => import("@/pages/dev-access"));
const DevAccessV7 = lazy(() => import("@/pages/DevAccessV7"));
const Marketplace = lazy(() => import("@/pages/marketplace"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const CookiePolicy = lazy(() => import("@/pages/cookie-policy"));
const PipedaCompliance = lazy(() => import("@/pages/pipeda-compliance"));
const Careers = lazy(() => import("@/pages/careers"));
const Partnerships = lazy(() => import("@/pages/partnerships"));
const Testimonials = lazy(() => import("@/pages/testimonials"));
const RevenueOptimization = lazy(() => import("@/pages/revenue-optimization"));
const PartsComponents = lazy(() => import("@/pages/parts-components"));
const MarketingServices = lazy(() => import("@/pages/marketing-services"));
const ConsignmentServices = lazy(() => import("@/pages/consignment-services"));
const ExtendedWarranty = lazy(() => import("@/pages/extended-warranty"));
const ProtectionPlans = lazy(() => import("@/pages/protection-plans"));
const ClaimGuides = lazy(() => import("@/pages/claim-guides"));
const IndustryReports = lazy(() => import("@/pages/industry-reports"));
const Webinars = lazy(() => import("@/pages/webinars"));
const KnowledgeBase = lazy(() => import("@/pages/knowledge-base"));
const DealerTraining = lazy(() => import("@/pages/dealer-training"));
const HelpCenter = lazy(() => import("@/pages/help-center"));
const Documentation = lazy(() => import("@/pages/documentation"));
const ApiAccess = lazy(() => import("@/pages/api-access"));
const SystemStatus = lazy(() => import("@/pages/system-status"));
const DealerIntegration = lazy(() => import("@/pages/dealer-integration"));
const ExpertConsultation = lazy(() => import("@/pages/expert-consultation"));
const NotFound = lazy(() => import("@/pages/not-found"));
const OperatorPortal = lazy(() => import("./portals/OperatorPortal"));
const DealerPortal = lazy(() => import("./portals/DealerPortal"));
const CustomerPortal = lazy(() => import("./portals/CustomerPortal"));
const BidderPortal = lazy(() => import("./portals/BidderPortal"));
const BidderPortalV6 = lazy(() => import("@/pages/BidderPortalV6"));
const PortalSelectV6 = lazy(() => import("@/pages/PortalSelectV6"));

// Session 3: 16-portal route sections
import {
  OperatorAdminPortalSection,
  OperatorStaffPortalSection,
  DealerOwnerPortalSection,
  DealerStaffPortalSection,
  ClientPortalSection,
  ServiceManagerPortalSection,
  ShopManagerPortalSection,
  PartsManagerPortalSection,
  FinancialManagerPortalSection,
  ShopTechPortalSection,
  OnSiteTechPortalSection,
  PublicBidderPortalSection,
  ConsignorPortalSection,
  IndependentBidderPortalSection,
  MarketplaceAdminPortalSection,
  MarketplaceStaffPortalSection,
} from './portals/PortalRoutes';
const UnitProfilePageOperator = lazy(async () => {
  const { default: Comp } = await import("@/components/units/UnitProfilePage");
  return { default: () => <Comp context="operator" /> };
});
const UnitProfilePageDealer = lazy(async () => {
  const { default: Comp } = await import("@/components/units/UnitProfilePage");
  return { default: () => <Comp context="dealer" /> };
});
const UnitProfilePageClient = lazy(async () => {
  const { default: Comp } = await import("@/components/units/UnitProfilePage");
  return { default: () => <Comp context="client" /> };
});
// DealershipDetailPage has PortalShell embedded — load as-is
const DealershipDetailPage = lazy(() => import("@/components/operator/DealershipDetailPage"));

// Routes that need PortalShell injected at the route level (dual-use or standalone pages)
// List page — no contextual sidebar (the table IS the list; sidebar would duplicate it)
const DealerAccountsListPageRoute = lazy(async () => {
  const [
    { default: Inner },
    { default: PortalShell },
    { default: OperatorMainNav },
  ] = await Promise.all([
    import("@/components/operator/DealerAccountsListPage"),
    import("@/components/layout/PortalShell"),
    import("@/pages/nav/OperatorMainNav"),
  ]);
  function Route() {
    const nav = <nav className="sidebar" style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}><OperatorMainNav currentPage="master.mgmt.dealer_accounts" /></nav>;
    return (
      <PortalShell context="operator" mainNav={nav}>
        <div style={{ flex: 1, overflowY: "auto" }}><Inner /></div>
      </PortalShell>
    );
  }
  return { default: Route };
});

const NewDealershipPageRoute = lazy(async () => {
  const [
    { default: Inner },
    { default: PortalShell },
    { default: OperatorMainNav },
  ] = await Promise.all([
    import("@/components/operator/NewDealershipPage"),
    import("@/components/layout/PortalShell"),
    import("@/pages/nav/OperatorMainNav"),
  ]);
  function Route() {
    const nav = <nav className="sidebar" style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}><OperatorMainNav currentPage="master.mgmt.dealer_accounts" /></nav>;
    return <PortalShell context="operator" mainNav={nav}><Inner /></PortalShell>;
  }
  return { default: Route };
});

const NewUnitPageRoute = lazy(async () => {
  const [
    { default: Inner },
    { default: PortalShell },
    { default: DealerMainNav },
  ] = await Promise.all([
    import("@/components/units/NewUnitPage"),
    import("@/components/layout/PortalShell"),
    import("@/pages/nav/DealerMainNav"),
  ]);
  function Route() {
    const nav = <nav className="sidebar" style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}><DealerMainNav currentPage="dealer.ops.inventory" /></nav>;
    return <PortalShell context="dealer" mainNav={nav}><Inner /></PortalShell>;
  }
  return { default: Route };
});

const NewClaimPageRoute = lazy(async () => {
  const [
    { default: Inner },
    { default: PortalShell },
    { default: DealerMainNav },
  ] = await Promise.all([
    import("@/components/claims/NewClaimPage"),
    import("@/components/layout/PortalShell"),
    import("@/pages/nav/DealerMainNav"),
  ]);
  function Route() {
    const nav = <nav className="sidebar" style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}><DealerMainNav currentPage="dealer.ops.inventory" /></nav>;
    return <PortalShell context="dealer" mainNav={nav}><Inner /></PortalShell>;
  }
  return { default: Route };
});

// Connects the shared wsClient with the dealer's Clerk token so the
// ScreenShareRequestToast can receive remote:share-request events.
function DealerWSConnector() {
  const { getToken } = useClerkAuth();
  useEffect(() => {
    let active = true;
    getToken()
      .then((token) => { if (token && active) wsClient.connectWithToken(token); })
      .catch(() => {});
    return () => { active = false; };
  }, [getToken]);
  return null;
}

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
        {/* Clerk OAuth callback routes — must be before the exact /login and /signup routes */}
        <Route path="/login/sso-callback">{() => <AuthenticateWithRedirectCallback />}</Route>
        <Route path="/signup/sso-callback">{() => <AuthenticateWithRedirectCallback />}</Route>
        {/* Wildcard sub-routes so Clerk can render factor/verify steps internally */}
        <Route path="/login/:rest*" component={LoginPage} />
        <Route path="/signup/:rest*" component={Signup} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={Signup} />
        <Route path="/portal-router" component={PortalRouter} />
        <Route path="/dev-access" component={DevAccess} />
        <Route path="/dev-access-v7" component={DevAccessV7} />
        <Route path="/dealer">{() => <Redirect to="/login" />}</Route>
        <Route path="/client-login">{() => <Redirect to="/login" />}</Route>
        <Route path="/financing" component={FinancingServices} />
        <Route path="/fi-services" component={FIServices} />
        <Route path="/network-marketplace" component={NetworkMarketplace} />
        <Route path="/live-auctions" component={LiveAuctions} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/operator">{() => <Redirect to="/login" />}</Route>
        <Route path="/client">{() => <Redirect to="/login" />}</Route>
        <Route path="/bidder">{() => <Redirect to="/login" />}</Route>
        <Route path="/bidder-login">{() => <Redirect to="/login" />}</Route>
        <Route path="/bidder-v6" component={BidderPortalV6} />
        <Route path="/portal-select-v6" component={PortalSelectV6} />
        <Route path="/book-demo" component={BookDemo} />
        <Route path="/on-site-repairs" component={OnSiteRepairs} />
        <Route path="/roadside-assistance" component={RoadsideAssistance} />
        <Route path="/news" component={NewsPage} />
        <Route path="/news/:id" component={NewsArticlePage} />
        <Route path="/actualites" component={NewsPage} />
        <Route path="/actualites/:id" component={NewsArticlePage} />
        <Route path="/reset-password">{() => <Redirect to="/login" />}</Route>
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/blog" component={BlogPage} />
        <Route path="/dealers/listing/:slug" component={DealerListingPage} />
        <Route path="/dealers/claim/:slug" component={DealerClaimPage} />
        <Route path="/dealers" component={DealersPage} />
        <Route path="/dealer-dashboard" component={DealerDashboardPage} />
        {/* New pages from site revamp */}
        <Route path="/sign-up" component={SignUpRequest} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/cookie-policy" component={CookiePolicy} />
        <Route path="/pipeda-compliance" component={PipedaCompliance} />
        <Route path="/careers" component={Careers} />
        <Route path="/partnerships" component={Partnerships} />
        <Route path="/testimonials" component={Testimonials} />
        <Route path="/revenue-optimization" component={RevenueOptimization} />
        <Route path="/parts-components" component={PartsComponents} />
        <Route path="/marketing-services" component={MarketingServices} />
        <Route path="/consignment-services" component={ConsignmentServices} />
        <Route path="/extended-warranty" component={ExtendedWarranty} />
        <Route path="/protection-plans" component={ProtectionPlans} />
        <Route path="/claim-guides" component={ClaimGuides} />
        <Route path="/industry-reports" component={IndustryReports} />
        <Route path="/webinars" component={Webinars} />
        <Route path="/knowledge-base" component={KnowledgeBase} />
        <Route path="/dealer-training" component={DealerTraining} />
        <Route path="/help-center" component={HelpCenter} />
        <Route path="/documentation" component={Documentation} />
        <Route path="/api-access" component={ApiAccess} />
        <Route path="/system-status" component={SystemStatus} />
        <Route path="/dealer-integration" component={DealerIntegration} />
        <Route path="/expert-consultation" component={ExpertConsultation} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

// Dealer portal role types — second URL segment identifies the role
const DEALER_PORTAL_ROLES = new Set([
  'owner', 'staff', 'client',
  'service-manager', 'shop-manager', 'parts-manager',
  'financial-manager', 'shop-tech', 'on-site-tech',
]);

function isDealerPortalPath(path: string): boolean {
  const seg = path.split('/')[2];
  return seg !== undefined && DEALER_PORTAL_ROLES.has(seg);
}

function isDealerAssistPath(path: string): boolean {
  const seg = path.split('/')[2];
  return seg === 'owner' || seg === 'staff';
}

function App() {
  const [location] = useLocation();
  // Portal sub-paths are isolated from the marketing layout.
  // /operator, /dealer, /client, /bidder (exact) serve login pages in the marketing Switch.
  // Only sub-paths (/:rest*) trigger portal mode.
  const isPortal = location.startsWith('/operator/') ||
                   location.startsWith('/operator-v6') ||
                   location.startsWith('/dealer/') ||
                   location.startsWith('/dealer-v6') ||
                   location.startsWith('/client/') ||
                   location.startsWith('/client-v6') ||
                   location.startsWith('/bidder/') ||
                   location.startsWith('/bidder-v6') ||
                   location.startsWith('/marketplace/bidder') ||
                   location.startsWith('/marketplace/consignor') ||
                   location.startsWith('/marketplace/independent') ||
                   location.startsWith('/marketplace/admin') ||
                   location.startsWith('/marketplace/staff') ||
                   isDealerPortalPath(location);

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
          <RemoteSupportProvider>
          <Suspense fallback={null}>
            <Switch>
              {/* v6 standalone sub-pages — specific routes before catch-alls */}
              <Route path="/operator-v6/dealerships/new" component={NewDealershipPageRoute} />
              <Route path="/operator-v6/dealerships/:id" component={DealershipDetailPage} />
              <Route path="/operator-v6/dealerships" component={DealerAccountsListPageRoute} />
              <Route path="/operator-v6/units/:id" component={UnitProfilePageOperator} />
              <Route path="/dealer-v6/units/:unitId/claims/new" component={NewClaimPageRoute} />
              <Route path="/dealer-v6/units/new" component={NewUnitPageRoute} />
              <Route path="/dealer-v6/units/:id" component={UnitProfilePageDealer} />
              <Route path="/client-v6/units/:id" component={UnitProfilePageClient} />

              {/* Session 3: Operator portals — BEFORE /operator/:rest* catch-all */}
              <Route path="/operator/admin/:rest*" component={OperatorAdminPortalSection} />
              <Route path="/operator/admin" component={OperatorAdminPortalSection} />
              <Route path="/operator/staff/:rest*" component={OperatorStaffPortalSection} />
              <Route path="/operator/staff" component={OperatorStaffPortalSection} />

              {/* v6 portal catch-alls → old portals (v6 endpoints) */}
              <Route path="/operator-v6/:rest*" component={OperatorPortal} />
              <Route path="/operator-v6" component={OperatorPortal} />
              <Route path="/dealer-v6/:rest*" component={DealerPortal} />
              <Route path="/dealer-v6" component={DealerPortal} />
              <Route path="/client-v6/:rest*" component={CustomerPortal} />
              <Route path="/client-v6" component={CustomerPortal} />
              {/* Legacy portal paths */}
              <Route path="/operator/:rest*" component={OperatorPortal} />
              <Route path="/dealer/:rest*" component={DealerPortal} />
              <Route path="/client/:rest*" component={CustomerPortal} />
              <Route path="/bidder/:rest*" component={BidderPortal} />

              {/* Session 3: Marketplace portals */}
              <Route path="/marketplace/bidder/:rest*" component={PublicBidderPortalSection} />
              <Route path="/marketplace/bidder" component={PublicBidderPortalSection} />
              <Route path="/marketplace/consignor/:rest*" component={ConsignorPortalSection} />
              <Route path="/marketplace/consignor" component={ConsignorPortalSection} />
              <Route path="/marketplace/independent/:rest*" component={IndependentBidderPortalSection} />
              <Route path="/marketplace/independent" component={IndependentBidderPortalSection} />
              <Route path="/marketplace/admin/:rest*" component={MarketplaceAdminPortalSection} />
              <Route path="/marketplace/admin" component={MarketplaceAdminPortalSection} />
              <Route path="/marketplace/staff/:rest*" component={MarketplaceStaffPortalSection} />
              <Route path="/marketplace/staff" component={MarketplaceStaffPortalSection} />

              {/* Session 3: Dealer role portals — dynamic :dealerId prefix, last in Switch */}
              <Route path="/:dealerId/owner/:rest*" component={DealerOwnerPortalSection} />
              <Route path="/:dealerId/owner" component={DealerOwnerPortalSection} />
              <Route path="/:dealerId/staff/:rest*" component={DealerStaffPortalSection} />
              <Route path="/:dealerId/staff" component={DealerStaffPortalSection} />
              <Route path="/:dealerId/client/:rest*" component={ClientPortalSection} />
              <Route path="/:dealerId/client" component={ClientPortalSection} />
              <Route path="/:dealerId/service-manager/:rest*" component={ServiceManagerPortalSection} />
              <Route path="/:dealerId/service-manager" component={ServiceManagerPortalSection} />
              <Route path="/:dealerId/shop-manager/:rest*" component={ShopManagerPortalSection} />
              <Route path="/:dealerId/shop-manager" component={ShopManagerPortalSection} />
              <Route path="/:dealerId/parts-manager/:rest*" component={PartsManagerPortalSection} />
              <Route path="/:dealerId/parts-manager" component={PartsManagerPortalSection} />
              <Route path="/:dealerId/financial-manager/:rest*" component={FinancialManagerPortalSection} />
              <Route path="/:dealerId/financial-manager" component={FinancialManagerPortalSection} />
              <Route path="/:dealerId/shop-tech/:rest*" component={ShopTechPortalSection} />
              <Route path="/:dealerId/shop-tech" component={ShopTechPortalSection} />
              <Route path="/:dealerId/on-site-tech/:rest*" component={OnSiteTechPortalSection} />
              <Route path="/:dealerId/on-site-tech" component={OnSiteTechPortalSection} />
            </Switch>
            {isDealerAssistPath(location) && <DealerWSConnector />}
            {isDealerAssistPath(location) && <AssistFAB />}
            {isDealerAssistPath(location) && <ScreenShareRequestToast />}
            <ScreenShareBanner />
          </Suspense>
          </RemoteSupportProvider>
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
