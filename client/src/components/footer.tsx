import { Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold gradient-text" data-testid="text-footer-logo">
              RVClaimTrack
            </h3>
            <p className="text-gray-300 text-sm" data-testid="text-footer-description">
              {t('footer.description')}
            </p>
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
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold" data-testid="text-footer-rv-types-title">
              {t('footer.rvTypesTitle')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li data-testid="text-footer-travel-trailers">{t('footer.travelTrailers')}</li>
              <li data-testid="text-footer-fifth-wheels">{t('footer.fifthWheels')}</li>
              <li data-testid="text-footer-class-ac">{t('footer.classAC')}</li>
              <li data-testid="text-footer-van-campers">{t('footer.vanCampers')}</li>
              <li data-testid="text-footer-toy-haulers">{t('footer.toyHaulers')}</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold" data-testid="text-footer-contact-title">
              {t('footer.contactTitle')}
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center">
                <Phone className="mr-2" size={14} />
                1-800-RV-CLAIM
              </li>
              <li className="flex items-center">
                <Mail className="mr-2" size={14} />
                claims@rvclaimtrack.ca
              </li>
              <li className="flex items-center">
                <MapPin className="mr-2" size={14} />
                {t('contactSection.location.address')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400" data-testid="text-footer-copyright">
              {t('footer.copyright')}
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-privacy">
                {t('footer.privacyPolicy')}
              </a>
              <a href="#" className="hover:text-white transition-colors" data-testid="link-footer-terms">
                {t('footer.termsOfService')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
