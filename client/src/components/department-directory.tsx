import { useLanguage } from "@/hooks/use-language";

export function DepartmentDirectory() {
  const { t } = useLanguage();

  const departments = [
    { key: 'claims', email: 'claims@rvclaims.ca' },
    { key: 'techSupport', email: 'support@rvclaims.ca' },
    { key: 'warranty', email: 'warranty@rvclaims.ca' },
    { key: 'roadside', email: 'roadside@rvclaims.ca' },
    { key: 'sales', email: 'sales@rvclaims.ca' },
    { key: 'accountsPayable', email: 'ap@rvclaims.ca' },
    { key: 'accountsReceivable', email: 'ar@rvclaims.ca' },
    { key: 'partners', email: 'partners@rvclaims.ca' },
    { key: 'media', email: 'media@rvclaims.ca' },
    { key: 'dealerOnboarding', email: 'onboarding@rvclaims.ca' },
    { key: 'dealerRelations', email: 'dealer@rvclaims.ca' },
    { key: 'general', email: 'hello@rvclaims.ca' }
  ];

  return (
    <section className="py-12 bg-background" data-testid="section-department-directory">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3" data-testid="text-directory-title">
            {t('departmentDirectory.title')}
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto" data-testid="text-directory-description">
            {t('departmentDirectory.description')}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3">
            {departments.map((dept) => (
              <div
                key={dept.key}
                className="flex justify-between items-center py-2 border-b border-border/30 last:border-b-0 hover:bg-primary/5 px-3 -mx-3 rounded transition-colors"
                data-testid={`row-department-${dept.key}`}
              >
                <span 
                  className="font-medium text-foreground text-sm" 
                  data-testid={`text-department-name-${dept.key}`}
                >
                  {t(`departmentDirectory.departments.${dept.key}`)}
                </span>
                <a
                  href={`mailto:${dept.email}`}
                  className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  data-testid={`link-email-${dept.key}`}
                >
                  {dept.email}
                </a>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground" data-testid="text-directory-note">
              {t('departmentDirectory.note')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}