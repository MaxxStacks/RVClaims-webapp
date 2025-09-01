import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { ContactSection } from "@/components/contact-section";
import { useLanguage } from "@/hooks/use-language";

export default function Contact() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle={t('contactPage.title')}
      seoDescription={t('contactPage.description')}
      seoKeywords="contact RVClaimTrack, claims experts, warranty revenue optimization, Canadian RV dealers"
      canonical="/contact"
    >
      <PageHero
        badge={t('contactPage.badge')}
        title={t('contactPage.title')}
        description={t('contactPage.description')}
      />
      
      <ContactSection />
    </PageLayout>
  );
}