import { useLanguage } from "@/hooks/use-language";

export function ExperienceSection() {
  const { t } = useLanguage();

  const stats = [
    {
      value: "150%",
      title: t('experienceSection.revenueIncrease.title'),
      description: t('experienceSection.revenueIncrease.description'),
      testId: 'stat-revenue'
    },
    {
      value: "85%",
      title: t('experienceSection.approvalRate.title'), 
      description: t('experienceSection.approvalRate.description'),
      testId: 'stat-approval'
    },
    {
      value: "48h",
      title: t('experienceSection.processingTime.title'),
      description: t('experienceSection.processingTime.description'),
      testId: 'stat-processing'
    }
  ];

  const manufacturers = [
    "Forest River",
    "Heartland", 
    "Jayco",
    "Keystone",
    "Winnebago",
    "Grand Design"
  ];

  return (
    <section id="experience" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground" data-testid="text-experience-title">
            {t('experienceSection.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-experience-description">
            {t('experienceSection.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card rounded-xl p-8 border border-border text-center hover-lift" data-testid={stat.testId}>
              <div className="text-4xl font-bold text-primary mb-2 stat-counter">{stat.value}</div>
              <h4 className="font-semibold mb-2">
                {stat.title}
              </h4>
              <p className="text-muted-foreground text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl p-8 border border-border">
          <h3 className="text-2xl font-semibold text-center mb-8" data-testid="text-manufacturers-title">
            {t('experienceSection.manufacturersTitle')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-center max-w-4xl mx-auto">
            {manufacturers.map((manufacturer, index) => (
              <div 
                key={index}
                className="h-16 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-sm font-semibold text-primary hover:from-primary/10 hover:to-primary/15 transition-all duration-300"
                data-testid={`manufacturer-${manufacturer.toLowerCase().replace(' ', '-')}`}
              >
                {manufacturer}
              </div>
            ))}
          </div>
          <p className="text-center text-primary mt-6 text-sm font-semibold animate-pulse">
            Plus more of North America's leading RV manufacturers and their top brands!
          </p>
        </div>
      </div>
    </section>
  );
}
