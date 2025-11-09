import { ServiceBadge } from "@/components/service-badge";

interface PageHeroProps {
  title: string;
  description: string;
  badge?: string;
  badgeType?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
}

export function PageHero({ title, description, badge, badgeType }: PageHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-white to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center space-y-8">
          {badgeType ? (
            <div className="mb-4">
              <ServiceBadge quarter={badgeType} />
            </div>
          ) : badge ? (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              {badge}
            </div>
          ) : null}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}