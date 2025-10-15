import { useLanguage } from "@/hooks/use-language";
import classAIcon from "@assets/Class A_1756847838643.png";
import classCIcon from "@assets/Class C_1756847838644.png";
import destinationTrailerIcon from "@assets/Destination Trailer_1756847838644.png";
import fifthWheelIcon from "@assets/Fifth Wheel_1756847838645.png";
import popUpIcon from "@assets/Pop Up_1756847838645.png";
import smallTrailerIcon from "@assets/Small Trailer_1756847838646.png";
import toyHaulerIcon from "@assets/Toy Hauler_1756847838646.png";
import travelTrailerIcon from "@assets/Travel Trailer_1756847838647.png";
import truckCamperIcon from "@assets/Truck Camper_1756847838647.png";
import vanCamperIcon from "@assets/Van Camper_1756847838648.png";

// Custom icon components with consistent styling
const iconStyle = {
  width: '90px',
  height: '90px', 
  imageRendering: 'crisp-edges' as const,
  objectFit: 'contain' as const
};

const TravelTrailerIcon = () => (
  <img src={travelTrailerIcon} alt="Travel Trailer" style={iconStyle} />
);

const FifthWheelIcon = () => (
  <img src={fifthWheelIcon} alt="Fifth Wheel" style={iconStyle} />
);

const ClassCIcon = () => (
  <img src={classCIcon} alt="Class C" style={iconStyle} />
);

const VanCamperIcon = () => (
  <img src={vanCamperIcon} alt="Van Camper" style={iconStyle} />
);

const ClassAIcon = () => (
  <img src={classAIcon} alt="Class A" style={iconStyle} />
);

const SmallTrailerIcon = () => (
  <img src={smallTrailerIcon} alt="Small Trailer" style={iconStyle} />
);

const PopUpIcon = () => (
  <img src={popUpIcon} alt="Pop Up" style={iconStyle} />
);

const ToyHaulerIcon = () => (
  <img src={toyHaulerIcon} alt="Toy Hauler" style={iconStyle} />
);

const TruckCamperIcon = () => (
  <img src={truckCamperIcon} alt="Truck Camper" style={iconStyle} />
);

const DestinationTrailerIcon = () => (
  <img src={destinationTrailerIcon} alt="Destination Trailer" style={iconStyle} />
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
      icon: ClassCIcon,
      title: t('rvTypes.classC'),
      testId: 'card-class-c'
    },
    {
      icon: VanCamperIcon,
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
      icon: PopUpIcon,
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
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl px-6 py-16 sm:px-12 sm:py-20">
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
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <type.icon />
              </div>
              <h4 className="font-medium text-sm">
                {type.title}
              </h4>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}