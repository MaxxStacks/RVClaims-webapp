import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { useLanguage } from "@/hooks/use-language";

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle={t('privacyPolicyPage.title')}
      seoDescription={t('privacyPolicyPage.description')}
      seoKeywords="privacy policy, confidentiality, PIPEDA compliance, data protection"
      canonical="/privacy-policy"
    >
      <PageHero
        title={t('privacyPolicyPage.title')}
        description={t('privacyPolicyPage.description')}
      />
      
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground">
              {t('privacyPolicyPage.content')}
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}