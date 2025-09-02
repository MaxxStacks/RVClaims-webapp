import { Phone, Mail, Users, Settings, CreditCard, Handshake, MessageCircle, UserPlus, Building, FileText, HeadphonesIcon } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function DepartmentDirectory() {
  const { t } = useLanguage();

  const departments = [
    {
      key: 'claims',
      icon: FileText,
      email: 'claims@rvclaims.ca'
    },
    {
      key: 'techSupport',
      icon: Settings,
      email: 'support@rvclaims.ca'
    },
    {
      key: 'warranty',
      icon: FileText,
      email: 'warranty@rvclaims.ca'
    },
    {
      key: 'roadside',
      icon: HeadphonesIcon,
      email: 'roadside@rvclaims.ca'
    },
    {
      key: 'sales',
      icon: Users,
      email: 'sales@rvclaims.ca'
    },
    {
      key: 'accountsPayable',
      icon: CreditCard,
      email: 'ap@rvclaims.ca'
    },
    {
      key: 'accountsReceivable',
      icon: CreditCard,
      email: 'ar@rvclaims.ca'
    },
    {
      key: 'partners',
      icon: Handshake,
      email: 'partners@rvclaims.ca'
    },
    {
      key: 'media',
      icon: MessageCircle,
      email: 'media@rvclaims.ca'
    },
    {
      key: 'dealerOnboarding',
      icon: UserPlus,
      email: 'onboarding@rvclaims.ca'
    },
    {
      key: 'dealerRelations',
      icon: Building,
      email: 'dealer@rvclaims.ca'
    },
    {
      key: 'general',
      icon: Mail,
      email: 'hello@rvclaims.ca'
    }
  ];

  return (
    <section className="py-16 bg-muted/50" data-testid="section-department-directory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-xl p-8 border border-border">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" data-testid="text-directory-title">
              {t('departmentDirectory.title')}
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto" data-testid="text-directory-description">
              {t('departmentDirectory.description')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {departments.map((dept) => {
              const IconComponent = dept.icon;
              return (
                <div
                  key={dept.key}
                  className="bg-background border border-border rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:border-primary/30 hover:bg-primary/5"
                  data-testid={`card-department-${dept.key}`}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-medium text-xs mb-1 leading-tight text-center" data-testid={`text-department-name-${dept.key}`}>
                      {t(`departmentDirectory.departments.${dept.key}`)}
                    </h3>
                    <a
                      href={`mailto:${dept.email}`}
                      className="text-primary hover:text-primary/80 text-xs font-medium transition-colors block break-all"
                      data-testid={`link-email-${dept.key}`}
                    >
                      {dept.email}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground" data-testid="text-directory-note">
              {t('departmentDirectory.note')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}