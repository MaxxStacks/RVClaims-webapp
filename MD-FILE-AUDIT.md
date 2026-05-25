# MD File Audit — DealerSuite360
Generated: 2026-05-24
Total .md files found: 37 (excluding node_modules)
Total size: 1,139.3 KB

---

## SAFE TO DELETE (8 files, ~195 KB freed)

| # | File Path | Lines | KB | Category | First Line | Reason |
|---|-----------|-------|-----|----------|------------|--------|
| 1 | `AUTONOMOUS.md` | 260 | 16.6 | PROMPT | `# AUTONOMOUS.md — Remote Support Enhancements` | Contains explicit autonomous execution trigger. COMPLETED.md confirms all work was executed successfully on 2026-05-24. No longer needed. |
| 2 | `COMPLETED.md` | 79 | 5.3 | REPORT | `# DS360 Assist — Enhancements 1, 2 & 3 — COMPLETED` | Execution completion log for AUTONOMOUS.md. The actual code changes are in the codebase. This is a disposable session receipt. |
| 3 | `SESSION2-AUTONOMOUS.md` | 339 | 15.2 | PROMPT | `## TASK: Build 13 portal layouts and populate all page components` | Autonomous build prompt for Session 2 of 4 (13-portal layout build). The layouts it describes are built. No longer needed operationally. |
| 4 | `SESSION2-AUTONOMOUS - Copy.md` | 339 | 15.2 | PROMPT | `## TASK: Build 13 portal layouts and populate all page components` | Exact duplicate of SESSION2-AUTONOMOUS.md. Zero value — delete first. |
| 5 | `SESSION3-AUTONOMOUS.md` | 332 | 25.4 | PROMPT | `## TASK: Register all routes and wire URLs — Session 3 of 4` | Autonomous prompt for Session 3 (route wiring). Work is done. V7-AUDIT-REPORT.md confirms routes are registered. No longer needed. |
| 6 | `DS360-V7-FULL-AUDIT.md` | 588 | 39.6 | PROMPT | `# DS360 V7 — FULL A-Z PLATFORM AUDIT (V6 BASELINE COMPARISON)` | Contains `## AUTONOMOUS EXECUTION` section — this was the audit prompt that produced `V7-AUDIT-REPORT.md`. The output (V7-AUDIT-REPORT.md) is the keeper; this prompt is spent. |
| 7 | `ds360-design-audit.md` | 599 | 28.5 | REPORT | `# DS360 Design Audit — Pre-V6 vs V6 Portal` | Pre-V6 vs V6 design comparison generated April 26, 2026. The codebase is now on V7. This is a historical snapshot of a superseded architecture — all pre-V6 portal files it references are gone or replaced. |
| 8 | `PROJECT-OVERVIEW.md` | 140 | 9.4 | REPORT | `# Portal Assessment: Dealer Suite 360` | April 26, 2026 snapshot assessment of the portal state at that time. Superseded by V7-AUDIT-REPORT.md which is more current and comprehensive. Content is stale — references Phase 2E/2F architecture that has since evolved. |

**Total safe to delete: 8 files, ~194.7 KB**

---

## REVIEW FIRST (8 files, ~647 KB)

| # | File Path | Lines | KB | Category | First Line | Reason |
|---|-----------|-------|-----|----------|------------|--------|
| 1 | `DATA-ROUTING-SPEC.md` | 5,070 | 265.5 | SPEC | `# DATA ROUTING SPEC — DealerSuite360` | 277 actions across 84 pages — the most comprehensive behavioral spec in the project. Generated 2026-03-23. Covers all 4 portals. Review whether V7 architecture changes have made its route/action definitions stale before deleting. If V7 API wiring is complete, this is superseded. If still ~40% of pages are stubs (per V7 audit), this remains the ground truth for what those stubs should do. **Likely KEEP until V7 API wiring is complete.** |
| 2 | `DS360-CC-REFERENCE.md` | 2,287 | 147.6 | CONFIG | `# DS360 CC REFERENCE — Project Bible` | Described as "drop this in project root before every CC session." Last updated April 26, 2026 — references "V6 portal code" and a 3-layer layout that may now be superseded by V7. Partially overlaps with CLAUDE.md (project bible role). Review for stale V6-specific references before deciding whether to retire or merge into CLAUDE.md. |
| 3 | `DATA-ROUTING-DEALER.md` | 1,640 | 88.9 | SPEC | `# DATA ROUTING SPEC — DEALER PORTAL` | Per-portal extraction from DATA-ROUTING-SPEC.md. Covers all dealer portal actions. Review whether V7 dealer portal routing matches these specs — if so, safe to delete as duplicate of the master spec. |
| 4 | `DATA-ROUTING-CLIENT-BIDDER.md` | 1,602 | 87.4 | SPEC | `# DATA ROUTING SPEC — CUSTOMER PORTAL` | Per-portal extraction from DATA-ROUTING-SPEC.md covering customer and bidder portals. Same review question as DATA-ROUTING-DEALER.md. |
| 5 | `DATA-ROUTING-OPERATOR.md` | 1,711 | 81.7 | SPEC | `# DATA ROUTING SPEC — OPERATOR PORTAL` | Per-portal extraction from DATA-ROUTING-SPEC.md covering the operator portal. Same review question. |
| 6 | `DATA-ACCESS-AUDIT-REPORT.md` | 414 | 38.7 | REPORT | `# DATA ACCESS AUDIT REPORT — DealerSuite360` | Security/RBAC audit from 2026-03-23. Identifies specific MEDIUM/HIGH risk flags in auth routes, middleware, and cross-portal data flow. Review whether these findings have been addressed in V7. If remediation is complete, this can be deleted. If any flagged issues remain open, this is a live security checklist — KEEP. |
| 7 | `Official HTML Pages/CC-CONVERSION-SPEC.md` | 326 | 15.6 | PROMPT | `# CC-CONVERSION-SPEC.md — HTML → TSX Mechanical Conversion` | Prompt spec for converting 53 HTML templates to TSX. Review whether all 53 conversions are complete. If complete, this prompt is spent and can be deleted. If conversions are in progress, this is still operationally needed. Lives inside `Official HTML Pages/` folder — check that folder's contents. |
| 8 | `shared/CLAUDE.md` | 259 | 19.7 | CONFIG | `# Dealer Suite 360 — The Dealership Operating System` | An older version of CLAUDE.md with 4 rules instead of the current 5. Still lives in `shared/` directory — check whether anything imports or reads it. If only the root CLAUDE.md is used by CC, this is a stale duplicate and can be deleted. |

**Total in review: 8 files, ~645.3 KB**

---

## KEEP (21 files, ~299 KB)

| # | File Path | Lines | KB | Category | First Line | Reason |
|---|-----------|-------|-----|----------|------------|--------|
| 1 | `CLAUDE.md` | 331 | 21.5 | CONFIG | `# Dealer Suite 360 — The Dealership Operating System` | Active project bible. CC reads this at every session start. Per audit rules: always KEEP. |
| 2 | `V7-AUDIT-REPORT.md` | 1,408 | 78.9 | REPORT | `# DS360 V7 AUDIT REPORT` | Comprehensive current-state audit generated 2026-05-24. Per audit rules: always KEEP. Primary reference for what's built vs what remains. |
| 3 | `DS360-ROADMAP.md` | 246 | 12.7 | SPEC | `# DS360-ROADMAP.md — Master Development Plan` | Per audit rules: always KEEP. Active development plan, updated 2026-05-24. Drives CC session priorities. |
| 4 | `DS360-ASSIST-SPEC.md` | 822 | 46.4 | SPEC | `# DS360 Assist — AI Agent & Remote Support Spec` | Pre-implementation spec dated May 24, 2026. Even though Phase 1 enhancements are built, this spec covers DS360 Assist broadly (AI agent, KB, analytics, session management) — most of which is not yet built. Active reference for future work. |
| 5 | `SITEMAP.md` | 580 | 23.5 | SPEC | `# Dealer Suite 360 — Full Site Map` | Generated 2026-04-29. Comprehensive URL map of all public pages, portals, and routes. Useful planning reference and CC context for route decisions. |
| 6 | `design_guidelines.md` | 146 | 6.8 | DOCUMENTATION | `# Dealer Suite 360 Website Design Guidelines` | Design system documentation (typography, colors, spacing, components). Actively useful for maintaining visual consistency per Rule 1 (DESIGN IS LOCKED). |
| 7 | `knowledge-base/faq/billing-faq.md` | 39 | 2.9 | DOCUMENTATION | `title: Billing & Subscription FAQ` | Structured KB article with YAML frontmatter (slug, category, tags, roles_visible). Active content for the DS360 Assist knowledge base feature. |
| 8 | `knowledge-base/faq/claim-statuses.md` | 40 | 2.7 | DOCUMENTATION | `title: Understanding Claim Statuses` | Active KB article. |
| 9 | `knowledge-base/faq/claim-types.md` | 34 | 3.1 | DOCUMENTATION | `title: Claim Types Explained` | Active KB article. |
| 10 | `knowledge-base/faq/frc-codes.md` | 37 | 3.2 | DOCUMENTATION | `title: FRC Codes by Manufacturer` | Active KB article. |
| 11 | `knowledge-base/faq/photos-explained.md` | 47 | 3.3 | DOCUMENTATION | `title: Photo Requirements for Claims` | Active KB article. |
| 12 | `knowledge-base/terminology/glossary.md` | 50 | 3.9 | DOCUMENTATION | `title: DealerSuite360 Glossary` | Active KB article. |
| 13 | `knowledge-base/troubleshooting/common-errors.md` | 47 | 3.9 | DOCUMENTATION | `title: Common Issues and Solutions` | Active KB article. |
| 14 | `knowledge-base/troubleshooting/getting-started.md` | 64 | 4.0 | DOCUMENTATION | `title: Getting Started with DealerSuite360` | Active KB article. |
| 15 | `knowledge-base/troubleshooting/permissions-guide.md` | 68 | 3.6 | DOCUMENTATION | `title: Role Permissions Guide` | Active KB article. |
| 16 | `knowledge-base/troubleshooting/screen-share-help.md` | 64 | 4.6 | DOCUMENTATION | `title: How to Share Your Screen with Support` | Active KB article — directly supports the Remote Support feature built in the last session. |
| 17 | `knowledge-base/workflows/create-client.md` | 42 | 2.4 | DOCUMENTATION | `title: How to Add a New Client` | Active KB article. |
| 18 | `knowledge-base/workflows/create-unit.md` | 43 | 2.7 | DOCUMENTATION | `title: How to Create a New Unit` | Active KB article. |
| 19 | `knowledge-base/workflows/file-claim.md` | 45 | 3.5 | DOCUMENTATION | `title: How to File a Warranty Claim` | Active KB article. |
| 20 | `knowledge-base/workflows/manage-staff.md` | 51 | 2.7 | DOCUMENTATION | `title: Managing Your Dealership Staff` | Active KB article. |
| 21 | `knowledge-base/workflows/purchase-module.md` | 35 | 2.7 | DOCUMENTATION | `title: Adding Modules to Your Subscription` | Active KB article. |

**Total to keep: 21 files, ~299.4 KB**

---

## SUMMARY

| Category | Files | KB |
|----------|-------|----|
| Safe to delete | 8 | ~194.7 KB |
| Review first | 8 | ~645.3 KB |
| Keep | 21 | ~299.4 KB |
| **Total** | **37** | **~1,139.3 KB** |

### Quick Wins (delete immediately, no risk)
1. `SESSION2-AUTONOMOUS - Copy.md` — exact duplicate, 15.2 KB
2. `AUTONOMOUS.md` + `COMPLETED.md` — execution pair, both spent (21.9 KB combined)
3. `SESSION2-AUTONOMOUS.md` + `SESSION3-AUTONOMOUS.md` — spent build prompts (40.6 KB combined)
4. `DS360-V7-FULL-AUDIT.md` — the prompt that produced V7-AUDIT-REPORT.md; output is the keeper (39.6 KB)

### After Review
- If V7 API wiring reaches 100%: delete all `DATA-ROUTING-*.md` files (~438 KB freed)
- If all 53 HTML→TSX conversions complete: delete `Official HTML Pages/CC-CONVERSION-SPEC.md` (15.6 KB)
- If `shared/CLAUDE.md` is confirmed unused: delete it (19.7 KB)
- Merge relevant V6 context from `DS360-CC-REFERENCE.md` into `CLAUDE.md` then delete it (147.6 KB)

### Maximum Recoverable Space
- Immediate: ~194.7 KB
- After review + cleanup: up to ~985 KB (86% of current total)
- Irreducible minimum (KEEP files): ~299.4 KB
