// app-store-metadata.ts — App store listing content for Google Play + iOS
// Use this when submitting to the stores

export const appMetadata = {
  // ===== COMMON =====
  appName: 'RV Claims',
  shortDescription: 'RV warranty claims management for Canadian dealerships',

  // ===== GOOGLE PLAY =====
  googlePlay: {
    packageName: 'ca.rvclaims.app',
    defaultLanguage: 'en-CA',

    title: 'RV Claims - Warranty Claims Manager',
    shortDescription: 'Manage RV warranty claims, track parts, process financing, and connect with your dealer network.',

    fullDescription: `RV Claims is the complete warranty claims management platform for Canadian RV dealerships and their customers.

FOR DEALERSHIPS:
• Upload claim photos directly from your phone
• Push claims to your operator for processing
• Track claim status in real-time
• Manage your unit inventory
• Request financing — we shop lenders for the best rate
• Order parts with sourcing and delivery tracking
• Invite customers to their own branded portal
• Manage staff access and permissions

FOR CUSTOMERS:
• Track your warranty claims status
• View warranty coverage and expiry dates
• Report issues with photos directly from your phone
• Message your dealer through support tickets
• Access protection plans (GAP, roadside, extended warranty)
• View all documents (warranty certs, inspection reports)

FOR OPERATORS:
• Process photo batches and assign FRC codes
• Manage your entire dealer network
• Create and send invoices
• Track revenue and approval rates
• Configure billing, fees, and platform settings

FEATURES:
✓ Dark mode
✓ Bilingual (English / French)
✓ Camera integration for claim photos
✓ Push notifications for claim updates
✓ Offline-capable
✓ Secure login with 2FA support`,

    category: 'Business',
    contentRating: 'Everyone',

    // Screenshots needed:
    // Phone: 2-8 screenshots, 16:9 or 9:16, min 320px, max 3840px
    // Tablet 7": optional
    // Tablet 10": optional
    screenshotCaptions: [
      'Dashboard — Track claims, revenue, and dealer activity at a glance',
      'Photo Upload — Capture claim photos directly from your phone',
      'Claims Tracking — Real-time status updates on every claim',
      'Financing — We shop lenders to find your customers the best rate',
      'Customer Portal — White-label experience with your branding',
      'Dark Mode — Easy on the eyes, day or night',
    ],

    // Feature graphic: 1024x500 PNG/JPG
    featureGraphicText: 'RV Claims — Get Paid for Warranty Work',

    privacyPolicyUrl: 'https://rvclaims.ca/privacy-policy',
    websiteUrl: 'https://rvclaims.ca',
    supportEmail: 'support@rvclaims.ca',
  },

  // ===== APPLE APP STORE =====
  appStore: {
    bundleId: 'ca.rvclaims.app',
    sku: 'RVCLAIMS001',
    primaryLanguage: 'en-CA',

    name: 'RV Claims',
    subtitle: 'Warranty Claims for RV Dealers',

    promotionalText: 'Now with financing services, F&I product tracking, and parts ordering — all from your phone.',

    description: `RV Claims is the complete warranty claims management platform built for Canadian RV dealerships.

Upload claim photos from the field, push to your claims team for processing, and track every claim from submission to payment. Manage your entire unit inventory, request financing for customers, order parts, and connect with your dealer network — all from one app.

Dealership owners and staff can upload photos, track claims, manage units, and communicate with the claims operator. Customers get their own branded portal to track warranty coverage, report issues, and message their dealer.

Key Features:
• Camera-to-claim photo workflow
• Real-time claim status tracking
• Unit inventory management
• Financing request submission
• Parts ordering with delivery tracking
• Customer portal management
• Bilingual support (English & French)
• Dark mode
• Push notifications`,

    keywords: 'rv,claims,warranty,dealership,recreational vehicle,camper,trailer,fifth wheel,repair,service,dealer',

    primaryCategory: 'Business',
    secondaryCategory: 'Productivity',

    supportUrl: 'https://rvclaims.ca/contact',
    marketingUrl: 'https://rvclaims.ca',
    privacyUrl: 'https://rvclaims.ca/privacy-policy',

    // Screenshots needed:
    // 6.7" (iPhone 15 Pro Max): 1290x2796 or 2796x1290
    // 6.5" (iPhone 14 Plus): 1284x2778 or 2778x1284
    // 5.5" (iPhone 8 Plus): 1242x2208 or 2208x1242
    // 12.9" iPad Pro: 2048x2732 or 2732x2048
    screenshotSets: {
      'iPhone 6.7"': { width: 1290, height: 2796 },
      'iPhone 6.5"': { width: 1284, height: 2778 },
      'iPhone 5.5"': { width: 1242, height: 2208 },
      'iPad 12.9"': { width: 2048, height: 2732 },
    },

    // App Review Information
    reviewNotes: 'This app requires a dealer account to access full features. Test credentials: Email: demo@rvclaims.ca / Password: Demo2026! — This will log into the dealer portal with sample data.',

    // Age Rating
    ageRating: '4+',

    // Permissions descriptions (Info.plist)
    permissions: {
      NSCameraUsageDescription: 'RV Claims needs camera access to photograph claim damage, scan unit VIN tags, and update profile photos.',
      NSPhotoLibraryUsageDescription: 'RV Claims needs photo library access to upload existing claim photos and documents.',
      NSPhotoLibraryAddUsageDescription: 'RV Claims saves claim photos to your library for backup.',
      NSLocationWhenInUseUsageDescription: 'RV Claims uses your location for the roadside assistance feature to dispatch help to your location.',
    },
  },

  // ===== FRENCH LOCALIZATION =====
  french: {
    title: 'RV Claims - Gestion de réclamations',
    subtitle: 'Réclamations de garantie pour concessionnaires VR',
    shortDescription: 'Gérez les réclamations de garantie VR, suivez les pièces et connectez-vous à votre réseau de concessionnaires.',
    keywords: 'vr,réclamation,garantie,concessionnaire,véhicule récréatif,caravane,remorque,réparation,service',
  },
};
