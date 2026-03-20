import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

const SECTION_KEYS = ['s1','s2','s3','s4','s5','s6','s7','s8','s9','s10'] as const;

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle="Privacy Policy | PIPEDA Compliance | RV Claims Canada"
      seoDescription="RV Claims Canada privacy policy. How we collect, use, and protect personal information in compliance with Canada's PIPEDA legislation."
      seoKeywords="privacy policy, PIPEDA compliance, data protection, personal information, Canadian privacy law, RV Claims Canada"
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
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
