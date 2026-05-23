import { Route, Switch, Redirect, useLocation } from 'wouter';

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

// ─── Exclusive: Dealer Owner ───────────────────────────────────────────────
import PhotoUpload from '@/pages/exclusive/dealer-owner/PhotoUpload';
import DO_Marketplace from '@/pages/exclusive/dealer-owner/Marketplace';
import Consignment from '@/pages/exclusive/dealer-owner/Consignment';
import Marketing from '@/pages/exclusive/dealer-owner/Marketing';
import SalesServices from '@/pages/exclusive/dealer-owner/SalesServices';
import StaffManagement from '@/pages/exclusive/dealer-owner/StaffManagement';
import AddStaff from '@/pages/exclusive/dealer-owner/AddStaff';
import BrandingSettings from '@/pages/exclusive/dealer-owner/BrandingSettings';
import BillingSettings from '@/pages/exclusive/dealer-owner/BillingSettings';
import PortalSettings from '@/pages/exclusive/dealer-owner/PortalSettings';

// ─── Exclusive: Client ─────────────────────────────────────────────────────
import FIOffers from '@/pages/exclusive/client/FIOffers';
import MyServices from '@/pages/exclusive/client/MyServices';
import NewTicket from '@/pages/exclusive/client/NewTicket';
import ReportIssue from '@/pages/exclusive/client/ReportIssue';
import QuickChat from '@/pages/exclusive/client/QuickChat';
import Roadside from '@/pages/exclusive/client/Roadside';
import CL_Messages from '@/pages/exclusive/client/Messages';

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
      <Route path="/operator/admin/units/:unitId">{() => <OperatorAdminLayout><UnitDetail /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/units">{() => <OperatorAdminLayout><Units /></OperatorAdminLayout>}</Route>
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
      {/* Finance & reports */}
      <Route path="/operator/admin/reports">{() => <OperatorAdminLayout><Reports /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/users">{() => <OperatorAdminLayout><UsersRoles /></OperatorAdminLayout>}</Route>
      {/* Products */}
      <Route path="/operator/admin/products/new">{() => <OperatorAdminLayout><AddProduct /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/products/:productId/edit">{() => <OperatorAdminLayout><EditProduct /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/products">{() => <OperatorAdminLayout><Products /></OperatorAdminLayout>}</Route>
      {/* System */}
      <Route path="/operator/admin/communications">{() => <OperatorAdminLayout><OA_Communications /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/blog">{() => <OperatorAdminLayout><OA_Blog /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/notifications">{() => <OperatorAdminLayout><Notifications /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/settings">{() => <OperatorAdminLayout><Settings /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/platform-settings">{() => <OperatorAdminLayout><Settings /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/changelog/feature-request">{() => <OperatorAdminLayout><AddFeatureReq /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/changelog">{() => <OperatorAdminLayout><Changelog /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/mfr-portals">{() => <OperatorAdminLayout><MfrPortals /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/techflow">{() => <OperatorAdminLayout><TechFlowOversight /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/work-by-dealer">{() => <OperatorAdminLayout><WorkByDealer /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/campaign-templates">{() => <OperatorAdminLayout><CampaignTemplates /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/consignment">{() => <OperatorAdminLayout><ConsignmentOversight /></OperatorAdminLayout>}</Route>
      <Route path="/operator/admin/escrow">{() => <OperatorAdminLayout><EscrowAdmin /></OperatorAdminLayout>}</Route>
      {/* Default */}
      <Route>{() => <Redirect to="/operator/admin/dashboard" />}</Route>
    </Switch>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. OPERATOR STAFF — /operator/staff/*
// ═══════════════════════════════════════════════════════════════════════════
export function OperatorStaffPortalSection() {
  return (
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
      <Route path="/operator/staff/parts">{() => <OperatorStaffLayout><Parts /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/notifications">{() => <OperatorStaffLayout><Notifications /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/changelog">{() => <OperatorStaffLayout><Changelog /></OperatorStaffLayout>}</Route>
      <Route path="/operator/staff/dashboard">{() => <OperatorStaffLayout><Dashboard /></OperatorStaffLayout>}</Route>
      <Route>{() => <Redirect to="/operator/staff/dashboard" />}</Route>
    </Switch>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. DEALER OWNER — /:dealerId/owner/*
// ═══════════════════════════════════════════════════════════════════════════
export function DealerOwnerPortalSection() {
  return (
    <Switch>
      <Route path="/:dealerId/owner/claims/new">{() => <DealerOwnerLayout><ClaimNew /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/claims/:claimId">{() => <DealerOwnerLayout><ClaimDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/claims">{() => <DealerOwnerLayout><Claims /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/units/new">{() => <DealerOwnerLayout><UnitNew /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/units/:unitId">{() => <DealerOwnerLayout><UnitDetail /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/units">{() => <DealerOwnerLayout><Units /></DealerOwnerLayout>}</Route>
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
      <Route path="/:dealerId/owner/whats-new">{() => <DealerOwnerLayout><Changelog /></DealerOwnerLayout>}</Route>
      <Route path="/:dealerId/owner/dashboard">{() => <DealerOwnerLayout><Dashboard /></DealerOwnerLayout>}</Route>
      <Route>{() => <DealerFallback role="owner" />}</Route>
    </Switch>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. DEALER STAFF — /:dealerId/staff/*
// ═══════════════════════════════════════════════════════════════════════════
export function DealerStaffPortalSection() {
  return (
    <Switch>
      <Route path="/:dealerId/staff/claims/:claimId">{() => <DealerStaffLayout><ClaimDetail /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/claims">{() => <DealerStaffLayout><Claims /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/units/:unitId">{() => <DealerStaffLayout><UnitDetail /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/units">{() => <DealerStaffLayout><Units /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/customer-tickets/:ticketId">{() => <DealerStaffLayout><TicketDetail /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/customer-tickets">{() => <DealerStaffLayout><CustomerTickets /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/upload">{() => <DealerStaffLayout><PhotoUpload /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/parts">{() => <DealerStaffLayout><Parts /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/customers">{() => <DealerStaffLayout><Customers /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/documents">{() => <DealerStaffLayout><Documents /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/messages">{() => <DealerStaffLayout><Messages /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/notifications">{() => <DealerStaffLayout><Notifications /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/whats-new">{() => <DealerStaffLayout><Changelog /></DealerStaffLayout>}</Route>
      <Route path="/:dealerId/staff/dashboard">{() => <DealerStaffLayout><Dashboard /></DealerStaffLayout>}</Route>
      <Route>{() => <DealerFallback role="staff" />}</Route>
    </Switch>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. CLIENT — /:dealerId/client/*
// ═══════════════════════════════════════════════════════════════════════════
export function ClientPortalSection() {
  return (
    <Switch>
      <Route path="/:dealerId/client/claims/:claimId">{() => <ClientLayout><ClaimDetail /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/claims">{() => <ClientLayout><Claims /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/tickets/new">{() => <ClientLayout><NewTicket /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/tickets/:ticketId">{() => <ClientLayout><TicketDetail /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/tickets">{() => <ClientLayout><CustomerTickets /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/my-unit">{() => <ClientLayout><UnitDetail /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/warranty">{() => <ClientLayout><Warranty /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/documents">{() => <ClientLayout><Documents /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/fi-products">{() => <ClientLayout><FAndI /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/fi-offers">{() => <ClientLayout><FIOffers /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/my-financing">{() => <ClientLayout><Financing /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/parts">{() => <ClientLayout><Parts /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/service-appointments">{() => <ClientLayout><ServiceAppointments /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/my-services">{() => <ClientLayout><MyServices /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/report-issue">{() => <ClientLayout><ReportIssue /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/quick-chat">{() => <ClientLayout><QuickChat /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/roadside">{() => <ClientLayout><Roadside /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/messages">{() => <ClientLayout><CL_Messages /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/settings">{() => <ClientLayout><Settings /></ClientLayout>}</Route>
      <Route path="/:dealerId/client/dashboard">{() => <ClientLayout><Dashboard /></ClientLayout>}</Route>
      <Route>{() => <DealerFallback role="client" />}</Route>
    </Switch>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. SERVICE MANAGER — /:dealerId/service-manager/*
// ═══════════════════════════════════════════════════════════════════════════
export function ServiceManagerPortalSection() {
  return (
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
      <Route path="/:dealerId/service-manager/parts">{() => <ServiceManagerLayout><Parts /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/service-appointments">{() => <ServiceManagerLayout><ServiceAppointments /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/settings">{() => <ServiceManagerLayout><ServiceSettings /></ServiceManagerLayout>}</Route>
      <Route path="/:dealerId/service-manager/dashboard">{() => <ServiceManagerLayout><Dashboard /></ServiceManagerLayout>}</Route>
      <Route>{() => <DealerFallback role="service-manager" />}</Route>
    </Switch>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. SHOP MANAGER — /:dealerId/shop-manager/*
// ═══════════════════════════════════════════════════════════════════════════
export function ShopManagerPortalSection() {
  return (
    <Switch>
      <Route path="/:dealerId/shop-manager/work-orders/:workOrderId">{() => <ShopManagerLayout><WorkOrderDetail /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/work-orders">{() => <ShopManagerLayout><WorkOrders /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/units/:unitId">{() => <ShopManagerLayout><UnitDetail /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/units">{() => <ShopManagerLayout><Units /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/dispatch">{() => <ShopManagerLayout><DispatchBoard /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/parts">{() => <ShopManagerLayout><Parts /></ShopManagerLayout>}</Route>
      <Route path="/:dealerId/shop-manager/dashboard">{() => <ShopManagerLayout><Dashboard /></ShopManagerLayout>}</Route>
      <Route>{() => <DealerFallback role="shop-manager" />}</Route>
    </Switch>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. PARTS MANAGER — /:dealerId/parts-manager/*
// ═══════════════════════════════════════════════════════════════════════════
export function PartsManagerPortalSection() {
  return (
    <Switch>
      <Route path="/:dealerId/parts-manager/orders/new">{() => <PartsManagerLayout><PartsNew /></PartsManagerLayout>}</Route>
      <Route path="/:dealerId/parts-manager/orders/:orderId">{() => <PartsManagerLayout><PartsDetail /></PartsManagerLayout>}</Route>
      <Route path="/:dealerId/parts-manager/orders">{() => <PartsManagerLayout><Parts /></PartsManagerLayout>}</Route>
      <Route path="/:dealerId/parts-manager/inventory">{() => <PartsManagerLayout><Inventory /></PartsManagerLayout>}</Route>
      <Route path="/:dealerId/parts-manager/claims">{() => <PartsManagerLayout><Claims /></PartsManagerLayout>}</Route>
      <Route path="/:dealerId/parts-manager/dashboard">{() => <PartsManagerLayout><Dashboard /></PartsManagerLayout>}</Route>
      <Route>{() => <DealerFallback role="parts-manager" />}</Route>
    </Switch>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. FINANCIAL MANAGER — /:dealerId/financial-manager/*
// ═══════════════════════════════════════════════════════════════════════════
export function FinancialManagerPortalSection() {
  return (
    <Switch>
      <Route path="/:dealerId/financial-manager/fi/:fiId">{() => <FinancialManagerLayout><FAndIDetail /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/fi">{() => <FinancialManagerLayout><FAndI /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/warranty/:planId">{() => <FinancialManagerLayout><WarrantyDetail /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/warranty">{() => <FinancialManagerLayout><WarrantyPlans /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/financing/:finId">{() => <FinancialManagerLayout><FinancingDetail /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/financing">{() => <FinancialManagerLayout><Financing /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/invoices">{() => <FinancialManagerLayout><Invoices /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/revenue">{() => <FinancialManagerLayout><RevenueDashboard /></FinancialManagerLayout>}</Route>
      <Route path="/:dealerId/financial-manager/dashboard">{() => <FinancialManagerLayout><Dashboard /></FinancialManagerLayout>}</Route>
      <Route>{() => <DealerFallback role="financial-manager" />}</Route>
    </Switch>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. SHOP TECHNICIAN — /:dealerId/shop-tech/*
// ═══════════════════════════════════════════════════════════════════════════
export function ShopTechPortalSection() {
  return (
    <Switch>
      <Route path="/:dealerId/shop-tech/work-orders/:workOrderId">{() => <ShopTechLayout><WorkOrderDetail /></ShopTechLayout>}</Route>
      <Route path="/:dealerId/shop-tech/work-orders">{() => <ShopTechLayout><WorkOrders /></ShopTechLayout>}</Route>
      <Route path="/:dealerId/shop-tech/dashboard">{() => <ShopTechLayout><Dashboard /></ShopTechLayout>}</Route>
      <Route>{() => <DealerFallback role="shop-tech" />}</Route>
    </Switch>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 11. ON-SITE TECHNICIAN — /:dealerId/on-site-tech/*
// ═══════════════════════════════════════════════════════════════════════════
export function OnSiteTechPortalSection() {
  return (
    <Switch>
      <Route path="/:dealerId/on-site-tech/work-orders/:workOrderId">{() => <OnSiteTechLayout><WorkOrderDetail /></OnSiteTechLayout>}</Route>
      <Route path="/:dealerId/on-site-tech/work-orders">{() => <OnSiteTechLayout><WorkOrders /></OnSiteTechLayout>}</Route>
      <Route path="/:dealerId/on-site-tech/dashboard">{() => <OnSiteTechLayout><Dashboard /></OnSiteTechLayout>}</Route>
      <Route>{() => <DealerFallback role="on-site-tech" />}</Route>
    </Switch>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 12. PUBLIC BIDDER — /marketplace/bidder/*
// ═══════════════════════════════════════════════════════════════════════════
export function PublicBidderPortalSection() {
  return (
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
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 13. CONSIGNOR — /marketplace/consignor/*
// ═══════════════════════════════════════════════════════════════════════════
export function ConsignorPortalSection() {
  return (
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
  );
}
