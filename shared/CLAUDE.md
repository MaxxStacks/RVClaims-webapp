# RV Claims Canada — The Dealership Operating System
# Powered by Dealer Suite 360

---

## FOUR RULES — APPLY TO EVERY TASK, EVERY FILE, EVERY LINE OF CODE

1. **DESIGN IS LOCKED.** The visual identity is approved and final. Do not change colors, typography, spacing, component patterns, card styles, shadows, borders, or navigation structure. When building new pages or components, copy the exact styling patterns from existing ones. Same Tailwind classes, same component library, same design language.

2. **THIS IS A FULL-SERVICE DEALERSHIP PLATFORM.** RVClaims.ca offers 16+ services across 5 categories. Claims processing is MODULE ONE — it is not the whole product. Every page, every piece of copy, every user flow must reflect the complete ecosystem. If you are writing content for any page and you only mention claims, you are wrong. Start over.

3. **BILINGUAL IS MANDATORY.** All UI text goes through the i18n system at `client/src/lib/i18n.ts`. English and French. No hardcoded strings in components. No exceptions.

4. **SURGICAL CHANGES ONLY.** Do not rebuild working components. Modify behavior on existing elements. If a button, layout, or page structure works, keep it and change only what's needed.

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
- Moderate projection: 200 dealers by Year 3 = $4.2M annual revenue from claims alone; full modules push toward $25-50M+ by Year 5

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
- **F&I (Finance & Insurance) Outsourcing** — Complete F&I management: loan origination, GAP insurance, extended warranty sales, premium product portfolio, compliance documentation, staff training, revenue reporting. 20% higher loan approval rates. Average 8.5% gross margin vs industry 6.9%.
- **Warranty & Extended Service Plans** — OEM + aftermarket plan management, dynamic pricing models, automated claims link, upsell & retention programs, real-time analytics

### Category 3: Revenue Growth Services (Q3 2026)
- **Digital Marketing & Lead Generation** — SEO, PPC, social media campaigns, lead generation, CRM integration, website optimization, email marketing, customer retention programs
- **Parts & Accessories Management** — Inventory optimization, installation services, customer upgrade programs, proactive accessory sales training
- **Service Department Support** — Mobile service deployment, online appointment scheduling, technician training & certification, service process optimization
- **Customer Experience Technology** — Advanced CRM, digital customer engagement platforms, automated follow-up and nurture campaigns, sales process automation tools
- **Trade-In & Consignment Programs** — Professional vehicle appraisal, consignment program management, trade-in value optimization, inventory turn improvement

### Category 4: Marketplace & Auctions (Q3-Q4 2026)
- **Network Marketplace** — Dealer-to-dealer RV inventory listings, verified vehicle history, model comparisons, direct dealer connect. Browse thousands of new and used RVs from trusted dealerships.
- **Live Auctions** — Real-time bidding platform for new, used, and overstock RV units at wholesale pricing. Verified dealerships compete for premium inventory.

### Category 5: Consumer Direct Services (B2C) (Q4 2026)
Sold directly to RV owners, bypassing dealerships:
- **Roadside Assistance** — 24/7 emergency towing and roadside support coverage
- **Extended Warranty** — Direct-purchase protection plans for RV owners
- **RV Protection Packages** — Paint, fabric, and interior protection

### The Technology Platform
- **Patent-pending claims management software**
- **Dealer Portal** — Full dashboard for all services: claims, financing, F&I, parts, marketplace, analytics
- **Client Portal** — Self-service for RV owners: track claims, view service history, access protection services
- **AI Engine** — FRC code matching, photo quality analysis, denial prediction, document scanning, readiness scoring
- **Revenue Analytics & Insights** — Cross-service reporting and optimization recommendations
- **Real-time manufacturer integration** with top North American brands

---

## PAGE ROLES — What Each Page Must Communicate

### Public Marketing Site (rvclaims.ca)
The homepage has 16 sections showcasing the FULL service ecosystem:
NotificationBar → Navigation → HeroSection → MainServicesSection (4 pillars) → ClaimsSection (5 claim types) → RvTypesSection (10 types) → TechnologySection (AI platform) → FinancingSection → ExperienceSection (15 years, stats) → FIServicesSection → SupportingServicesSection (parts, tech, marketing, consignment) → PrivacyAssuranceSection → WarrantySection → ConsumerServicesSection (roadside, ext warranty, protection) → PartsSection → ContactSection → Footer

Additional pages: /about, /services, /claims-processing, /financing, /warranty-extended-service, /fi-services, /rv-coverage, /technology, /revenue-services, /network-marketplace, /live-auctions, /pricing, /contact, /privacy-policy

### Sign Up Page
- Dealers are creating an account with **RV Claims** (not Dealer Suite 360)
- Left panel MUST showcase the FULL platform — all 16+ services, not just claims
- Form captures: personal info + dealership info
- NO subscription/plan selection on this page — that happens inside the panel after operator approval
- Onboarding flow: Signup → Operator verifies dealership → Approval (within 1 business day) → First login → Onboarding wizard → Plan selection → Payment → Workspace activated
- "Powered by Dealer Suite 360" in footer only

### Dealer Login (/client-login)
- For **Dealer Owner** and **Dealer Staff** roles
- Left panel highlights ALL services available in the dealer portal — claims tracking, financing tools, F&I management, parts ordering, marketplace listings, auction access, analytics, and more
- Login options: Google OAuth, LinkedIn OAuth, Email/Password
- Bottom: "Operator? Sign in here" → /operator

### Operator Login (/operator)
- For **Operator Admin** and **Operator Staff** roles
- NOT linked anywhere on the public site — direct URL access only
- Shows platform authority stats (claims processed, approval rate, active dealers, manufacturers)
- "AUTHORIZED ACCESS ONLY" + unauthorized access warning
- Login: "Continue with Email" only (no social OAuth)
- Bottom: "Dealer login? Sign in here" → /client-login
- Lists operator capabilities: claims processing across all dealers, FRC management, photo review, billing/invoicing, dealer onboarding, platform settings

### Login Routing Rules
- Dealer login ONLY accepts dealer_owner and dealer_staff roles → redirects to dealer dashboard
- Operator login ONLY accepts operator_admin and operator_staff roles → redirects to operator dashboard
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
- **This portal is TRACKING AND MANAGEMENT only** — actual claims are submitted on manufacturer portals (Jayco portal, Forest River portal, etc.)
- **VIN is the primary tracking key** for all units
- **Manufacturer assigns claim# and preauth#** — the dealer and operator do NOT control these numbers
- **Each manufacturer has UNIQUE FRC (Flat Rate Code) systems** — codes are NOT universal
- **Each claim has MULTIPLE FRC lines** — each line is independently approved or denied by the manufacturer
- **Photos are required PER FRC LINE** — not per claim. Each line needs its own close-up + context shots
- **Photo quality directly impacts claim approval rates and revenue** — this is the variable that must be controlled

### FRC System
- Per-manufacturer database of Flat Rate Codes
- Each code: repair type, default labor hours, common parts list, category
- AI fuzzy matching: dealer describes problem → system suggests correct FRC for that manufacturer
- Operator confirms/adjusts before submitting on manufacturer portal
- System learns from corrections over time

### Claim Lifecycle (Dealer Side)
1. Add unit by VIN (or select existing)
2. Create claim on unit — select type (DAF/PDI/Warranty/ExtWarranty/Insurance)
3. Add claim items — each item is an FRC line with description + photos
4. Submit to operator for processing
5. Track status as operator processes
6. Receive updates: which lines approved/denied, parts status, payment status
7. Receive invoice for claim processing fees
8. Pay via Stripe or auto-deduct from wallet

### Claim Lifecycle (Operator Side)
1. Receive notification: new claim from dealer
2. AI Photo Gatekeeper flags quality issues (NEVER blocks dealer uploads — flags for operator review only)
3. AI suggests FRC codes from manufacturer-specific database
4. Operator reviews, confirms/adjusts FRC codes
5. Operator submits on manufacturer's external portal
6. Operator logs manufacturer-assigned claim#/preauth#
7. Manufacturer reviews — operator logs per-line approved/denied with labor hours and parts
8. Approved lines with parts → track ordering, delivery, receipt
9. Dealer repairs, uploads invoices → AI matches invoices to lines
10. Operator requests payment from manufacturer
11. Payment received → mark complete
12. Billing engine auto-generates dealer invoice
13. Claim closed

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

### Keep As-Is
`attachments`, `notes`, `events`, `contacts`

---

## BILLING ENGINE

### Plan A: Subscription
Monthly recurring charge via Stripe. Higher per-claim processing fees. Invoice per claim or monthly roll-up.

### Plan B: Pre-Funded Wallet
No monthly fee. Lower per-claim fees. Dealer loads balance via Stripe. Fees auto-deducted per claim. Low balance alerts. Optional auto-top-up.

### Payment Methods
- PRIMARY: Stripe in-portal (credit card on file, auto-billing, auto-top-up)
- SECONDARY: Interac e-Transfer (critical for Canadian market, requires manual reconciliation)

### Subscription Timing
Selection happens INSIDE the dealer panel after account creation and operator approval. NOT during signup. Flow: Signup → Operator approves → First login → Onboarding wizard → Select plan → Payment → Active.

### Future Module Billing
Each service module adds its own fee structure to the unified dealer statement: marketplace listing fees, auction commissions, F&I referral fees, financing origination fees, marketing retainers.

---

## AI COMPONENTS (Design Schema to Support — Build Later)

| Component | Function |
|-----------|----------|
| FRC Lookup Engine | Fuzzy match plain-language descriptions to manufacturer-specific FRC codes |
| Photo Quality Gatekeeper | Analyze sharpness, lighting, relevance on operator side (never blocks dealer) |
| Claim Readiness Score | 0-100% confidence rating before manufacturer submission |
| Document Scanner | OCR manufacturer correspondence, auto-populate claim records |
| Denial Prediction | Flag high-risk FRC lines based on historical manufacturer patterns |
| Invoice Matcher | Auto-link uploaded part invoices to correct claim lines |
| Stale Claim Detection | Auto-generate follow-up drafts for stuck claims |
| Intelligence Flywheel | Every claim across every dealer trains models for all dealers |
| AI Chatbot | Replace keyword matcher with RAG-based assistant on public site |

---

## TECH STACK

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix), Wouter, TanStack Query, Framer Motion |
| Backend | Express.js, TypeScript, Node.js |
| Database | PostgreSQL (Neon Serverless) + Drizzle ORM |
| Auth | JWT (15 min access + 7 day refresh) + bcrypt + server-side sessions |
| Payments | Stripe (subscriptions, invoices, wallet) + Interac e-Transfer |
| File Storage | S3/GCS with signed URLs, per-dealer isolation |
| i18n | Custom EN/FR system in `client/src/lib/i18n.ts` |
| Email | SendGrid or AWS SES (replace raw SMTP) |
| Real-time | WebSocket (ws library installed) |
| Monitoring | Sentry + DataDog (planned) |

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

## File Structure
```
client/src/
  components/    — 54 custom + 47 shadcn/ui components
  pages/         — 16 marketing pages + login pages
  hooks/         — use-language (i18n), use-mobile, use-toast
  lib/           — i18n.ts (2,100 lines EN/FR), queryClient, utils
server/
  index.ts       — Server entry point
  routes.ts      — API routes (currently 5 — needs expansion)
  storage.ts     — Data storage (currently in-memory Map — needs DB)
  db.ts          — Drizzle connection (configured, unused)
  email.ts       — Email service (basic SMTP)
  chatbot-*.ts   — Keyword chatbot (replace with AI)
shared/
  schema.ts      — Drizzle schema + Zod validation (currently 2 tables — needs expansion)
attached_assets/ — Images, logos, NDA docs
```

## Known Issues
1. Auth is a facade — all login handlers are console.log() with TODO comments
2. Admin API endpoints have zero auth protection
3. User credentials (email + password) logged to browser console in plaintext
4. All data stored in JavaScript Map — database configured but never used
5. No portal or dashboard exists behind login — login leads to nothing
6. OAuth buttons (Google, LinkedIn) have zero backend integration
7. Stripe SDK installed but never implemented
8. Chatbot uses static keyword matching — no AI
9. No CSRF protection, rate limiting, or input sanitization on any endpoint
10. Hero image is an external Unsplash hotlink (not a local asset)
11. Cookie consent notice has TODO placeholder code
12. Pricing inconsistency: chatbot quotes $349/$749, pricing page shows $299/$599
13. Navigation active state bug: /warranty-extended-service vs /warranty-extended-services mismatch
