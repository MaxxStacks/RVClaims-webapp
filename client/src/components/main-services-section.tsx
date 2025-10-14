import { Shield, DollarSign, FileText, TrendingUp, Check } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";

export function MainServicesSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-20">
          <div className="inline-block">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide uppercase border border-primary/20">
              {t('mainServices.badge')}
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground" data-testid="text-main-services-title">
            {t('mainServices.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-main-services-description">
            {t('mainServices.description')}
          </p>
        </div>

        {/* Claims Processing - Full Width Featured */}
        <div className="mb-20 bg-gradient-to-br from-primary/5 to-background rounded-2xl p-8 lg:p-12 border-2 border-primary/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Shield className="text-primary" size={28} />
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-foreground">
                  {t('mainServices.claims.title')}
                </h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('mainServices.claims.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-primary" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.claims.feature1')}
                    </h4>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-primary" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.claims.feature2')}
                    </h4>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-primary" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.claims.feature3')}
                    </h4>
                  </div>
                </div>
              </div>
              <Link href="/claims-processing">
                <Button size="lg" className="mt-4" data-testid="button-claims-cta">
                  {t('mainServices.claims.cta')}
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1554224154-26032ffc0d07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Claims processing and management" 
                className="rounded-xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* Financing Services - Reverse Layout */}
        <div className="mb-20 bg-gradient-to-br from-blue-500/5 to-background rounded-2xl p-8 lg:p-12 border-2 border-blue-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1554224154-22dec7ec8818?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Financing and lending solutions" 
                className="rounded-xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tl from-blue-500/20 to-transparent rounded-xl"></div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-blue-600" size={28} />
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-foreground">
                  {t('mainServices.financing.title')}
                </h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('mainServices.financing.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-blue-600" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.financing.feature1')}
                    </h4>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-blue-600" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.financing.feature2')}
                    </h4>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-blue-600" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.financing.feature3')}
                    </h4>
                  </div>
                </div>
              </div>
              <Link href="/financing">
                <Button size="lg" className="mt-4 bg-blue-600 hover:bg-blue-700" data-testid="button-financing-cta">
                  {t('mainServices.financing.cta')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Warranty & Extended Service */}
        <div className="mb-20 bg-gradient-to-br from-indigo-500/5 to-background rounded-2xl p-8 lg:p-12 border-2 border-indigo-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                  <FileText className="text-indigo-600" size={28} />
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-foreground">
                  {t('mainServices.warranty.title')}
                </h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('mainServices.warranty.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-indigo-600" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.warranty.feature1')}
                    </h4>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-indigo-600" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.warranty.feature2')}
                    </h4>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-indigo-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-indigo-600" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.warranty.feature3')}
                    </h4>
                  </div>
                </div>
              </div>
              <Link href="/warranty-extended-service">
                <Button size="lg" className="mt-4 bg-indigo-600 hover:bg-indigo-700" data-testid="button-warranty-cta">
                  {t('mainServices.warranty.cta')}
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Warranty and protection plans" 
                className="rounded-xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>

        {/* F&I Services - Reverse Layout */}
        <div className="bg-gradient-to-br from-violet-500/5 to-background rounded-2xl p-8 lg:p-12 border-2 border-violet-500/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="F&I services and compliance" 
                className="rounded-xl shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-tl from-violet-500/20 to-transparent rounded-xl"></div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 bg-violet-500/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-violet-600" size={28} />
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-foreground">
                  {t('mainServices.fiServices.title')}
                </h3>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t('mainServices.fiServices.description')}
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-violet-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-violet-600" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.fiServices.feature1')}
                    </h4>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-violet-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-violet-600" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.fiServices.feature2')}
                    </h4>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-violet-500/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="text-violet-600" size={14} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {t('mainServices.fiServices.feature3')}
                    </h4>
                  </div>
                </div>
              </div>
              <Link href="/fi-services">
                <Button size="lg" className="mt-4 bg-violet-600 hover:bg-violet-700" data-testid="button-fi-cta">
                  {t('mainServices.fiServices.cta')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
