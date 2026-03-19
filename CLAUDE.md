# RV Claims Canada — The Dealership Operating System
# Powered by Dealer Suite 360

---

## FIVE RULES — APPLY TO EVERY TASK, EVERY FILE, EVERY LINE OF CODE

1. **DESIGN IS LOCKED.** The visual identity is approved and final. Do not change colors, typography, spacing, component patterns, card styles, shadows, borders, or navigation structure. When building new pages or components, copy the exact styling patterns from existing ones. Same Tailwind classes, same component library, same design language.

2. **DO NOT MODIFY PORTAL TSX FILES.** The 3 portal components (OperatorPortal.tsx, DealerPortal.tsx, CustomerPortal.tsx), portal.css, and i18n.ts are pixel-perfect client-approved builds. Every className, inline style, SVG path, text string, and table row is final. Changing anything breaks the approved design.

3. **THIS IS A FULL-SERVICE DEALERSHIP PLATFORM.** RVClaims.ca offers 16+ services across 5 categories. Claims processing is MODULE ONE — it is not the whole product. Every page, every piece of copy, every user flow must reflect the complete ecosystem.

4. **BILINGUAL IS MANDATORY.** All UI text goes through the i18n system. English and French. No hardcoded strings in components. No exceptions.

5. **SURGICAL CHANGES ONLY.** Do not rebuild working components. Modify behavior on existing elements. If a button, layout, or page structure works, keep it and change only what's needed.

---

## THE BIG PICTURE — What This Platform Is

RVClaims.ca is a **comprehensive service platform for Canadian RV dealerships**. It is the single subscription a dealer needs to run their entire operation — from warranty claims to financing, F&I, parts, marketing, and beyond. The technology is powered by **Dealer Suite 360**, which will also serve the US market under its own brand.

Think of it like this: Shopify is to e-commerce what RVClaims/DealerSuite360 aims to be to RV dealerships. One platform. Every service. AI-powered.

### Brand Architecture
- **RVClaims.ca** = the brand dealers see, subscribe to, and interact with (Canadian market)
- **DealerSuite360** = the technology brand powering everything (North American expansion, US market)
- On the site: **"Powered by Dealer Suite 360"** in footers only
- Dealers are joining **RV Claims** — they NEVER "join Dealer Suite 360"
- Same codebase serves both brands with different theming

### Business Model
- **Two-sided SaaS platform**: Dealers (clients) subscribe → Operator (SaaS owner + team) delivers services
- Revenue streams: monthly subscriptions + per-claim fees + per-module fees + marketplace commissions + auction transaction fees + F&I referral fees + financing origination fees + marketing retainers
- Each service module adds a new revenue stream as it activates
- The AI intelligence flywheel is the competitive moat — every claim processed makes the platform smarter for every dealer

### Competitive Position
- **No one in North America** offers an AI-powered, RV-specific, two-sided SaaS platform combining outsourced claims processing with a full dealership service suite
- DMS incumbents (IDS-Astra, EverLogic, Lightspeed, DealerRock, Motility) run dealership operations but don't process claims for dealers and have no AI
- Claims outsourcers (TBF/Jupiter, WPC) offer the service model but are manual, automotive-focused, with no SaaS platform
- RVClaims sits in the gap: AI-powered platform + human expertise + full service ecosystem
- TAM: ~7,400 RV dealerships across North America, ~$56B combined industry revenue

---

## THE COMPLETE SERVICE ECOSYSTEM

### Category 1: Core Claims Services (MODULE ONE — Live Now)
The entry wedge. This is what launches first and what drives daily dealer engagement.
- **A-Z Warranty Claims Processing** — DAF, PDI, Warranty, Extended Warranty, Insurance
- **Revenue Optimization** — Maximize labor and parts revenue through expert claim preparation
- **Denial Reduction** — Expert claim preparation that reduces denial rates
- **Dealership Integration** — Deep integration with each dealer's workflow and best practices
- Supported manufacturers: **Jayco, Forest River, Heartland, Columbia NW, Keystone, Midwest Auto**
- Covers ALL RV types: Travel Trailer, Fifth Wheel, Class A, Class C, Van Camper, Small Trailer, Pop Up, Toy Hauler, Truck Camper, Destination Trailer

### Category 2: Financial Services (Q2 2026)
- **Financing Services** — Lender integration, approval optimization, real-time status tracking, bilingual compliance support
- **F&I (Finance & Insurance) Outsourcing** — Complete F&I management: loan origination, GAP insurance, extended warranty sales, premium product portfolio, compliance documentation, staff training, revenue reporting
- **Warranty & Extended Service Plans** — OEM + aftermarket plan management, dynamic pricing models, automated claims link, upsell & retention programs

### Category 3: Revenue Growth Services (Q3 2026)
- **Digital Marketing & Lead Generation** — SEO, PPC, social media campaigns, lead generation, CRM integration
- **Parts & Accessories Management** — Inventory optimization, installation services, customer upgrade programs
- **Service Department Support** — Mobile service deployment, online appointment scheduling, technician training
- **Customer Experience Technology** — Advanced CRM, digital customer engagement, automated follow-up
- **Trade-In & Consignment Programs** — Professional appraisal, consignment management, trade-in optimization

### Category 4: Marketplace & Auctions (Q3-Q4 2026)
- **Network Marketplace** — Dealer-to-dealer RV inventory listings, verified vehicle history, direct dealer connect
- **Live Auctions** — Real-time bidding for new, used, and overstock units at wholesale pricing

### Category 5: Consumer Direct Services (B2C) (Q4 2026)
- **Roadside Assistance** — 24/7 emergency towing and roadside support
- **Extended Warranty** — Direct-purchase protection plans
- **RV Protection Packages** — Paint, fabric, and interior protection

---

## PAGE ROLES — What Each Page Must Communicate

### Public Marketing Site (rvclaims.ca)
The homepage has 16 sections showcasing the FULL service ecosystem:
NotificationBar → Navigation → HeroSection → MainServicesSection (4 pillars) → ClaimsSection (5 claim types) → RvTypesSection (10 types) → TechnologySection (AI platform) → FinancingSection → ExperienceSection (15 years, stats) → FIServicesSection → SupportingServicesSection (parts, tech, marketing, consignment) → PrivacyAssuranceSection → WarrantySection → ConsumerServicesSection (roadside, ext warranty, protection) → PartsSection → ContactSection → Footer

### Sign Up Page
- Dealers create accounts with **RV Claims** (not Dealer Suite 360)
- Left panel showcases the FULL platform — all 16+ services
- NO subscription/plan selection on this page — happens inside panel after operator approval
- Flow: Signup → Operator verifies → Approval → First login → Onboarding wizard → Plan selection → Payment → Active

### Dealer Login (/client-login)
- For **Dealer Owner** and **Dealer Staff** roles
- Login options: Google OAuth, LinkedIn OAuth, Email/Password
- Bottom: "Operator? Sign in here" → /operator

### Operator Login (/operator-login)
- For **Operator Admin** and **Operator Staff** roles
- NOT linked anywhere on the public site — direct URL access only
- "AUTHORIZED ACCESS ONLY" + unauthorized access warning
- Login: "Continue with Email" only (no social OAuth)

### Login Routing Rules
- Dealer login ONLY accepts dealer roles → dealer dashboard
- Operator login ONLY accepts operator roles → operator dashboard
- Wrong role at wrong door → "Invalid credentials" — NEVER reveal the account exists on the other side

---

## RBAC — 4 Roles

### Dealer Owner
Full dealership control. Creates/manages staff accounts. Manages billing, subscription, invoices, payments, wallet top-ups. Can do everything Dealer Staff can do plus all administration. Sees ONLY their own dealership data — multi-tenant isolation is absolute.

### Dealer Staff
Operational access within their dealership only. Creates claims, uploads photos, adds units, updates claim details, views statuses. CANNOT access billing, subscription, staff management, or any financial administration.

### Operator Admin (Super Admin)
God mode. Sees every dealer, every claim, every dollar across the entire platform. Manages subscriptions, billing, invoicing, dealer onboarding, platform settings, FRC database, user management. Full administrative AND operational control.

### Operator Staff
Full operational access across ALL dealers. Assigns FRC codes, flags photo quality issues, logs manufacturer responses, tracks parts, updates statuses, communicates with dealers. CANNOT access billing, invoicing, subscription management, platform settings, or dealer account administration.

---

## CLAIMS MODULE — Domain Knowledge (Module One)

### Claim Types
- **DAF** — Dealer Authorization Form. Inspection when unit first arrives at dealership.
- **PDI** — Pre-Delivery Inspection. Final check before customer delivery.
- **Warranty** — Customer-reported issues during manufacturer warranty period.
- **Extended Warranty** — Issues after manufacturer warranty, covered by purchased extension.
- **Insurance** — Collision, weather, theft, liability claims.

### Critical Business Rules
- **This portal is TRACKING AND MANAGEMENT only** — actual claims are submitted on manufacturer portals
- **VIN is the primary tracking key** for all units
- **Manufacturer assigns claim# and preauth#** — the dealer/operator does NOT control these
- **Each manufacturer has UNIQUE FRC systems** — codes are NOT universal
- **Each claim has MULTIPLE FRC lines** — each line independently approved/denied
- **Photos are required PER FRC LINE** — not per claim. Close-up + context shots per line
- **Photo quality directly impacts approval rates and revenue**

### Claim Lifecycle (Dealer Side)
1. Add unit by VIN → create claim → select type → add items with descriptions + photos
2. Submit to operator → track status → receive approval/denial per line
3. Receive invoice → pay via Stripe or wallet deduction

### Claim Lifecycle (Operator Side)
1. Receive notification → AI flags photo quality issues → AI suggests FRC codes
2. Operator reviews/adjusts → submits on manufacturer portal → logs claim#/preauth#
3. Manufacturer reviews per-line → operator logs approvals/denials
4. Parts tracking → dealer repairs → invoice matching → payment request
5. Payment received → claim complete → billing engine auto-invoices dealer

---

## DATABASE SCHEMA (GEN2)

### New Tables
| Table | Purpose |
|-------|---------|
| `dealers` | Multi-tenant: name, address, subscription_plan, wallet_balance, stripe_customer_id, status |
| `dealer_users` | email, password_hash, role (owner/staff), dealer_id, name, status, 2FA, last_login |
| `operator_users` | email, password_hash, role (admin/staff), name, status, last_login |
| `claim_lines` | THE CORE: claim_id, frc_code_id, description, requested/approved labor hrs, line_status, parts_required |
| `frc_codes` | Per manufacturer: code, description, default_labor_hours, category, search_vector |
| `line_photos` | Per line: file_path, thumbnail, photo_type (damage/repair/invoice), ai_quality_score, ai_flags |
| `inspection_photos` | Per unit: inspection_type (DAF/PDI), file_path, description |
| `parts_orders` | Per line: source (mfr/local), part_name, part_number, cost, order_status, received_at |
| `invoices` | Dealer billing: dealer_id, claim_id, amount, tax, total, status, stripe_invoice_id, paid_at |
| `wallet_transactions` | Pre-funded: dealer_id, type (top-up/deduction/refund), amount, balance_after |
| `subscriptions` | dealer_id, plan_type (A/B), stripe_subscription_id, status, period dates |
| `audit_log` | Compliance: who, what, when, IP, dealer context |
| `notifications` | In-app: type, recipient, message, read status, linked entity |

### Modified Tables
| Table | Changes |
|-------|---------|
| `units` | Add: dealer_id, warranty_expiry, ext_warranty_provider, daf_status, pdi_status |
| `claims` | Add: dealer_id, claim_type enum, mfr_claim_number, mfr_preauth_number, submitted_at, closed_at. Financial fields move to claim_lines. |

---

## BILLING ENGINE

### Plan A: Subscription
Monthly recurring charge via Stripe. Higher per-claim processing fees. Invoice per claim or monthly roll-up.

### Plan B: Pre-Funded Wallet
No monthly fee. Lower per-claim fees. Dealer loads balance via Stripe. Fees auto-deducted per claim. Low balance alerts. Optional auto-top-up.

### Payment Methods
- PRIMARY: Stripe in-portal (credit card on file, auto-billing, auto-top-up)
- SECONDARY: Interac e-Transfer (critical for Canadian market, requires manual reconciliation)

---

## AI COMPONENTS (Design Schema to Support — Build Later)

| Component | Function |
|-----------|----------|
| FRC Lookup Engine | Fuzzy match descriptions to manufacturer-specific FRC codes |
| Photo Quality Gatekeeper | Analyze sharpness, lighting, relevance (operator side only) |
| Claim Readiness Score | 0-100% confidence before manufacturer submission |
| Document Scanner | OCR correspondence, auto-populate claim records |
| Denial Prediction | Flag high-risk FRC lines from historical patterns |
| Invoice Matcher | Auto-link part invoices to correct claim lines |
| AI F&I Presenter | Live video avatar (Tavus/D-ID) for remote product presentations |
| AI Chatbot | Replace keyword matcher with RAG-based assistant |

---

## TECH STACK

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix), Wouter, TanStack Query, Framer Motion |
| Backend | Express.js, TypeScript, Node.js |
| Database | PostgreSQL (Neon Serverless) + Drizzle ORM |
| Auth | JWT (15 min access + 7 day refresh) + bcrypt + server-side sessions |
| Payments | Stripe (subscriptions, invoices, wallet) + Interac e-Transfer |
| File Storage | Cloudflare R2 or S3 with signed URLs, per-dealer isolation |
| i18n | portal.css + i18n.ts (284 EN/FR translation pairs) |
| Email | SendGrid or AWS SES (replace raw SMTP) |
| Real-time | WebSocket (ws library installed) |

## Commands
```bash
# Windows development
$env:NODE_ENV="development"; $env:PORT=3000; npx tsx server/index.ts

# Linux/Mac development
npm run dev

# Build & deploy
npm run build
npm start
npm run db:push
npm run check
```

---

## THREE-PORTAL SYSTEM (v2.0.0 — Current)

### Operator Portal (36 pages, 1,227 lines TSX)
Route: `/operator`

Dashboard, Processing Queue, Batch Review, All Claims, Claim Detail, Stale Claims, Dealer Management, Add Dealer, Dealer Detail (9 tabs), Unit Inventory, Add Unit, Unit Detail (5 tabs with inline edit), FRC Codes, Service Marketplace, Financing (list/detail/new), F&I (list/detail/new), Warranty Plans (list/new), Parts & Accessories (list/detail/new), Billing & Invoices, Products & Services (list/add/edit), Create Invoice (Wave-style), Revenue Reports, Notifications, Users & Roles, Settings (7 sub-pages), Changelog (4 tabs), Add Feature Request.

### Dealer Portal (25 pages, 874 lines TSX)
Route: `/dealer`

Dashboard, Upload Photos / Push to Claim, My Claims, Claim Detail, My Units, Add Unit, Unit Detail (4 tabs), Financing (list/detail/new), F&I Products, New F&I Deal, Warranty Plans, Parts Orders, New Parts Order, Invoices & Billing, Customer Portal Management, Customer Tickets, Customer Ticket Detail, Invite Customer, Staff, Add Staff, Branding & Domain, What's New (4 tabs), Settings (5 sub-pages).

### Customer Portal (14 pages, 522 lines TSX)
Route: `/portal`

Dashboard, My Unit, Warranty & Coverage, Documents, Claim Status, Claim Detail, Report an Issue, Parts Orders, Protection Plans, Roadside Assist (coming soon), Support Tickets, Ticket Detail, New Ticket, Quick Chat, Settings (3 sub-pages).

### Shared Features
- **Dark mode** — toggle persists to localStorage (`ds360-theme`)
- **EN/FR toggle** — pill-style, 284 translations, browser auto-detection (`ds360-lang`)
- **White sidebar** — consistent across all 3, dark mode compatible
- **Profile photo upload** — updates both settings and sidebar avatars

---

## PORTAL INTEGRATION INSTRUCTIONS

### Step 1: Place the 5 portal files
```
client/src/styles/portal.css
client/src/lib/i18n.ts
client/src/portals/OperatorPortal.tsx
client/src/portals/DealerPortal.tsx
client/src/portals/CustomerPortal.tsx
```

### Step 2: Import portal.css globally
In `client/src/main.tsx`:
```typescript
import './styles/portal.css';
```

### Step 3: Ensure Google Fonts in `client/index.html`
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Step 4: Set up routing with layout isolation
Portals are full-page layouts with their own sidebar/header. Render WITHOUT any parent wrapper.

```typescript
import { Route, Switch, useLocation } from 'wouter';
import OperatorPortal from './portals/OperatorPortal';
import DealerPortal from './portals/DealerPortal';
import CustomerPortal from './portals/CustomerPortal';

function App() {
  const [location] = useLocation();
  const isPortal = location.startsWith('/operator') ||
                   location.startsWith('/dealer') ||
                   location.startsWith('/portal');

  if (isPortal) {
    return (
      <Switch>
        <Route path="/operator/:rest*" component={OperatorPortal} />
        <Route path="/dealer/:rest*" component={DealerPortal} />
        <Route path="/portal/:rest*" component={CustomerPortal} />
      </Switch>
    );
  }

  return (
    <AppLayout>
      <Switch>
        {/* existing marketing routes */}
      </Switch>
    </AppLayout>
  );
}
```

### Step 5: Handle CSS conflicts
If Tailwind reset interferes with portal styles, scope the marketing side — DO NOT rename portal classes.

### Step 6: Verify
```bash
npm run check && npm run build && npm run dev
```
Navigate to `/operator`, `/dealer`, `/portal` and run the verification checklist below.

---

## VERIFICATION CHECKLIST (44 items)

### All 3 Portals
- [ ] Every sidebar nav item navigates correctly
- [ ] Dark mode toggle works and persists on refresh
- [ ] EN/FR pill toggle translates all text and persists
- [ ] FR pill highlights when French active
- [ ] French browser auto-detects on first visit
- [ ] Profile photo upload updates settings AND sidebar avatar

### Operator Portal
- [ ] Dealer Detail — 9 tabs switch correctly
- [ ] Unit Detail — inline edit toggle works
- [ ] Unit Detail — display photo upload works
- [ ] Create Invoice — Add service/subscription adds dropdown row
- [ ] Create Invoice — Search & add part adds search row
- [ ] Create Invoice — × buttons remove rows
- [ ] Products & Services — Edit navigates to pre-filled page
- [ ] Settings — 7 sub-pages switch correctly
- [ ] Changelog — 4 tabs, "+ Add Request" opens inline form

### Dealer Portal
- [ ] Upload Photos — unit selector, upload zone, Push to Claim
- [ ] Branding — color pickers apply live, logo upload updates sidebar
- [ ] Branding — Save confirms, Restore resets, Preview jumps to dashboard
- [ ] Customer Tickets — tabs, detail with reply + visibility toggle
- [ ] What's New — 4 tabs, Request a Feature form
- [ ] Settings — 5 sub-pages under Personal and Dealership headers

### Customer Portal
- [ ] Dashboard — unit card, alerts, quick actions, dealer info
- [ ] Warranty — countdown cards with progress bars
- [ ] Claim Detail — visual progress timeline
- [ ] Tickets — list, detail, New Ticket with 7 categories
- [ ] Quick Chat — casual messages + "Create Ticket" callout
- [ ] Protection Plans — product cards, "OWNED" ribbon

---

## KNOWN BEHAVIORS (Not Bugs)

1. **innerHTML in addServiceRow/addPartRow/updateProfile** — Direct DOM manipulation. Intentional for prototype.
2. **DOM-walking translation engine** — i18n.ts traverses DOM nodes. Intentional with monolithic components.
3. **Single activePage state** — All navigation is one useState toggling CSS display.
4. **Client-side-only file previews** — FileReader shows previews. No server upload yet.
5. **No API calls** — All data hardcoded. API integration is Phase 2.
6. **localStorage for theme/lang** — Keys `ds360-theme` and `ds360-lang`.
7. **No auth guards** — Portal routes accessible without login. Auth is Phase 2.

---

## KNOWN ISSUES (Original Codebase — Fix in GEN2)

1. Auth is a facade — login handlers are console.log() with TODO comments
2. Admin API endpoints have zero auth protection
3. Credentials logged to browser console in plaintext
4. Data stored in JavaScript Map — database configured but unused
5. ~~No portal exists behind login~~ → **FIXED: 3 portals built (v2.0.0)**
6. OAuth buttons have zero backend integration
7. Stripe installed but not implemented
8. Chatbot uses static keyword matching
9. No CSRF, rate limiting, or input sanitization
10. Hero image is external Unsplash hotlink
11. Cookie consent has TODO placeholders
12. Pricing inconsistency: chatbot $349/$749 vs pricing page $299/$599

---

## FILE INTEGRITY

After placing portal files, confirm line counts:
- `OperatorPortal.tsx`: 1,227 lines
- `DealerPortal.tsx`: 874 lines
- `CustomerPortal.tsx`: 522 lines
- `portal.css`: 123 lines
- `i18n.ts`: 356 lines

---

## VERSION HISTORY

- **v2.0.0** (March 17, 2026) — 3-portal system, 75 pages, dark mode, EN/FR, changelog
- **v1.0.0** (November 2025) — Original RVClaims.xyz single-portal
- **v0.1.0** (October 2025) — Marketing website only

## ROADMAP

- **v2.1.0** (April 2026) — JWT auth, PostgreSQL, real API, file uploads
- **v2.2.0** (May 2026) — Stripe payments, WebSocket, email, ticket system
- **v2.3.0** (June 2026) — AI Scanner, PWA mobile, AI F&I Presenter, responsive
- **v3.0.0** (Q3 2026) — US expansion (DealerSuite360), multi-currency, analytics
