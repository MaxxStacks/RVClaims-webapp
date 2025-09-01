import { Shield, Lock, FileCheck } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function PrivacyAssuranceSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-xl p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-privacy-title">
            {t('privacyAssurance.title')}
          </h2>
          
          <p className="text-xl text-white/90 mb-8 leading-relaxed" data-testid="text-privacy-description">
            {t('privacyAssurance.description')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center text-white/90">
              <Lock className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium" data-testid="text-privacy-feature-1">
                {t('privacyAssurance.features.encryption')}
              </span>
            </div>
            <div className="flex flex-col items-center text-white/90">
              <FileCheck className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium" data-testid="text-privacy-feature-2">
                {t('privacyAssurance.features.agreements')}
              </span>
            </div>
            <div className="flex flex-col items-center text-white/90">
              <Shield className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium" data-testid="text-privacy-feature-3">
                {t('privacyAssurance.features.compliance')}
              </span>
            </div>
          </div>
          
          <p className="text-white font-semibold text-lg" data-testid="text-privacy-guarantee">
            {t('privacyAssurance.guarantee')}
          </p>
        </div>
      </div>
    </section>
  );
}