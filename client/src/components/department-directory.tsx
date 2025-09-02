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
    <section className="py-16 bg-background" data-testid="section-department-directory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-directory-title">
            {t('departmentDirectory.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-directory-description">
            {t('departmentDirectory.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {departments.map((dept) => {
            const IconComponent = dept.icon;
            return (
              <div
                key={dept.key}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 hover:border-primary/20"
                data-testid={`card-department-${dept.key}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-2 leading-tight" data-testid={`text-department-name-${dept.key}`}>
                      {t(`departmentDirectory.departments.${dept.key}`)}
                    </h3>
                    <a
                      href={`mailto:${dept.email}`}
                      className="text-primary hover:text-primary/80 text-sm font-medium break-all transition-colors"
                      data-testid={`link-email-${dept.key}`}
                    >
                      {dept.email}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground" data-testid="text-directory-note">
            {t('departmentDirectory.note')}
          </p>
        </div>
      </div>
    </section>
  );
}