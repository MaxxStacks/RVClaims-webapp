// server/db/seedModules.ts — Seed the 12 DS360 service modules
// Run via: npx tsx server/seed.ts (called from main seed)

import { db } from "../db";
import { serviceModules } from "@shared/schema";
import { eq } from "drizzle-orm";

const MODULES = [
  {
    name: "Claims Processing",
    slug: "claims-processing",
    tagline: "Streamline your warranty claims from inspection to payment",
    description: [
      "The backbone of your dealership operations, DS360 Claims Processing gives your team a complete end-to-end warranty claims management system purpose-built for RV dealerships. From the moment a unit arrives on your lot to final manufacturer payment, every step is tracked, documented, and optimized for maximum approval rates.",
      "Our expert operator team reviews every claim before submission, catching errors and optimizing FRC code selection based on years of manufacturer-specific experience. AI photo quality analysis flags issues before they become denial reasons.",
      "With DS360, dealerships typically see 23% fewer denials and 18% faster payment cycles within the first 90 days.",
    ].join("\n\n"),
    features: [
      "Full claims lifecycle management",
      "FRC code library by manufacturer",
      "Batch photo upload with Push to Claim",
      "Operator processing queue with assign and review",
      "Per-line approve and deny with denial reasons",
      "Manufacturer portal submission tracking",
      "Preauth and claim number tracking",
      "Claim-to-invoice workflow",
    ],
    icon: "FileText",
    category: "Claims",
    monthlyPrice: "0",
    isBase: true,
    sortOrder: 1,
  },
  {
    name: "Extended Warranty",
    slug: "extended-warranty",
    tagline: "Sell and manage extended warranty plans for every unit",
    description: [
      "Extended warranty sales are one of the highest-margin revenue opportunities in RV dealerships. DS360 Extended Warranty gives you a complete platform to create, sell, and manage extended service plans that keep customers protected long after the manufacturer warranty expires.",
      "Build custom warranty tiers across 6 coverage categories, track every active plan with automated renewal alerts, and generate professional warranty certificates your customers can access anytime.",
      "Integration with the claims module means warranty coverage is automatically verified when a claim is filed, reducing manual lookup time and ensuring customers get the service they are entitled to.",
    ].join("\n\n"),
    features: [
      "Custom warranty plan creation",
      "6 coverage categories (Structural, Plumbing, Electrical, HVAC, Appliances, Slide-Outs)",
      "Customer-facing warranty display with days remaining",
      "Automated renewal tracking and alerts",
      "Coverage breakdown per category",
      "Warranty certificate generation",
    ],
    icon: "Shield",
    category: "Finance",
    monthlyPrice: "149",
    isBase: false,
    sortOrder: 2,
  },
  {
    name: "GAP Coverage",
    slug: "gap-coverage",
    tagline: "Protect your customers against depreciation gaps",
    description: [
      "RVs depreciate rapidly, and a total loss without GAP coverage can leave your customers underwater on their loan. DS360 GAP Coverage lets you offer, enroll, and manage GAP insurance products directly from your dealership portal.",
      "Track every active GAP policy, process GAP claims when needed, and integrate seamlessly with your F&I workflow so no deal leaves your lot without the right protection discussion.",
      "Policy documents are stored digitally and customers can access them through the Customer Portal module, reducing your administrative burden while improving the customer experience.",
    ].join("\n\n"),
    features: [
      "GAP product catalog management",
      "Customer enrollment and tracking",
      "Integration with F&I deal workflow",
      "Claims processing for GAP coverage",
      "Policy document management",
    ],
    icon: "Umbrella",
    category: "Finance",
    monthlyPrice: "99",
    isBase: false,
    sortOrder: 3,
  },
  {
    name: "Roadside Assistance",
    slug: "roadside-assistance",
    tagline: "24/7 roadside support for your customers wherever they travel",
    description: [
      "When your customers are on the road, they need to know help is just a call away. DS360 Roadside Assistance lets you offer a branded roadside service program that your customers can activate from their phone, with real-time dispatch and status tracking.",
      "Manage your service provider network, verify coverage by VIN, and handle dispatch all from the DS360 platform. Whether a customer needs a tow, a tire change, or emergency fuel, your team has the tools to coordinate a fast response.",
      "Adding roadside assistance to your customer offering increases perceived value at purchase and creates a recurring revenue stream that extends well beyond the initial sale.",
    ].join("\n\n"),
    features: [
      "Service request management and dispatch",
      "Customer mobile access for roadside calls",
      "Coverage verification by VIN",
      "Service provider network",
      "Real-time status tracking",
    ],
    icon: "Truck",
    category: "Support",
    monthlyPrice: "79",
    isBase: false,
    sortOrder: 4,
  },
  {
    name: "F&I Services",
    slug: "fi-services",
    tagline: "Maximize every deal with AI-powered F&I presentations",
    description: [
      "Finance and Insurance products represent some of the highest-margin revenue in any dealership. DS360 F&I Services gives your team a complete product catalog, deal tracking system, and an AI-powered video presenter that delivers personalized F&I presentations to every customer — even remotely.",
      "The AI F&I Presenter creates custom video sessions where customers can review products at their own pace, ask questions, and accept coverage options digitally. Real-time analytics show you exactly which products are being accepted and where customers drop off.",
      "No more rushed F&I conversations at the signing table. DS360 F&I lets you start the conversation early, track every product, and maximize per-deal revenue with data-driven recommendations.",
    ].join("\n\n"),
    features: [
      "Complete F&I product catalog",
      "AI-powered video F&I Presenter",
      "Customer self-service acceptance portal",
      "Deal tracking and commission reporting",
      "Real-time acceptance analytics",
      "Automated product recommendations",
    ],
    icon: "TrendingUp",
    category: "Finance",
    monthlyPrice: "299",
    isBase: false,
    sortOrder: 5,
  },
  {
    name: "Financing Services",
    slug: "financing-services",
    tagline: "Connect with lender partners for seamless customer financing",
    description: [
      "Getting customers financed quickly and at the best rate is critical to closing deals. DS360 Financing Services connects your dealership with a network of lender partners and gives your team the tools to submit applications, track approvals, and compare rates all in one place.",
      "Digital application submission eliminates paperwork and speeds up the approval process. Automated status notifications keep your team and your customers informed at every stage, from application to funding.",
      "Funded deal reporting gives you a clear view of your financing volume, lender performance, and revenue contribution — the data you need to optimize your lending relationships over time.",
    ].join("\n\n"),
    features: [
      "Multi-lender partner management",
      "Digital application submission",
      "Automated approval tracking",
      "Rate comparison tools",
      "Application status notifications",
      "Funded deal reporting",
    ],
    icon: "CreditCard",
    category: "Finance",
    monthlyPrice: "199",
    isBase: false,
    sortOrder: 6,
  },
  {
    name: "Parts & Accessories",
    slug: "parts-accessories",
    tagline: "Track every part from order to installation",
    description: [
      "Parts and accessories management is one of the most operationally complex areas of any dealership. DS360 Parts & Accessories gives your team a complete system for ordering, receiving, and tracking parts from your supplier network through to installation.",
      "Create purchase orders, track deliveries, manage your parts inventory, and link every parts order directly to the associated claim line. Technicians can request parts from the field, and your parts department can manage fulfillment without losing track of anything.",
      "Claim-linked parts ordering ensures that warranty parts are properly documented and submitted for reimbursement, recovering revenue that often slips through the cracks in manual systems.",
    ].join("\n\n"),
    features: [
      "Parts catalog with supplier management",
      "Purchase order creation and tracking",
      "Delivery and receiving workflow",
      "Technician parts request system",
      "Inventory management",
      "Claim-linked parts ordering",
    ],
    icon: "Package",
    category: "Operations",
    monthlyPrice: "129",
    isBase: false,
    sortOrder: 7,
  },
  {
    name: "TechFlow On-Site Repairs",
    slug: "techflow",
    tagline: "Dispatch technicians and manage service in the field",
    description: [
      "When service happens in the field, you need your team connected. TechFlow gives your dispatch team, service advisors, and technicians a shared platform for work order management, scheduling, and real-time field updates — whether the job is on your lot or at a customer site.",
      "Technicians clock in and out on mobile, capture before-and-after photos, request parts from the field, and update job status in real time. Service advisors see the full picture from their desktop, and nothing falls through the cracks between the shop and the office.",
      "TechFlow integrates directly with Claims, so every service job is properly documented for warranty submission. Parts requests flow directly to your Parts & Accessories module, keeping your whole operation connected.",
    ].join("\n\n"),
    features: [
      "Work order creation and management",
      "Technician assignment and dispatch board",
      "Service appointment scheduling",
      "Mobile time tracking and clock-in",
      "Before and after repair photos",
      "Parts request from field",
    ],
    icon: "Wrench",
    category: "Operations",
    monthlyPrice: "179",
    isBase: false,
    sortOrder: 8,
  },
  {
    name: "Marketing Services",
    slug: "marketing-services",
    tagline: "Launch targeted campaigns to grow your customer base",
    description: [
      "Growing your dealership requires consistent, targeted outreach to the right customers at the right time. DS360 Marketing Services gives you a campaign platform built specifically for RV dealerships, with templates, targeting tools, and performance analytics designed for your industry.",
      "Launch email campaigns, capture leads from your website, and segment your customer database to deliver messages that convert. Automated follow-up sequences keep prospects engaged without adding work to your team.",
      "Every campaign is tracked so you know exactly which messages are driving traffic, generating leads, and contributing to revenue. Stop guessing and start marketing with data.",
    ].join("\n\n"),
    features: [
      "Campaign template library",
      "Custom campaign creation",
      "Lead capture and tracking",
      "Performance analytics",
      "Customer segmentation",
      "Automated follow-up sequences",
    ],
    icon: "Megaphone",
    category: "Sales",
    monthlyPrice: "399",
    isBase: false,
    sortOrder: 9,
  },
  {
    name: "Consignment",
    slug: "consignment",
    tagline: "Manage consigned units and automate seller payouts",
    description: [
      "Consignment programs let you expand your inventory without upfront capital investment. DS360 Consignment gives you everything you need to manage consigned units from agreement signing through to seller payout, with full transparency for both your team and the seller.",
      "Track offers, manage acceptance workflows, and automatically calculate payouts based on your commission and fee structure. A seller communication portal keeps consignors informed without flooding your inbox with status questions.",
      "A public unit showcase lets you market consigned inventory directly to buyers, and commission tracking ensures every deal is properly recorded and reported at month end.",
    ].join("\n\n"),
    features: [
      "Consignment agreement management",
      "Offer tracking and acceptance",
      "Automated payout calculation",
      "Public unit showcase",
      "Seller communication portal",
      "Commission and fee tracking",
    ],
    icon: "RefreshCw",
    category: "Sales",
    monthlyPrice: "149",
    isBase: false,
    sortOrder: 10,
  },
  {
    name: "Marketplace & Auctions",
    slug: "marketplace-auctions",
    tagline: "List units for auction and reach qualified buyers nationwide",
    description: [
      "The DS360 Marketplace & Auctions module connects your inventory with qualified buyers across North America through a dealer-to-dealer auction platform purpose-built for RVs. List units directly from your inventory, set reserve prices, and let the market determine value in real time.",
      "Real-time bidding powered by WebSocket technology means every participant sees live updates as bids come in. Buyer verification and escrow management protect both sides of every transaction, and anonymous bidding keeps the focus on the units, not the personalities.",
      "Whether you are moving aged inventory, sourcing units for your lot, or building a new wholesale channel, DS360 Auctions gives you the reach and the tools to transact with confidence.",
    ].join("\n\n"),
    features: [
      "Unit listing creation from inventory",
      "Real-time bidding with WebSocket",
      "Buyer verification and escrow management",
      "Auction scheduling and lifecycle",
      "Commission tracking at $250 per transaction",
      "Anonymous bidding (buyer identity protected)",
    ],
    icon: "Gavel",
    category: "Sales",
    monthlyPrice: "249",
    perTransactionFee: "250",
    isBase: false,
    sortOrder: 11,
  },
  {
    name: "Customer Portal",
    slug: "customer-portal",
    tagline: "Give your customers a branded self-service experience",
    description: [
      "Your customers expect a modern digital experience. DS360 Customer Portal gives every customer a branded self-service portal where they can track their claim status, view their warranty coverage, access documents, and contact your team — all without calling or emailing.",
      "White-label with your dealership logo and brand colors, the portal can be deployed on your own custom domain so it feels like a natural extension of your dealership website. Customers can open support tickets, engage in quick chat, and never feel out of the loop on the status of their unit.",
      "Reducing inbound status calls frees up your team for higher-value work, and customers who feel informed and supported are more likely to return for their next purchase.",
    ].join("\n\n"),
    features: [
      "White-label portal with custom domain",
      "Customer claim status tracking",
      "Warranty coverage display",
      "Document access and downloads",
      "Support ticket system",
      "Quick chat with dealership",
      "Branded with your logo and colors",
    ],
    icon: "Users",
    category: "Support",
    monthlyPrice: "99",
    isBase: false,
    sortOrder: 12,
  },
];

export async function seedModules() {
  console.log("  🔧 Seeding service modules...");
  let seeded = 0;
  let skipped = 0;

  for (const mod of MODULES) {
    const [existing] = await db
      .select()
      .from(serviceModules)
      .where(eq(serviceModules.slug, mod.slug))
      .limit(1);

    if (!existing) {
      await db.insert(serviceModules).values({
        name: mod.name,
        slug: mod.slug,
        tagline: mod.tagline,
        description: mod.description,
        features: mod.features,
        icon: mod.icon,
        category: mod.category,
        monthlyPrice: mod.monthlyPrice || "0",
        perTransactionFee: mod.perTransactionFee ?? null,
        setupFee: null,
        isBase: mod.isBase,
        isActive: true,
        sortOrder: mod.sortOrder,
      });
      seeded++;
    } else {
      skipped++;
    }
  }

  console.log(`  ✅ Service modules: ${seeded} seeded, ${skipped} already exist`);
}
