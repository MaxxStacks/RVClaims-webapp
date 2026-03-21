import { Phone, Mail, MapPin, Heart, Linkedin, Facebook, Youtube, Instagram, Twitter, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ServiceBadge } from "@/components/service-badge";
import { Link } from "wouter";
import logoEN from "@assets/DS360_logo_en.webp";
import logoFR from "@assets/DS360_logo_fr.webp";

export function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gray-50 text-gray-900 pt-16 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-4">
            <div className="mb-2" data-testid="div-footer-logo">
              <Link href="/">
                <img
                  src={language === 'en' ? logoEN : logoFR}
                  alt="Dealer Suite 360"
                  width={512}
                  height={108}
                  style={{ height: "72px", width: "auto" }}
                  className="cursor-pointer"
                  data-testid="img-footer-logo"
                />
              </Link>
            </div>
            <p className="text-gray-600 text-sm" data-testid="text-footer-description">
              {t('footer.description')}
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Phone className="mr-2" size={14} />
                <a href="tel:8882453204" className="hover:text-primary transition-colors">
                  (888) 245-3204
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2" size={14} />
                <a href="mailto:support@dealersuite360.com" className="hover:text-primary transition-colors">
                  support@dealersuite360.com
                </a>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2" size={14} />
                {t('contactSection.location.address')}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold" data-testid="text-footer-services-title">
              {t('footer.servicesTitle')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/claims-processing" className="hover:text-primary transition-colors" data-testid="link-footer-processing">
                  {t('footer.processing')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/financing" 
                  className="hover:text-primary transition-colors inline-flex items-center gap-1 flex-wrap" 
                  data-testid="link-footer-financing"
                >
                  {t('mainServices.financing.title')}
                  <ServiceBadge quarter="Q2" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/fi-services" 
                  className="hover:text-primary transition-colors inline-flex items-center gap-1 flex-wrap" 
                  data-testid="link-footer-fi-services"
                >
                  {t('mainServices.fiServices.title')}
                  <ServiceBadge quarter="Q2" />
                </Link>
              </li>
              <li>
                <Link href="/revenue-services" className="hover:text-primary transition-colors" data-testid="link-footer-optimization">
                  {t('footer.optimization')}
                </Link>
              </li>
              <li>
                <Link href="/technology" className="hover:text-primary transition-colors" data-testid="link-footer-technology">
                  {t('footer.technology')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-integration">
                  {t('footer.integration')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-consultation">
                  {t('footer.consultation')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-training">
                  {t('footer.training')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/network-marketplace" 
                  className="text-primary font-semibold animate-pulse inline-flex items-center gap-1 flex-wrap hover:text-primary/80 transition-colors" 
                  data-testid="link-footer-sign-up"
                >
                  Sign Up
                  <ServiceBadge quarter="Q1" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/live-auctions" 
                  className="text-primary font-semibold inline-flex items-center gap-1 flex-wrap hover:text-primary/80 transition-colors" 
                  data-testid="link-footer-live-auctions"
                >
                  {t('navigation.liveAuctions')}
                  <ServiceBadge quarter="Q3" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="hover:text-primary transition-colors" 
                  data-testid="link-footer-pricing"
                >
                  {t('navigation.pricing')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold" data-testid="text-footer-company-title">
              {t('footer.companyTitle')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors" data-testid="link-footer-about">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-careers">
                  {t('footer.careers')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-partnerships">
                  {t('footer.partnerships')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-testimonials">
                  {t('footer.testimonials')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold" data-testid="text-footer-resources-title">
              {t('footer.resourcesTitle')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-claim-guides">
                  {t('footer.claimGuides')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-industry-reports">
                  {t('footer.industryReports')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-webinars">
                  {t('footer.webinars')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-knowledge-base">
                  {t('footer.knowledgeBase')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold" data-testid="text-footer-support-title">
              {t('footer.supportTitle')}
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-help-center">
                  {t('footer.helpCenter')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-documentation">
                  {t('footer.documentation')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-api-access">
                  {t('footer.apiAccess')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-system-status">
                  {t('footer.systemStatus')}
                </Link>
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
              <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-terms">
                {t('footer.termsOfService')}
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-cookies">
                {t('footer.cookiePolicy')}
              </Link>
              <Link href="/contact" className="hover:text-primary transition-colors" data-testid="link-footer-compliance">
                {t('footer.compliance')}
              </Link>
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
            
            <div className="flex items-center gap-2 order-2 sm:order-2" data-testid="text-footer-powered-by">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-full">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-medium text-gray-700">{t('footer.developedWith')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
