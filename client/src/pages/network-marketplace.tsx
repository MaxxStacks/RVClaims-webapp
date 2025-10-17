import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { NotificationBar } from "@/components/notification-bar";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  TrendingUp, 
  Network, 
  Shield, 
  Zap, 
  DollarSign,
  BarChart3,
  RefreshCcw,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function NetworkMarketplace() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <NotificationBar />
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge 
              className="mb-6 border border-primary/20 px-3 py-1 text-xs animate-pulse" 
              variant="outline"
              data-testid="badge-coming-soon"
            >
              <Sparkles className="mr-2 h-3 w-3" />
              {t('networkMarketplace.badge')}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="text-marketplace-title">
              {t('networkMarketplace.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8" data-testid="text-marketplace-subtitle">
              {t('networkMarketplace.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild data-testid="button-join-network">
                <Link href="/contact">
                  {t('networkMarketplace.cta.primary')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                <Link href="/about">
                  {t('networkMarketplace.cta.secondary')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-purpose-title">
              {t('networkMarketplace.purpose.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto" data-testid="text-purpose-description">
              {t('networkMarketplace.purpose.description')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {(t('networkMarketplace.purpose.points') as string[]).map((point: string, index: number) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-4 rounded-lg bg-gray-50"
                data-testid={`card-purpose-${index}`}
              >
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selling Perks Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 border border-primary/20 px-3 py-1 text-xs" variant="outline">
              <RefreshCcw className="mr-2 h-3 w-3" />
              For Sellers
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-selling-title">
              {t('networkMarketplace.sellingPerks.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(t('networkMarketplace.sellingPerks.items') as any[]).map((item: any, index: number) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg border border-border hover:shadow-lg transition-shadow"
                data-testid={`card-selling-perk-${index}`}
              >
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buying Perks Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 border border-primary/20 px-3 py-1 text-xs" variant="outline">
              <DollarSign className="mr-2 h-3 w-3" />
              For Buyers
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-buying-title">
              {t('networkMarketplace.buyingPerks.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(t('networkMarketplace.buyingPerks.items') as any[]).map((item: any, index: number) => (
              <div 
                key={index}
                className="bg-gray-50 p-6 rounded-lg border border-border hover:shadow-lg transition-shadow"
                data-testid={`card-buying-perk-${index}`}
              >
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exclusive Benefits */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 border border-primary/20 px-3 py-1 text-xs" variant="outline">
              <Shield className="mr-2 h-3 w-3" />
              Members Only
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-exclusive-title">
              {t('networkMarketplace.exclusive.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(t('networkMarketplace.exclusive.points') as string[]).map((point: string, index: number) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg border border-primary/20 text-center"
                data-testid={`card-exclusive-${index}`}
              >
                <p className="text-gray-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Drivers */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-wow-title">
              {t('networkMarketplace.valueDrivers.title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(t('networkMarketplace.valueDrivers.points') as string[]).map((point: string, index: number) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-4"
                data-testid={`card-value-${index}`}
              >
                <Zap className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 font-medium">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Auctions Feature Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge 
              className="mb-4 border border-primary/20 px-3 py-1 text-xs" 
              variant="outline"
              data-testid="badge-auctions-coming"
            >
              <Sparkles className="mr-2 h-3 w-3" />
              {t('liveAuctions.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-auctions-marketplace-title">
              {t('liveAuctions.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8" data-testid="text-auctions-marketplace-subtitle">
              {t('liveAuctions.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {(t('liveAuctions.types.categories') as any[]).map((category: any, index: number) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-primary/50 transition-colors text-center"
                data-testid={`card-auction-category-${index}`}
              >
                <h3 className="font-semibold mb-2" data-testid={`text-auction-category-title-${index}`}>
                  {category.title}
                </h3>
                <p className="text-sm text-gray-600" data-testid={`text-auction-category-description-${index}`}>
                  {category.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" asChild data-testid="button-learn-auctions">
              <Link href="/live-auctions">
                {t('liveAuctions.cta.secondary')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-cta-footer">
            {t('networkMarketplace.footer')}
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild data-testid="button-footer-join">
              <Link href="/contact">
                {t('networkMarketplace.cta.primary')}
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild data-testid="button-footer-learn">
              <Link href="/about">
                {t('networkMarketplace.cta.secondary')}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
