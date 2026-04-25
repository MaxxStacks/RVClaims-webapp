# CC-CONVERSION-SPEC.md — HTML → TSX Mechanical Conversion

## WHAT THIS IS

You are converting 53 pre-approved HTML page templates into React TSX page components. The HTML files contain FINAL, APPROVED content — every word, every section, every heading, every FAQ, every CTA, every stat, every card has been reviewed and approved by the business owner. Your job is MECHANICAL CONVERSION, not creative interpretation.

## THE GOLDEN RULE

**If the HTML says it, the TSX says it. If the HTML doesn't say it, the TSX doesn't say it.**

You are a translator, not a writer. You are not improving, rewriting, reorganizing, simplifying, or "cleaning up" anything. The HTML content is sacred.

---

## WHAT YOU ARE DOING

1. Reading each HTML file
2. Extracting the page body content (everything between `</nav>` and `<footer>`)
3. Converting that content to valid JSX (class → className, self-closing tags, entities)
4. Wrapping it in a React functional component
5. Transferring ALL SEO metadata from the HTML `<head>` into the page component
6. Registering the route
7. Adding the page-specific CSS to the project stylesheet

## WHAT YOU ARE NOT DOING

- ❌ DO NOT rewrite, rephrase, shorten, or "improve" any text content
- ❌ DO NOT change section order
- ❌ DO NOT remove sections, cards, FAQ items, stats, or any content block
- ❌ DO NOT add content that isn't in the HTML
- ❌ DO NOT touch the Header/Navbar component
- ❌ DO NOT touch the Footer component
- ❌ DO NOT touch any existing page components that aren't being replaced
- ❌ DO NOT change any existing CSS variables, fonts, or design tokens
- ❌ DO NOT restructure the file system
- ❌ DO NOT modify any portal routes (/operator/*, /dealer/*, /customer/*)
- ❌ DO NOT touch App.tsx layout structure beyond adding route registrations
- ❌ DO NOT create new shared components — each page is a self-contained component

---

## SEO, METADATA & AI INDEXATION

This is critical. Every page MUST have the following transferred EXACTLY from the HTML `<head>`:

### 1. Title Tag
```tsx
// Use whatever head management the project uses (React Helmet, Vite plugin, etc.)
// If none exists, use document.title in a useEffect
<title>Claims Processing — AI-Powered Warranty & DAF Claims | DealerSuite360</title>
```
Copy the EXACT `<title>` from each HTML file. Do not rewrite it.

### 2. Meta Description
```html
<meta name="description" content="..." />
```
Copy the EXACT description from each HTML file.

### 3. Meta Keywords
```html
<meta name="keywords" content="..." />
```
Copy from HTML if present.

### 4. Open Graph Tags
```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:type" content="website" />
```
Copy from HTML.

### 5. Twitter Card Tags
```html
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
```
Copy from HTML.

### 6. JSON-LD Structured Data
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  ...
}
</script>
```
Copy the EXACT JSON-LD block from each HTML file. Render it in the component using a `<script>` tag with `dangerouslySetInnerHTML` or the project's existing structured data pattern.

### 7. Canonical URL
Add a canonical link for each page:
```html
<link rel="canonical" href="https://dealersuite360.com/[route]" />
```

### 8. FAQ Schema
If a page has an FAQ section, it MUST also include FAQPage JSON-LD schema. If the HTML already has it, copy it. If the HTML has FAQ content but no FAQ schema, generate the schema from the exact Q&A pairs in the HTML:
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "exact question text from HTML",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "exact answer text from HTML"
      }
    }
  ]
}
```

### 9. Semantic HTML
- Preserve the heading hierarchy from the HTML: single `<h1>`, logical `<h2>`/`<h3>` flow
- Preserve all `<section>`, `<article>`, `<nav>` semantic elements from the HTML
- Do NOT flatten semantic HTML into generic `<div>` soup

### 10. Crawlability
- All page content must be in the initial HTML render, NOT behind JavaScript-only interactions
- FAQ answers must be in the DOM (hidden via CSS max-height:0 is fine, but the text must be in the markup)
- All internal `<a href>` links must be real routes, not `href="#"`
- Structured data must be in the page source, not injected client-side after load

---

## CONVERSION PROCESS — PER PAGE

### Step 1: Read the HTML file
Open the HTML file from the project root or the specified path.

### Step 2: Identify the content zone
Find everything between the closing `</nav>` tag and the opening `<footer>` tag. This is the page body. IGNORE the nav and footer — the site's existing layout provides those.

### Step 3: Convert to JSX
- `class=` → `className=`
- `for=` → `htmlFor=`
- Self-close void elements: `<br>` → `<br/>`, `<img ...>` → `<img .../>`
- HTML entities: `&rarr;` → `→` (unicode) or `{'→'}`, `&middot;` → `·`, `&#8217;` → `'`, `&#8594;` → `→`
- `style="..."` → `style={{...}}` with camelCase properties
- `onclick` → `onClick`, etc.

### Step 4: Create the component
```tsx
import { useEffect } from 'react';

export default function PageName() {
  // Set page metadata
  useEffect(() => {
    document.title = "EXACT TITLE FROM HTML";
    // Set meta tags
    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('description', 'EXACT DESCRIPTION FROM HTML');
    setMeta('keywords', 'EXACT KEYWORDS FROM HTML');
    setMeta('og:title', 'EXACT OG TITLE FROM HTML', true);
    setMeta('og:description', 'EXACT OG DESCRIPTION FROM HTML', true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', 'EXACT TWITTER TITLE FROM HTML');
    setMeta('twitter:description', 'EXACT TWITTER DESCRIPTION FROM HTML');
    
    // Set canonical
    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon); }
    canon.href = 'https://dealersuite360.com/ROUTE';

    // JSON-LD
    const ldId = 'ld-page-name';
    if (!document.getElementById(ldId)) {
      const script = document.createElement('script');
      script.id = ldId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(EXACT_JSONLD_FROM_HTML);
      document.head.appendChild(script);
    }

    // Cleanup on unmount
    return () => {
      const ld = document.getElementById(ldId);
      if (ld) ld.remove();
    };
  }, []);

  // FAQ accordion state (only if page has FAQ)
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scroll animation
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('v'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.anim').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* PASTE CONVERTED JSX BODY HERE — everything between nav and footer from the HTML */}
    </>
  );
}
```

### Step 5: Add page CSS
Extract all `<style>` content from the HTML that is page-specific (not already in the global stylesheet). Add it to the project's global CSS file or a page-level CSS import following the project's existing pattern.

DO NOT duplicate CSS that already exists globally (nav, footer, button base styles, etc.). Only add section-specific styles that are unique to this page.

### Step 6: Register the route
Add the route to the router configuration following the EXACT pattern used by existing routes.

---

## FILE NAMING

Follow whatever naming convention the existing page components use. If existing pages are `ClaimsProcessing.tsx`, name new ones the same way. If they're `claims-processing.tsx`, match that.

---

## ROUTE MAPPING

| HTML File | Route |
|---|---|
| About.html | /about |
| AI-FI Presenter.html | /ai-fi-presenter |
| API Access.html | /api-access |
| Appearance Protection.html | /appearance-protection |
| Bidder Portal.html | /bidder-portal |
| Careers.html | /careers |
| Claim Guides.html | /claim-guides |
| Claims Processing.html | /claims-processing |
| Client Portal.html | /client-portal |
| Consignment Services.html | /consignment-services |
| Contact.html | /contact |
| Cookie Policy.html | /cookie-policy |
| Dealer Exchange.html | /dealer-exchange |
| Dealer Integration.html | /dealer-integration |
| Dealer Portal.html | /dealer-portal |
| Dealer Training.html | /dealer-training |
| Documentation.html | /documentation |
| Expert Consultation.html | /expert-consultation |
| FI Services.html | /fi-services |
| Financing Services.html | /financing |
| Free Dealer Analysis.html | /free-dealer-analysis |
| GAP Insurance.html | /gap-insurance |
| Help Center.html | /help-center |
| Industry Reports.html | /industry-reports |
| Knowledge Base.html | /knowledge-base |
| Live Auctions.html | /live-auctions |
| Marketing Services.html | /marketing-services |
| Marketplace Hub.html | /marketplace |
| Mobile App.html | /mobile-app |
| On-site Repairs.html | /on-site-repairs |
| Part Component.html | /parts-components |
| Partnerships.html | /partnerships |
| PIPEDA Compliance.html | /pipeda-compliance |
| Pricing.html | /pricing |
| Privacy Policy.html | /privacy |
| Protection Plans.html | /protection-plans |
| Revenue Optimization.html | /revenue-optimization |
| Revenue Services.html | /revenue-services |
| Roadside Assistance.html | /roadside-assistance |
| Roadside Travel Protection.html | /roadside-travel-protection |
| RV Coverage.html | /rv-types |
| Services Hub.html | /services |
| Sign-Up.html | /sign-up |
| Specialty Protection.html | /specialty-protection |
| System Status.html | /system-status |
| TechFlow.html | /services/techflow |
| Technology Platform.html | /technology-platform |
| Technology.html | /technology |
| Terms of Service.html | /terms-of-service |
| Testimonials.html | /testimonials |
| Tire Wheel Protection.html | /tire-wheel |
| Warranty Extended Service.html | /warranty-plans |
| Webinars.html | /webinars |

---

## BATCH EXECUTION

Execute in batches. After each batch: `npm run build` must pass with ZERO errors, then `git add -A && git commit && git push origin main`. Wait for human verification before proceeding to the next batch.

### Batch 1 — Core Services (5 pages)
Claims Processing, Financing Services, FI Services, Warranty Extended Service, Revenue Services

### Batch 2 — Supporting Services (5 pages)
On-site Repairs, Roadside Assistance, Part Component, Marketing Services, Consignment Services

### Batch 3 — Services continued (4 pages)
Services Hub, RV Coverage, TechFlow, AI-FI Presenter

### Batch 4 — F&I Products (4 pages)
GAP Insurance, Protection Plans, Appearance Protection, Tire Wheel Protection (note: Extended Warranty product page is in Batch 5)

### Batch 5 — Protection Products + Extended Warranty (3 pages)
Roadside Travel Protection, Specialty Protection, Extended Warranty (product page, not the service page)

### Batch 6 — Marketplace (4 pages)
Marketplace Hub, Dealer Exchange, Live Auctions, Bidder Portal

### Batch 7 — Platform (5 pages)
Technology, Technology Platform, Revenue Optimization, Free Dealer Analysis, Mobile App

### Batch 8 — Portals + Main Pages (5 pages)
Dealer Portal, Client Portal, About, Pricing, Contact

### Batch 9 — Company + Legal (5 pages)
Careers, Partnerships, Testimonials, Sign-Up, Privacy Policy

### Batch 10 — Legal + Resources (5 pages)
Terms of Service, Cookie Policy, PIPEDA Compliance, Claim Guides, Industry Reports

### Batch 11 — Resources + Support (8 pages)
Webinars, Knowledge Base, Dealer Training, Help Center, Documentation, API Access, System Status, Dealer Integration, Expert Consultation

### Commit message format per batch:
```
git commit -m "Batch [N]: Convert [page names] HTML to TSX

- Converted [N] HTML templates to React TSX components
- All SEO metadata transferred (title, description, OG, Twitter, JSON-LD)
- FAQ schema added for pages with FAQ sections
- Canonical URLs set
- Routes registered
- No existing components modified
- npm run build passes with zero errors"
```

### BETWEEN BATCHES:
**STOP. Do not proceed to the next batch until the human confirms.** Say: "Batch [N] complete. [List the pages]. Ready for your review — confirm when I should proceed to Batch [N+1]."

---

## EXISTING PAGES — REPLACE vs NEW

Some routes already exist in the codebase with old content. For these:
- Find the existing component file
- REPLACE its content entirely with the new TSX conversion
- Keep the same filename
- Keep the same route registration (don't duplicate it)

For routes that don't exist yet:
- Create a new component file
- Add a new route registration

Before converting each page, CHECK if the route already exists in the router config. If it does, you're replacing. If it doesn't, you're adding.

---

## CSS STRATEGY

1. First, read the project's global CSS (`client/src/index.css` or equivalent) completely
2. Identify which CSS classes from the HTML files already exist in the global stylesheet
3. For CSS that IS already global: use the existing class names, do not duplicate
4. For CSS that is NOT in the global stylesheet: add it to a single new file called `pages.css` (or append to the existing global stylesheet — follow whatever pattern the project uses)
5. DO NOT create individual CSS files per page
6. DO NOT use CSS-in-JS, styled-components, or CSS modules unless the project already uses them

### Brand Colors (reference only — these should already be in the codebase)
```css
--primary: hsl(217, 95%, 26%)  /* #033280 */
--primary-light: hsl(217, 95%, 36%)
--green: #0cb22c
```

---

## DID YOU KNOW SECTIONS

Every "Did You Know?" section: the "?" character must be colored `#033280` (brand navy blue), NOT black. If the HTML already handles this, preserve it. If it doesn't, wrap the "?" in a `<span style={{color: '#033280'}}>` or equivalent className.

---

## CTA SECTIONS

Transfer the CTA sections EXACTLY as they appear in each HTML file. Some pages use CTA Hybrid 1 (split layout, gray background), some use CTA Hybrid 2 (centered, white background with borders). The HTML files already contain the correct CTA for each page — just convert what's there.

DO NOT swap, replace, or standardize CTAs across pages. Each page's CTA is intentional.

---

## VERIFICATION CHECKLIST — RUN AFTER EVERY BATCH

Before committing each batch, verify:

1. `npm run build` completes with ZERO errors
2. Each new/replaced page component exists and exports correctly
3. Each route is registered and doesn't conflict with existing routes
4. No existing page components were modified (unless they're being replaced by this batch)
5. No changes to Header, Footer, Navbar, App layout, or portal components
6. The `<title>`, meta description, and JSON-LD are set in each new component

---

## REMINDER

You are a translator. The HTML files are the source of truth. Your output should be a 1:1 conversion of the HTML content into valid React TSX, with SEO metadata preserved, routes registered, and nothing else changed. If you find yourself rewriting a heading, rephrasing a description, removing a section, or reorganizing content — STOP. You are going off-script. Go back to the HTML and convert what's there.
