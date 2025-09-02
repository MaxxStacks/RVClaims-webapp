import { Truck, Bus, CarTaxiFront, Tent } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import travelTrailerIcon from "@assets/New Project_1756841574795.png";

// Custom Travel Trailer Icon Component
const TravelTrailerIcon = () => (
  <img src={travelTrailerIcon} alt="Travel Trailer" style={{ width: '100px', height: '100px' }} />
);

// Custom SVG icons for specific RV types
const FifthWheelIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
    <path d="M4 16h2v2H4v-2zm14 0h2v2h-2v-2zM8 18h8v-2H8v2z" fill="currentColor"/>
    <path d="M20 14V8c0-1.1-.9-2-2-2h-4V4c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h1v2c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="6" cy="17" r="1" fill="currentColor"/>
    <circle cx="18" cy="17" r="1" fill="currentColor"/>
  </svg>
);

const ClassAIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
    <path d="M4 16h2v2H4v-2zm14 0h2v2h-2v-2z" fill="currentColor"/>
    <path d="M2 14V8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="6" cy="17" r="1" fill="currentColor"/>
    <circle cx="18" cy="17" r="1" fill="currentColor"/>
    <rect x="6" y="8" width="12" height="4" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

const SmallTrailerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
    <path d="M4 16h2v2H4v-2zm8 0h2v2h-2v-2z" fill="currentColor"/>
    <path d="M16 14V8c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="6" cy="17" r="1" fill="currentColor"/>
    <circle cx="14" cy="17" r="1" fill="currentColor"/>
    <path d="M16 10h4v4h-4v-4z" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

const ToyHaulerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
    <path d="M4 16h2v2H4v-2zm14 0h2v2h-2v-2z" fill="currentColor"/>
    <path d="M2 14V8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="6" cy="17" r="1" fill="currentColor"/>
    <circle cx="18" cy="17" r="1" fill="currentColor"/>
    <path d="M14 12V8h6v4h-6z" stroke="currentColor" strokeWidth="1" fill="none"/>
    <circle cx="17" cy="10" r="0.5" fill="currentColor"/>
  </svg>
);

const TruckCamperIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
    <path d="M4 16h2v2H4v-2zm12 0h2v2h-2v-2z" fill="currentColor"/>
    <path d="M2 14V10c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="6" cy="17" r="1" fill="currentColor"/>
    <circle cx="16" cy="17" r="1" fill="currentColor"/>
    <path d="M4 8V6c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v2" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

const DestinationTrailerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
    <path d="M4 16h2v2H4v-2zm14 0h2v2h-2v-2z" fill="currentColor"/>
    <path d="M2 14V8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="6" cy="17" r="1" fill="currentColor"/>
    <circle cx="18" cy="17" r="1" fill="currentColor"/>
    <rect x="5" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none"/>
    <rect x="15" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none"/>
  </svg>
);

export function RvTypesSection() {
  const { t } = useLanguage();

  const rvTypes = [
    {
      icon: TravelTrailerIcon,
      title: t('rvTypes.travelTrailer'),
      testId: 'card-travel-trailer'
    },
    {
      icon: FifthWheelIcon,
      title: t('rvTypes.fifthWheel'),
      testId: 'card-fifth-wheel'
    },
    {
      icon: Bus,
      title: t('rvTypes.classC'),
      testId: 'card-class-c'
    },
    {
      icon: CarTaxiFront,
      title: t('rvTypes.vanCamper'),
      testId: 'card-van-camper'
    },
    {
      icon: ClassAIcon,
      title: t('rvTypes.classA'),
      testId: 'card-class-a'
    },
    {
      icon: SmallTrailerIcon,
      title: t('rvTypes.smallTrailer'),
      testId: 'card-small-trailer'
    },
    {
      icon: Tent,
      title: t('rvTypes.popUp'),
      testId: 'card-pop-up'
    },
    {
      icon: ToyHaulerIcon,
      title: t('rvTypes.toyHauler'),
      testId: 'card-toy-hauler'
    },
    {
      icon: TruckCamperIcon,
      title: t('rvTypes.truckCamper'),
      testId: 'card-truck-camper'
    },
    {
      icon: DestinationTrailerIcon,
      title: t('rvTypes.destinationTrailer'),
      testId: 'card-destination-trailer'
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

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
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
