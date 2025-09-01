import { useLanguage } from "@/hooks/use-language";
import { FileText, Truck, Shield, ShieldCheck, Building } from "lucide-react";

export function ClaimsSection() {
  const { t } = useLanguage();

  const claimTypes = [
    {
      key: 'daf',
      icon: Truck,
      color: 'text-blue-600'
    },
    {
      key: 'pdi',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      key: 'warranty',
      icon: Shield,
      color: 'text-purple-600'
    },
    {
      key: 'extended',
      icon: ShieldCheck,
      color: 'text-orange-600'
    },
    {
      key: 'insurance',
      icon: Building,
      color: 'text-red-600'
    }
  ];

  return (
    <section className="py-24 bg-gray-50" id="claims">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6" data-testid="text-claims-title">
            {t('claimsSection.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-claims-description">
            {t('claimsSection.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {claimTypes.map(({ key, icon: Icon, color }) => (
            <div
              key={key}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              data-testid={`card-claim-${key}`}
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Icon className={`${color} w-8 h-8`} />
                </div>
                <h3 className="font-semibold text-lg mb-3" data-testid={`text-claim-title-${key}`}>
                  {t(`claimsSection.claimTypes.${key}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed" data-testid={`text-claim-description-${key}`}>
                  {t(`claimsSection.claimTypes.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}