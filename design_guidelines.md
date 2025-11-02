# RV Claims Canada Website Design Guidelines

## Design Approach

**Reference Inspiration**: Drawing from modern corporate B2B sites like Stripe (restraint + clarity) and Intercom (approachable professionalism). Clean, trustworthy aesthetic that communicates expertise without being stuffy.

**Core Principles**:
- Card-based content containers with subtle shadows for depth
- Generous whitespace to convey professionalism and clarity
- Alternating section backgrounds (white/bg-gray-50) for visual rhythm
- No gradients, no divider lines - rely on spacing and backgrounds for separation
- Bilingual content presented equally and accessibly

## Typography

**Font Stack**: 
- Primary: Inter (Google Fonts) - clean, professional, excellent bilingual support
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

**Hierarchy**:
- H1: text-4xl/5xl (56px desktop), font-bold, tracking-tight
- H2: text-3xl/4xl (40px desktop), font-bold
- H3: text-2xl (24px), font-semibold
- H4: text-xl (20px), font-semibold
- Body: text-base (16px), font-normal, leading-relaxed
- Small: text-sm (14px)
- Buttons: text-base, font-medium

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24, 32
- Component internal padding: p-6 to p-8
- Section vertical spacing: py-16 to py-24
- Card spacing: gap-8 on grids
- Container max-width: max-w-7xl

**Responsive Grid**: 
- Mobile: Single column
- Tablet (md:): 2 columns for feature grids
- Desktop (lg:): 3-4 columns for service/feature showcases

## Hero Section

**Layout**: Full-width section with structured two-column layout
- Left column (60%): Headline, subheadline, dual-CTA buttons, trust indicators
- Right column (40%): Large hero image
- Section height: Natural content height (not forced vh)
- Background: white
- Padding: py-20 to py-32

**Hero Image**: 
- Professional RV/vehicle on clean background or Canadian landscape
- Dimensions: 600x800px portrait orientation
- Treatment: Subtle shadow, rounded corners (rounded-lg)
- Position: Anchored right, slight offset upward for dynamism

**Trust Indicators Below CTAs**:
- "Serving Canadian RV owners since [YEAR]" with small shield icon
- "Bilingual service: English | Français" with language toggle indicator
- Industry certifications/accreditations with micro logos

## Component Library

### Navigation Header
- Fixed top, white background with subtle shadow
- Logo left, navigation center, language toggle + CTA button right
- Navigation items: text-sm, font-medium, navy text
- Mobile: Hamburger menu with slide-in drawer
- Height: 80px desktop, sticky behavior

### Cards (Primary Content Container)
- White background on gray sections, very light gray (bg-gray-50) on white sections
- Shadow: shadow-sm, hover:shadow-md transition
- Padding: p-8
- Border radius: rounded-lg
- Never use borders - rely on shadow and background contrast

### Services/Features Grid
- 3-column desktop (lg:grid-cols-3), 2-column tablet, 1-column mobile
- Each card contains: Icon (64px, navy), H3 title, body text, "Learn more" link
- Icons: Heroicons via CDN (outline style)
- Gap between cards: gap-8

### Bilingual Content Sections
- Language toggle pill at section top (EN/FR) when content differs
- Smooth fade transition between languages
- Maintain identical layouts regardless of text length

### Call-to-Action Sections
- Full-width sections with navy background
- White text, centered layout
- Large H2 headline + supporting text + prominent button
- Padding: py-20
- Background pattern: Subtle dot/grid pattern overlay (very low opacity)

### Testimonial Cards
- 2-column grid desktop, stacked mobile
- Profile image (circular, 60px) + name + company
- Quote in slightly larger text (text-lg)
- Star rating component (5 stars, gold)
- Card styling: white background, p-8, shadow-sm

### Footer
- Multi-column layout (4 columns desktop: Services, Company, Resources, Contact)
- Dark navy background, white/gray text
- Newsletter signup form integrated in Contact column
- Social icons (LinkedIn, Facebook) - Heroicons
- Bottom bar: Copyright, Privacy Policy, Terms of Service links
- Full bilingual content duplication

### Page Takeover Modal (Promotional)

**Trigger**: Time-based (5 seconds after page load) or exit-intent detection

**Structure**:
- Overlay: Black at 60% opacity (bg-black/60), backdrop blur effect
- Modal container: max-w-4xl, centered, white background
- Close button: Top right, large X icon (text-2xl), absolute positioned
- Padding: p-0 (content sections handle their own padding)

**Modal Content Layout**:
Two-column split (60/40):
- **Left Column (60%)**: 
  - Padding: p-12
  - Badge: "Limited Time Offer" in navy pill at top
  - H2 headline (text-3xl, font-bold)
  - Bullet points highlighting offer details (text-lg)
  - Prominent CTA button (w-full)
  - Fine print below CTA (text-sm, gray text)
  
- **Right Column (40%)**:
  - Full-height image related to promotion
  - No padding (image bleeds to edges)
  - Subtle overlay gradient (navy 20% opacity) for text contrast if needed

**Modal Animations**:
- Entry: Fade in overlay (200ms) → Scale up modal from 95% to 100% (300ms, ease-out)
- Exit: Reverse animation
- Backdrop click closes modal

**Accessibility**:
- Focus trap within modal
- ESC key closes
- Initial focus on close button
- ARIA labels for screen readers
- Body scroll lock when active

## Images Section

**Hero Image**:
- Description: Professional RV (Class A or Fifth Wheel) in pristine condition, photographed against Canadian backdrop (mountains, forest, or clean studio)
- Placement: Right column of hero section
- Size: 600x800px portrait
- Treatment: rounded-lg, shadow-md

**Service Category Images** (3 total):
- Description: High-quality photos showing (1) RV inspection process, (2) Claims documentation/paperwork, (3) Happy RV owners
- Placement: Alternating sections - image left/content right, then content left/image right
- Size: 800x600px landscape each
- Treatment: rounded-lg

**Modal Promotional Image**:
- Description: Eye-catching image relevant to promotion (e.g., RV with "Spring Ready" overlay, or professional claims adjuster with clipboard)
- Placement: Right 40% of modal, full height
- Size: 480x720px portrait
- Treatment: No rounding (bleeds to modal edge on right)

**Testimonial Profile Images** (6-8 total):
- Description: Professional headshots or candid photos of satisfied clients with RVs
- Placement: Within testimonial cards
- Size: 120x120px square
- Treatment: rounded-full

**Trust/Certification Logos**:
- Description: Industry association badges, certification marks (Better Business Bureau, RV Industry Association, etc.)
- Placement: Below hero CTAs and in footer
- Size: Varied, max height 48px
- Treatment: Grayscale filter, hover to color

All images should convey professionalism, trust, and Canadian identity. Photography style: Clean, bright, authentic - avoid overly staged corporate stock photos.