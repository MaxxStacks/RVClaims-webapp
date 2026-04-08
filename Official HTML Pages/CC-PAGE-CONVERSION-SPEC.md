# CC-PAGE-CONVERSION-SPEC.md — HTML → TSX Conversion + Menu Overhaul

## PURPOSE

Convert all HTML page templates into React TSX page components within the existing codebase. Every page uses the EXISTING site header, footer, and navigation — NOT the nav/footer baked into the HTML files. All menus (desktop mega menu, desktop hamburger, mobile hamburger, footer desktop, footer mobile) must be updated to reflect the full page inventory. Bottom CTAs alternate between two approved designs (Hybrid 1 and Hybrid 2) across pages.

---

## CRITICAL RULES

### 1. USE EXISTING SITE HEADER & FOOTER
- **DO NOT** copy or recreate the `<nav>` or `<footer>` from the HTML template files.
- Every page component renders ONLY the page body content — everything between nav and footer.
- The site's existing shared `Header`/`Navbar` and `Footer` components wrap each page via the layout/router.
- If the site uses a layout wrapper (e.g., `Layout.tsx`, `App.tsx`), all new pages plug into that same wrapper.

### 2. USE EXISTING DESIGN SYSTEM
- Read `client/src/index.css` for all CSS variables, fonts, spacing, and design tokens.
- Match the existing site's visual patterns exactly. Do NOT introduce new CSS variables.
- Primary brand color: `#033280` / `hsl(217, 95%, 26%)`.
- Font: Inter (already loaded in the project).

### 3. MONOLITHIC FILE STRUCTURE — DO NOT RESTRUCTURE
- The existing file structure is intentional. Do not reorganize, rename, or restructure directories.
- Add new page components following the existing naming convention and file location pattern.

### 4. EVERY INTERACTIVE ELEMENT MUST BE FUNCTIONAL
- No empty `onClick` handlers. No `href="#"`. No decorative-only buttons.
- FAQ accordions must open/close.
- Forms must have proper field types and submission handling (even if just `mailto:` or `console.log` for now).
- All internal links must point to real routes.

---

## CTA ALTERNATION SYSTEM

Two bottom-of-page CTA designs alternate across all pages. The headline, description, and button text/links are page-specific, but the LAYOUT and STYLING alternate.

### CTA Hybrid 1 — "Split Layout on Gray"
- Gray background (`--gray-50`), decorative circles (primary-10, primary-5) positioned top-right and bottom-left
- Split grid: text (h2 + p) on left, stacked buttons on right
- Primary button: navy solid with deep box-shadow (`0 10px 20px -5px rgba(3,50,128,.3)`)
- Secondary button: white bg, border, ghost style
- h2 uses `.accent` span for primary-colored emphasis text
- Responsive: stacks to single column on mobile

```
CSS class: .cta-h1
Layout: grid 1fr auto, gap 4rem, max-width 52rem centered
```

### CTA Hybrid 2 — "Centered on White"
- White background with `border-top` and `border-bottom` (1px solid border color)
- Decorative circles same as H1 but smaller (16rem and 10rem)
- Centered text: h2 (font-weight 800) + p underneath, centered buttons below
- Same button styles as H1
- h2 uses `.accent` span for primary-colored emphasis text

```
CSS class: .cta-h2
Layout: centered, max-width 48rem
```

### Alternation Assignment

| # | Page | CTA |
|---|------|-----|
| 1 | `/claim-guides` | H1 |
| 2 | `/industry-reports` | H2 |
| 3 | `/webinars` | H1 |
| 4 | `/knowledge-base` | H2 |
| 5 | `/dealer-training` | H1 |
| 6 | `/help-center` | H2 |
| 7 | `/documentation` | H1 |
| 8 | `/api-access` | H2 |
| 9 | `/system-status` | H1 |
| 10 | `/dealer-integration` | H2 |
| 11 | `/expert-consultation` | H1 |
| 12 | `/careers` | H2 |
| 13 | `/partnerships` | H1 |
| 14 | `/testimonials` | H2 |
| 15 | `/sign-up` | H1 |
| 16 | `/terms-of-service` | H2 |
| 17 | `/cookie-policy` | H1 |
| 18 | `/pipeda-compliance` | H2 |
| 19 | `/claims-processing` | H1 |
| 20 | `/services` | H2 |
| 21 | `/rv-types` | H1 |
| 22 | `/financing` | H2 |
| 23 | `/fi-services` | H1 |
| 24 | `/warranty-plans` | H2 |
| 25 | `/revenue-services` | H1 |
| 26 | `/technology` | H2 |
| 27 | `/on-site-repairs` | H1 |
| 28 | `/roadside-assistance` | H2 |
| 29 | `/marketplace` | H1 |
| 30 | `/dealer-exchange` | H2 |
| 31 | `/live-auctions` | H1 |
| 32 | `/pricing` | H2 |
| 33 | `/contact` | H1 |
| 34 | `/about` | H2 |
| 35 | `/parts-components` | H1 |
| 36 | `/marketing-services` | H2 |
| 37 | `/consignment-services` | H1 |
| 38 | `/extended-warranty` | H2 |
| 39 | `/protection-plans` | H1 |
| 40 | `/gap-insurance` | H2 |
| 41 | `/appearance-protection` | H1 |
| 42 | `/tire-wheel` | H2 |
| 43 | `/roadside-travel-protection` | H1 |
| 44 | `/specialty-protection` | H2 |
| 45 | `/revenue-optimization` | H1 |
| 46 | `/technology-platform` | H2 |
| 47 | `/free-dealer-analysis` | H1 |
| 48 | `/bidder-portal` | H2 |
| 49 | `/dealer-portal` | H1 |
| 50 | `/client-portal` | H2 |
| 51 | `/mobile-app` | H1 |
| 52 | `/services/techflow` | H2 |
| 53 | `/ai-fi-presenter` | H1 |

### DID YOU KNOW — Question Mark Color Fix
Every "Did You Know?" section across all pages: the "?" character must be colored `#033280` (brand navy), NOT black. If the "?" is rendered as a separate styled element, set its `color: #033280`. If it's inline text, wrap it in a `<span style="color:#033280">` or a className that applies the brand primary color.

Each page's CTA headline and description should be contextual to that page. Do NOT use the same generic text on every page. Pull the CTA text from the HTML template if it exists; if the HTML uses the old `bcta` navy gradient, replace it with the assigned Hybrid and write a contextual headline.

### CTA Hybrid 1 CSS (add to global styles)

```css
.cta-h1{background:var(--gray-50);padding:5rem 0;position:relative;overflow:hidden}
.cta-h1::before{content:"";position:absolute;right:-5rem;top:-5rem;width:20rem;height:20rem;border-radius:50%;background:hsl(217,95%,26%/0.10);pointer-events:none}
.cta-h1::after{content:"";position:absolute;left:-3rem;bottom:-3rem;width:12rem;height:12rem;border-radius:50%;background:hsl(217,95%,26%/0.05);pointer-events:none}
.cta-h1-inner{max-width:52rem;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:4rem;align-items:center;position:relative;z-index:1}
@media(max-width:768px){.cta-h1-inner{grid-template-columns:1fr;text-align:center}}
.cta-h1-inner h2{font-size:clamp(1.75rem,4vw,2.25rem);font-weight:700;margin-bottom:.75rem;line-height:1.2}
.cta-h1-inner h2 .accent{color:hsl(217,95%,26%)}
.cta-h1-inner p{font-size:1rem;color:var(--muted,hsl(215.4,16.3%,46.9%));line-height:1.7;max-width:32rem}
.cta-h1-btns{display:flex;flex-direction:column;gap:.75rem}
@media(max-width:768px){.cta-h1-btns{flex-direction:row;justify-content:center}}
.cta-h1 .btn-solid{background:hsl(217,95%,26%);color:white;padding:1rem 2.5rem;font-size:1rem;font-weight:600;border-radius:.5rem;border:none;cursor:pointer;box-shadow:0 10px 20px -5px rgba(3,50,128,.3);transition:all .2s}
.cta-h1 .btn-solid:hover{background:hsl(217,95%,22%);box-shadow:0 15px 25px -5px rgba(3,50,128,.4)}
.cta-h1 .btn-ghost{background:white;color:var(--fg,hsl(240,10%,3.9%));padding:.85rem 2.5rem;font-size:.92rem;font-weight:600;border-radius:.5rem;border:1px solid hsl(214.3,31.8%,91.4%);cursor:pointer;transition:all .2s}
.cta-h1 .btn-ghost:hover{border-color:hsl(217,95%,26%);color:hsl(217,95%,26%)}
```

### CTA Hybrid 2 CSS (add to global styles)

```css
.cta-h2{background:white;border-top:1px solid hsl(214.3,31.8%,91.4%);border-bottom:1px solid hsl(214.3,31.8%,91.4%);padding:5rem 0;position:relative;overflow:hidden}
.cta-h2::before{content:"";position:absolute;right:-4rem;top:-4rem;width:16rem;height:16rem;border-radius:50%;background:hsl(217,95%,26%/0.05);pointer-events:none}
.cta-h2::after{content:"";position:absolute;left:-2rem;bottom:-2rem;width:10rem;height:10rem;border-radius:50%;background:hsl(217,95%,26%/0.05);pointer-events:none}
.cta-h2-inner{max-width:48rem;margin:0 auto;text-align:center;position:relative;z-index:1}
.cta-h2-inner h2{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:800;margin-bottom:.75rem;line-height:1.15}
.cta-h2-inner h2 .accent{color:hsl(217,95%,26%)}
.cta-h2-inner p{font-size:1.05rem;color:var(--muted,hsl(215.4,16.3%,46.9%));line-height:1.7;max-width:36rem;margin:0 auto 2rem}
.cta-h2-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.cta-h2 .btn-solid{background:hsl(217,95%,26%);color:white;padding:1rem 2.5rem;font-size:1rem;font-weight:600;border-radius:.5rem;border:none;cursor:pointer;box-shadow:0 10px 20px -5px rgba(3,50,128,.3);transition:all .2s}
.cta-h2 .btn-solid:hover{background:hsl(217,95%,22%);box-shadow:0 15px 25px -5px rgba(3,50,128,.4)}
.cta-h2 .btn-outline{background:transparent;color:var(--fg,hsl(240,10%,3.9%));padding:.85rem 2rem;font-size:.92rem;font-weight:600;border-radius:.5rem;border:1px solid hsl(214.3,31.8%,91.4%);cursor:pointer;transition:all .2s}
.cta-h2 .btn-outline:hover{border-color:hsl(217,95%,26%);color:hsl(217,95%,26%)}
```

---

## NAVIGATION OVERHAUL

Update ALL menus in the existing navigation components. Do NOT create new nav/footer components — edit the ones that already exist.

### DESKTOP MEGA MENU (Main Header)

**Top-level items:**
- Home → `/`
- About → `/about`
- Services → `/services` (click navigates, hover opens mega dropdown)
- Products → `/products/fi-services` (click navigates, hover opens mega dropdown)
- Marketplace → `/marketplace` (click navigates, hover opens mega dropdown)
- Technology → `/technology`
- Pricing → `/pricing`
- Contact → `/contact` (styled as CTA button)

**Services Mega Dropdown:**
| Column 1 — Core Services | Column 2 — Supporting Services |
|---|---|
| Claims Processing → `/claims-processing` | Parts & Components → `/parts-components` |
| Financing Services → `/financing` | Marketing Services → `/marketing-services` |
| F&I Services → `/fi-services` | Consignment Services → `/consignment-services` |
| Warranty & Extended Service → `/warranty-plans` | TechFlow → `/services/techflow` |
| Revenue Services → `/revenue-services` | On-Site Repairs → `/on-site-repairs` |
| RV Coverage → `/rv-types` | Roadside Assistance → `/roadside-assistance` |
| | AI F&I Presenter → `/ai-fi-presenter` |

**Products Mega Dropdown:**
| Column 1 — F&I Products | Column 2 — Protection Plans |
|---|---|
| GAP Insurance → `/gap-insurance` | Appearance Protection → `/appearance-protection` |
| Extended Warranty → `/extended-warranty` | Tire & Wheel → `/tire-wheel` |
| Protection Plans → `/protection-plans` | Roadside & Travel → `/roadside-travel-protection` |
| | Specialty Protection → `/specialty-protection` |

**Marketplace Mega Dropdown:**
| Links |
|---|
| Dealer Exchange → `/dealer-exchange` |
| Live Auctions → `/live-auctions` |
| Bidder Portal → `/bidder-portal` |

### DESKTOP HAMBURGER MENU

This is the secondary hamburger icon on desktop (if it exists). It should contain the FULL site map organized by category:

**DS360 Services:**
- Claims Processing → `/claims-processing`
- Financing Services → `/financing`
- Warranty & Extended Service → `/warranty-plans`
- F&I Services → `/fi-services`
- Revenue Services → `/revenue-services`
- RV Coverage → `/rv-types`
- TechFlow → `/services/techflow`
- On-Site Repairs → `/on-site-repairs`
- Roadside Assistance → `/roadside-assistance`
- Parts & Components → `/parts-components`
- Marketing Services → `/marketing-services`
- Consignment Services → `/consignment-services`
- AI F&I Presenter → `/ai-fi-presenter`

**DS360 Products:**- GAP Insurance → `/gap-insurance`
- Extended Warranty → `/extended-warranty`
- Protection Plans → `/protection-plans`
- Appearance Protection → `/appearance-protection`
- Tire & Wheel → `/tire-wheel`
- Roadside & Travel Protection → `/roadside-travel-protection`
- Specialty Protection → `/specialty-protection`

**Marketplace:**
- Dealer Exchange → `/dealer-exchange`
- Live Auctions → `/live-auctions`
- Bidder Portal → `/bidder-portal`

**Platform:**
- Technology → `/technology`
- Technology Platform → `/technology-platform`
- Dealer Portal → `/dealer-portal`
- Client Portal → `/client-portal`
- Mobile App → `/mobile-app`
- Revenue Optimization → `/revenue-optimization`
- Free Dealer Analysis → `/free-dealer-analysis`

**Company:**
- About Us → `/about`
- Careers → `/careers`
- Partnerships → `/partnerships`
- Testimonials → `/testimonials`
- Pricing → `/pricing`
- Contact → `/contact`
- Sign Up → `/sign-up`

**Resources:**
- Claim Guides → `/claim-guides`
- Industry Reports → `/industry-reports`
- Webinars → `/webinars`
- Knowledge Base → `/knowledge-base`
- Dealer Training → `/dealer-training`

**Support:**
- Help Center → `/help-center`
- Documentation → `/documentation`
- API Access → `/api-access`
- System Status → `/system-status`
- Dealer Integration → `/dealer-integration`
- Expert Consultation → `/expert-consultation`

### MOBILE HAMBURGER MENU

Same structure as Desktop Hamburger but in an accordion/collapsible format. Each category header expands to show its links. Collapsed by default.

### FOOTER — DESKTOP & MOBILE

**Row 1 — 4-column link grid:**

| Services | Company | Resources | Support |
|---|---|---|---|
| Claims Processing → `/claims-processing` | About Us → `/about` | Claim Guides → `/claim-guides` | Help Center → `/help-center` |
| Financing → `/financing` | Careers → `/careers` | Industry Reports → `/industry-reports` | Documentation → `/documentation` |
| F&I Services → `/fi-services` | Partnerships → `/partnerships` | Webinars → `/webinars` | API Access → `/api-access` |
| Revenue Services → `/revenue-services` | Testimonials → `/testimonials` | Knowledge Base → `/knowledge-base` | System Status → `/system-status` |
| Technology → `/technology` | Sign Up → `/sign-up` | Dealer Training → `/dealer-training` | Dealer Integration → `/dealer-integration` |
| TechFlow → `/services/techflow` | Pricing → `/pricing` | | Expert Consultation → `/expert-consultation` |
| AI F&I Presenter → `/ai-fi-presenter` | | | |
| Live Auctions → `/live-auctions` | | | |

**Row 2 — Copyright bar:**
```
© 2026 DealerSuite360. All rights reserved. Patent Pending Technology.
Privacy Policy → /privacy  |  Terms of Service → /terms-of-service  |  Cookie Policy → /cookie-policy  |  PIPEDA Compliance → /pipeda-compliance  |  Powered by Maxx Stacks MSIL → https://maxxstacks.com (external, target="_blank")
```

**Mobile footer:** Same links, but columns stack vertically. Category headers may be collapsible.

---

## CONVERSION INSTRUCTIONS

### For each HTML template file:

1. **Open the HTML file** and extract ONLY the content between `<nav>` closing tag and `<footer>` opening tag.
2. **Convert to JSX:** Change `class=` to `className=`, self-close tags (`<br/>`, `<img/>`), escape `&` entities as JSX expressions or use unicode.
3. **Extract inline styles to CSS classes** where repeated. Add page-specific CSS to the global stylesheet or a page-level CSS module following the project's existing pattern.
4. **Replace the bottom CTA section** (the `<section class="bcta">` navy gradient block) with the assigned CTA Hybrid (H1 or H2) per the alternation table above. Write a page-contextual headline — do NOT reuse generic text.
5. **Wire FAQ accordion JS** as React state. Each FAQ card gets an `open` state toggle on click.
6. **Wire scroll animations** using IntersectionObserver in a `useEffect` — same pattern as the HTML `anim` class.
7. **Register the route** in the router configuration following the existing pattern.
8. **Verify internal links** — every `<a href="/...">` must point to a registered route.

### For existing pages being replaced:

1. Find the existing page component file.
2. Replace its content entirely with the new TSX conversion.
3. Keep the same file name and route registration.
4. Do NOT change the route path.

### For net-new pages:

1. Create a new component file following existing naming convention.
2. Register the route in the router.
3. Add the page to the sitemap.

---

## SEO REQUIREMENTS (every page)

- Unique `<title>` tag via React Helmet or the project's existing head management
- Unique `<meta name="description">` pulled from the HTML template's `<head>`
- Open Graph and Twitter Card meta tags
- JSON-LD structured data (copy from the HTML template's `<script type="application/ld+json">`)
- Proper heading hierarchy: single `<h1>`, logical `<h2>`/`<h3>` flow
- Canonical URL via `<link rel="canonical">`
- All these are already defined in the HTML templates — transfer them to the TSX page

---

## EXECUTION ORDER

### Phase 1 — Global setup (do first)
1. Add CTA H1 and H2 CSS to the global stylesheet
2. Update the Header/Navbar component with new mega menu structure
3. Update the hamburger menu(s) with full site map
4. Update the Footer component with new link grid and copyright bar

### Phase 2 — Replace existing pages (14 pages)
Convert and replace in this order:
`/services`, `/claims-processing`, `/rv-types`, `/financing`, `/fi-services`, `/warranty-plans`, `/revenue-services`, `/technology`, `/on-site-repairs`, `/roadside-assistance`, `/marketplace`, `/dealer-exchange`, `/live-auctions`, `/pricing`

### Phase 3 — Add new pages (batch 1: company + legal + signup)
`/about`, `/careers`, `/partnerships`, `/testimonials`, `/sign-up`, `/terms-of-service`, `/cookie-policy`, `/pipeda-compliance`

### Phase 4 — Add new pages (batch 2: products)
`/gap-insurance`, `/extended-warranty`, `/protection-plans`, `/appearance-protection`, `/tire-wheel`, `/roadside-travel-protection`, `/specialty-protection`

### Phase 5 — Add new pages (batch 3: platform + revenue)
`/technology-platform`, `/revenue-optimization`, `/free-dealer-analysis`, `/dealer-portal`, `/client-portal`, `/bidder-portal`, `/mobile-app`

### Phase 6 — Add new pages (batch 4: services)
`/parts-components`, `/marketing-services`, `/consignment-services`, `/services/techflow`, `/ai-fi-presenter`

### Phase 7 — Add new pages (batch 5: resources + support)
`/claim-guides`, `/industry-reports`, `/webinars`, `/knowledge-base`, `/dealer-training`, `/help-center`, `/documentation`, `/api-access`, `/system-status`, `/dealer-integration`, `/expert-consultation`

### Phase 8 — Verification & push
1. `npm run build` — must complete with ZERO errors
2. Verify every route loads without 404
3. Verify every internal link resolves
4. Verify all menus (desktop mega, desktop hamburger, mobile hamburger, footer) contain correct links
5. Verify CTA alternation matches the table above
6. `git add -A`
7. `git commit -m "Complete page conversion: 53 TSX pages, menu overhaul, CTA alternation

- Converted all HTML templates to React TSX components
- Updated desktop mega menu with Services/Products/Marketplace dropdowns
- Updated desktop and mobile hamburger menus with full site map
- Updated footer with 4-column link grid and copyright bar
- Added CTA Hybrid 1 and Hybrid 2 alternating across all pages
- Registered all new routes
- All pages use existing site header/footer — no duplicate nav/footer
- All interactive elements functional (FAQ accordion, forms, animations)
- SEO meta tags, JSON-LD, and canonical URLs on every page"`
8. `git push origin main`

---

## FILE REFERENCE

HTML template files to convert (check `/mnt/user-data/outputs/` or project root):

**Already built (from prior sessions):**
- claims-processing-v3.html (reference template)
- DS360-Master-Component-Library.html (component reference)
- All product pages (gap-insurance, extended-warranty, protection-plans, appearance-protection, tire-wheel, roadside-travel-protection, specialty-protection)
- All service pages (services-hub, claims-processing, rv-coverage, financing, fi-services, warranty, revenue-services, technology, on-site-repairs, roadside-assistance, parts-components, marketing-services, consignment-services)
- All platform pages (technology-platform, revenue-optimization, free-dealer-analysis, dealer-portal, client-portal, bidder-portal, mobile-app)
- careers, partnerships, testimonials, sign-up, terms-of-service, cookie-policy, pipeda-compliance, about

**Built this session:**
- claim-guides.html
- industry-reports.html
- webinars.html
- knowledge-base.html
- dealer-training.html
- help-center.html
- documentation.html
- api-access.html
- system-status.html
- dealer-integration.html
- expert-consultation.html

**CTA reference:**
- cta-options.html (contains Hybrid 1, Hybrid 2, and originals A/B for comparison)

---

## REMINDER

- DO NOT touch the header or footer HTML/JSX in the page templates. Strip it out during conversion.
- DO NOT create new nav or footer components. Edit the existing ones.
- DO NOT restructure the file system.
- Every button, link, form, and accordion must be functional.
- Alternate CTAs per the table. No exceptions.
