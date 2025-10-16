import { Phone, Mail, MapPin, Heart, Linkedin, Facebook, Youtube, Instagram, Twitter } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";
import logoEN from "@assets/Test 1-01_1760585336142.png";
import logoFR from "@assets/RV CLAIMS-FR_1760581425944.png";

export function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gray-50 text-gray-900 pt-16 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="mb-2" data-testid="div-footer-logo">
              <img 
                src={language === 'en' ? logoEN : logoFR} 
                alt="RV Claims" 
                className="h-16 w-auto max-w-[450px]" 
                style={{ imageRendering: 'crisp-edges' }}
                data-testid="img-footer-logo"
              />
            </div>
            <p className="text-gray-600 text-sm" data-testid="text-footer-description">
              {t('footer.description')}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Phone className="mr-2" size={14} />
                1-800-RV-CLAIM
              </div>
              <div className="flex items-center">
                <Mail className="mr-2" size={14} />
                support@rvclaims.ca
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
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-processing">
                  {t('footer.processing')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-optimization">
                  {t('footer.optimization')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-technology">
                  {t('footer.technology')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-integration">
                  {t('footer.integration')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-consultation">
                  {t('footer.consultation')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-training">
                  {t('footer.training')}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold" data-testid="text-footer-company-title">
              {t('footer.companyTitle')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-about">
                  {t('footer.aboutUs')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-careers">
                  {t('footer.careers')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-partnerships">
                  {t('footer.partnerships')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-testimonials">
                  {t('footer.testimonials')}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold" data-testid="text-footer-resources-title">
              {t('footer.resourcesTitle')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-claim-guides">
                  {t('footer.claimGuides')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-industry-reports">
                  {t('footer.industryReports')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-webinars">
                  {t('footer.webinars')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-knowledge-base">
                  {t('footer.knowledgeBase')}
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold" data-testid="text-footer-support-title">
              {t('footer.supportTitle')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-help-center">
                  {t('footer.helpCenter')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-documentation">
                  {t('footer.documentation')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-api-access">
                  {t('footer.apiAccess')}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-system-status">
                  {t('footer.systemStatus')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-4 pb-0">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <p className="text-sm text-gray-600" data-testid="text-footer-copyright">
              {t('footer.copyright')}
            </p>
            <div className="flex flex-wrap justify-center lg:justify-end gap-6 text-sm text-gray-600">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors" data-testid="link-footer-privacy">
                {t('footer.privacyPolicy')}
              </Link>
              <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-terms">
                {t('footer.termsOfService')}
              </a>
              <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-cookies">
                {t('footer.cookiePolicy')}
              </a>
              <a href="#" className="hover:text-primary transition-colors" data-testid="link-footer-compliance">
                {t('footer.compliance')}
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-300 gap-4">
            {/* Social Media Icons */}
            <div className="flex items-center gap-2 order-1 sm:order-1" data-testid="div-footer-social">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                data-testid="link-footer-linkedin"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                data-testid="link-footer-facebook"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                data-testid="link-footer-youtube"
                aria-label="YouTube"
              >
                <Youtube size={24} />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                data-testid="link-footer-instagram"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
                data-testid="link-footer-twitter"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
            
            <p className="text-[15px] text-gray-600 flex items-center order-2 sm:order-2" data-testid="text-footer-made-with-love">
              {t('footer.developedWith')} <Heart className="mx-2 w-4 h-4 text-primary fill-primary" /> {t('footer.developedLocation')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
