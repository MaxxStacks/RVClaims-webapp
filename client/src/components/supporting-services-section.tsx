import { Package, Smartphone, TrendingUp, RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function SupportingServicesSection() {
  const { t } = useLanguage();

  const services = [
    {
      key: 'parts',
      icon: Package
    },
    {
      key: 'technology',
      icon: Smartphone
    },
    {
      key: 'marketing',
      icon: TrendingUp
    },
    {
      key: 'consignment',
      icon: RefreshCw
    }
  ];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-3xl p-12">
        {/* Section Header */}
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground" data-testid="text-supporting-services-title">
            Additional Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-supporting-services-description">
            Comprehensive solutions to enhance your dealership's operations
          </p>
        </div>

        {/* Services Grid - Smaller, more compact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className="bg-card rounded-lg p-6 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
              data-testid={`card-${key}-supporting`}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="text-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {t(`upsellServices.services.${key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {t(`upsellServices.services.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
