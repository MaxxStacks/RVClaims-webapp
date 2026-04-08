# SITE-REVAMP-MASTER.md — DealerSuite360 Complete Page Revamp Specification

## Executive Summary

This spec covers the complete revamp of **all marketing pages** for DealerSuite360 (deployed at rvclaims.xyz / rvclaims.ca). The site is a React 18 + TypeScript + Vite application. Every page must follow 10 strict guidelines and be ready for sitemap indexing, AI crawlers, and Google Ads campaigns targeting North American RV dealers.

**Total Pages: 42** (14 existing need revamp, 28 need creation)

---

## THE 10 COMMANDMENTS — Apply to EVERY Page Without Exception

### 1. SEO + AI Indexable Content
- Every page must have unique `<title>`, `<meta name="description">`, Open Graph tags, and Twitter Card meta
- Include JSON-LD structured data (Service, FAQ, Organization as appropriate)
- Content must include target keywords naturally (see per-page keyword targets)
- Pages must be indexable by AI search engines (Perplexity, ChatGPT, Google AI Overview)
- Include semantic HTML: `<main>`, `<article>`, `<section>`, `<header>`, `<nav>`, `<footer>`
- Every page gets an `<h1>` that matches the page topic, plus logical `<h2>`/`<h3>` hierarchy

### 2. Light Grey Hero with Thick Title + Description
- Every inner page uses a consistent hero section with light grey background (`--ds-card: #18181c` with subtle gradient or `rgba(255,255,255,0.03)` overlay)
- Hero contains:
  - Breadcrumb trail (Home > Section > Page)
  - Thick `<h1>` title in `Instrument Serif` font, large (clamp(2rem, 4vw, 3.5rem))
  - SEO-optimized subtitle/description paragraph (2-3 sentences, keyword-rich)
- Hero height: compact — roughly 280-320px, NOT full viewport
- Hero must NOT overwhelm the page content

### 3. All Buttons Must Link to Real Pages or Actions
- Every button/CTA on every page must have a working `href` or `onClick` that navigates to a real page or triggers a real action (modal, form, scroll-to-section)
- If the destination page doesn't exist yet, it must be created as part of this revamp
- Zero dead links. Zero `href="#"`. Zero empty `onClick` handlers
- Common button destinations:
  - "Get Started" → `/sign-up`
  - "Request Demo" → `/contact` with demo pre-selected
  - "View Pricing" → `/pricing`
  - "Talk to an Expert" → `/contact` with consultation pre-selected
  - "Learn More" → the relevant service page
  - Service-specific CTAs → the specific service page

### 4. Respect Established Style & Branding
**Design System (from homepage):**
```css
:root {
  --ds-black: #0a0a0b;        /* Page background */
  --ds-dark: #111114;         /* Section alternation */
  --ds-card: #18181c;         /* Card backgrounds */
  --ds-border: #2a2a30;       /* Borders */
  --ds-muted: #6b6b78;        /* Muted text */
  --ds-text: #d1d1d8;         /* Body text */
  --ds-white: #f0f0f3;        /* Headings, emphasis */
  --ds-accent: #4f8cff;       /* Primary accent (blue) */
  --ds-accent-glow: rgba(79, 140, 255, 0.15); /* Glow effects */
  --ds-green: #34d399;        /* Success/positive */
  --ds-amber: #fbbf24;        /* Warning/highlight */
  --ds-red: #f87171;          /* Error/urgent */
  --font-display: 'Instrument Serif', Georgia, serif;  /* Headings */
  --font-body: 'DM Sans', system-ui, sans-serif;       /* Body */
}
```

**Typography Rules:**
- All `<h1>`, `<h2>` use `font-display` (Instrument Serif)
- All body text, buttons, labels use `font-body` (DM Sans)
- Body line-height: 1.7
- Anti-aliased rendering: `-webkit-font-smoothing: antialiased`

**Layout Rules:**
- Max content width: 1200px, centered
- Container padding: 0 24px
- Section vertical padding: 80-120px
- Card border-radius: 12-16px
- Card border: 1px solid var(--ds-border)

**Navigation:**
- Fixed top nav, 72px height, glassmorphism (`backdrop-filter: blur(20px)`)
- Logo: "Dealer" in white + "Suite 360" in accent blue, Instrument Serif
- Nav links: uppercase, 0.875rem, letter-spacing 0.02em, DM Sans
- CTA button in nav: blue accent background, dark text, 8px radius

**Button Styles:**
- Primary: `background: var(--ds-accent); color: var(--ds-black); border-radius: 8px; padding: 12px 28px; font-weight: 600;`
- Secondary/Ghost: `border: 1px solid var(--ds-border); color: var(--ds-text); background: transparent;`
- Never white-on-white. Never invisible text.

**Card Patterns:**
- Background: `var(--ds-card)`
- Border: `1px solid var(--ds-border)`
- Padding: 24-32px
- Border-radius: 12-16px
- Hover: subtle border color shift or glow

**Section Alternation:**
- Alternate between `--ds-black` and `--ds-dark` backgrounds for visual rhythm

### 5. Pricing Display on Paid Service Pages
- Any page offering a paid service SHOULD include a pricing section or pricing card
- Pricing components: plan name, price, billing frequency toggle (monthly/annual with 20% discount), feature list, CTA button
- The main `/pricing` page is an overview/summary of ALL service pricing with links to individual service pages
- Format: 3-tier pricing tables where applicable (Starter, Professional, Enterprise)

### 6. CTA / Conversion Mechanism on Every Page
Every page must have at least ONE of:
- **Contact form** (inline or modal)
- **CTA button** leading to sign-up or contact
- **Request for Quote (RFQ)** form
- **Demo request** button/form
- **Newsletter signup**
- **"Talk to an Expert"** scheduling link
- **Free consultation** offer

The CTA must be contextual to the page content (don't put a generic "Contact Us" — put "Get Your Claims Processing Quote" on the claims page)

### 7. SEO-Optimized, Coherent Content
- Content must accurately describe DealerSuite360's actual services
- No filler, no "lorem ipsum", no generic tech-speak that could apply to any company
- Every claim must be grounded in what the platform actually does
- Include real statistics where possible (15+ years experience, 6+ manufacturer partnerships, etc.)
- Each page needs 800-1500 words of substantive content minimum
- Use internal linking between related service pages
- Include FAQ sections (3-5 questions) for rich snippet eligibility

### 8. Visual Variety — Break the Repetitive Cycle
Each page must include at least 2 of:
- **SVG icons** relevant to the service (inline, not image files)
- **Data visualizations** (charts, graphs showing value props like "40% faster claim approvals")
- **Process flow diagrams** (numbered steps showing how the service works)
- **Comparison tables** (before/after, us vs. traditional, plan comparison)
- **Stat blocks** (large numbers with labels: "15+ Years", "6+ Manufacturers", etc.)
- **Testimonial cards** (mock testimonials with dealer names, dealership names, locations)
- **Screenshot/mockup placeholders** (styled placeholder boxes showing "Platform Screenshot" with proper aspect ratio)
- **Timeline graphics** (onboarding steps, claim lifecycle, etc.)
- **Icon grids** (feature lists with distinct icons per feature)

DO NOT use the same card grid layout on every page. Mix layouts: two-column with image, full-width feature strips, alternating left-right sections, tabbed content, accordion FAQs.

### 9. Accessibility & Best Practices
- All images/icons have `alt` text
- Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
- Focus states on all interactive elements
- Semantic HTML throughout
- `aria-label` on icon-only buttons
- Skip-to-content link
- Form labels associated with inputs
- Keyboard navigable

### 10. Complete Page Interlinking
- Every page listed in this spec must be properly linked from its designated navigation location (header menu, hamburger menu, footer menu, copyright menu)
- All internal links must use React Router navigation (no full page reloads)
- Breadcrumbs on every inner page link back through the hierarchy
- Related services sections cross-link to sibling pages
- Footer contains the complete sitemap as defined in the CSV

---

## DESIGN SYSTEM COMPONENTS (Reusable Across All Pages)

### PageHero Component
```
Props: title, subtitle, breadcrumbs[], backgroundVariant?
- Light grey-dark background with subtle gradient
- Breadcrumb: Home > Parent > Current (linked)
- H1 in Instrument Serif, large
- Subtitle paragraph in DM Sans, --ds-text color
- Compact height (280-320px)
```

### SectionBlock Component
```
Props: bgVariant ('black' | 'dark'), padding?, children
- Alternates background color for visual rhythm
- Standard vertical padding 80-120px
- Container max-width 1200px centered
```

### PricingTable Component
```
Props: plans[], billingToggle?, ctaUrl
- Monthly/Annual toggle with 20% discount badge
- 3-column responsive grid
- Highlighted "recommended" plan
- Feature checklist per plan
- CTA button per plan
```

### CTASection Component
```
Props: headline, description, primaryButton{text, href}, secondaryButton?{text, href}
- Full-width section with accent glow background
- Centered text + buttons
- Used as the final CTA before footer on every page
```

### FAQSection Component
```
Props: questions[{q, a}], schemaEnabled?
- Accordion-style expandable questions
- JSON-LD FAQ schema injected when schemaEnabled=true
- Styled consistently with the design system
```

### TestimonialCard Component
```
Props: quote, name, title, company, location?, rating?
- Card with quote, attribution
- Star rating optional
- Consistent styling across all pages
```

### StatBlock Component
```
Props: stats[{value, label, description?}]
- Large numbers in Instrument Serif
- Labels in DM Sans
- Grid layout (2-4 columns)
```

### ProcessSteps Component
```
Props: steps[{number, title, description, icon?}]
- Numbered steps with connecting line/dots
- Icon optional per step
- Horizontal on desktop, vertical on mobile
```

---

## PAGE INVENTORY — Complete Requirements Per Page

### NAVIGATION STRUCTURE

**Header Menu (Main):**
- Home (/)
- About Us (/about)
- Services (/services) — clicking opens mega menu AND links to /services
- Marketplace (/marketplace) — clicking opens mega menu AND links to /marketplace
- Pricing (/pricing)
- Contact (/contact) — styled as CTA button

**Services Mega Menu:**
- Claims Processing (/claims-processing)
- RV Coverage (/rv-types)
- Financing Services (/financing)
- F&I Services (/fi-services)
- Warranty & Extended Service (/warranty-plans)
- Revenue Services (/revenue-services)
- Technology (/technology)
- On-Site Repairs (/on-site-repairs)
- Roadside Assistance (/roadside-assistance)

**Marketplace Mega Menu:**
- Network Marketplace (/network-marketplace)
- Live Auctions (/live-auctions)

**Hamburger Menu:**
- Main Services:
  - Claim Processing (/claims-processing)
  - Financing Services (/financing)
  - Warranty & Extended Service (/warranty-plans)
  - F&I Services (/fi-services)
- Supporting Services:
  - Parts & Components (/parts-components) — NEW
  - Marketing Services (/marketing-services) — NEW
  - Consignment Services (/consignment-services) — NEW
- Owner Services:
  - Roadside Assistance (/roadside-assistance)
  - Extended Warranty (/extended-warranty) — NEW
  - Protection Plans (/protection-plans) — NEW

**Footer Menu:**
- Services: A-Z Claim Processing, Financing, F&I, Revenue Optimization (/revenue-optimization NEW), Technology Platform, Live Auctions
- Company: About Us, Careers (/careers NEW), Partnerships (/partnerships NEW), Testimonials (/testimonials NEW), Sign Up (/sign-up NEW), Pricing
- Resources: Claim Guides (/claim-guides NEW), Industry Reports (/industry-reports NEW), Webinars (/webinars NEW), Knowledge Base (/knowledge-base NEW), Dealer Training (/dealer-training NEW)
- Support: Help Center (/help-center NEW), Documentation (/documentation NEW), API Access (/api-access NEW), System Status (/system-status NEW), Dealer Integration (/dealer-integration NEW), Expert Consultation (/expert-consultation NEW)

**Copyright Menu:**
- Privacy Policy (/privacy-policy) — UPDATE
- Terms of Service (/terms-of-service) — NEW
- Cookie Policy (/cookie-policy) — NEW
- PIPEDA Compliance (/pipeda-compliance) — NEW
- Powered by Maxx Stacks MSIL → external link to https://maxxstacks.com

---

## PAGES — EXISTING (Revamp Required)

---

### PAGE 1: /services — Services Overview
**Status:** EXISTS — needs content revamp
**Nav Location:** Header Menu (Main) + Hamburger Menu header
**Priority:** HIGH

**Fix Required:** The "Services" nav item currently only opens the mega menu without linking to /services. Fix: clicking "Services" text should navigate to /services AND the dropdown arrow/hover opens the mega menu.

**SEO Target Keywords:** RV dealer services, dealership claims processing, RV warranty management, dealer financing solutions, F&I outsourcing

**Meta:**
```html
<title>RV Dealer Services | Claims, Warranty, F&I & More | DealerSuite360</title>
<meta name="description" content="Complete dealership services platform — A-Z claims processing, warranty management, F&I outsourcing, financing solutions, and revenue optimization for North American RV dealers.">
```

**Content Requirements:**
- Hero: "Complete Dealership Services Platform" + subtitle about end-to-end RV dealer support
- Services grid: Each service gets a card with icon, title, 2-sentence description, "Learn More" link to its dedicated page
- Group services into categories: Core Services, Supporting Services, Owner Services, Technology & Marketplace
- Include a "Why DealerSuite360" section with 4 stat blocks (years experience, manufacturers supported, claim types handled, dealer satisfaction)
- Process section: "How It Works" — 4 steps from onboarding to revenue optimization
- CTA: "Schedule a Demo" linking to /contact with demo context
- FAQ: 5 questions about service scope, pricing, onboarding time, manufacturer support, Canadian/US availability

**Layout Direction:** Do NOT use a simple card grid. Use alternating left-right sections with icons/illustrations on one side and text on the other, followed by a comparison table (DealerSuite360 vs. Traditional Methods).

---

### PAGE 2: /claims-processing — Claims Processing
**Status:** EXISTS — has broken title ("claims.Page.typesTitle"), needs content revamp
**Nav Location:** Header Services Tab + Hamburger Menu + Footer
**Priority:** HIGH

**Fixes Required:**
- Fix broken title string "claims.Page.typesTitle"
- "Create your account" button must link to /sign-up
- "Talk to a Claims Expert" button must link to /contact with claims context

**SEO Target Keywords:** RV claims processing, warranty claim management, RV dealer claims, A-Z claims processing, DAF PDI warranty claims

**Meta:**
```html
<title>A-Z RV Claims Processing | DAF, PDI, Warranty & Extended | DealerSuite360</title>
<meta name="description" content="End-to-end RV warranty claims processing for Canadian dealers. We handle DAF, PDI, warranty, and extended warranty claims across Jayco, Forest River, Heartland, Keystone, and more.">
```

**Content Requirements:**
- Hero: "A-Z Claims Processing for RV Dealers"
- Claim types section: DAF, PDI, Warranty, Extended Warranty, Insurance — each with description and what's included
- Process flow: Inspect → FRC Lines → Submit → Approve/Deny → Parts → Repair → Invoice → Payment → Close (use ProcessSteps component)
- Manufacturer support: "We work with North America's leading RV manufacturers including Jayco, Forest River, Heartland, Columbia NW, Keystone, and Midwest Auto — with more being added regularly." (Phrasing protects against "they don't work with X" objection)
- Stats section: Average approval rate, average processing time, claims handled
- Pricing section: Claims processing pricing or "Starting at $X/claim" with link to /pricing
- CTA: "Start Processing Claims Today" → /sign-up
- FAQ: What types of claims do you process? How long does approval take? What manufacturers do you support? How does billing work? Can I track claims in real-time?

**Layout Direction:** Use a claim lifecycle timeline graphic as the centerpiece. Include a "Before & After" comparison table showing dealer time spent on claims with vs. without DealerSuite360.

---

### PAGE 3: /rv-types — RV Coverage
**Status:** EXISTS — needs card revamp + manufacturer messaging fix
**Nav Location:** Header Services Tab
**Priority:** MEDIUM

**Fix Required:** Manufacturer section must NOT make dealers think "they don't work with my manufacturer." Change messaging to: "Supporting North America's leading RV manufacturers — and growing. Currently integrated with Jayco, Forest River, Heartland, Columbia NW, Keystone, and Midwest Auto, with new manufacturer partnerships added regularly."

**SEO Target Keywords:** RV types coverage, travel trailer warranty, fifth wheel claims, Class A motorhome warranty, RV dealer coverage

**Meta:**
```html
<title>RV Types & Coverage | All Classes Supported | DealerSuite360</title>
<meta name="description" content="Full coverage for every RV type — travel trailers, fifth wheels, Class A & C motorhomes, van campers, toy haulers, and more. Claims processing and warranty management across all categories.">
```

**Content Requirements:**
- Hero: "Coverage for Every RV Type"
- RV types section: 10 types (Travel Trailer, Fifth Wheel, Class A, Class C, Van Camper, Small Trailer, Pop Up, Toy Hauler, Truck Camper, Destination Trailer) — each with unique SVG icon, brief description, and common claim scenarios
- The 10 cards must NOT be generic rectangles — use distinct icons per RV type and vary the layout (e.g., featured types larger, grid + list hybrid)
- Manufacturer section with inclusive messaging (see fix above)
- Coverage details: What's covered per RV type, common warranty items
- CTA: "Check Your Coverage" → /contact
- FAQ: Which RV types are covered? Are custom/modified RVs eligible? What about older models?

**Layout Direction:** Use a visually distinct card layout — perhaps a masonry or featured+grid hybrid where Class A and Fifth Wheel get larger featured cards while smaller types use compact cards. Include SVG icons for each RV type.

---

### PAGE 4: /financing — Financing Services
**Status:** EXISTS — insufficient content
**Nav Location:** Header Services Tab + Hamburger Menu
**Priority:** HIGH

**SEO Target Keywords:** RV dealer financing, RV financing solutions, dealership financing program, RV lender integration, dealer financing optimization

**Meta:**
```html
<title>RV Financing Solutions for Dealers | Lender Integration | DealerSuite360</title>
<meta name="description" content="Streamline RV financing with integrated lender connections, approval optimization, and rate comparison tools. Help your customers secure the best financing while maximizing dealer revenue.">
```

**Content Requirements:**
- Hero: "Financing Solutions That Close More Deals"
- Value props: Integrated lender network, faster approvals, rate comparison, compliance management
- How it works: 4-step process (Customer Application → Lender Matching → Approval Optimization → Deal Closing)
- Benefits section for dealers: Higher approval rates, faster funding, increased back-end revenue
- Benefits section for customers: More options, competitive rates, faster approvals
- Pricing: Financing module pricing or "Included with Professional plan"
- Stats: Average approval rate improvement, average time to funding, lender network size
- CTA: "Optimize Your Financing" → /contact with financing context
- FAQ: How does lender integration work? What credit tiers do you support? How fast are approvals? Is there a minimum volume?

**Layout Direction:** Use a split section — dealer benefits on left, customer benefits on right. Include a mock "rate comparison" interface screenshot placeholder. Add a lender integration flow diagram.

---

### PAGE 5: /fi-services — F&I Services
**Status:** EXISTS — nearly blank
**Nav Location:** Header Services Tab + Hamburger Menu + Footer
**Priority:** HIGH

**SEO Target Keywords:** F&I outsourcing RV dealers, finance and insurance RV, F&I products RV dealership, AI F&I presenter, remote F&I services

**Meta:**
```html
<title>F&I Services & AI Presenter | RV Dealer F&I Outsourcing | DealerSuite360</title>
<meta name="description" content="Outsource your F&I department or enhance it with our AI-powered F&I Presenter. Increase product penetration, customer satisfaction, and per-deal revenue with DealerSuite360's F&I solutions.">
```

**Content Requirements:**
- Hero: "F&I Services That Maximize Every Deal"
- AI F&I Presenter section (flagship feature): AI-powered video avatar that presents F&I products to customers remotely. Customer gets a personalized link post-purchase, AI avatar greets by name, knows the unit and deal details, walks through protection products, handles objections in real-time. Accepted products auto-sync to the platform.
- Traditional F&I outsourcing option: For dealers without an in-house F&I manager
- F&I product catalog: Extended warranties, GAP insurance, tire & wheel, paint protection, fabric protection, key replacement, etc.
- Revenue impact section: "Dealers using our F&I services see an average of $X increase in per-deal revenue"
- Pricing: F&I module pricing tiers
- CTA: "Boost Your F&I Revenue" → /contact
- FAQ: What F&I products do you offer? How does the AI Presenter work? Can I customize the product menu? What's the integration process?

**Layout Direction:** Lead with the AI F&I Presenter as the hero feature — this is a differentiator. Use a side-by-side comparison of traditional F&I desk vs. AI-powered remote F&I. Include a visual flow diagram of the customer experience.

---

### PAGE 6: /warranty-plans — Warranty & Extended Service
**Status:** EXISTS — insufficient content
**Nav Location:** Header Services Tab + Hamburger Menu
**Priority:** HIGH

**SEO Target Keywords:** RV warranty management, extended warranty RV, RV dealer warranty plans, warranty claims tracking, RV protection plans

**Meta:**
```html
<title>Warranty & Extended Service Plans | RV Dealer Solutions | DealerSuite360</title>
<meta name="description" content="Manage manufacturer warranties and sell extended service plans through one platform. Track coverage, process claims, and maximize warranty revenue for your RV dealership.">
```

**Content Requirements:**
- Hero: "Warranty Management & Extended Service Plans"
- Manufacturer warranty tracking: How the platform tracks original manufacturer warranties per unit/VIN
- Extended warranty sales: How dealers can offer and manage extended warranty plans through the platform
- Plan comparison table: Coverage levels, terms, what's included
- Claims integration: How warranty claims flow directly into the claims processing module
- Revenue section: How warranty plan sales generate recurring revenue for dealers
- Pricing: Warranty module pricing
- CTA: "Start Selling Warranty Plans" → /sign-up
- FAQ: What warranty types do you support? How do extended plans work? What's the claims process for warranty items? Can customers purchase directly?

**Layout Direction:** Use a tiered plan comparison table as the centerpiece. Include a warranty lifecycle diagram (Sale → Coverage Period → Claim → Resolution). Add a revenue calculator concept.

---

### PAGE 7: /revenue-services — Revenue Services
**Status:** EXISTS — generic card content
**Nav Location:** Header Services Tab
**Priority:** MEDIUM

**SEO Target Keywords:** RV dealer revenue optimization, dealership revenue growth, dealer profit maximization, RV dealer business growth

**Meta:**
```html
<title>Revenue Services for RV Dealers | Growth & Optimization | DealerSuite360</title>
<meta name="description" content="Unlock new revenue streams for your RV dealership. From warranty plan sales to F&I optimization, marketplace commissions, and service revenue — grow your bottom line with DealerSuite360.">
```

**Content Requirements:**
- Hero: "Unlock New Revenue Streams for Your Dealership"
- Revenue pillars: Warranty plan margins, F&I product revenue, claims processing efficiency (less time = more deals), marketplace commissions, parts markup, financing referral fees
- Revenue calculator concept: Show estimated annual revenue increase based on unit volume
- Case study section: Mock dealer success story with specific revenue numbers
- Integration with other services: How each DealerSuite360 module contributes to revenue
- CTA: "Calculate Your Revenue Potential" → /contact
- FAQ: How does DealerSuite360 increase revenue? What's the typical ROI timeline? Are there minimum requirements?

**Layout Direction:** Lead with a compelling data visualization — a stacked bar chart or waterfall chart showing revenue sources. Use stat blocks with large dollar amounts. Include a mock case study with before/after numbers.

---

### PAGE 8: /technology — Technology Platform
**Status:** EXISTS — slightly better than others but needs real content
**Nav Location:** Header Services Tab + Footer
**Priority:** MEDIUM

**SEO Target Keywords:** RV dealer software platform, dealership management technology, claims processing software, dealer portal technology, AI dealer tools

**Meta:**
```html
<title>Technology Platform | AI-Powered Dealer Management | DealerSuite360</title>
<meta name="description" content="Patent-pending dealership management platform with AI document scanning, real-time claims tracking, dealer and customer portals, mobile apps, and manufacturer integration.">
```

**Content Requirements:**
- Hero: "Technology Built for Modern Dealerships"
- Platform overview: Three-portal architecture (Operator, Dealer, Customer) explained for the dealer audience
- Feature highlights with icons: AI Document Scanner, VIN Tag Scanner, Real-Time Claims Tracking, Push-to-Claim Mobile Workflow, Manufacturer Integration, Revenue Analytics
- Security section: Data encryption, PIPEDA compliance, role-based access control, secure cloud infrastructure
- Mobile section: iOS & Android apps (Capacitor), PWA support, on-the-lot workflows
- Integration capabilities: API access, manufacturer portal connections, lender integrations
- CTA: "See the Platform in Action" → /contact with demo request
- FAQ: What technology stack do you use? Is there a mobile app? How does AI scanning work? Is my data secure?

**Layout Direction:** Use a platform architecture diagram showing the three portals and how they connect. Feature highlights should use a tabbed or accordion interface, not a flat card grid. Include mock UI screenshots (styled placeholder boxes).

---

### PAGE 9: /on-site-repairs — On-Site Repairs
**Status:** EXISTS — nearly blank
**Nav Location:** Header Services Tab
**Priority:** MEDIUM

**SEO Target Keywords:** RV on-site repair service, mobile RV repair, dealership repair services, RV warranty repair, on-location RV service

**Meta:**
```html
<title>On-Site RV Repair Services | Mobile Warranty Repairs | DealerSuite360</title>
<meta name="description" content="Coordinate on-site and mobile repair services for warranty claims. Reduce downtime, improve customer satisfaction, and streamline the repair process through DealerSuite360.">
```

**Content Requirements:**
- Hero: "On-Site Repairs — Minimize Downtime, Maximize Satisfaction"
- Service overview: How on-site repairs integrate with the claims process
- Benefits: Reduced customer wait times, lower transport costs, faster claim resolution, improved dealer reputation
- Process: Claim Filed → Repair Scheduled → Technician Dispatched → Work Completed → Claim Updated → Payment Processed
- Coverage area: North American service network (position for growth)
- CTA: "Schedule On-Site Repair Support" → /contact
- FAQ: How does on-site repair scheduling work? What types of repairs qualify? What's the turnaround time? Is this included in my plan?

---

### PAGE 10: /roadside-assistance — Roadside Assistance
**Status:** EXISTS — nearly blank
**Nav Location:** Header Services Tab + Hamburger Owner Services
**Priority:** MEDIUM

**SEO Target Keywords:** RV roadside assistance, 24/7 RV towing, RV emergency service, roadside assistance program dealers

**Meta:**
```html
<title>24/7 RV Roadside Assistance | Emergency Coverage | DealerSuite360</title>
<meta name="description" content="Offer your customers 24/7 roadside assistance coverage. Towing, emergency repairs, tire service, and lockout assistance for RVs across North America.">
```

**Content Requirements:**
- Hero: "24/7 Roadside Assistance for RV Owners"
- Coverage details: Towing, flat tire, battery jump, lockout, fuel delivery, emergency repairs
- For dealers: How to offer roadside assistance as an add-on product, revenue opportunity
- For owners: Peace of mind, coverage area, response times
- Pricing: Roadside assistance plan pricing (annual, per-unit)
- How it works: Customer calls → Dispatch → Service arrives → Claim logged → Resolution
- CTA: "Add Roadside Assistance to Your Offerings" → /contact
- FAQ: What does roadside assistance cover? Is there a distance limit? How fast is response time? Can customers purchase directly?

---

### PAGE 11: /marketplace — Marketplace Overview
**Status:** EXISTS — needs SEO optimization
**Nav Location:** Header Menu (Main)
**Priority:** MEDIUM

**Fix Required:** "Marketplace" nav item currently only opens mega menu. Fix: clicking "Marketplace" text should navigate to /marketplace AND dropdown opens on hover/arrow click.

**SEO Target Keywords:** RV dealer marketplace, dealer to dealer RV sales, RV wholesale marketplace, dealer network marketplace

**Meta:**
```html
<title>Dealer Marketplace | Buy & Sell RV Inventory | DealerSuite360</title>
<meta name="description" content="Access North America's dealer-to-dealer RV marketplace. Buy, sell, and auction new, used, and overstock inventory through a verified dealer network.">
```

**Content Requirements:**
- Hero: "The Dealer-to-Dealer RV Marketplace"
- Two sections: Network Marketplace (always-on listings) and Live Auctions (scheduled events)
- Marketplace features: Verified dealers only ($499/yr membership), manual staff verification, dealer identity hidden in listings, $500 Stripe escrow per transaction, $250 flat commission per sale
- Public Showcase add-on: $299/yr, monthly 24-hour public auctions, free public browsing, credit-card-verified bidding
- Trust & security: Escrow holds, dealer verification, dispute resolution
- CTA: "Join the Marketplace" → /sign-up with marketplace context
- FAQ: How do I list inventory? What are the fees? How does verification work? Is my identity protected?

---

### PAGE 12: /network-marketplace — Network Marketplace
**Status:** EXISTS — copy-paste content
**Nav Location:** Header Marketplace Tab
**Priority:** MEDIUM

**Content Requirements:**
- Hero: "Dealer Network Marketplace"
- Always-on inventory listings between verified dealers
- How to list: Upload inventory → Set pricing → Dealers browse → Offers received → Escrow → Delivery → Commission
- Membership details: $499/year, what's included
- Listing features: Photos, specs, condition reports, history
- CTA: "Start Listing Your Inventory" → /sign-up
- Pricing: Membership + commission structure displayed

---

### PAGE 13: /live-auctions — Live Auctions
**Status:** EXISTS — oversized hero, white-on-white buttons, needs content
**Nav Location:** Header Marketplace Tab + Footer
**Priority:** MEDIUM

**Fixes Required:**
- Hero height reduced to standard 280-320px
- Fix all button text visibility (no white-on-white)

**Content Requirements:**
- Hero: "Live RV Auctions" (compact, properly styled)
- How auctions work: Scheduled events, real-time bidding, reserve prices, automatic escrow
- Public Showcase: Monthly 24-hour events, public access with credit card verification
- For sellers: Benefits of auction format, reserve price protection
- For buyers: Wholesale pricing access, verified inventory
- Upcoming auctions section (placeholder for dynamic content)
- Pricing: Auction fees and commissions displayed
- CTA: "Register for Next Auction" → /sign-up

---

### PAGE 14: /pricing — Pricing Overview
**Status:** EXISTS — needs major clarity overhaul
**Nav Location:** Header Menu (Main) + Footer
**Priority:** CRITICAL

**SEO Target Keywords:** RV dealer software pricing, dealership management pricing, claims processing cost, dealer platform subscription

**Meta:**
```html
<title>Pricing Plans | RV Dealer Platform | DealerSuite360</title>
<meta name="description" content="Transparent pricing for DealerSuite360 — choose from Starter, Professional, or Enterprise plans. Monthly or annual billing with 20% annual discount. All the tools your RV dealership needs.">
```

**Content Requirements:**
- Hero: "Simple, Transparent Pricing"
- Billing toggle: Monthly / Annual (Save 20%)
- Three-tier pricing table: Starter, Professional, Enterprise
  - Each plan lists included modules/services clearly
  - Feature comparison checklist
  - "Most Popular" badge on Professional
  - Enterprise: "Contact Us" for custom pricing
- Add-on modules section: Individual modules that can be added to any plan (Marketplace $499/yr, Public Showcase $299/yr, AI F&I Presenter, etc.)
- Per-service pricing links: Each service module links to its detailed page for more info
- Money-back guarantee or free trial mention if applicable
- FAQ: What's included in each plan? Can I upgrade anytime? Is there a setup fee? Do you offer custom enterprise pricing? What payment methods do you accept?
- CTA: "Get Started" per plan → /sign-up with plan pre-selected

**Layout Direction:** The current pricing table layout is good — keep the monthly/annual toggle with 20% savings. But add much more clarity on what each plan includes. Add a full feature comparison matrix below the main cards.

---

### PAGE 15: /privacy-policy — Privacy Policy
**Status:** EXISTS — needs update to March 2026 standards
**Nav Location:** Hamburger Menu + Copyright Menu
**Priority:** MEDIUM

**Requirements:**
- Update all dates to March 2026
- Add DealerSuite360 logo at the top
- Update content to reflect all current services (claims, financing, F&I, marketplace, AI features, mobile app)
- Include PIPEDA compliance language (Canadian market)
- Include CCPA/state privacy law references (US market expansion)
- Data processing for AI features (document scanning, F&I presenter)
- Third-party integrations disclosure (Stripe, manufacturer portals, lender APIs)
- Cookie policy reference
- Keep the standard legal page layout — no need for fancy design, but add the brand logo

---

## PAGES — NEW (Creation Required)

---

### PAGE 16: /sign-up — Sign Up / Request Access
**Status:** NEW
**Nav Location:** Footer (Company section)
**Priority:** CRITICAL

**SEO Target Keywords:** RV dealer sign up, dealership platform registration, dealer claims account

**Content Requirements:**
- Hero: "Get Started with DealerSuite360"
- Simple, clean form: Dealership Name, Contact Name, Email, Phone, Number of Units (dropdown), Primary Interest (checkboxes: Claims, Financing, F&I, Warranty, Marketplace, All Services)
- Messaging: "A member of our team will reach out within 24 hours to get you started."
- Trust signals: "No credit card required", "Free onboarding consultation", security badges
- Side panel or section: Quick value props (3-4 bullet points about what they're signing up for)
- Form submits to backend API endpoint
- Success state: Thank you message with next steps

**Layout Direction:** Clean two-column layout — form on one side, value props on the other. Not cluttered.

---

### PAGE 17: /parts-components — Parts & Components
**Status:** NEW
**Nav Location:** Hamburger Menu (Supporting Services)
**Priority:** MEDIUM

**SEO Target Keywords:** RV parts sourcing, dealer parts supply, RV components wholesale, warranty parts fulfillment

**Meta:**
```html
<title>Parts & Components Sourcing | RV Dealer Parts | DealerSuite360</title>
<meta name="description" content="DealerSuite360 sources and supplies OEM and aftermarket parts to facilitate warranty claims and repairs. Streamline your parts ordering and reduce repair delays.">
```

**Content Requirements:**
- Hero: "Parts & Components — Sourced, Supplied, Simplified"
- How it works: DealerSuite360 sources parts to facilitate the claims process, reducing dealer burden
- Parts catalog concept: OEM parts, aftermarket alternatives, accessories
- Integration with claims: When a claim is approved, parts are automatically sourced and tracked
- Benefits: Reduced repair delays, competitive pricing, quality assurance
- Pricing: Parts ordering included with claims module, or standalone pricing
- CTA: "Streamline Your Parts Supply" → /contact
- FAQ: How do you source parts? What brands do you carry? How fast is delivery? Can I order parts without a claim?

---

### PAGE 18: /marketing-services — Marketing Services
**Status:** NEW
**Nav Location:** Hamburger Menu (Supporting Services)
**Priority:** MEDIUM

**SEO Target Keywords:** RV dealer marketing, dealership lead generation, RV sales leads, dealer marketing services

**Meta:**
```html
<title>Marketing Services | Sales Leads for RV Dealers | DealerSuite360</title>
<meta name="description" content="Generate qualified sales leads for your RV dealership. DealerSuite360 provides targeted marketing services and lead generation to help dealers grow their customer base.">
```

**Content Requirements:**
- Hero: "Marketing Services That Drive Sales"
- Lead generation: How DealerSuite360 provides qualified sales leads to dealers
- Marketing channels: Digital advertising, SEO, social media, email campaigns
- Lead quality: Verified, local, intent-based leads
- Results tracking: Dashboard integration showing lead metrics
- Pricing: Marketing services pricing tiers
- CTA: "Start Generating Leads" → /contact
- FAQ: What types of leads do you provide? How are leads qualified? What's the cost per lead? Can I set my service area?

---

### PAGE 19: /consignment-services — Consignment Services
**Status:** NEW
**Nav Location:** Hamburger Menu (Supporting Services)
**Priority:** MEDIUM

**SEO Target Keywords:** RV consignment, dealer consignment program, used RV consignment, RV trade-in consignment

**Meta:**
```html
<title>Consignment Services | Used RV Inventory for Dealers | DealerSuite360</title>
<meta name="description" content="Expand your inventory with consignment units from RV owners. DealerSuite360 manages the consignment process so dealers can focus on selling.">
```

**Content Requirements:**
- Hero: "Consignment Services — Expand Your Inventory, Minimize Risk"
- How it works: RV owners consign their units through DealerSuite360 → dealers get access to pre-vetted used inventory
- Benefits for dealers: No upfront purchase cost, expanded inventory, professional inspections included
- Benefits for owners: Professional sales support, dealership exposure, competitive pricing
- Process flow: Owner Submits → Inspection → Listing → Dealer Sells → Commission Split
- Pricing: Commission structure
- CTA: "Explore Consignment" → /contact
- FAQ: How does consignment pricing work? Who handles inspections? What's the typical sales timeline? What if the unit doesn't sell?

---

### PAGE 20: /extended-warranty — Extended Warranty (Owner Services)
**Status:** NEW
**Nav Location:** Hamburger Menu (Owner Services)
**Priority:** MEDIUM

**SEO Target Keywords:** RV extended warranty, extended RV protection, RV warranty plans, after-market RV warranty

**Meta:**
```html
<title>Extended Warranty Plans | RV Owner Protection | DealerSuite360</title>
<meta name="description" content="Protect your RV investment with comprehensive extended warranty coverage. Plans cover mechanical, electrical, and structural components beyond the manufacturer warranty.">
```

**Content Requirements:**
- Hero: "Extended Warranty Protection for Your RV"
- Plan tiers: Basic, Plus, Premium — with coverage comparison table
- What's covered: Mechanical, electrical, plumbing, structural, appliances
- Claims process: How to file a claim under the extended warranty
- Pricing table: Per-plan pricing displayed
- Trust: Coverage backed by licensed insurers
- CTA: "Get a Quote" → /contact or inline quote form
- FAQ: When does coverage start? Are pre-existing conditions covered? Can I transfer my warranty? What's the claims process?

**Note:** This is a B2C page — targeting RV owners directly, not dealers.

---

### PAGE 21: /protection-plans — Protection Plans (Owner Services)
**Status:** NEW
**Nav Location:** Hamburger Menu (Owner Services)
**Priority:** MEDIUM

**SEO Target Keywords:** RV protection plans, RV paint protection, fabric protection RV, RV interior protection

**Meta:**
```html
<title>RV Protection Plans | Paint, Fabric & Interior | DealerSuite360</title>
<meta name="description" content="Keep your RV looking new with comprehensive protection plans. Paint protection, fabric guard, interior shield, and tire & wheel coverage for all RV types.">
```

**Content Requirements:**
- Hero: "Protect Your RV Inside and Out"
- Protection products: Paint Protection, Fabric Guard, Interior Shield, Tire & Wheel, Key Replacement
- Each product: What it covers, duration, cost
- Bundle pricing: Save by combining products
- CTA: "Choose Your Protection" → inline plan selector or /contact
- FAQ: How long does protection last? Is professional application required? Can I add protection after purchase?

**Note:** B2C page — targeting RV owners.

---

### PAGE 22: /revenue-optimization — Revenue Optimization
**Status:** NEW (distinct from /revenue-services)
**Nav Location:** Footer (Services section)
**Priority:** MEDIUM

**SEO Target Keywords:** dealer revenue optimization, RV dealer profit growth, dealership efficiency, claims approval optimization

**Meta:**
```html
<title>Revenue Optimization | Maximize Dealer Profitability | DealerSuite360</title>
<meta name="description" content="DealerSuite360 creates products, services, and tools designed to optimize revenue for RV dealers. From higher claims approval rates to better warranty margins.">
```

**Content Requirements:**
- Hero: "Revenue Optimization — Tools Built to Grow Your Bottom Line"
- Key difference from /revenue-services: This page focuses on HOW DealerSuite360 optimizes revenue (tools, strategies, products), not just listing revenue streams
- Optimization areas: Claims approval rate improvement, warranty plan margin optimization, F&I penetration increase, parts markup optimization, time savings = more deals
- Data section: Show improvement metrics (e.g., "40% faster claim approvals", "25% higher F&I penetration")
- Tools overview: Analytics dashboard, revenue reports, benchmark comparisons
- CTA: "Start Optimizing Your Revenue" → /contact
- FAQ: How do you measure revenue optimization? What's the typical improvement? How long to see results?

---

### PAGE 23: /careers — Careers
**Status:** NEW
**Nav Location:** Footer (Company section)
**Priority:** MEDIUM

**SEO Target Keywords:** DealerSuite360 careers, RV industry jobs, dealer technology careers, SaaS startup jobs

**Meta:**
```html
<title>Careers at DealerSuite360 | Join Our Team</title>
<meta name="description" content="Join DealerSuite360 and help build the future of RV dealership technology. We're hiring passionate people in sales, marketing, account management, and technology.">
```

**Content Requirements:**
- Hero: "Build the Future of Dealership Technology"
- Company culture: "We're looking for people passionate about creating tools that help businesses succeed"
- Open positions (initial postings):
  - Account Manager — Dealer Relations
  - Sales Representative — New Business Development
  - Marketing Coordinator — Digital Marketing & Content
  - Customer Success Specialist
  - Technical Support Representative
- Each position: Brief description, location (Remote / Hybrid), department, "Apply Now" button → mailto: or application form
- Benefits section: Remote work options, competitive compensation, growth opportunity at a scaling startup
- CTA: "See Open Positions" scrolls to positions section + "Don't see your role? Send us your resume" → email link

---

### PAGE 24: /partnerships — Partnerships
**Status:** NEW
**Nav Location:** Footer (Company section)
**Priority:** MEDIUM

**SEO Target Keywords:** RV dealer partnership, manufacturer partnership, RV industry partner, dealership technology partner

**Meta:**
```html
<title>Partnerships | Grow with DealerSuite360</title>
<meta name="description" content="Partner with DealerSuite360 — whether you're a dealer, manufacturer, parts supplier, insurer, or service provider. Together we're building the future of the RV industry.">
```

**Content Requirements:**
- Hero: "Partner with DealerSuite360 — Grow Together"
- Partner types: Dealers, Manufacturers, Parts Suppliers, Insurance Providers, Service Networks, Technology Integrators
- Each partner type: What the partnership looks like, benefits, requirements
- Current partnerships: Manufacturer logos/names (the 6 current ones + "and growing")
- Partnership inquiry form: Company Name, Contact, Partner Type (dropdown), Message
- CTA: "Become a Partner" → scrolls to form
- FAQ: What types of partnerships do you offer? Is there a cost to partner? What's the onboarding process?

---

### PAGE 25: /testimonials — Testimonials
**Status:** NEW
**Nav Location:** Footer (Company section)
**Priority:** MEDIUM

**SEO Target Keywords:** DealerSuite360 reviews, RV dealer testimonials, dealer platform reviews

**Meta:**
```html
<title>Dealer Testimonials | Success Stories | DealerSuite360</title>
<meta name="description" content="See how RV dealers across North America have increased efficiency, revenue, and customer satisfaction with DealerSuite360.">
```

**Content Requirements:**
- Hero: "What Dealers Are Saying"
- 6-8 mock testimonials from fictional dealers with:
  - Dealer name, dealership name, location (spread across Canadian provinces + US states)
  - Specific results mentioned: "Claim processing time cut by 60%", "F&I revenue up 35%", etc.
  - Star ratings (4.5-5 stars)
  - Photo placeholder (initials avatar)
- Categorize by use case: Claims, Financing, F&I, Overall Platform
- Featured testimonial: One large, detailed success story
- CTA: "Join These Successful Dealers" → /sign-up

---

### PAGE 26: /about — About Us
**Status:** EXISTS — needs SEO optimization
**Nav Location:** Header Menu + Footer (Company)
**Priority:** MEDIUM

**SEO Target Keywords:** DealerSuite360 about, RV dealer technology company, dealership services company

**Meta:**
```html
<title>About DealerSuite360 | Our Mission & Story</title>
<meta name="description" content="DealerSuite360 was built by industry veterans who understand the challenges RV dealers face every day. 15+ years of experience powering dealer success across North America.">
```

**Content Requirements:**
- Hero: "Built by Industry Veterans, For the Industry"
- Company story: Founded by professionals who saw dealers struggling with fragmented tools and manual processes
- Mission: "To provide RV dealers with a single platform that handles every aspect of their business — from claims to customer service"
- Stats: 15+ years experience, 6+ manufacturer partnerships, North American coverage
- Team section: Placeholder for team bios
- Vision: Growing from RV dealers to all dealership types across North America
- "Powered by Maxx Stacks" mention
- CTA: "Get in Touch" → /contact

---

### PAGE 27: /contact — Contact
**Status:** EXISTS — needs review
**Nav Location:** Header Menu (CTA button)
**Priority:** HIGH

**Requirements:**
- Contact form with fields: Name, Email, Phone, Dealership Name, Department Interest (dropdown: Claims, Financing, F&I, Warranty, Marketplace, Technology, General, Partnership, Demo Request), Message
- Contact information: Email, phone (if applicable), business hours
- Map placeholder or office location
- Response time promise: "We'll get back to you within 24 hours"
- The form should accept URL parameters to pre-select department (?dept=demo, ?dept=claims, etc.) so CTAs from other pages can deep-link with context

---

### PAGES 28-31: Resources Section (Footer)

### PAGE 28: /claim-guides — Claim Guides
**Status:** NEW | **Nav:** Footer Resources

**Content:** Resource hub for claim processing guides. Include 4-6 article summaries: "How to File a DAF Claim", "Understanding FRC Codes", "Warranty Claim Best Practices", "Common Claim Denials and How to Avoid Them", "Manufacturer-Specific Claim Requirements", "Photo Documentation Guide". Each article card links to # (future blog posts). Include download CTA for a "Complete Claims Guide" (email capture).

### PAGE 29: /industry-reports — Industry Reports
**Status:** NEW | **Nav:** Footer Resources

**Content:** Industry insights and data. Include 3-4 report summaries: "State of RV Warranty Claims 2026", "Dealer Revenue Optimization Report", "F&I Trends in the RV Industry", "North American RV Market Outlook". Each links to # (future downloads). Email capture for "Get the Latest Report".

### PAGE 30: /webinars — Webinars
**Status:** NEW | **Nav:** Footer Resources

**Content:** Webinar listings. Include 3-4 upcoming/past webinar cards: "Maximizing Claims Approval Rates", "Introduction to AI F&I", "Building a Dealer Marketplace Strategy", "2026 Warranty Landscape". Registration form or email capture. "Notify Me of Upcoming Webinars" CTA.

### PAGE 31: /knowledge-base — Knowledge Base
**Status:** NEW | **Nav:** Footer Resources

**Content:** Searchable help resource. Categories: Getting Started, Claims Processing, Financing, Warranty Management, Marketplace, Account & Billing. Each category shows 3-4 article titles. Search bar at top (UI only for now). "Can't find what you need?" → /contact CTA.

### PAGE 32: /dealer-training — Dealer Training
**Status:** NEW | **Nav:** Footer Resources

**Content:** Training resources for dealers. Include: Onboarding program overview, platform walkthrough videos (placeholder), claims processing training, certification program concept. "Schedule Training" CTA → /contact.

---

### PAGES 33-38: Support Section (Footer)

### PAGE 33: /help-center — Help Center
**Status:** NEW | **Nav:** Footer Support

**Content:** Support hub. Quick links to: Knowledge Base, Documentation, Contact Support, System Status. FAQ section with top 5 most common questions. "Submit a Support Ticket" CTA. Live chat mention (coming soon).

### PAGE 34: /documentation — Documentation
**Status:** NEW | **Nav:** Footer Support

**Content:** Technical documentation hub. Sections: Platform Overview, Dealer Portal Guide, Customer Portal Guide, API Reference, Integration Guides, Release Notes. Each section shows brief description and "View Documentation" link (# for now). Styled like a developer docs landing page.

### PAGE 35: /api-access — API Access
**Status:** NEW | **Nav:** Footer Support

**Content:** API access information. Who it's for: Technology partners, custom integrations, enterprise dealers. Features: RESTful API, webhook support, real-time data sync, comprehensive documentation. Getting started: Request API key → Review docs → Build integration → Go live. "Request API Access" form → /contact with API context.

### PAGE 36: /system-status — System Status
**Status:** NEW | **Nav:** Footer Support

**Content:** System status page. Current status indicator (green = operational). Services listed: Dealer Portal, Customer Portal, API, Claims Processing, Marketplace, Payments. All show "Operational" status. Uptime percentage: 99.9%. Incident history section (empty — "No recent incidents"). "Subscribe to Status Updates" email capture.

### PAGE 37: /dealer-integration — Dealer Integration
**Status:** NEW | **Nav:** Footer Support

**Content:** Integration guide for new dealers. Onboarding timeline: Day 1-3 setup, Day 4-7 training, Day 8-10 go-live. Integration checklist: Account setup, branding configuration, staff accounts, first claim submission, customer portal setup. Requirements: Business license, manufacturer dealer agreements. "Start Integration" → /sign-up.

### PAGE 38: /expert-consultation — Expert Consultation
**Status:** NEW | **Nav:** Footer Support

**Content:** Book a consultation with a DealerSuite360 expert. Topics: Platform demo, claims processing strategy, revenue optimization, marketplace strategy, custom enterprise solutions. Booking form: Name, Email, Company, Topic (dropdown), Preferred Date/Time. "Book Your Consultation" as primary CTA.

---

### PAGES 39-42: Legal / Copyright Menu

### PAGE 39: /terms-of-service — Terms of Service
**Status:** NEW | **Nav:** Copyright Menu
**Note:** Currently redirects to /contact — must be its own page

**Content:** Standard SaaS terms of service covering: Service description, account terms, payment terms, acceptable use, intellectual property, limitation of liability, termination, governing law (Canadian jurisdiction + US provisions for North American expansion). DealerSuite360 logo at top. Effective date: March 2026.

### PAGE 40: /cookie-policy — Cookie Policy
**Status:** NEW | **Nav:** Copyright Menu
**Note:** Currently has no href

**Content:** Cookie policy covering: What cookies are, cookies we use (essential, analytics, preferences), third-party cookies (Stripe, analytics), how to manage cookies, cookie consent management. Consider also triggering a cookie consent banner on click. DealerSuite360 logo at top.

### PAGE 41: /pipeda-compliance — PIPEDA Compliance
**Status:** NEW | **Nav:** Copyright Menu
**Note:** Currently has no href

**Content:** PIPEDA (Personal Information Protection and Electronic Documents Act) compliance statement. How DealerSuite360 complies with Canadian privacy law: Data collection practices, consent management, data access/correction rights, data retention policies, breach notification procedures, privacy officer contact. Important for Canadian market credibility. DealerSuite360 logo at top.

---

## NAVIGATION FIXES REQUIRED

1. **Services menu item:** Must BOTH link to /services AND open mega menu (click = navigate, hover/dropdown-arrow = mega menu)
2. **Marketplace menu item:** Same fix — must navigate to /marketplace AND open mega menu
3. **Hamburger menu:** All "Same as above" entries must link to the correct URLs as specified
4. **Footer menu:** All links must point to existing pages (not # or /contact as fallback)
5. **Copyright menu:** Terms of Service currently redirects to /contact — fix to point to /terms-of-service. Cookie Policy has no href — fix to /cookie-policy. PIPEDA has no href — fix to /pipeda-compliance.
6. **"Powered by Maxx Stacks MSIL"** in footer must link to https://maxxstacks.com (external, target="_blank")

---

## SITEMAP.XML UPDATE

After all pages are created, update `public/sitemap.xml` to include every page with:
- `<loc>` — full URL
- `<lastmod>` — current date (2026-03-25)
- `<changefreq>` — monthly for service pages, weekly for dynamic pages (pricing, status)
- `<priority>` — 1.0 for home, 0.9 for services/pricing, 0.8 for sub-pages, 0.6 for legal/support

---

## ROBOTS.TXT UPDATE

Ensure marketing pages are all crawlable. Portal routes (/operator/*, /dealer/*, /customer/*) remain blocked.

---

## LLMS.TXT UPDATE

Update `public/llms.txt` to reflect all new pages and services for AI search engine indexing.

---

## JSON-LD STRUCTURED DATA

Every service page should include:
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "[Service Name]",
  "description": "[Service description]",
  "provider": {
    "@type": "Organization",
    "name": "DealerSuite360",
    "url": "https://dealersuite360.com"
  },
  "areaServed": "North America",
  "audience": {
    "@type": "Audience",
    "audienceType": "RV Dealers"
  }
}
```

Every page with an FAQ section should include FAQ schema for rich snippets.

---

## IMPLEMENTATION NOTES

1. **All pages are React components** rendered via the existing Vite + React Router setup
2. **Shared layout:** All marketing pages use the same Nav + Footer wrapper
3. **Reusable components:** PageHero, SectionBlock, PricingTable, CTASection, FAQSection, TestimonialCard, StatBlock, ProcessSteps should be created as shared components
4. **Forms:** All forms should post to Express API endpoints (create endpoints as needed)
5. **URL parameters:** /contact page should accept `?dept=X` for contextual pre-selection
6. **Responsive:** All pages must be fully responsive (mobile-first)
7. **Performance:** Lazy-load below-fold sections, optimize images, minimize bundle size
8. **Analytics-ready:** Add data attributes for event tracking on CTAs

---

## EXECUTION ORDER (Suggested)

**Phase A — Critical (Do First):**
1. Shared components (PageHero, SectionBlock, CTASection, FAQSection, etc.)
2. /sign-up (everything links to it)
3. /pricing (pricing clarity)
4. /contact (all CTAs lead here)
5. /claims-processing (core service, broken title)
6. Navigation fixes (Services + Marketplace click-through)

**Phase B — Service Pages:**
7. /services (overview)
8. /fi-services
9. /financing
10. /warranty-plans
11. /technology
12. /revenue-services
13. /rv-types

**Phase C — Supporting & New Pages:**
14. /parts-components
15. /marketing-services
16. /consignment-services
17. /extended-warranty
18. /protection-plans
19. /revenue-optimization
20. /on-site-repairs
21. /roadside-assistance

**Phase D — Marketplace:**
22. /marketplace
23. /network-marketplace
24. /live-auctions

**Phase E — Company & Community:**
25. /about
26. /careers
27. /partnerships
28. /testimonials

**Phase F — Resources & Support:**
29-38. All resource and support pages

**Phase G — Legal & Final:**
39. /privacy-policy (update)
40. /terms-of-service
41. /cookie-policy
42. /pipeda-compliance
43. Sitemap, robots.txt, llms.txt updates
44. Full link audit — every internal link verified

---

*End of specification. This document contains everything needed to execute the complete site revamp autonomously.*
