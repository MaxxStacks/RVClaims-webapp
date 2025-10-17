import { useLanguage } from "@/hooks/use-language";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { SeoMeta } from "@/components/seo-meta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Gavel, Shield, Truck, FileCheck, Clock, TrendingUp, ArrowRight, Sparkles, Check, Tag } from "lucide-react";

export default function LiveAuctions() {
  const { t, language } = useLanguage();

  const iconMap: { [key: string]: any } = {
    Gavel,
    Shield,
    Truck,
    FileCheck,
    Clock,
    TrendingUp
  };

  return (
    <div className="min-h-screen bg-white">
      <SeoMeta 
        title={`${t('liveAuctions.title')} - RV Claims Canada`}
        description={t('liveAuctions.description')}
      />
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-medium mb-6" data-testid="badge-launch-date">
              <Sparkles className="w-3 h-3" />
              {t('liveAuctions.badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-auctions-title">
              {t('liveAuctions.title')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-4" data-testid="text-auctions-subtitle">
              {t('liveAuctions.subtitle')}
            </p>
            <p className="text-lg text-gray-500 mb-8 max-w-3xl mx-auto" data-testid="text-auctions-description">
              {t('liveAuctions.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/network-marketplace">
                <Button size="lg" className="text-base" data-testid="button-get-early-access">
                  {t('liveAuctions.cta.primary')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base" data-testid="button-watch-demo">
                {t('liveAuctions.cta.secondary')}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4" data-testid="text-info">
              {t('liveAuctions.cta.info')}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" data-testid="text-how-it-works-title">
            {t('liveAuctions.howItWorks.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {(t('liveAuctions.howItWorks.steps') as any[]).map((step: any, index: number) => (
              <Card key={index} className="border-2 relative" data-testid={`card-step-${index + 1}`}>
                <div className="absolute -top-4 left-6 bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold" data-testid={`badge-step-${step.number}`}>
                  {step.number}
                </div>
                <CardHeader className="pt-10">
                  <CardTitle className="text-xl" data-testid={`text-step-title-${index + 1}`}>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base" data-testid={`text-step-description-${index + 1}`}>
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Launch Promotion Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4" data-testid="badge-promotion">
                <Tag className="w-4 h-4" />
                {t('liveAuctions.pricing.badge')}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-pricing-title">
                {t('liveAuctions.pricing.title')}
              </h2>
              <p className="text-xl text-gray-600" data-testid="text-pricing-subtitle">
                {t('liveAuctions.pricing.subtitle')}
              </p>
            </div>

            <Card className="border-2 border-primary/20 shadow-2xl">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12">
                  {/* Left: Pricing */}
                  <div className="text-center md:text-left">
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
                        <span className="text-5xl md:text-6xl font-bold text-primary" data-testid="text-price">
                          {t('liveAuctions.pricing.price')}
                        </span>
                        <span className="text-xl text-gray-600" data-testid="text-per-month">
                          {t('liveAuctions.pricing.perMonth')}
                        </span>
                      </div>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="text-2xl text-gray-400 line-through" data-testid="text-regular-price">
                          {t('liveAuctions.pricing.regularPrice')}
                        </span>
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">50% OFF</span>
                      </div>
                    </div>
                    <p className="text-lg text-primary font-semibold mb-6" data-testid="text-lifetime-lock">
                      {t('liveAuctions.pricing.lifetimeLock')}
                    </p>
                    <Link href="/network-marketplace">
                      <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6" data-testid="button-lock-pricing">
                        {t('liveAuctions.pricing.cta')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <p className="text-sm text-gray-500 mt-4 font-medium" data-testid="text-deadline">
                      {t('liveAuctions.pricing.deadline')}
                    </p>
                  </div>

                  {/* Right: Features */}
                  <div>
                    <h3 className="text-xl font-bold mb-6" data-testid="text-includes">
                      {t('liveAuctions.pricing.includes')}
                    </h3>
                    <ul className="space-y-4">
                      {(t('liveAuctions.pricing.features') as string[]).map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-3" data-testid={`list-feature-${index}`}>
                          <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
                            <Check className="w-5 h-5" />
                          </div>
                          <span className="text-gray-700 text-lg">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-500 mt-6 italic" data-testid="text-additional-listings">
                      {t('liveAuctions.pricing.additionalListings')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" data-testid="text-benefits-title">
            {t('liveAuctions.benefits.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card data-testid="card-sellers">
              <CardHeader>
                <CardTitle className="text-2xl" data-testid="text-sellers-title">
                  {t('liveAuctions.benefits.sellers.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(t('liveAuctions.benefits.sellers.points') as string[]).map((point: string, index: number) => (
                    <li key={index} className="flex items-start gap-3" data-testid={`list-seller-benefit-${index}`}>
                      <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <span className="text-gray-600">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card data-testid="card-buyers">
              <CardHeader>
                <CardTitle className="text-2xl" data-testid="text-buyers-title">
                  {t('liveAuctions.benefits.buyers.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(t('liveAuctions.benefits.buyers.points') as string[]).map((point: string, index: number) => (
                    <li key={index} className="flex items-start gap-3" data-testid={`list-buyer-benefit-${index}`}>
                      <div className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <span className="text-gray-600">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" data-testid="text-features-title">
            {t('liveAuctions.features.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {(t('liveAuctions.features.items') as any[]).map((feature: any, index: number) => {
              const IconComponent = iconMap[feature.icon];
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors" data-testid={`card-feature-${index}`}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      {IconComponent && <IconComponent className="w-6 h-6 text-primary" />}
                    </div>
                    <CardTitle className="text-lg" data-testid={`text-feature-title-${index}`}>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base" data-testid={`text-feature-description-${index}`}>
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Auction Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" data-testid="text-types-title">
            {t('liveAuctions.types.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {(t('liveAuctions.types.categories') as any[]).map((category: any, index: number) => (
              <Card key={index} className="text-center" data-testid={`card-category-${index}`}>
                <CardHeader>
                  <CardTitle className="text-lg" data-testid={`text-category-title-${index}`}>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription data-testid={`text-category-description-${index}`}>
                    {category.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-coming-soon">
            {t('liveAuctions.comingSoon')}
          </h2>
          <Link href="/network-marketplace">
            <Button size="lg" variant="secondary" className="text-base" data-testid="button-join-waitlist">
              {t('liveAuctions.cta.primary')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
