import { Route, Switch, Redirect, useLocation } from 'wouter';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// ─── Layouts ───────────────────────────────────────────────────────────────
import OperatorAdminLayout from '@/layouts/OperatorAdminLayout';
import OperatorStaffLayout from '@/layouts/OperatorStaffLayout';
import DealerOwnerLayout from '@/layouts/DealerOwnerLayout';
import DealerStaffLayout from '@/layouts/DealerStaffLayout';
import ClientLayout from '@/layouts/ClientLayout';
import ServiceManagerLayout from '@/layouts/ServiceManagerLayout';
import ShopManagerLayout from '@/layouts/ShopManagerLayout';
import PartsManagerLayout from '@/layouts/PartsManagerLayout';
import FinancialManagerLayout from '@/layouts/FinancialManagerLayout';
import ShopTechLayout from '@/layouts/ShopTechLayout';
import OnSiteTechLayout from '@/layouts/OnSiteTechLayout';
import PublicBidderLayout from '@/layouts/PublicBidderLayout';
import ConsignorLayout from '@/layouts/ConsignorLayout';
import IndependentBidderLayout from '@/layouts/IndependentBidderLayout';
import MarketplaceAdminLayout from '@/layouts/MarketplaceAdminLayout';
import MarketplaceStaffLayout from '@/layouts/MarketplaceStaffLayout';

// ─── Shared pages ──────────────────────────────────────────────────────────
import Dashboard from '@/pages/Dashboard';
import Claims from '@/pages/Claims';
import ClaimDetail from '@/pages/ClaimDetail';
import ClaimNew from '@/pages/ClaimNew';
import StaleClaims from '@/pages/StaleClaims';
import ProcessingQueue from '@/pages/ProcessingQueue';
import BatchReview from '@/pages/BatchReview';
import Units from '@/pages/Units';
import AddUnit from '@/pages/AddUnit';
import UnitNew from '@/pages/UnitNew';
import UnitDetail from '@/pages/UnitDetail';
import DealerManagement from '@/pages/DealerManagement';
import AddDealer from '@/pages/AddDealer';
import DealerDetail from '@/pages/DealerDetail';
import FRCCodes from '@/pages/FRCCodes';
import Financing from '@/pages/Financing';
import FinancingNew from '@/pages/FinancingNew';
import FinancingDetail from '@/pages/FinancingDetail';
import FAndI from '@/pages/FAndI';
import FAndINew from '@/pages/FAndINew';
import FAndIDetail from '@/pages/FAndIDetail';
import WarrantyPlans from '@/pages/WarrantyPlans';
import WarrantyPlansNew from '@/pages/WarrantyPlansNew';
import WarrantyDetail from '@/pages/WarrantyDetail';
import Warranty from '@/pages/Warranty';
import Parts from '@/pages/Parts';
import PartsNew from '@/pages/PartsNew';
import PartsDetail from '@/pages/PartsDetail';
import Invoices from '@/pages/Invoices';
import InvoiceDetail from '@/pages/InvoiceDetail';
import CreateInvoice from '@/pages/CreateInvoice';
import Reports from '@/pages/Reports';
import UsersRoles from '@/pages/UsersRoles';
import Products from '@/pages/Products';
import AddProduct from '@/pages/AddProduct';
import EditProduct from '@/pages/EditProduct';
import Notifications from '@/pages/Notifications';
import Settings from '@/pages/Settings';
import Changelog from '@/pages/Changelog';
import AddFeatureReq from '@/pages/AddFeatureReq';
import MfrPortals from '@/pages/MfrPortals';
import Customers from '@/pages/Customers';
import CustomerDetail from '@/pages/CustomerDetail';
import InviteCustomer from '@/pages/InviteCustomer';
import CustomerTickets from '@/pages/CustomerTickets';
import TicketDetail from '@/pages/TicketDetail';
import Documents from '@/pages/Documents';
import WorkOrders from '@/pages/WorkOrders';
import WorkOrderNew from '@/pages/WorkOrderNew';
import WorkOrderDetail from '@/pages/WorkOrderDetail';
import Messages from '@/pages/Messages';
import Auctions from '@/pages/Auctions';
import AuctionDetail from '@/pages/AuctionDetail';
import ServiceAppointments from '@/pages/ServiceAppointments';
import ImportData from '@/pages/ImportData';

// ─── Exclusive: Operator Admin ─────────────────────────────────────────────
import DealerClaims from '@/pages/exclusive/operator-admin/DealerClaims';
import DealerUnits from '@/pages/exclusive/operator-admin/DealerUnits';
import DealerStaffView from '@/pages/exclusive/operator-admin/DealerStaffView';
import DealerBilling from '@/pages/exclusive/operator-admin/DealerBilling';
import OA_Marketplace from '@/pages/exclusive/operator-admin/Marketplace';
import MktMembers from '@/pages/exclusive/operator-admin/MktMembers';
import MktMemberDetail from '@/pages/exclusive/operator-admin/MktMemberDetail';
import MktListings from '@/pages/exclusive/operator-admin/MktListings';
import MktTransactions from '@/pages/exclusive/operator-admin/MktTransactions';
import MktTransactionDetail from '@/pages/exclusive/operator-admin/MktTransactionDetail';
import MktAuctions from '@/pages/exclusive/operator-admin/MktAuctions';
import MktPublicEvents from '@/pages/exclusive/operator-admin/MktPublicEvents';
import MktPublicEventDetail from '@/pages/exclusive/operator-admin/MktPublicEventDetail';
import OA_CRM from '@/pages/exclusive/operator-admin/CRM';
import OA_CRMKanban from '@/pages/exclusive/operator-admin/CRMKanban';
import OA_CRMDealerDetail from '@/pages/exclusive/operator-admin/CRMDealerDetail';
import OA_Communications from '@/pages/exclusive/operator-admin/Communications';
import OA_Blog from '@/pages/exclusive/operator-admin/Blog';
import OA_BlogCreate from '@/pages/exclusive/operator-admin/BlogCreate';
import OA_InviteUser from '@/pages/exclusive/operator-admin/InviteUser';
import OA_Notifications from '@/pages/exclusive/operator-admin/Notifications';
import OA_UsersRoles from '@/pages/exclusive/operator-admin/UsersRoles';
import OA_Settings from '@/pages/exclusive/operator-admin/Settings';
import OA_PlatformSettings from '@/pages/exclusive/operator-admin/PlatformSettings';
import TechFlowOversight from '@/pages/exclusive/operator-admin/TechFlowOversight';
import FinancingApps from '@/pages/exclusive/operator-admin/FinancingApps';
import FinancingPartners from '@/pages/exclusive/operator-admin/FinancingPartners';
import PartsCatalog from '@/pages/exclusive/operator-admin/PartsCatalog';
import WorkByDealer from '@/pages/exclusive/operator-admin/WorkByDealer';
import CampaignTemplates from '@/pages/exclusive/operator-admin/CampaignTemplates';
import ConsignmentOversight from '@/pages/exclusive/operator-admin/ConsignmentOversight';
import PartsMgmt from '@/pages/exclusive/operator-admin/PartsMgmt';
import PartsOrders from '@/pages/exclusive/operator-admin/PartsOrders';
import EscrowAdmin from '@/pages/exclusive/operator-admin/EscrowAdmin';
import Roadmap from '@/pages/exclusive/operator-admin/Roadmap';
import AssistLiveChatPage from '@/pages/exclusive/operator-admin/AssistLiveChat';
import AssistAnalyticsPage from '@/pages/exclusive/operator-admin/AssistAnalytics';
import RemoteDashboard from '@/components/remote-support/RemoteDashboard';
import ModuleManagement from '@/pages/exclusive/operator-admin/ModuleManagement';
import WalletManagement from '@/pages/exclusive/operator-admin/WalletManagement';
import ArrivalsQueue from '@/pages/exclusive/operator-admin/ArrivalsQueue';
import KnowledgeBaseManagement from '@/pages/exclusive/operator-admin/KnowledgeBaseManagement';
import PaymentPlanManagement from '@/pages/exclusive/operator-admin/PaymentPlanManagement';
import UpsellStats from '@/pages/exclusive/operator-admin/UpsellStats';
import RemindersOverview from '@/pages/exclusive/operator-admin/RemindersOverview';
import LoyaltyStats from '@/pages/exclusive/operator-admin/LoyaltyStats';
import AISupportStats from '@/pages/exclusive/operator-admin/AISupportStats';

// ─── Exclusive: Shared ─────────────────────────────────────────────────────
import ScanUnit from '@/pages/exclusive/shared/ScanUnit';
import BatchScan from '@/pages/exclusive/shared/BatchScan';
import PDIChecklist from '@/pages/exclusive/shared/PDIChecklist';
import PDIDetail from '@/pages/exclusive/shared/PDIDetail';
import PDITemplateManagement from '@/pages/exclusive/operator-admin/PDITemplateManagement';
import KnowledgeBaseBrowse from '@/pages/exclusive/shared/KnowledgeBaseBrowse';

// ─── Exclusive: Dealer Owner ───────────────────────────────────────────────
import PhotoUpload from '@/pages/exclusive/dealer-owner/PhotoUpload';
import DealJacketList from '@/pages/exclusive/dealer-owner/DealJacketList';
import DealJacket from '@/pages/exclusive/dealer-owner/DealJacket';
import DO_Marketplace from '@/pages/exclusive/dealer-owner/Marketplace';
import Consignment from '@/pages/exclusive/dealer-owner/Consignment';
import Marketing from '@/pages/exclusive/dealer-owner/Marketing';
import SalesServices from '@/pages/exclusive/dealer-owner/SalesServices';
import StaffManagement from '@/pages/exclusive/dealer-owner/StaffManagement';
import AddStaff from '@/pages/exclusive/dealer-owner/AddStaff';
import BrandingSettings from '@/pages/exclusive/dealer-owner/BrandingSettings';
import BillingSettings from '@/pages/exclusive/dealer-owner/BillingSettings';
import PortalSettings from '@/pages/exclusive/dealer-owner/PortalSettings';
import ModuleCatalog from '@/pages/exclusive/dealer-owner/ModuleCatalog';
import ModuleDetail from '@/pages/exclusive/dealer-owner/ModuleDetail';
import WalletDashboard from '@/pages/exclusive/dealer-owner/WalletDashboard';

// ─── Exclusive: Client ─────────────────────────────────────────────────────
import FIOffers from '@/pages/exclusive/client/FIOffers';
import MyServices from '@/pages/exclusive/client/MyServices';
import NewTicket from '@/pages/exclusive/client/NewTicket';
import ReportIssue from '@/pages/exclusive/client/ReportIssue';
import QuickChat from '@/pages/exclusive/client/QuickChat';
import Roadside from '@/pages/exclusive/client/Roadside';
import CL_Messages from '@/pages/exclusive/client/Messages';
import DealJacketView from '@/pages/exclusive/client/DealJacketView';
import ClientPDIView from '@/pages/exclusive/client/PDIView';
import ClientKnowledgeBase from '@/pages/exclusive/client/KnowledgeBase';

// ─── Exclusive: Service Manager ────────────────────────────────────────────
import Scheduling from '@/pages/exclusive/service-manager/Scheduling';
import TechAssignments from '@/pages/exclusive/service-manager/TechAssignments';
import ServiceSettings from '@/pages/exclusive/service-manager/ServiceSettings';

// ─── Exclusive: Shop Manager ───────────────────────────────────────────────
import DispatchBoard from '@/pages/exclusive/shop-manager/DispatchBoard';

// ─── Exclusive: Parts Manager ──────────────────────────────────────────────
import Inventory from '@/pages/exclusive/parts-manager/Inventory';

// ─── Exclusive: Financial Manager ─────────────────────────────────────────
import RevenueDashboard from '@/pages/exclusive/financial-manager/RevenueDashboard';
import PaymentPlans from '@/pages/exclusive/dealer-owner/PaymentPlans';
import UpsellDashboard from '@/pages/exclusive/dealer-owner/UpsellDashboard';
import MyPaymentPlans from '@/pages/exclusive/client/MyPaymentPlans';
import ClientSettings from '@/pages/exclusive/client/Settings';
import RemindersDashboard from '@/pages/exclusive/dealer-owner/RemindersDashboard';
import LoyaltyConfig from '@/pages/exclusive/dealer-owner/LoyaltyConfig';
import CustomerLoyalty from '@/pages/exclusive/client/CustomerLoyalty';
import AISupportConfig from '@/pages/exclusive/dealer-owner/AISupportConfig';
import ReviewsDashboard from '@/pages/exclusive/dealer-owner/ReviewsDashboard';
import NpsDashboard from '@/pages/exclusive/operator-admin/NpsDashboard';
import CustomerSurvey from '@/pages/exclusive/client/CustomerSurvey';
import OperatorAnalytics from '@/pages/exclusive/operator-admin/OperatorAnalytics';
import DealerAnalytics from '@/pages/exclusive/dealer-owner/DealerAnalytics';

// ─── Exclusive: Public Bidder ──────────────────────────────────────────────
import PB_Profile from '@/pages/exclusive/public-bidder/Profile';
import PB_Verification from '@/pages/exclusive/public-bidder/Verification';
import PB_Payment from '@/pages/exclusive/public-bidder/Payment';
import PB_MyBids from '@/pages/exclusive/public-bidder/MyBids';
import PB_WonUnits from '@/pages/exclusive/public-bidder/WonUnits';
import PB_PaymentMethods from '@/pages/exclusive/public-bidder/PaymentMethods';

// ─── Exclusive: Consignor ──────────────────────────────────────────────────
import CO_MyListings from '@/pages/exclusive/consignor/MyListings';
import CO_NewListing from '@/pages/exclusive/consignor/NewListing';
import CO_Offers from '@/pages/exclusive/consignor/Offers';
import CO_Showcase from '@/pages/exclusive/consignor/Showcase';
import CO_ShowcaseSubmit from '@/pages/exclusive/consignor/ShowcaseSubmit';
import CO_PayoutTracking from '@/pages/exclusive/consignor/PayoutTracking';

// ─── Dealer fallback redirect helper ──────────────────────────────────────
function DealerFallback({ role }: { role: string }) {
  const [location] = useLocation();
  const dealerId = location.split('/').filter(Boolean)[0] || 'unknown';
  return <Redirect to={`/${dealerId}/${role}/dashboard`} />;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. OPERATOR ADMIN — /operator/admin/*
// ═══════════════════════════════════════════════════════════════════════════
export function OperatorAdminPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['operator_admin']}>
    <Switch>
      {/* Dealer sub-routes — most specific first */}
      <Route path="/operator/admin/dealers/:dealerId/claims">{() => <OperatorAdminLayout><DealerClaims /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/dealers/:dealerId/units">{() => <OperatorAdminLayout><DealerUnits /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/dealers/:dealerId/staff">{() => <OperatorAdminLayout><DealerStaffView /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/dealers/:dealerId/billing">{() => <OperatorAdminLayout><DealerBilling /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/dealers/new">{() => <OperatorAdminLayout><AddDealer /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/dealers/:dealerId">{() => <OperatorAdminLayout><DealerDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/dealers">{() => <OperatorAdminLayout><DealerManagement /></OperatorAdminLayout>}</Route>
      {/* Units */}
      <Route path="/operator/admin/units/new">{() => <OperatorAdminLayout><AddUnit /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/units/:unitId/pdi/new">{() => <OperatorAdminLayout><PDIChecklist /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/units/:unitId">{() => <OperatorAdminLayout><UnitDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/units">{() => <OperatorAdminLayout><Units /></OperatorAdminLayout>}</Route>
      {/* PDI */}
      <Route path="/operator/admin/pdi/templates">{() => <OperatorAdminLayout><PDITemplateManagement /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/pdi/:pdiId">{() => <OperatorAdminLayout><PDIDetail /></OperatorAdminLayout>}</Route>
      {/* Claims */}
      <Route path="/operator/admin/claims/:claimId">{() => <OperatorAdminLayout><ClaimDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/claims">{() => <OperatorAdminLayout><Claims /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/stale">{() => <OperatorAdminLayout><StaleClaims /></OperatorAdminLayout>}</Route>
      {/* Queue */}
      <Route path="/operator/admin/queue/:batchId">{() => <OperatorAdminLayout><BatchReview /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/queue">{() => <OperatorAdminLayout><ProcessingQueue /></OperatorAdminLayout>}</Route>
      {/* Dashboard & FRC */}
      <Route path="/operator/admin/dashboard">{() => <OperatorAdminLayout><Dashboard /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/frc">{() => <OperatorAdminLayout><FRCCodes /></OperatorAdminLayout>}</Route>
      {/* Financing */}
      <Route path="/operator/admin/financing-apps">{() => <OperatorAdminLayout><FinancingApps /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/financing-partners">{() => <OperatorAdminLayout><FinancingPartners /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/financing/new">{() => <OperatorAdminLayout><FinancingNew /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/financing/:finId">{() => <OperatorAdminLayout><FinancingDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/financing">{() => <OperatorAdminLayout><Financing /></OperatorAdminLayout>}</Route>
      {/* F&I */}
      <Route path="/operator/admin/fi/new">{() => <OperatorAdminLayout><FAndINew /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/fi/:fiId">{() => <OperatorAdminLayout><FAndIDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/fi">{() => <OperatorAdminLayout><FAndI /></OperatorAdminLayout>}</Route>
      {/* Warranty */}
      <Route path="/operator/admin/warranty-plans/new">{() => <OperatorAdminLayout><WarrantyPlansNew /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/warranty-plans">{() => <OperatorAdminLayout><WarrantyPlans /></OperatorAdminLayout>}</Route>
      {/* Parts */}
      <Route path="/operator/admin/parts-catalog">{() => <OperatorAdminLayout><PartsCatalog /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/parts-mgmt">{() => <OperatorAdminLayout><PartsMgmt /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/parts-orders">{() => <OperatorAdminLayout><PartsOrders /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/parts/new">{() => <OperatorAdminLayout><PartsNew /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/parts/:orderId">{() => <OperatorAdminLayout><PartsDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/parts">{() => <OperatorAdminLayout><Parts /></OperatorAdminLayout>}</Route>
      {/* Invoices */}
      <Route path="/operator/admin/invoices/new">{() => <OperatorAdminLayout><CreateInvoice /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/invoices/:invoiceId">{() => <OperatorAdminLayout><InvoiceDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/invoices">{() => <OperatorAdminLayout><Invoices /></OperatorAdminLayout>}</Route>
      {/* Marketplace sub-routes */}
      <Route path="/operator/admin/marketplace/members/:memberId">{() => <OperatorAdminLayout><MktMemberDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/marketplace/members">{() => <OperatorAdminLayout><MktMembers /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/marketplace/listings">{() => <OperatorAdminLayout><MktListings /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/marketplace/transactions/:txnId">{() => <OperatorAdminLayout><MktTransactionDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/marketplace/transactions">{() => <OperatorAdminLayout><MktTransactions /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/marketplace/auctions">{() => <OperatorAdminLayout><MktAuctions /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/marketplace/public-events/:eventId">{() => <OperatorAdminLayout><MktPublicEventDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/marketplace/public-events">{() => <OperatorAdminLayout><MktPublicEvents /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/marketplace">{() => <OperatorAdminLayout><OA_Marketplace /></OperatorAdminLayout>}</Route>
      {/* CRM */}
      <Route path="/operator/admin/crm/kanban">{() => <OperatorAdminLayout><OA_CRMKanban /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/crm/:dealerId">{() => <OperatorAdminLayout><OA_CRMDealerDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/crm">{() => <OperatorAdminLayout><OA_CRM /></OperatorAdminLayout>}</Route>
      {/* Tickets */}
      <Route path="/operator/admin/tickets/:ticketId">{() => <OperatorAdminLayout><TicketDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/tickets">{() => <OperatorAdminLayout><CustomerTickets /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/customers/:customerId">{() => <OperatorAdminLayout><CustomerDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/customers">{() => <OperatorAdminLayout><Customers /></OperatorAdminLayout>}</Route>
      {/* Finance & reports */}
      <Route path="/operator/admin/reports">{() => <OperatorAdminLayout><Reports /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/users/invite">{() => <OperatorAdminLayout><OA_InviteUser /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/users">{() => <OperatorAdminLayout><OA_UsersRoles /></OperatorAdminLayout>}</Route>
      {/* Products */}
      <Route path="/operator/admin/products/new">{() => <OperatorAdminLayout><AddProduct /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/products/:productId/edit">{() => <OperatorAdminLayout><EditProduct /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/products">{() => <OperatorAdminLayout><Products /></OperatorAdminLayout>}</Route>
      {/* System */}
      <Route path="/operator/admin/communications">{() => <OperatorAdminLayout><OA_Communications /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/blog/new">{() => <OperatorAdminLayout><OA_BlogCreate /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/blog">{() => <OperatorAdminLayout><OA_Blog /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/notifications">{() => <OperatorAdminLayout><OA_Notifications /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/settings">{() => <OperatorAdminLayout><OA_Settings /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/platform-settings">{() => <OperatorAdminLayout><OA_PlatformSettings /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/changelog/feature-request">{() => <OperatorAdminLayout><AddFeatureReq /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/changelog">{() => <OperatorAdminLayout><Changelog /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/mfr-portals">{() => <OperatorAdminLayout><MfrPortals /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/techflow/new">{() => <OperatorAdminLayout><WorkOrderNew /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/techflow/:workOrderId">{() => <OperatorAdminLayout><WorkOrderDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/techflow">{() => <OperatorAdminLayout><TechFlowOversight /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/work-by-dealer">{() => <OperatorAdminLayout><WorkByDealer /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/campaign-templates">{() => <OperatorAdminLayout><CampaignTemplates /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/consignment">{() => <OperatorAdminLayout><ConsignmentOversight /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/escrow">{() => <OperatorAdminLayout><EscrowAdmin /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/import">{() => <OperatorAdminLayout><ImportData /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/roadmap">{() => <OperatorAdminLayout><Roadmap /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/assist-live-chat">{() => <OperatorAdminLayout><AssistLiveChatPage /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/assist-analytics">{() => <OperatorAdminLayout><AssistAnalyticsPage /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/remote-support">{() => <OperatorAdminLayout><RemoteDashboard /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/modules">{() => <OperatorAdminLayout><ModuleManagement /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/wallets">{() => <OperatorAdminLayout><WalletManagement /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/arrivals">{() => <OperatorAdminLayout><ArrivalsQueue /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/knowledge-base">{() => <OperatorAdminLayout><KnowledgeBaseManagement /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/payment-plans">{() => <OperatorAdminLayout><PaymentPlanManagement /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/upsell-stats">{() => <OperatorAdminLayout><UpsellStats /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/reminders">{() => <OperatorAdminLayout><RemindersOverview /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/loyalty-stats">{() => <OperatorAdminLayout><LoyaltyStats /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/ai-support-stats">{() => <OperatorAdminLayout><AISupportStats /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/reviews">{() => <OperatorAdminLayout><NpsDashboard /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/analytics">{() => <OperatorAdminLayout><OperatorAnalytics /></OperatorAdminLayout>}</Route>
      {/* Default */}
      <Route>{() => <Redirect to="/operator/admin/dashboard" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. OPERATOR STAFF — /operator/staff/*
// ═══════════════════════════════════════════════════════════════════════════
export function OperatorStaffPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['operator_staff']}>
    <Switch>
      <Route path="/operator/staff/claims/:claimId">{() => <OperatorStaffLayout><ClaimDetail /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/claims">{() => <OperatorStaffLayout><Claims /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/stale">{() => <OperatorStaffLayout><StaleClaims /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/queue/:batchId">{() => <OperatorStaffLayout><BatchReview /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/queue">{() => <OperatorStaffLayout><ProcessingQueue /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/units/:unitId">{() => <OperatorStaffLayout><UnitDetail /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/units">{() => <OperatorStaffLayout><Units /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/dealers/:dealerId">{() => <OperatorStaffLayout><DealerDetail /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/dealers">{() => <OperatorStaffLayout><DealerManagement /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/parts/new">{() => <OperatorStaffLayout><PartsNew /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/parts/:orderId">{() => <OperatorStaffLayout><PartsDetail /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/parts">{() => <OperatorStaffLayout><Parts /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/tickets/:ticketId">{() => <OperatorStaffLayout><TicketDetail /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/tickets">{() => <OperatorStaffLayout><CustomerTickets /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/notifications">{() => <OperatorStaffLayout><Notifications /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/changelog">{() => <OperatorStaffLayout><Changelog /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/remote-support">{() => <OperatorStaffLayout><RemoteDashboard /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/dashboard">{() => <OperatorStaffLayout><Dashboard /></OperatorStaffLayout>}</Route>
      <Route>{() => <Redirect to="/operator/staff/dashboard" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. DEALER OWNER — /:dealerId/owner/*
// ═══════════════════════════════════════════════════════════════════════════
export function DealerOwnerPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['dealer_owner']} requireDealershipId={true}>
    <Switch>
      <Route path="/:dealerId/owner/scan">{() => <DealerOwnerLayout><ScanUnit /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/units/batch-scan">{() => <DealerOwnerLayout><BatchScan /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/claims/new">{() => <DealerOwnerLayout><ClaimNew /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/claims/:claimId">{() => <DealerOwnerLayout><ClaimDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/claims">{() => <DealerOwnerLayout><Claims /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/units/new">{() => <DealerOwnerLayout><UnitNew /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/units/:unitId/pdi/new">{() => <DealerOwnerLayout><PDIChecklist /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/units/:unitId">{() => <DealerOwnerLayout><UnitDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/units">{() => <DealerOwnerLayout><Units /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/pdi/:pdiId">{() => <DealerOwnerLayout><PDIDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/financing/new">{() => <DealerOwnerLayout><FinancingNew /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/financing/:finId">{() => <DealerOwnerLayout><FinancingDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/financing">{() => <DealerOwnerLayout><Financing /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/fi/new">{() => <DealerOwnerLayout><FAndINew /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/fi/:fiId">{() => <DealerOwnerLayout><FAndIDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/fi">{() => <DealerOwnerLayout><FAndI /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/warranty/:planId">{() => <DealerOwnerLayout><WarrantyDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/warranty">{() => <DealerOwnerLayout><WarrantyPlans /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/parts/new">{() => <DealerOwnerLayout><PartsNew /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/parts/:orderId">{() => <DealerOwnerLayout><PartsDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/parts">{() => <DealerOwnerLayout><Parts /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/deal-jackets">{() => <DealerOwnerLayout><DealJacketList /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/customers/:customerId/jacket/:jacketId">{() => <DealerOwnerLayout><DealJacket /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/customers/invite">{() => <DealerOwnerLayout><InviteCustomer /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/customers/:customerId">{() => <DealerOwnerLayout><CustomerDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/customers">{() => <DealerOwnerLayout><Customers /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/customer-tickets/:ticketId">{() => <DealerOwnerLayout><TicketDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/customer-tickets">{() => <DealerOwnerLayout><CustomerTickets /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/techflow/new">{() => <DealerOwnerLayout><WorkOrderNew /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/techflow/:workOrderId">{() => <DealerOwnerLayout><WorkOrderDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/techflow">{() => <DealerOwnerLayout><WorkOrders /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/staff/new">{() => <DealerOwnerLayout><AddStaff /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/staff">{() => <DealerOwnerLayout><StaffManagement /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/upload">{() => <DealerOwnerLayout><PhotoUpload /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/invoices/:invoiceId">{() => <DealerOwnerLayout><InvoiceDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/invoices">{() => <DealerOwnerLayout><Invoices /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/documents">{() => <DealerOwnerLayout><Documents /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/messages">{() => <DealerOwnerLayout><Messages /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/marketplace">{() => <DealerOwnerLayout><DO_Marketplace /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/consignment">{() => <DealerOwnerLayout><Consignment /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/marketing">{() => <DealerOwnerLayout><Marketing /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/sales-services">{() => <DealerOwnerLayout><SalesServices /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/notifications">{() => <DealerOwnerLayout><Notifications /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/branding">{() => <DealerOwnerLayout><BrandingSettings /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/billing">{() => <DealerOwnerLayout><BillingSettings /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/portal-settings">{() => <DealerOwnerLayout><PortalSettings /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/settings">{() => <DealerOwnerLayout><Settings /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/import">{() => <DealerOwnerLayout><ImportData /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/whats-new">{() => <DealerOwnerLayout><Changelog /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/modules/:moduleSlug">{() => <DealerOwnerLayout><ModuleDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/modules">{() => <DealerOwnerLayout><ModuleCatalog /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/wallet">{() => <DealerOwnerLayout><WalletDashboard /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/knowledge-base">{() => <DealerOwnerLayout><KnowledgeBaseBrowse /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/payment-plans">{() => <DealerOwnerLayout><PaymentPlans /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/upsell">{() => <DealerOwnerLayout><UpsellDashboard /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/reminders">{() => <DealerOwnerLayout><RemindersDashboard /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/loyalty">{() => <DealerOwnerLayout><LoyaltyConfig /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/ai-support">{() => <DealerOwnerLayout><AISupportConfig /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/reviews">{() => <DealerOwnerLayout><ReviewsDashboard /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/analytics">{() => <DealerOwnerLayout><DealerAnalytics /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/dashboard">{() => <DealerOwnerLayout><Dashboard /></DealerOwnerLayout>}</Route>
      <Route>{() => <DealerFallback role="owner" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. DEALER STAFF — /:dealerId/staff/*
// ═══════════════════════════════════════════════════════════════════════════
export function DealerStaffPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['dealer_staff']} requireDealershipId={true}>
    <Switch>
      <Route path="/:dealerId/staff/scan">{() => <DealerStaffLayout><ScanUnit /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/units/batch-scan">{() => <DealerStaffLayout><BatchScan /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/claims/:claimId">{() => <DealerStaffLayout><ClaimDetail /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/claims">{() => <DealerStaffLayout><Claims /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/units/:unitId/pdi/new">{() => <DealerStaffLayout><PDIChecklist /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/units/:unitId">{() => <DealerStaffLayout><UnitDetail /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/units">{() => <DealerStaffLayout><Units /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/pdi/:pdiId">{() => <DealerStaffLayout><PDIDetail /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/customer-tickets/:ticketId">{() => <DealerStaffLayout><TicketDetail /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/customer-tickets">{() => <DealerStaffLayout><CustomerTickets /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/staff">{() => <DealerStaffLayout><StaffManagement /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/upload">{() => <DealerStaffLayout><PhotoUpload /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/parts/:orderId">{() => <DealerStaffLayout><PartsDetail /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/parts">{() => <DealerStaffLayout><Parts /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/customers">{() => <DealerStaffLayout><Customers /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/documents">{() => <DealerStaffLayout><Documents /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/messages">{() => <DealerStaffLayout><Messages /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/notifications">{() => <DealerStaffLayout><Notifications /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/import">{() => <DealerStaffLayout><ImportData /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/whats-new">{() => <DealerStaffLayout><Changelog /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/knowledge-base">{() => <DealerStaffLayout><KnowledgeBaseBrowse /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/dashboard">{() => <DealerStaffLayout><Dashboard /></DealerStaffLayout>}</Route>
      <Route>{() => <DealerFallback role="staff" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. CLIENT — /:dealerId/client/*
// ═══════════════════════════════════════════════════════════════════════════
export function ClientPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['client']} requireDealershipId={true}>
    <Switch>
      <Route path="/:dealerId/client/claims/:claimId">{() => <ClientLayout><ClaimDetail /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/claims">{() => <ClientLayout><Claims /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/tickets/new">{() => <ClientLayout><NewTicket /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/tickets/:ticketId">{() => <ClientLayout><TicketDetail /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/tickets">{() => <ClientLayout><CustomerTickets /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/my-unit">{() => <ClientLayout><UnitDetail /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/warranty">{() => <ClientLayout><Warranty /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/jacket/:jacketId">{() => <ClientLayout><DealJacketView /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/documents">{() => <ClientLayout><Documents /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/fi-products">{() => <ClientLayout><FAndI /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/fi-offers">{() => <ClientLayout><FIOffers /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/my-financing">{() => <ClientLayout><Financing /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/parts/:orderId">{() => <ClientLayout><PartsDetail /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/parts">{() => <ClientLayout><Parts /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/service-appointments">{() => <ClientLayout><ServiceAppointments /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/my-services">{() => <ClientLayout><MyServices /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/report-issue">{() => <ClientLayout><ReportIssue /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/quick-chat">{() => <ClientLayout><QuickChat /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/roadside">{() => <ClientLayout><Roadside /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/messages">{() => <ClientLayout><CL_Messages /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/notifications">{() => <ClientLayout><Notifications /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/pdi/:pdiId">{() => <ClientLayout><ClientPDIView /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/knowledge-base">{() => <ClientLayout><ClientKnowledgeBase /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/payment-plans">{() => <ClientLayout><MyPaymentPlans /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/loyalty">{() => <ClientLayout><CustomerLoyalty /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/review/:reviewId">{() => <CustomerSurvey />}</Route>
      <Route path="/:dealerId/client/settings">{() => <ClientLayout><ClientSettings /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/dashboard">{() => <ClientLayout><Dashboard /></ClientLayout>}</Route>
      <Route>{() => <DealerFallback role="client" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. SERVICE MANAGER — /:dealerId/service-manager/*
// ═══════════════════════════════════════════════════════════════════════════
export function ServiceManagerPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['service_manager']} requireDealershipId={true}>
    <Switch>
      <Route path="/:dealerId/service-manager/claims/:claimId">{() => <ServiceManagerLayout><ClaimDetail /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/claims">{() => <ServiceManagerLayout><Claims /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/units/:unitId">{() => <ServiceManagerLayout><UnitDetail /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/units">{() => <ServiceManagerLayout><Units /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/work-orders/new">{() => <ServiceManagerLayout><WorkOrderNew /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/work-orders/:workOrderId">{() => <ServiceManagerLayout><WorkOrderDetail /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/work-orders">{() => <ServiceManagerLayout><WorkOrders /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/scheduling">{() => <ServiceManagerLayout><Scheduling /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/technicians">{() => <ServiceManagerLayout><TechAssignments /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/parts/:orderId">{() => <ServiceManagerLayout><PartsDetail /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/parts">{() => <ServiceManagerLayout><Parts /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/service-appointments">{() => <ServiceManagerLayout><ServiceAppointments /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/settings">{() => <ServiceManagerLayout><ServiceSettings /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/knowledge-base">{() => <ServiceManagerLayout><KnowledgeBaseBrowse /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/dashboard">{() => <ServiceManagerLayout><Dashboard /></ServiceManagerLayout>}</Route>
      <Route>{() => <DealerFallback role="service-manager" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. SHOP MANAGER — /:dealerId/shop-manager/*
// ═══════════════════════════════════════════════════════════════════════════
export function ShopManagerPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['shop_manager']} requireDealershipId={true}>
    <Switch>
      <Route path="/:dealerId/shop-manager/work-orders/:workOrderId">{() => <ShopManagerLayout><WorkOrderDetail /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/work-orders">{() => <ShopManagerLayout><WorkOrders /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/units/:unitId">{() => <ShopManagerLayout><UnitDetail /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/units">{() => <ShopManagerLayout><Units /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/dispatch">{() => <ShopManagerLayout><DispatchBoard /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/parts/:orderId">{() => <ShopManagerLayout><PartsDetail /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/parts">{() => <ShopManagerLayout><Parts /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/dashboard">{() => <ShopManagerLayout><Dashboard /></ShopManagerLayout>}</Route>
      <Route>{() => <DealerFallback role="shop-manager" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. PARTS MANAGER — /:dealerId/parts-manager/*
// ═══════════════════════════════════════════════════════════════════════════
export function PartsManagerPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['parts_dept']} requireDealershipId={true}>
    <Switch>
      <Route path="/:dealerId/parts-manager/orders/new">{() => <PartsManagerLayout><PartsNew /></PartsManagerLayout>}</Route>
      <Route path="/:dealerId/parts-manager/orders/:orderId">{() => <PartsManagerLayout><PartsDetail /></PartsManagerLayout>}</Route>
      <Route path="/:dealerId/parts-manager/orders">{() => <PartsManagerLayout><Parts /></PartsManagerLayout>}</Route>
      <Route path="/:dealerId/parts-manager/inventory">{() => <PartsManagerLayout><Inventory /></PartsManagerLayout>}</Route>
      <Route path="/:dealerId/parts-manager/claims/:claimId">{() => <PartsManagerLayout><ClaimDetail /></PartsManagerLayout>}</Route>
      <Route path="/:dealerId/parts-manager/claims">{() => <PartsManagerLayout><Claims /></PartsManagerLayout>}</Route>
      <Route path="/:dealerId/parts-manager/dashboard">{() => <PartsManagerLayout><Dashboard /></PartsManagerLayout>}</Route>
      <Route>{() => <DealerFallback role="parts-manager" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. FINANCIAL MANAGER — /:dealerId/financial-manager/*
// ═══════════════════════════════════════════════════════════════════════════
export function FinancialManagerPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['dealer_owner']} requireDealershipId={true}>
    <Switch>
      <Route path="/:dealerId/financial-manager/fi/:fiId">{() => <FinancialManagerLayout><FAndIDetail /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/fi">{() => <FinancialManagerLayout><FAndI /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/warranty/:planId">{() => <FinancialManagerLayout><WarrantyDetail /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/warranty">{() => <FinancialManagerLayout><WarrantyPlans /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/financing/:finId">{() => <FinancialManagerLayout><FinancingDetail /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/financing">{() => <FinancialManagerLayout><Financing /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/invoices/:invoiceId">{() => <FinancialManagerLayout><InvoiceDetail /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/invoices">{() => <FinancialManagerLayout><Invoices /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/products">{() => <FinancialManagerLayout><Products /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/revenue">{() => <FinancialManagerLayout><RevenueDashboard /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/dashboard">{() => <FinancialManagerLayout><Dashboard /></FinancialManagerLayout>}</Route>
      <Route>{() => <DealerFallback role="financial-manager" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. SHOP TECHNICIAN — /:dealerId/shop-tech/*
// ═══════════════════════════════════════════════════════════════════════════
export function ShopTechPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['technician']} requireDealershipId={true}>
    <Switch>
      <Route path="/:dealerId/shop-tech/scan">{() => <ShopTechLayout><ScanUnit /></ShopTechLayout>}</Route>
      <Route path="/:dealerId/shop-tech/units/:unitId/pdi/new">{() => <ShopTechLayout><PDIChecklist /></ShopTechLayout>}</Route>
      <Route path="/:dealerId/shop-tech/pdi/:pdiId">{() => <ShopTechLayout><PDIDetail /></ShopTechLayout>}</Route>
      <Route path="/:dealerId/shop-tech/work-orders/:workOrderId">{() => <ShopTechLayout><WorkOrderDetail /></ShopTechLayout>}</Route>
      <Route path="/:dealerId/shop-tech/work-orders">{() => <ShopTechLayout><WorkOrders /></ShopTechLayout>}</Route>
      <Route path="/:dealerId/shop-tech/knowledge-base">{() => <ShopTechLayout><KnowledgeBaseBrowse /></ShopTechLayout>}</Route>
      <Route path="/:dealerId/shop-tech/dashboard">{() => <ShopTechLayout><Dashboard /></ShopTechLayout>}</Route>
      <Route>{() => <DealerFallback role="shop-tech" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. ON-SITE TECHNICIAN — /:dealerId/on-site-tech/*
// ═══════════════════════════════════════════════════════════════════════════
export function OnSiteTechPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['technician']} requireDealershipId={true}>
    <Switch>
      <Route path="/:dealerId/on-site-tech/scan">{() => <OnSiteTechLayout><ScanUnit /></OnSiteTechLayout>}</Route>
      <Route path="/:dealerId/on-site-tech/units/:unitId/pdi/new">{() => <OnSiteTechLayout><PDIChecklist /></OnSiteTechLayout>}</Route>
      <Route path="/:dealerId/on-site-tech/pdi/:pdiId">{() => <OnSiteTechLayout><PDIDetail /></OnSiteTechLayout>}</Route>
      <Route path="/:dealerId/on-site-tech/work-orders/:workOrderId">{() => <OnSiteTechLayout><WorkOrderDetail /></OnSiteTechLayout>}</Route>
      <Route path="/:dealerId/on-site-tech/work-orders">{() => <OnSiteTechLayout><WorkOrders /></OnSiteTechLayout>}</Route>
      <Route path="/:dealerId/on-site-tech/knowledge-base">{() => <OnSiteTechLayout><KnowledgeBaseBrowse /></OnSiteTechLayout>}</Route>
      <Route path="/:dealerId/on-site-tech/dashboard">{() => <OnSiteTechLayout><Dashboard /></OnSiteTechLayout>}</Route>
      <Route>{() => <DealerFallback role="on-site-tech" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. PUBLIC BIDDER — /marketplace/bidder/*
// ═══════════════════════════════════════════════════════════════════════════
export function PublicBidderPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['public_bidder', 'bidder']}>
    <Switch>
      <Route path="/marketplace/bidder/auctions/:auctionId">{() => <PublicBidderLayout><AuctionDetail /></PublicBidderLayout>}</Route>
      <Route path="/marketplace/bidder/auctions">{() => <PublicBidderLayout><Auctions /></PublicBidderLayout>}</Route>
      <Route path="/marketplace/bidder/profile">{() => <PublicBidderLayout><PB_Profile /></PublicBidderLayout>}</Route>
      <Route path="/marketplace/bidder/verification">{() => <PublicBidderLayout><PB_Verification /></PublicBidderLayout>}</Route>
      <Route path="/marketplace/bidder/payment">{() => <PublicBidderLayout><PB_Payment /></PublicBidderLayout>}</Route>
      <Route path="/marketplace/bidder/my-bids">{() => <PublicBidderLayout><PB_MyBids /></PublicBidderLayout>}</Route>
      <Route path="/marketplace/bidder/won-units">{() => <PublicBidderLayout><PB_WonUnits /></PublicBidderLayout>}</Route>
      <Route path="/marketplace/bidder/payment-methods">{() => <PublicBidderLayout><PB_PaymentMethods /></PublicBidderLayout>}</Route>
      <Route path="/marketplace/bidder/settings">{() => <PublicBidderLayout><Settings /></PublicBidderLayout>}</Route>
      <Route path="/marketplace/bidder/dashboard">{() => <PublicBidderLayout><Dashboard /></PublicBidderLayout>}</Route>
      <Route>{() => <Redirect to="/marketplace/bidder/dashboard" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. CONSIGNOR — /marketplace/consignor/*
// ═══════════════════════════════════════════════════════════════════════════
export function ConsignorPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['consignor']}>
    <Switch>
      <Route path="/marketplace/consignor/auctions/:auctionId">{() => <ConsignorLayout><AuctionDetail /></ConsignorLayout>}</Route>
      <Route path="/marketplace/consignor/auctions">{() => <ConsignorLayout><Auctions /></ConsignorLayout>}</Route>
      <Route path="/marketplace/consignor/my-listings/new">{() => <ConsignorLayout><CO_NewListing /></ConsignorLayout>}</Route>
      <Route path="/marketplace/consignor/my-listings">{() => <ConsignorLayout><CO_MyListings /></ConsignorLayout>}</Route>
      <Route path="/marketplace/consignor/offers">{() => <ConsignorLayout><CO_Offers /></ConsignorLayout>}</Route>
      <Route path="/marketplace/consignor/showcase/submit">{() => <ConsignorLayout><CO_ShowcaseSubmit /></ConsignorLayout>}</Route>
      <Route path="/marketplace/consignor/showcase">{() => <ConsignorLayout><CO_Showcase /></ConsignorLayout>}</Route>
      <Route path="/marketplace/consignor/payout">{() => <ConsignorLayout><CO_PayoutTracking /></ConsignorLayout>}</Route>
      <Route path="/marketplace/consignor/settings">{() => <ConsignorLayout><Settings /></ConsignorLayout>}</Route>
      <Route path="/marketplace/consignor/dashboard">{() => <ConsignorLayout><Dashboard /></ConsignorLayout>}</Route>
      <Route>{() => <Redirect to="/marketplace/consignor/dashboard" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 14. INDEPENDENT BIDDER — /marketplace/independent/*
// ═══════════════════════════════════════════════════════════════════════════
export function IndependentBidderPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['independent_bidder', 'bidder']}>
    <Switch>
      <Route path="/marketplace/independent/auctions/:auctionId">{() => <IndependentBidderLayout><AuctionDetail /></IndependentBidderLayout>}</Route>
      <Route path="/marketplace/independent/auctions">{() => <IndependentBidderLayout><Auctions /></IndependentBidderLayout>}</Route>
      <Route path="/marketplace/independent/profile">{() => <IndependentBidderLayout><PB_Profile /></IndependentBidderLayout>}</Route>
      <Route path="/marketplace/independent/verification">{() => <IndependentBidderLayout><PB_Verification /></IndependentBidderLayout>}</Route>
      <Route path="/marketplace/independent/payment">{() => <IndependentBidderLayout><PB_Payment /></IndependentBidderLayout>}</Route>
      <Route path="/marketplace/independent/my-bids">{() => <IndependentBidderLayout><PB_MyBids /></IndependentBidderLayout>}</Route>
      <Route path="/marketplace/independent/won-units">{() => <IndependentBidderLayout><PB_WonUnits /></IndependentBidderLayout>}</Route>
      <Route path="/marketplace/independent/payment-methods">{() => <IndependentBidderLayout><PB_PaymentMethods /></IndependentBidderLayout>}</Route>
      <Route path="/marketplace/independent/settings">{() => <IndependentBidderLayout><Settings /></IndependentBidderLayout>}</Route>
      <Route path="/marketplace/independent/dashboard">{() => <IndependentBidderLayout><Dashboard /></IndependentBidderLayout>}</Route>
      <Route>{() => <Redirect to="/marketplace/independent/dashboard" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 15. MARKETPLACE ADMIN — /marketplace/admin/*
// ═══════════════════════════════════════════════════════════════════════════
export function MarketplaceAdminPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['operator_admin']}>
    <Switch>
      <Route path="/marketplace/admin/members/:memberId">{() => <MarketplaceAdminLayout><MktMemberDetail /></MarketplaceAdminLayout>}</Route>
      <Route path="/marketplace/admin/members">{() => <MarketplaceAdminLayout><MktMembers /></MarketplaceAdminLayout>}</Route>
      <Route path="/marketplace/admin/listings">{() => <MarketplaceAdminLayout><MktListings /></MarketplaceAdminLayout>}</Route>
      <Route path="/marketplace/admin/auctions">{() => <MarketplaceAdminLayout><MktAuctions /></MarketplaceAdminLayout>}</Route>
      <Route path="/marketplace/admin/transactions/:txnId">{() => <MarketplaceAdminLayout><MktTransactionDetail /></MarketplaceAdminLayout>}</Route>
      <Route path="/marketplace/admin/transactions">{() => <MarketplaceAdminLayout><MktTransactions /></MarketplaceAdminLayout>}</Route>
      <Route path="/marketplace/admin/escrow">{() => <MarketplaceAdminLayout><EscrowAdmin /></MarketplaceAdminLayout>}</Route>
      <Route path="/marketplace/admin/reports">{() => <MarketplaceAdminLayout><Reports /></MarketplaceAdminLayout>}</Route>
      <Route path="/marketplace/admin/settings">{() => <MarketplaceAdminLayout><Settings /></MarketplaceAdminLayout>}</Route>
      <Route path="/marketplace/admin/dashboard">{() => <MarketplaceAdminLayout><Dashboard /></MarketplaceAdminLayout>}</Route>
      <Route>{() => <Redirect to="/marketplace/admin/dashboard" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 16. MARKETPLACE STAFF — /marketplace/staff/*
// ═══════════════════════════════════════════════════════════════════════════
export function MarketplaceStaffPortalSection() {
  return (
    <ProtectedRoute allowedRoles={['operator_staff']}>
    <Switch>
      <Route path="/marketplace/staff/members">{() => <MarketplaceStaffLayout><MktMembers /></MarketplaceStaffLayout>}</Route>
      <Route path="/marketplace/staff/listings">{() => <MarketplaceStaffLayout><MktListings /></MarketplaceStaffLayout>}</Route>
      <Route path="/marketplace/staff/auctions">{() => <MarketplaceStaffLayout><MktAuctions /></MarketplaceStaffLayout>}</Route>
      <Route path="/marketplace/staff/bids">{() => <MarketplaceStaffLayout><MktTransactions /></MarketplaceStaffLayout>}</Route>
      <Route path="/marketplace/staff/dashboard">{() => <MarketplaceStaffLayout><Dashboard /></MarketplaceStaffLayout>}</Route>
      <Route>{() => <Redirect to="/marketplace/staff/dashboard" />}</Route>
    </Switch>
    </ProtectedRoute>
  );
}
