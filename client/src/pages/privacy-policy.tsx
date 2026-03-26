import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { Link } from "wouter";

const SECTION_KEYS = ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10'] as const;

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle="Privacy Policy | PIPEDA Compliance | Dealer Suite 360"
      seoDescription="Dealer Suite 360 privacy policy. How we collect, use, and protect personal information in compliance with Canada's PIPEDA legislation."
      seoKeywords="privacy policy, PIPEDA compliance, data protection, personal information, Canadian privacy law, Dealer Suite 360"
      canonical="/privacy-policy"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 border border-primary/20 px-3 py-1 text-xs" variant="outline">
            <Shield className="mr-2 h-3 w-3" />
            PIPEDA Compliant
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {t('privacyPolicyPage.title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('privacyPolicyPage.effective')}
          </p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-muted-foreground mb-12 leading-relaxed">
            {t('privacyPolicyPage.description')}
          </p>

          <div className="space-y-10">
            {SECTION_KEYS.map((key) => (
              <div key={key} className="border-l-4 border-primary/30 pl-6">
                <h2 className="text-xl font-bold mb-3 text-foreground">
                  {t(`privacyPolicyPage.${key}Title`)}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`privacyPolicyPage.${key}Body`)}
                </p>
              </div>
            ))}

            {/* Canadian Compliance */}
            <div className="border-l-4 border-primary/30 pl-6">
              <h2 className="text-xl font-bold mb-3 text-foreground">11. Canadian Privacy Compliance</h2>
              <p className="text-muted-foreground leading-relaxed">
                Dealer Suite 360 is headquartered in Canada and our primary privacy framework is Canada's federal Personal Information Protection and Electronic Documents Act (PIPEDA). All data collection, use, and disclosure practices described in this policy are designed to comply with PIPEDA and applicable provincial privacy legislation. For information about our PIPEDA compliance and Canadian privacy practices, see our{' '}
                <Link href="/pipeda-compliance" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                  PIPEDA Compliance Statement
                </Link>.
              </p>
            </div>

            {/* AI Features */}
            <div className="border-l-4 border-primary/30 pl-6">
              <h2 className="text-xl font-bold mb-3 text-foreground">12. AI-Powered Features</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform includes AI-powered features including document scanning, photo quality analysis, FRC code lookup, claim readiness scoring, denial prediction, and AI-generated F&I presentations. These features process dealership data to improve service delivery and claim approval rates. No personally identifiable information is shared with third-party AI providers. All AI processing is performed within our secure infrastructure or through contracted processors bound by strict data processing agreements.
              </p>
            </div>

            {/* Marketplace & Auctions */}
            <div className="border-l-4 border-primary/30 pl-6">
              <h2 className="text-xl font-bold mb-3 text-foreground">13. Marketplace &amp; Auctions</h2>
              <p className="text-muted-foreground leading-relaxed">
                When participating in our Network Marketplace or Public Auctions, transaction data including bid amounts, escrow details, and dealer identities are collected and processed to facilitate secure transactions. Buyer and seller identities are kept separate until a transaction is completed. Dealer Suite 360 acts as escrow and processes all transaction data under this Privacy Policy. Auction participants consent to the collection and use of this transaction data as a condition of participation.
              </p>
            </div>

            {/* Mobile Application */}
            <div className="border-l-4 border-primary/30 pl-6">
              <h2 className="text-xl font-bold mb-3 text-foreground">14. Mobile Application</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our mobile application (iOS and Android, launching Q3 2026) may collect device information (device model, operating system version, unique device identifiers), location data (with your explicit permission, used for lot-location features and mobile service routing), and usage analytics to improve the user experience. You may revoke location permission at any time through your device settings. Usage analytics are collected in aggregate and do not identify individual users.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
