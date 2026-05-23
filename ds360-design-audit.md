# DS360 Design Audit — Pre-V6 vs V6 Portal

**Generated:** April 26, 2026  
**Purpose:** Side-by-side design system comparison. Extracts the pre-V6 ("old") portal as a replicable design spec.

---

## Source Files

| Layer | Pre-V6 (Old) | V6 (Current) |
|---|---|---|
| Portal shells | `client/src/portals/OperatorPortal.tsx` · `DealerPortal.tsx` · `CustomerPortal.tsx` · `BidderPortal.tsx` | `client/src/pages/OperatorPortalV6.tsx` · `DealerPortalV6.tsx` · `ClientPortalV6.tsx` · `BidderPortalV6.tsx` |
| Styling | `client/src/styles/portal.css` · `portal-mobile.css` · `portal-responsive.css` | Inline React styles · `client/src/components/layout/tokens.ts` |
| Layout wrapper | `.sidebar` + `.main` (CSS classes) | `PortalShell.tsx` + `SectionLayout.tsx` |
| Navigation | `.nav-item` CSS classes | `OperatorMainNav.tsx` · `DealerMainNav.tsx` · `ClientMainNav.tsx` · `BidderMainNav.tsx` (use shared CSS classes) |
| AppBar | `.header` CSS class | `AppBar.tsx` (inline styles) |
| Design tokens | CSS custom properties on `:root` | `LAYOUT` object in `tokens.ts` |

---

## 1. Layout Patterns

### Overall Structure

| Aspect | Pre-V6 | V6 |
|---|---|---|
| Sidebar positioning | `position: fixed; top: 0; left: 0; bottom: 0` | Flexbox sibling (`flex-shrink: 0`) |
| Main content offset | `margin-left: var(--sidebar-w)` | Flex `flex: 1` (no margin) |
| Full-viewport lock | No | `height: 100vh; overflow: hidden` on shell |
| Scroll target | `body` / `.content` scrolls | Inner content div `overflow-y: auto` |
| Header position | `position: sticky; top: 0; z-index: 50` | Flexbox child — always visible |

### Dimensions

| Dimension | Pre-V6 | V6 |
|---|---|---|
| Sidebar width (desktop) | `240px` (`--sidebar-w`) | `240px` (`LAYOUT.mainNavWidth`) |
| Header / AppBar height | `60px` (`--header-h`) | `56px` (`LAYOUT.appBarHeight`) |
| Header padding (horizontal) | `0 32px` | `0 16px` |
| Contextual sidebar width | — (not present) | `260px` (`LAYOUT.contextualSidebarWidth`) |
| Content area padding | `28px 32px` | `24px` |
| Tablet sidebar width | `200px` (portal-responsive) or `64px` (portal-mobile) | No responsive adjustment in V6 yet |
| Mobile sidebar | `display: none` (bottom nav takes over) | Not yet implemented in V6 |

### Grid Systems

| Grid | Pre-V6 | V6 |
|---|---|---|
| Stat cards | `repeat(5, 1fr); gap: 16px` | `repeat(auto-fit, minmax(160px, 1fr)); gap: 12px` |
| Dashboard panels | `2fr 1fr` | Not standardized — per-page |
| Alert cards | `repeat(3, 1fr); gap: 16px` | Per-page |
| Quick action buttons | `repeat(4, 1fr); gap: 12px` | Per-page |
| Form grids | `1fr 1fr; gap: 16px; padding: 20px` | Per-page inline |
| Claim detail grid | `2fr 1fr; gap: 20px` | Kanban columns (new) |

---

## 2. Card / Container Styles

### Standard Panel / Card

| Property | Pre-V6 | V6 |
|---|---|---|
| Background | `var(--bg-card, #fff)` | `white` |
| Border | `1px solid var(--border, #e5e7eb)` | `1px solid #e5eaf2` |
| Border-radius | `8px` | `8px` |
| Box-shadow | **None** | **None** (standard cards) |
| Padding (stat card) | `20px` | `16px` |
| Padding (panel header) | `16px 20px` | varies per component |
| Panel header border-bottom | `1px solid #f0f0f0` | `1px solid #f0f2f5` |

### Special Containers

| Container | Pre-V6 | V6 |
|---|---|---|
| Detail section (`.cd-section`) | `background: #fff; border: 1px solid #e5e7eb; border-radius: 8px` | No direct equivalent yet |
| FI / gradient card (`.fi-card`) | `background: linear-gradient(135deg, #033280 0%, #0c2f75 100%); border-radius: 12px; padding: 24px` | Not present |
| Dropdown / popover | Border only, no shadow | `border: 1px solid #e5eaf2; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.10)` |
| Empty state | Not standardized | `padding: 60px; background: #fafbfd; border-radius: 8px; color: #888; text-align: center` |
| Kanban column | — | Not extracted yet (see `ClaimQueuePage.tsx`) |

**Key difference:** V6 AppBar dropdowns (notifications, user menu) gain `box-shadow: 0 8px 24px rgba(0,0,0,0.10)` and `border-radius: 10px` — the old portal has no elevation shadows anywhere.

---

## 3. Typography

### Scale

| Element | Pre-V6 | V6 |
|---|---|---|
| Page h1 / detail title | `font-size: 20px; font-weight: 700` (`.detail-title`) | `font-size: 22px; font-weight: 600` |
| Header / AppBar title | `font-size: 18px; font-weight: 600` (`.header-title`) | `font-size: 13px; font-weight: 600; color: #033280` (portal label) |
| Panel / section title | `font-size: 14px; font-weight: 600` (`.pn-t`) | Not standardized |
| Body text (table td) | `font-size: 13px; color: #333` | Consistent `13px` |
| Label (form, detail) | `font-size: 12px; font-weight: 500; color: #555` | `font-size: 11px; color: #888` (less prominent) |
| Value (detail row) | `font-size: 13px; color: #111; font-weight: 500` | `font-size: 13px` |
| Stat value | `font-size: 28px; font-weight: 700; color: #111` | `font-size: 24px; font-weight: 700` |
| Stat label | `font-size: 12px; color: #888; font-weight: 500` | `font-size: 11px; color: #888` |
| Breadcrumb / section label | Not present | `font-size: 11px; color: #888; text-transform: uppercase; font-weight: 600` |
| Timestamp / hint text | `font-size: 11px; color: #aaa` | `font-size: 10px; color: #aaa` |

### Sidebar Typography

| Element | Pre-V6 | V6 |
|---|---|---|
| Logo name | `font-size: 14px; font-weight: 700; color: #033280` | Not visible (sub-text only) |
| Logo sub | `font-size: 10px; color: #888` | `font-size: 12px; font-weight: 600` (inline override) |
| Nav section label | `font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; color: #bbb; font-weight: 600` | `font-size: 11px; color: #888; text-transform: uppercase; font-weight: 600` (from reference) |
| Nav item | `font-size: 13px; font-weight: 500` | `font-size: 13px; font-weight: 600` (from reference) |
| Nav item muted | — | `font-size: 10px; color: #888` |
| User name | `font-size: 13px; color: #111; font-weight: 500` | Same class (shared) |
| User role | `font-size: 11px; color: #888` | Same class (shared) |

### Font Family

Both systems: `Inter, -apple-system, sans-serif`  
Monospace (VINs, codes): Pre-V6 uses `'SF Mono', 'Fira Code', monospace; font-size: 12px` — V6 inherits same class `.vin`

---

## 4. Color Usage

### Page / Background Colors

| Token | Pre-V6 value | V6 value | Delta |
|---|---|---|---|
| Page background | `#f5f6f8` (`--bg-page`) | `#f7f9fc` (`LAYOUT.bgPage`) | Slightly cooler/bluer |
| Card / sidebar bg | `#fff` (`--bg-card`) | `white` (`LAYOUT.bgWhite`) | Same |
| Secondary bg | `#fafafa` (`--bg-secondary`) | `#fafbfd` (inline, empty state) | Slightly cooler |
| Table header bg | `#fafafa` | Not specified (inherits white) | Old has tinted header |
| Hover row bg | `#fafbfc` | Not yet standardized | |

### Border Colors

| Token | Pre-V6 | V6 |
|---|---|---|
| Primary border | `#e5e7eb` (`--border`) | `#e5eaf2` (`LAYOUT.borderLight`) | V6 is cooler/bluer |
| Light border | `#f0f0f0` (`--border-light`) | `#f0f2f5` (`LAYOUT.borderLighter`) | V6 cooler |
| Lighter border | `#f5f5f5` (`--border-lighter`) | Not named in tokens | |
| V6 filter input border | — | `#d5dbe5` | Slightly darker than card borders |

### Text Colors

| Role | Pre-V6 | V6 |
|---|---|---|
| Primary text | `#111` | `#222` (`LAYOUT.textPrimary`) |
| Secondary text | `#555` | `#666` (`LAYOUT.textSecondary`) |
| Muted text | `#888` | `#888` (`LAYOUT.textMuted`) |
| Hint / timestamp | `#aaa` | `#aaa` |
| Table td | `#333` | `#333` (consistent) |

**Notable:** V6 primary text is `#222` (softer) vs old `#111` (near-black). Old secondary `#555` vs V6 `#666` — V6 is consistently lower-contrast.

### Brand / Interactive Colors

| Use | Pre-V6 | V6 |
|---|---|---|
| Primary brand | `#033280` (`--brand`) | `#033280` (`LAYOUT.navy`) |
| Brand hover | `#022260` (`--brand-dark`) | `#022260` (implicit) |
| Brand light variant | `#044aa0` (`--brand-light`) | Not in tokens |
| Active item bg | `#eff6ff` | `#eaf1fb` (`LAYOUT.navyLight`) |
| Active item text | `#033280` | `#033280` |
| Active item left border | **None** | `3px solid #033280` **← new** |
| NavBg (hover area) | `#f5f6f8` | `#f0f5ff` (`LAYOUT.navyBg`) |
| Green (CTA / success) | `#22c55e` | `#0cb22c` (`LAYOUT.green`) |

### Status Badge Colors

| Status | Pre-V6 bg / text | V6 bg / text |
|---|---|---|
| Draft | `#f3f4f6` / `#6b7280` | `#f0f2f5` / `#666` |
| Submitted / Active | `#dbeafe` / `#2563eb` | `#dcfce7` / `#166534` (re-mapped to green) |
| Authorized / Approved | `#dcfce7` / `#16a34a` | `#dcfce7` / `#166534` |
| Denied / Expired | `#fee2e2` / `#dc2626` | `#fee2e2` / `#991b1b` |
| Parts ordered | `#e0e7ff` / `#4f46e5` | — |
| Completed | `#d1fae5` / `#059669` | — |
| Payment req'd | `#f5f3ff` / `#7c3aed` | — |
| Pending | `#fef3c7` / `#d97706` | `#fef3c7` / `#92400e` (`LAYOUT.statusPendingText`) |

### Sidebar Notification Badges

| Type | Pre-V6 | V6 |
|---|---|---|
| Red (urgent) | `background: #fef2f2; color: #ef4444` | Same via shared class |
| Amber (warn) | `background: #fffbeb; color: #d97706` | Same |
| Blue (info) | `background: #eff6ff; color: #033280` | Same |
| Green | `background: #f0fdf4; color: #0eb32c` | Same |

### Dark Mode (Pre-V6 only — V6 has no dark mode yet)

| Token | Dark value |
|---|---|
| `--bg-page` | `#0f1117` |
| `--bg-card` | `#1a1c25` |
| `--bg-secondary` | `#22252e` |
| `--bg-sidebar` | `#14161e` |
| `--border` | `#2a2d38` |
| `--brand` (dark mode) | `#4a7cff` (lighter blue) |
| `--text-primary` | `#e4e4e7` |
| `--text-secondary` | `#a1a1aa` |
| `--text-muted` | `#71717a` |
| `--text-hint` | `#52525b` |

---

## 5. Button Styles

### Button Variants

| Variant | Pre-V6 | V6 equivalent |
|---|---|---|
| **Primary** | `background: #033280; color: #fff; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; border: none; transition: all 0.15s` | `background: #033280; color: white; border: 0; border-radius: 6px; padding: 8px 16px; font-size: 13px; font-weight: 600` |
| Primary hover | `background: #022260` | Not defined (inline, no hover state) |
| **Outline** | `background: #fff; color: #333; border: 1px solid #e0e0e0; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; transition: all 0.15s` | `border: 1px solid #d5dbe5; border-radius: 6px; background: white; font-size: 12px; padding: 6px 14px` |
| Outline hover | `background: #f5f5f5` | Not defined |
| **Danger** | `background: #ef4444; color: #fff; border-radius: 8px; padding: 10px 20px` | Not yet present |
| Danger hover | `background: #dc2626` | — |
| **Success** | `background: #22c55e; color: #fff` | — |
| Success hover | `background: #16a34a` | — |
| **Small** | `padding: 6px 14px; font-size: 12px` | `padding: 6px 14px; font-size: 12px` (same) |
| **Icon button (header)** | `width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff` | `width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e5eaf2; background: white` |
| **Sign-out (nav footer)** | Standard `.btn-o` or link style | `padding: 7px 12px; background: none; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 12px; color: #888; width: 100%` |

### Key Differences

| Property | Pre-V6 | V6 |
|---|---|---|
| Border-radius (primary) | `8px` | `6px` — slightly tighter |
| Padding (primary) | `10px 20px` | `8px 16px` — more compact |
| Transition | `all 0.15s` on all `.btn` | No transition on inline buttons |
| Font-size (outline small) | `13px` | `12px` |
| Hover states | Defined via CSS | Not defined in inline styles |
| Button row container | `.btn-bar: padding: 16px 20px; border-top: 1px solid #f0f0f0; display: flex; gap: 10px` | Per-component |

---

## 6. Table / List Presentation

### Table Structure

| Property | Pre-V6 | V6 |
|---|---|---|
| Container | `.tw { overflow-x: auto }` | `overflow: hidden` on table wrapper |
| Table layout | `width: 100%; border-collapse: collapse` | `width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden` |
| **`<th>` padding** | `10px 16px` | `12px` (no horizontal specified — likely same on both sides) |
| `<th>` font-size | `11px` | `11px` |
| `<th>` font-weight | `600` | — (inherits) |
| `<th>` color | `#888` | `#888` |
| `<th>` transform | `uppercase; letter-spacing: 0.5px` | `uppercase` (no letter-spacing) |
| `<th>` border-bottom | `1px solid #f0f0f0` | `2px solid #eee` (heavier) |
| `<th>` background | `#fafafa` | Not set (white via table) |
| **`<td>` padding** | `12px 16px` | Not extracted (est. `12px`) |
| `<td>` font-size | `13px` | `13px` |
| `<td>` color | `#333` | `#333` |
| `<td>` border-bottom | `1px solid #f5f5f5` | — |
| Row hover | `background: #fafbfc` | Not defined |
| Clickable ID (`.cid`) | `color: #033280; font-weight: 500; cursor: pointer` | Inline link style |
| VIN text | `font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #666` | `.vin` class (shared) |

### List / Feed Items

| Pattern | Pre-V6 | V6 |
|---|---|---|
| Activity item padding | `14px 20px` | — |
| Activity item border | `1px solid #f5f5f5` | — |
| Activity dot size | `width: 8px; height: 8px; border-radius: 50%` | — |
| Communication msg padding | `12px 16px` | — |
| Comm avatar size | `28px × 28px` | — |
| FRC line padding | `16px 20px` | — |
| FRC number badge | `width: 28px; height: 28px; border-radius: 50%; background: #eff6ff; color: #033280; font-size: 12px; font-weight: 600` | — |

### Alert / Highlight Cards

| Element | Pre-V6 | V6 |
|---|---|---|
| Alert grid item | `background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px 20px; display: flex; gap: 14px` | — |
| Alert icon | `width: 40px; height: 40px; border-radius: 8px` | — |
| Alert title | `font-size: 13px; font-weight: 600; color: #111` | — |
| Alert desc | `font-size: 12px; color: #888` | — |
| Alert action | `font-size: 12px; color: #033280; font-weight: 500` | — |

---

## 7. Form Inputs and Interactive Elements

### Input Fields

| Property | Pre-V6 | V6 |
|---|---|---|
| Padding | `10px 12px` | `6px 10px` (filter inputs) / `8px 12px` (form fields) |
| Border | `1px solid #e0e0e0` | `1px solid #d5dbe5` |
| Border-radius | `8px` | `6px` |
| Font-size | `13px` | `12px` |
| Background | `#fafafa` | `white` (unspecified, defaults) |
| Focus border | `#033280` | Not defined (inline inputs lack `:focus` state) |
| Focus background | `#fff` | — |
| Min-height (textarea) | `80px; resize: vertical` | — |

### Form Layout

| Property | Pre-V6 | V6 |
|---|---|---|
| Form grid | `grid-template-columns: 1fr 1fr; gap: 16px; padding: 20px` | Inline per-component |
| 3-column grid | `1fr 1fr 1fr` | `repeat(auto-fit, minmax(160px, 1fr))` for KPIs |
| Full-width field | `.form-group.full { grid-column: 1 / -1 }` | — |
| Label style | `font-size: 12px; font-weight: 500; color: #555` | `font-size: 11px; color: #888` |
| Group gap | `6px` | — |

### Filter Bar

| Property | Pre-V6 | V6 |
|---|---|---|
| Container | `display: flex; gap: 12px; padding: 16px 20px; border-bottom: 1px solid #f0f0f0; align-items: center; flex-wrap: wrap` | `display: flex; gap: 8px; flex-wrap: wrap` (inside content padding) |
| Input width | `200px` | `minWidth: 200px` (flex) |
| Input padding | `8px 12px` | `6px 10px` |
| Border | `1px solid #e0e0e0` | `1px solid #d5dbe5` |
| Border-radius | `8px` | `6px` |
| Font-size | `12px` | `12px` |

### Toggle (Theme Switch)

Pre-V6 has a styled pill toggle:
```css
.toggle { width: 40px; height: 22px; background: #ddd; border-radius: 11px }
.toggle.on { background: #22c55e }
.toggle::after { width: 18px; height: 18px; border-radius: 50%; top: 2px; left: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.15) }
.toggle.on::after { left: 20px }
```

V6 has no custom theme toggle yet.

### Language Toggle

Pre-V6:
```css
.lang-toggle { height: 36px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; display: flex; overflow: hidden }
.lang-btn-opt { padding: 0 10px; height: 100%; font-size: 11px; font-weight: 500 }
.lang-btn-opt.active { background: #033280; color: #fff; font-weight: 600 }
.lang-btn-opt:hover:not(.active) { background: #f0f0f0 }
```

V6: Not implemented.

### Tabs

| Property | Pre-V6 | V6 |
|---|---|---|
| Container | `display: flex; gap: 4px; padding: 0 20px; border-bottom: 1px solid #f0f0f0; background: #fafafa` | — |
| Tab padding | `12px 16px` | — |
| Tab font | `font-size: 13px; font-weight: 500; color: #888` | — |
| Tab hover | `color: #333` | — |
| Active tab | `color: #033280; border-bottom: 2px solid #033280` | — |
| Tab transition | `all 0.15s` | — |

---

## 8. Navigation and Sidebar Treatment

### Sidebar Shell

| Property | Pre-V6 | V6 |
|---|---|---|
| Width | `240px` | `240px` |
| Background | `var(--bg-sidebar, #fff)` | `white` |
| Right border | `1px solid var(--border, #e5e7eb)` | `1px solid #e5eaf2` |
| Position | `position: fixed` | `flexShrink: 0` (flexbox) |
| Z-index | `100` | Auto (no z-index) |
| Overflow | Scrollable nav | `overflow: hidden` (flex column) |
| Collapse | To `64px` with icon-only via `.sidebar.collapsed` | Not implemented in V6 |

### Logo / Header Area

| Property | Pre-V6 | V6 |
|---|---|---|
| Padding | `16px 20px` | Same (via shared `.sidebar-logo` class) |
| Border-bottom | `1px solid var(--border-light, #f0f0f0)` | Same (shared class) |
| Min-height | `64px` | Not set |
| Logo size | `36px × 36px; border-radius: 8px` | `36px × 36px; border-radius: 8px` (same) |
| Logo bg | `background: #f5f6f8; padding: 2px` | Not specified |
| Name font | `14px; weight 700; color: #033280` | Hidden (sub-text replaces it) |
| Sub font | `10px; color: #888` | `12px; weight 600` (inline override) |
| Badge style | `padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #033280; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px` | Same (shared `.sidebar-badge` class) |

### Nav Section Label

| Property | Pre-V6 | V6 (from reference) |
|---|---|---|
| Font-size | `10px` | `11px` |
| Color | `#bbb` | `#888` (more visible) |
| Transform | `uppercase; letter-spacing: 1.2px` | `uppercase` |
| Font-weight | `600` | `600` |
| Padding | `8px 8px 6px` | Not specified in reference |
| Section padding | `0 16px; margin-bottom: 8px` | `0 16px` |

### Nav Item (MOST IMPORTANT DIFFERENCE)

| Property | Pre-V6 | V6 |
|---|---|---|
| Padding | `9px 12px` | `10px 16px` (from reference / tokens) |
| Border-radius | `8px` | Not set (left border replaces) |
| Font-size | `13px` | `13px` |
| Font-weight | `500` | `600` (bolder) |
| Icon size | `18px × 18px; opacity: 0.6` | `18px` (no opacity) |
| Hover bg | `#f5f6f8` | `transparent` (no bg hover) |
| Hover color | `#333` | — |
| **Active bg** | `#eff6ff` | `#eaf1fb` |
| **Active text** | `#033280` | `#033280` |
| **Active left border** | **None** | **`3px solid #033280`** ← signature difference |
| **Inactive left border** | None | `3px solid transparent` |
| Active icon opacity | `1` | Full (no opacity) |
| Margin-bottom | `2px` | Not set |
| Transition | `all 0.15s` | Not set (inline) |
| Spacer between items | `margin-bottom: 2px` | None |

### User Footer

| Property | Pre-V6 | V6 (shared classes + inline) |
|---|---|---|
| Container padding | `16px` | Same (`.sidebar-footer`) |
| Top border | `1px solid var(--border-light, #f0f0f0)` | Same (shared class) |
| Avatar size | `32px × 32px` | `32px × 32px` |
| Avatar bg | `#033280` | `#033280` |
| Avatar font | `12px; weight 600; color: #fff` | Same |
| User name | `13px; color: #111; weight 500` | Same (shared) |
| User role | `11px; color: #888` | Same (shared) |
| Sign-out button | None in old portal (signout was in header) | `width: 100%; margin-top: 8px; padding: 7px 12px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 12px; color: #888` |

### AppBar / Header

| Property | Pre-V6 | V6 |
|---|---|---|
| Height | `60px` | `56px` |
| Background | `var(--bg-card, #fff)` | `white` |
| Border-bottom | `1px solid var(--border, #e5e7eb)` | `1px solid #e5eaf2` |
| Left padding | `32px` | `16px` |
| Right padding | `32px` | `16px` |
| Left content | Title `18px/600` + sub `12px/#999` | Portal label `13px/600/navy` |
| Right content | Icon buttons (36×36) + lang + theme toggles | Bell (36×36) + avatar circle |
| Sticky | Yes (`position: sticky; z-index: 50`) | Implicit (flexbox) |

---

## 9. Modal / Dialog Styling

The pre-V6 portal has no modals — all navigation is state-based page switching. V6 introduces dropdown overlays.

### V6 Dropdown / Flyout (AppBar)

```
Notification panel:
  position: absolute; right: 0; top: 44px
  width: 320px
  background: white
  border: 1px solid #e5eaf2
  border-radius: 10px
  box-shadow: 0 8px 24px rgba(0,0,0,0.10)
  z-index: 300
  max-height: 70vh; overflow: hidden

  Header: padding: 12px 16px; border-bottom: 1px solid #f0f2f5
    Title: font-size: 13px; font-weight: 600
    Action: font-size: 11px; color: #033280; font-weight: 500

  Notification row:
    padding: 12px 16px; border-bottom: 1px solid #f7f7f7
    Unread bg: #f5f8ff
    Read bg: white
    Title: font-size: 12px; font-weight: 600 (unread) or 400 (read); color: #222
    Body: font-size: 11px; color: #666; margin-top: 3px
    Time: font-size: 10px; color: #aaa; margin-top: 4px

User menu:
  width: 220px; border-radius: 10px; box-shadow: same
  Header: padding: 14px 16px; border-bottom: 1px solid #f0f2f5
    Name: font-size: 13px; font-weight: 600; color: #222
    Role: font-size: 11px; color: #888
  Menu item: padding: 10px 16px; font-size: 12px; color: #222
  Danger item: color: #dc2626; border-top: 1px solid #f0f2f5
```

Pre-V6 equivalent: `.hbtn` notification dot only — no dropdown panel. Theme/lang toggles inline in header. No user dropdown.

---

## 10. Visual Density Comparison

### Compact vs Spacious

| Element | Pre-V6 | V6 | Direction |
|---|---|---|---|
| Content padding | `28px 32px` | `24px` | V6 more compact |
| AppBar height | `60px` | `56px` | V6 more compact |
| AppBar horizontal padding | `32px` | `16px` | V6 much tighter |
| Stat card padding | `20px` | `16px` | V6 more compact |
| Nav item padding | `9px 12px` | `10px 16px` | V6 taller but wider |
| Filter input padding | `8px 12px` | `6px 10px` | V6 more compact |
| Table th padding | `10px 16px` | `12px` | Similar |
| Table td padding | `12px 16px` | ~`12px` | Similar |
| Panel header padding | `16px 20px` | Per-component | Old more consistent |
| Activity item padding | `14px 20px` | — | |
| Form group gap | `6px` | — | |
| Section margin-bottom | `28px` (stats) | `20px` (stats) | V6 tighter |
| Gap between stat cards | `16px` | `12px` | V6 tighter |
| Gap between alert cards | `16px` | — | |
| Quick button gap | `12px` | — | |

**Overall density:** V6 is 10–20% more compact than the pre-V6 portal across most spacing. The pre-V6 portal was designed with a "spacious SaaS" aesthetic (`28px/32px` content padding). V6 targets a denser dashboard feel.

---

## Design System Specification Summary — Pre-V6

Use this spec to replicate the old design in any new component.

### Layout
```
sidebar: fixed, 240px, z-index 100
header: sticky, 60px, padding 0 32px
content: padding 28px 32px
```

### Colors
```
--brand:          #033280
--brand-dark:     #022260
--brand-light:    #044aa0
--bg-page:        #f5f6f8
--bg-card:        #ffffff
--bg-secondary:   #fafafa
--border:         #e5e7eb
--border-light:   #f0f0f0
--border-lighter: #f5f5f5
--text-primary:   #111111
--text-secondary: #555555
--text-muted:     #888888
--text-hint:      #aaaaaa
active-item-bg:   #eff6ff
active-item-text: #033280
green-success:    #22c55e
```

### Typography
```
Body:           13px / 500 / #333
Label:          12px / 500 / #555
Muted:          12px / 400 / #888
Hint:           11px / 400 / #aaa
Nav item:       13px / 500 / #666
Nav label:      10px / 600 / uppercase / letter-spacing 1.2px / #bbb
Panel title:    14px / 600 / #111
Header title:   18px / 600 / #111
Detail title:   20px / 700 / #111
Stat value:     28px / 700 / #111
Stat label:     12px / 500 / #888
Table th:       11px / 600 / uppercase / letter-spacing 0.5px / #888
Table td:       13px / 400 / #333
VIN:            12px / monospace / #666
```

### Cards / Panels
```
background:     #fff
border:         1px solid #e5e7eb
border-radius:  8px
box-shadow:     none
panel-hdr-pad:  16px 20px
panel-hdr-bdr:  1px solid #f0f0f0
stat-pad:       20px
```

### Buttons
```
primary:   bg #033280 / text #fff / pad 10px 20px / radius 8px / size 13px / weight 600
           hover: bg #022260
outline:   bg #fff / text #333 / border 1px #e0e0e0 / pad 10px 20px / radius 8px / size 13px
           hover: bg #f5f5f5
danger:    bg #ef4444 / text #fff  →  hover #dc2626
success:   bg #22c55e / text #fff  →  hover #16a34a
small:     pad 6px 14px / size 12px
icon-btn:  36×36 / radius 8px / border 1px #e5e7eb / bg #fff
all buttons: transition: all 0.15s
```

### Inputs
```
padding:       10px 12px
border:        1px solid #e0e0e0
border-radius: 8px
font-size:     13px
background:    #fafafa
focus-border:  #033280
focus-bg:      #fff
label:         12px / 500 / #555
gap above:     6px
```

### Filter Bar
```
padding:       16px 20px
border-bottom: 1px solid #f0f0f0
gap:           12px
input-pad:     8px 12px
input-radius:  8px
input-width:   200px
```

### Tables
```
th-pad:        10px 16px
th-size:       11px / 600 / uppercase / ls 0.5px / #888
th-bg:         #fafafa
th-border:     1px solid #f0f0f0
td-pad:        12px 16px
td-size:       13px / #333
td-border:     1px solid #f5f5f5
row-hover:     background #fafbfc
clickable-id:  color #033280 / weight 500
```

### Tabs
```
container:     display flex / padding 0 20px / border-bottom 1px #f0f0f0 / bg #fafafa
tab:           pad 12px 16px / size 13px / weight 500 / color #888
tab-hover:     color #333
tab-active:    color #033280 / border-bottom 2px #033280
transition:    all 0.15s
```

### Sidebar Nav Item
```
padding:       9px 12px
border-radius: 8px
font-size:     13px
font-weight:   500
margin-bottom: 2px
icon-size:     18×18 / opacity 0.6 (inactive) / 1.0 (active)
hover:         bg #f5f6f8 / color #333
active:        bg #eff6ff / color #033280  (NO left border)
transition:    all 0.15s
```

### Nav Section Label
```
font-size:       10px
text-transform:  uppercase
letter-spacing:  1.2px
color:           #bbb
font-weight:     600
padding:         8px 8px 6px
section-pad:     0 16px / margin-bottom 8px
```

### Status Badges
```
padding:         3px 10px
border-radius:   9999px
font-size:       11px
font-weight:     500

draft:           bg #f3f4f6  / text #6b7280
submitted:       bg #dbeafe  / text #2563eb
authorized:      bg #dcfce7  / text #16a34a
denied:          bg #fee2e2  / text #dc2626
parts-ordered:   bg #e0e7ff  / text #4f46e5
completed:       bg #d1fae5  / text #059669
payment-req:     bg #f5f3ff  / text #7c3aed
active:          bg #dcfce7  / text #16a34a
pending:         bg #fef3c7  / text #d97706
suspended:       bg #fee2e2  / text #dc2626
```

### Grids (Desktop)
```
stat-cards:      repeat(5, 1fr) / gap 16px / mb 28px
alert-cards:     repeat(3, 1fr) / gap 16px / mb 28px
quick-actions:   repeat(4, 1fr) / gap 12px / mb 28px
form-2col:       1fr 1fr / gap 16px / pad 20px
form-3col:       1fr 1fr 1fr
detail-layout:   2fr 1fr / gap 20px
dashboard-panel: 2fr 1fr / gap 20px
```

### Responsive Breakpoints
```
Desktop  ≥1025px:  full layout (above)
Tablet   769–1024: sidebar 64px (icon only), content pad 20px
Mobile   ≤768px:   sidebar hidden, bottom nav, content pad 16px, stats 2-col
Small    ≤480px:   stats 1-col, content pad 12px
```

---

## V6 Delta — What Changed

| Category | Key Change |
|---|---|
| Page background | `#f5f6f8` → `#f7f9fc` (cooler blue tint) |
| Border color | `#e5e7eb` → `#e5eaf2` (cooler, bluer) |
| Text primary | `#111` → `#222` (softer) |
| Active nav bg | `#eff6ff` → `#eaf1fb` |
| **Active nav** | No left border → `3px solid #033280` left border (signature change) |
| Nav item weight | `500` → `600` (bolder) |
| Nav label color | `#bbb` → `#888` (more visible) |
| AppBar height | `60px` → `56px` |
| AppBar padding | `0 32px` → `0 16px` |
| Content padding | `28px 32px` → `24px` |
| Stat card padding | `20px` → `16px` |
| Input border | `#e0e0e0` → `#d5dbe5` (slightly darker, bluer) |
| Input padding | `10px 12px` → `6px 10px` (compact) |
| Input radius | `8px` → `6px` |
| Button radius | `8px` → `6px` |
| Button padding | `10px 20px` → `8px 16px` |
| Dropdown shadow | None → `0 8px 24px rgba(0,0,0,0.10)` |
| Dropdown radius | — → `10px` |
| Header content | Title + subtitle + multiple controls → Portal label + bell + avatar |
| Table th border | `1px solid #f0f0f0` → `2px solid #eee` |
| Green brand | `#22c55e` → `#0cb22c` (slightly richer) |
| Page h1 | `20px/700` → `22px/600` (bigger but lighter weight) |
| Dark mode | Full CSS variable system | Not implemented |
| Sidebar collapse | Implemented (64px icon mode) | Not implemented |
| Mobile layout | Full responsive system | Not implemented |
