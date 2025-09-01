import { Caravan, Truck, Bus, CarTaxiFront, Tent } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function RvTypesSection() {
  const { t } = useLanguage();

  const rvTypes = [
    {
      icon: Caravan,
      title: t('rvTypes.travelTrailers'),
      testId: 'card-travel-trailers'
    },
    {
      icon: Truck,
      title: t('rvTypes.fifthWheels'),
      testId: 'card-fifth-wheels'
    },
    {
      icon: Bus,
      title: t('rvTypes.classAC'),
      testId: 'card-class-ac'
    },
    {
      icon: CarTaxiFront,
      title: t('rvTypes.vanCampers'),
      testId: 'card-van-campers'
    },
    {
      icon: Tent,
      title: t('rvTypes.popups'),
      testId: 'card-popups'
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-rv-types-title">
            {t('rvTypes.title')}
          </h2>
          <p className="text-xl text-muted-foreground" data-testid="text-rv-types-description">
            {t('rvTypes.description')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {rvTypes.map((type, index) => (
            <div key={index} className="bg-card rounded-lg p-4 text-center border border-border hover-lift" data-testid={type.testId}>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <type.icon className="text-primary" size={24} />
              </div>
              <h4 className="font-medium text-sm">
                {type.title}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
