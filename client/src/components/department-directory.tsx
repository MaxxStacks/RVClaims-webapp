import { Mail, Phone } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function DepartmentDirectory() {
  const { t } = useLanguage();

  const departmentGroups = [
    {
      title: t('departmentDirectory.groups.operations'),
      departments: [
        { key: 'claims', email: 'claims@rvclaims.ca' },
        { key: 'warranty', email: 'warranty@rvclaims.ca' },
        { key: 'techSupport', email: 'support@rvclaims.ca' },
        { key: 'roadside', email: 'roadside@rvclaims.ca' },
        { key: 'network', email: 'network@rvclaims.ca' }
      ]
    },
    {
      title: t('departmentDirectory.groups.business'),
      departments: [
        { key: 'sales', email: 'sales@rvclaims.ca' },
        { key: 'dealerRelations', email: 'dealer@rvclaims.ca' },
        { key: 'dealerOnboarding', email: 'onboarding@rvclaims.ca' },
        { key: 'partners', email: 'partners@rvclaims.ca' },
        { key: 'development', email: 'development@rvclaims.ca' }
      ]
    },
    {
      title: t('departmentDirectory.groups.finance'),
      departments: [
        { key: 'accountsPayable', email: 'ap@rvclaims.ca' },
        { key: 'accountsReceivable', email: 'ar@rvclaims.ca' },
        { key: 'financing', email: 'financing@rvclaims.ca' }
      ]
    },
    {
      title: t('departmentDirectory.groups.corporate'),
      departments: [
        { key: 'media', email: 'media@rvclaims.ca' },
        { key: 'general', email: 'hello@rvclaims.ca' },
        { key: 'legal', email: 'legal@rvclaims.ca' }
      ]
    }
  ];

  return (
    <section className="py-16 bg-background" data-testid="section-department-directory">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" data-testid="text-directory-title">
            {t('departmentDirectory.title')}
          </h2>
          <p className="text-muted-foreground" data-testid="text-directory-description">
            {t('departmentDirectory.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {departmentGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 border-b border-border pb-2">
                {group.title}
              </h3>
              <div className="space-y-3">
                {group.departments.map((dept) => (
                  <div key={dept.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <span className="font-medium text-sm" data-testid={`text-department-name-${dept.key}`}>
                      {t(`departmentDirectory.departments.${dept.key}`)}
                    </span>
                    <a
                      href={`mailto:${dept.email}`}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                      data-testid={`link-email-${dept.key}`}
                    >
                      <Mail className="w-4 h-4" />
                      {dept.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-primary">General Inquiries</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            For urgent matters or general support, call our main line:
          </p>
          <a href="tel:8882453204" className="text-lg font-bold text-primary hover:text-primary/80 transition-colors">
            (888) 245-3204
          </a>
          <p className="text-xs text-muted-foreground mt-2">
            Available Monday-Friday, 8:00 AM - 6:00 PM EST
          </p>
        </div>
      </div>
    </section>
  );
}