import { PageLayout } from "@/components/page-layout";
import { PageHero } from "@/components/page-hero";
import { ContactSection } from "@/components/contact-section";
import { DepartmentDirectory } from "@/components/department-directory";
import { useLanguage } from "@/hooks/use-language";

export default function Contact() {
  const { t } = useLanguage();

  return (
    <PageLayout
      seoTitle={t('contactPage.title')}
      seoDescription={t('contactPage.description')}
      seoKeywords="contact Dealer Suite 360, RV warranty claims experts, dealership support, RV dealers, claims processing support"
      canonical="/contact"
    >
      <PageHero
        badge={t('contactPage.badge')}
        title={t('contactPage.title')}
        description={t('contactPage.description')}
      />
      
      <ContactSection />
      <DepartmentDirectory />
    </PageLayout>
  );
}