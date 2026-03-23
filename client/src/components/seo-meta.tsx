import { useLanguage } from "@/hooks/use-language";

interface SeoMetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  schema?: object | object[];
}

const BRAND = "Dealer Suite 360";
const BASE_URL = "https://dealersuite360.com";
const OG_IMAGE = `${BASE_URL}/og-image.png`;
const PHONE = "+18884432204";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  "name": BRAND,
  "alternateName": "dealersuite360.com",
  "url": BASE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": `${BASE_URL}/attached_assets/DS360_logo_en.png`
  },
  "description": "Dealer Suite 360 is the all-in-one dealership operating system for RV dealers — AI-powered warranty claims processing, F&I, financing, parts management, dealer-to-dealer marketplace, and live auctions. Powered by Dealer Suite 360.",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CA",
    "addressRegion": "ON",
    "addressLocality": "Toronto"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": PHONE,
      "contactType": "customer service",
      "availableLanguage": ["English", "French"],
      "areaServed": "CA"
    },
    {
      "@type": "ContactPoint",
      "telephone": PHONE,
      "contactType": "sales",
      "availableLanguage": ["English", "French"],
      "areaServed": "CA"
    }
  ],
  "sameAs": [BASE_URL],
  "knowsAbout": [
    "RV warranty claims processing",
    "RV dealer management software",
    "F&I services for RV dealerships",
    "RV financing solutions",
    "Dealer Suite 360",
    "RV dealership platform"
  ]
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  "url": BASE_URL,
  "name": BRAND,
  "description": "The all-in-one operating system for RV dealerships",
  "publisher": { "@id": `${BASE_URL}/#organization` },
  "inLanguage": ["en-CA", "fr-CA"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/contact?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

const siteNavigationSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Dealer Suite 360 Site Navigation",
  "itemListElement": [
    { "@type": "SiteLinksSearchBox", "target": BASE_URL },
    { "@type": "ListItem", "position": 1, "name": "Services", "url": `${BASE_URL}/services` },
    { "@type": "ListItem", "position": 2, "name": "Claims Processing", "url": `${BASE_URL}/claims-processing` },
    { "@type": "ListItem", "position": 3, "name": "Technology", "url": `${BASE_URL}/technology` },
    { "@type": "ListItem", "position": 4, "name": "Financing", "url": `${BASE_URL}/financing` },
    { "@type": "ListItem", "position": 5, "name": "F&I Services", "url": `${BASE_URL}/fi-services` },
    { "@type": "ListItem", "position": 6, "name": "Network Marketplace", "url": `${BASE_URL}/network-marketplace` },
    { "@type": "ListItem", "position": 7, "name": "Live Auctions", "url": `${BASE_URL}/live-auctions` },
    { "@type": "ListItem", "position": 8, "name": "Pricing", "url": `${BASE_URL}/pricing` },
    { "@type": "ListItem", "position": 9, "name": "About", "url": `${BASE_URL}/about` },
    { "@type": "ListItem", "position": 10, "name": "Contact", "url": `${BASE_URL}/contact` }
  ]
};

export function SeoMeta({ title, description, keywords, canonical, ogType = "website", ogImage, schema }: SeoMetaProps) {
  const { language } = useLanguage();

  const fullTitle = `${title} | ${BRAND}`;
  const currentUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  const image = ogImage || OG_IMAGE;
  const locale = language === 'fr' ? 'fr_CA' : 'en_CA';
  const altLocale = language === 'fr' ? 'en_CA' : 'fr_CA';
  const altUrl = canonical
    ? `${BASE_URL}${canonical}`
    : BASE_URL;

  const schemas = [
    organizationSchema,
    websiteSchema,
    siteNavigationSchema,
    ...(schema ? (Array.isArray(schema) ? schema : [schema]) : [])
  ];

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="language" content={language === 'fr' ? 'fr-CA' : 'en-CA'} />
      <meta name="geo.region" content="CA" />
      
      <link rel="canonical" href={currentUrl} />
      <link rel="alternate" hrefLang="en-CA" href={currentUrl} />
      <link rel="alternate" hrefLang="fr-CA" href={altUrl} />
      <link rel="alternate" hrefLang="x-default" href={currentUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={BRAND} />
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content={altLocale} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${BRAND} — ${title}`} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </>
  );
}