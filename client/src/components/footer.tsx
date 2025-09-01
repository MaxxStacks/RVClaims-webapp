import { Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold gradient-text" data-testid="text-footer-logo">
              RVClaimTrack
            </h3>
            <p className="text-gray-300 text-sm" data-testid="text-footer-description">
              {t('footer.description')}
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center">
                <Phone className="mr-2" size={14} />
                1-800-RV-CLAIM
              </div>
              <div className="flex items-center">
                <Mail className="mr-2" size={14} />
                claims@rvclaimtrack.ca
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2" size={14} />
                {t('contactSection.location.address')}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold" data-testid="text-footer-services-title">
              {t('footer.servicesTitle')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-processing">
                  {t('footer.processing')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-optimization">
                  {t('footer.optimization')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-technology">
                  {t('footer.technology')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-integration">
                  {t('footer.integration')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-consultation">
                  {t('footer.consultation')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-training">
                  {t('footer.training')}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold" data-testid="text-footer-company-title">
              {t('footer.companyTitle')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-about">
                  {t('footer.aboutUs')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-careers">
                  {t('footer.careers')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-partnerships">
                  {t('footer.partnerships')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-testimonials">
                  {t('footer.testimonials')}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold" data-testid="text-footer-resources-title">
              {t('footer.resourcesTitle')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-claim-guides">
                  {t('footer.claimGuides')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-industry-reports">
                  {t('footer.industryReports')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-webinars">
                  {t('footer.webinars')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-knowledge-base">
                  {t('footer.knowledgeBase')}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold" data-testid="text-footer-support-title">
              {t('footer.supportTitle')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-help-center">
                  {t('footer.helpCenter')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-documentation">
                  {t('footer.documentation')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-api-access">
                  {t('footer.apiAccess')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-system-status">
                  {t('footer.systemStatus')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <p className="text-sm text-gray-400" data-testid="text-footer-copyright">
              {t('footer.copyright')}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-end gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-privacy">
                {t('footer.privacyPolicy')}
              </a>
              <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-terms">
                {t('footer.termsOfService')}
              </a>
              <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-cookies">
                {t('footer.cookiePolicy')}
              </a>
              <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-compliance">
                {t('footer.compliance')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
