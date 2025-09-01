import { useLanguage } from "@/hooks/use-language";

interface SeoMetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: string;
}

export function SeoMeta({ title, description, keywords, canonical, ogType = "website" }: SeoMetaProps) {
  const { language } = useLanguage();
  
  const fullTitle = `${title} | RVClaimTrack`;
  const baseUrl = "https://rvclaims.ca";
  const currentUrl = canonical ? `${baseUrl}${canonical}` : baseUrl;
  
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow" />
      <meta name="language" content={language} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="RVClaimTrack" />
      <meta property="og:locale" content={language === 'fr' ? 'fr_CA' : 'en_CA'} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      
      {/* Structured Data - Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "RVClaimTrack",
          "url": baseUrl,
          "description": "Professional RV warranty claims processing for Canadian dealerships",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "CA",
            "addressRegion": "ON",
            "addressLocality": "Toronto"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-800-RV-CLAIM",
            "contactType": "customer service",
            "availableLanguage": ["English", "French"]
          },
          "sameAs": [
            baseUrl
          ]
        })}
      </script>
    </>
  );
}