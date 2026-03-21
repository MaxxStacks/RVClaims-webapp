import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Shield, DollarSign, Clock, CheckCircle2, Zap, Store, Sparkles, Lock
} from "lucide-react";

const featureIcons = [Shield, Lock, DollarSign, CheckCircle2, Clock, Zap, Shield, Store];

export default function NetworkMarketplace() {
  const { t } = useLanguage();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Dealer Suite 360 Network Marketplace",
    "provider": {
      "@type": "Organization",
      "name": "Dealer Suite 360"
    },
    "description": "Dealer-to-dealer RV inventory marketplace with Dealer Suite 360 escrow. Verified Canadian dealers only. Flat $250 commission per unit sold. Available 24/7.",
    "url": "https://dealersuite360.com/network-marketplace"
  };

  const sellingPerks = (t('networkMarketplace.sellingPerks.items') as unknown as { title: string; desc: string }[]);
  const buyingPerks = (t('networkMarketplace.buyingPerks.items') as unknown as { title: string; desc: string }[]);
  const escrowPoints = (t('networkMarketplace.exclusive.points') as unknown as string[]);
  const valueDrivers = (t('networkMarketplace.valueDrivers.points') as unknown as string[]);
  const howItWorks = (t('networkMarketplace.purpose.points') as unknown as string[]);

  return (
    <PageLayout
      seoTitle="RV Dealer Network Marketplace | Dealer-to-Dealer RV Inventory | Dealer Suite 360"
      seoDescription="The Dealer Suite 360 Network Marketplace connects verified Canadian RV dealers to buy and sell inventory 24/7. Flat $250 commission, Dealer Suite 360 escrow, verified dealers only."
      seoKeywords="RV dealer marketplace, dealer to dealer RV inventory, wholesale RV marketplace, Dealer Suite 360 marketplace, RV escrow service, Canadian RV dealers"
      canonical="/network-marketplace"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 border border-primary/20 px-3 py-1 text-xs animate-pulse" variant="outline">
              <Sparkles className="mr-2 h-3 w-3" />
              {t('networkMarketplace.badge')}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('networkMarketplace.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4">
              {t('networkMarketplace.subtitle')}
            </p>
            <p className="text-muted-foreground mb-10 max-w-3xl mx-auto">
              {t('networkMarketplace.heroBody')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">{t('networkMarketplace.cta.primary')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">{t('networkMarketplace.cta.secondary')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Numbers Strip */}
      <section className="py-12 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-1">$250</div>
              <div className="text-white/75 text-sm">Flat commission per sale</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-white/75 text-sm">Marketplace access</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">$499</div>
              <div className="text-white/75 text-sm">Annual membership</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">100%</div>
              <div className="text-white/75 text-sm">Escrow-backed transactions</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('networkMarketplace.purpose.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('networkMarketplace.purpose.description')}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {howItWorks.map((point: string, i: number) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">{t('networkMarketplace.sellingPerks.title')}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellingPerks.map((item, i: number) => {
              const Icon = featureIcons[i % featureIcons.length];
              return (
                <div key={i} className="bg-card p-6 rounded-xl border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Dealers List */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold">{t('networkMarketplace.buyingPerks.title')}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buyingPerks.map((item, i: number) => (
              <div key={i} className="bg-muted/30 p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Escrow Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Shield className="w-12 h-12 text-primary mb-6" />
              <h2 className="text-3xl font-bold mb-4">{t('networkMarketplace.exclusive.title')}</h2>
              <div className="space-y-4">
                {escrowPoints.map((point: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-8 border border-primary/20">
              <h3 className="font-bold text-lg mb-5">{t('networkMarketplace.membershipTitle')}</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-primary">{t('networkMarketplace.membershipPrice')}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6">{t('networkMarketplace.membershipBody')}</p>
              <div className="space-y-2">
                {valueDrivers.map((point: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6" asChild>
                <Link href="/contact">{t('networkMarketplace.cta.primary')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Auctions Feature */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 border border-primary/20 px-3 py-1 text-xs" variant="outline">
            <Sparkles className="mr-2 h-3 w-3" />
            Also Included with Membership
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Monthly Public Live Auctions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Marketplace members also get access to our monthly 48-hour public live auctions — list wholesale inventory for fast liquidation at competitive prices.
          </p>
          <Button variant="outline" asChild>
            <Link href="/live-auctions">Learn About Live Auctions →</Link>
          </Button>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('networkMarketplace.footer')}
          </h2>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">{t('networkMarketplace.cta.primary')}</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link href="/pricing">{t('networkMarketplace.cta.secondary')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
