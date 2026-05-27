# Changelog

All notable changes to Dealer Suite 360 are documented here.
Generated automatically from git commit history.

## [1.3.0] — 2026-05-27

### New Features
- white-label operator resell — enterprise platform licensing
- Vendor/Supplier Portal — new portal type with full supplier role
- Multi-location management — dealership location tier upgrade
- Compliance Manager add-on module — jurisdiction-aware regulatory tracking
- Advanced Analytics & BI Dashboard add-on module
- Review & Feedback System add-on module (Reputation Management)
- AI Customer Support Bot add-on module
- Customer Loyalty Program add-on module
- Automated Service Reminders add-on module
- Smart Upsell engine — AI-driven revenue opportunities add-on module
- Payment Plans add-on module + US/Canada locale utility
- customer mobile app audit + fix — Deal Jacket, PDI view, KB, push prompts, responsive fixes
- Owner's Manual / Knowledge Base system
- AI Claim Drafting Phase 1 — CCC from photos with issue grouping intelligence
- Batch VIN Import + Operator Arrivals Queue
- Digital Deal Jacket — auto-created on unit sale, document checklist, permissions matrix
- PDI & Delivery Checklist workflow — 5-step wizard, templates, signatures, unit integration
- Digital Signatures infrastructure — reusable SignatureCapture for PDI, WO, invoices
- Print-to-PDF system — PrintButton, PrintHeader, print CSS on all detail and list pages
- Unit Tag Scanner + Barcode/QR Traceability System
- Dealer Wallet System — funding tiers, bonus credits, auto-deduction, Stripe integration
- Module Marketplace — service catalog, subscriptions, and module-gated sidebar
- DS360 Assist Enhancements 1-3 — screen share, operator requests, document transfer
- DS360 Assist Phases 4 & 5 — remote support, analytics, KB, rate limiting, mobile
- DS360 Assist Phase 3 — Escalation Paths
- DS360 Assist — Phase 2 agent intelligence complete
- DS360 Assist — Phase 1 foundation (AI agent + remote support schema)
- operator-admin system section + header — all 17 items complete
- operator-admin roadmap page — confidential dev tracker
- dynamic template banner labels based on selected entity type
- downloadable CSV templates for all 5 import entity types

### Bug Fixes
- print.css stray closing brace — digital signatures block moved inside @media print
- V7 final cleanup — navy color unification, unguarded route audit, V6 portal deletion
- DevAccessV7 auth bypass race condition — localStorage check before Clerk, all 15 portals verified, 3 missing portal cards added
- Settings profile Clerk+DB sync, notification prefs data corruption, apiFetch error surfacing
- LanguageProvider wrapping portal routes, ProtectedRoute dev mode bypass for DevAccessV7
- dealer screen-share toast + operator request button in both layouts
- correct dealer role redirect paths in DevAccessV7 from /demo/ to /dealer/
- make OpenAI client init defensive for missing API key
- add stub assist route files to unblock Railway deploy
- silence auction timer 42P01 log spam until db:push runs
- dev-access-v7 — real portals, correct URLs, card UI, role injection
- add multer dependency for import file uploads

### Improvements
- remove all v6 references from API routes and file names

### Documentation
- V7 mega platform audit — health score 91/100
- V7 Final Audit — 134/150 (89/100 on original scale, +27 from baseline)

### Other Changes
- AI features: Document Scanner with VIN detection + F&I Presenter with customer session page — graceful fallbacks, 0 TypeScript errors
- stub cleanup: 9 pages wired to real APIs, WorkByDealer agent mode, Documents endpoint, 4 polished future-feature placeholders — 0 stubs remaining
- V7 complete: 20-module V6→V7 migration — full claims workflow, billing, units, dealer management, auth/RBAC, F&I, warranty, financing, parts, customer portal, marketplace (5 portals), techflow, notifications, users/settings, CRM, marketing, consignment, i18n EN/FR, mobile PWA, cleanup — 0 TypeScript errors
- changelog: bump to v2.1.0 — 13-portal architecture, 215 routes, import system

## [1.2.0] — 2026-05-27

### New Features
- white-label operator resell — enterprise platform licensing
- Vendor/Supplier Portal — new portal type with full supplier role
- Multi-location management — dealership location tier upgrade
- Compliance Manager add-on module — jurisdiction-aware regulatory tracking
- Advanced Analytics & BI Dashboard add-on module
- Review & Feedback System add-on module (Reputation Management)
- AI Customer Support Bot add-on module
- Customer Loyalty Program add-on module
- Automated Service Reminders add-on module
- Smart Upsell engine — AI-driven revenue opportunities add-on module
- Payment Plans add-on module + US/Canada locale utility
- customer mobile app audit + fix — Deal Jacket, PDI view, KB, push prompts, responsive fixes
- Owner's Manual / Knowledge Base system
- AI Claim Drafting Phase 1 — CCC from photos with issue grouping intelligence
- Batch VIN Import + Operator Arrivals Queue
- Digital Deal Jacket — auto-created on unit sale, document checklist, permissions matrix
- PDI & Delivery Checklist workflow — 5-step wizard, templates, signatures, unit integration
- Digital Signatures infrastructure — reusable SignatureCapture for PDI, WO, invoices
- Print-to-PDF system — PrintButton, PrintHeader, print CSS on all detail and list pages
- Unit Tag Scanner + Barcode/QR Traceability System
- Dealer Wallet System — funding tiers, bonus credits, auto-deduction, Stripe integration
- Module Marketplace — service catalog, subscriptions, and module-gated sidebar
- DS360 Assist Enhancements 1-3 — screen share, operator requests, document transfer
- DS360 Assist Phases 4 & 5 — remote support, analytics, KB, rate limiting, mobile
- DS360 Assist Phase 3 — Escalation Paths
- DS360 Assist — Phase 2 agent intelligence complete
- DS360 Assist — Phase 1 foundation (AI agent + remote support schema)
- operator-admin system section + header — all 17 items complete
- operator-admin roadmap page — confidential dev tracker
- dynamic template banner labels based on selected entity type
- downloadable CSV templates for all 5 import entity types

### Bug Fixes
- print.css stray closing brace — digital signatures block moved inside @media print
- V7 final cleanup — navy color unification, unguarded route audit, V6 portal deletion
- DevAccessV7 auth bypass race condition — localStorage check before Clerk, all 15 portals verified, 3 missing portal cards added
- Settings profile Clerk+DB sync, notification prefs data corruption, apiFetch error surfacing
- LanguageProvider wrapping portal routes, ProtectedRoute dev mode bypass for DevAccessV7
- dealer screen-share toast + operator request button in both layouts
- correct dealer role redirect paths in DevAccessV7 from /demo/ to /dealer/
- make OpenAI client init defensive for missing API key
- add stub assist route files to unblock Railway deploy
- silence auction timer 42P01 log spam until db:push runs
- dev-access-v7 — real portals, correct URLs, card UI, role injection
- add multer dependency for import file uploads

### Improvements
- remove all v6 references from API routes and file names

### Documentation
- V7 mega platform audit — health score 91/100
- V7 Final Audit — 134/150 (89/100 on original scale, +27 from baseline)

### Other Changes
- AI features: Document Scanner with VIN detection + F&I Presenter with customer session page — graceful fallbacks, 0 TypeScript errors
- stub cleanup: 9 pages wired to real APIs, WorkByDealer agent mode, Documents endpoint, 4 polished future-feature placeholders — 0 stubs remaining
- V7 complete: 20-module V6→V7 migration — full claims workflow, billing, units, dealer management, auth/RBAC, F&I, warranty, financing, parts, customer portal, marketplace (5 portals), techflow, notifications, users/settings, CRM, marketing, consignment, i18n EN/FR, mobile PWA, cleanup — 0 TypeScript errors
- changelog: bump to v2.1.0 — 13-portal architecture, 215 routes, import system

## [1.1.0] — 2026-05-27

### New Features
- white-label operator resell — enterprise platform licensing
- Vendor/Supplier Portal — new portal type with full supplier role
- Multi-location management — dealership location tier upgrade
- Compliance Manager add-on module — jurisdiction-aware regulatory tracking
- Advanced Analytics & BI Dashboard add-on module
- Review & Feedback System add-on module (Reputation Management)
- AI Customer Support Bot add-on module
- Customer Loyalty Program add-on module
- Automated Service Reminders add-on module
- Smart Upsell engine — AI-driven revenue opportunities add-on module
- Payment Plans add-on module + US/Canada locale utility
- customer mobile app audit + fix — Deal Jacket, PDI view, KB, push prompts, responsive fixes
- Owner's Manual / Knowledge Base system
- AI Claim Drafting Phase 1 — CCC from photos with issue grouping intelligence
- Batch VIN Import + Operator Arrivals Queue
- Digital Deal Jacket — auto-created on unit sale, document checklist, permissions matrix
- PDI & Delivery Checklist workflow — 5-step wizard, templates, signatures, unit integration
- Digital Signatures infrastructure — reusable SignatureCapture for PDI, WO, invoices
- Print-to-PDF system — PrintButton, PrintHeader, print CSS on all detail and list pages
- Unit Tag Scanner + Barcode/QR Traceability System
- Dealer Wallet System — funding tiers, bonus credits, auto-deduction, Stripe integration
- Module Marketplace — service catalog, subscriptions, and module-gated sidebar
- DS360 Assist Enhancements 1-3 — screen share, operator requests, document transfer
- DS360 Assist Phases 4 & 5 — remote support, analytics, KB, rate limiting, mobile
- DS360 Assist Phase 3 — Escalation Paths
- DS360 Assist — Phase 2 agent intelligence complete
- DS360 Assist — Phase 1 foundation (AI agent + remote support schema)
- operator-admin system section + header — all 17 items complete
- operator-admin roadmap page — confidential dev tracker
- dynamic template banner labels based on selected entity type
- downloadable CSV templates for all 5 import entity types

### Bug Fixes
- print.css stray closing brace — digital signatures block moved inside @media print
- V7 final cleanup — navy color unification, unguarded route audit, V6 portal deletion
- DevAccessV7 auth bypass race condition — localStorage check before Clerk, all 15 portals verified, 3 missing portal cards added
- Settings profile Clerk+DB sync, notification prefs data corruption, apiFetch error surfacing
- LanguageProvider wrapping portal routes, ProtectedRoute dev mode bypass for DevAccessV7
- dealer screen-share toast + operator request button in both layouts
- correct dealer role redirect paths in DevAccessV7 from /demo/ to /dealer/
- make OpenAI client init defensive for missing API key
- add stub assist route files to unblock Railway deploy
- silence auction timer 42P01 log spam until db:push runs
- dev-access-v7 — real portals, correct URLs, card UI, role injection
- add multer dependency for import file uploads

### Improvements
- remove all v6 references from API routes and file names

### Documentation
- V7 mega platform audit — health score 91/100
- V7 Final Audit — 134/150 (89/100 on original scale, +27 from baseline)

### Other Changes
- AI features: Document Scanner with VIN detection + F&I Presenter with customer session page — graceful fallbacks, 0 TypeScript errors
- stub cleanup: 9 pages wired to real APIs, WorkByDealer agent mode, Documents endpoint, 4 polished future-feature placeholders — 0 stubs remaining
- V7 complete: 20-module V6→V7 migration — full claims workflow, billing, units, dealer management, auth/RBAC, F&I, warranty, financing, parts, customer portal, marketplace (5 portals), techflow, notifications, users/settings, CRM, marketing, consignment, i18n EN/FR, mobile PWA, cleanup — 0 TypeScript errors
- changelog: bump to v2.1.0 — 13-portal architecture, 215 routes, import system
