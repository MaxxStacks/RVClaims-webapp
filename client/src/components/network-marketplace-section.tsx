import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Network, TrendingUp, Users, Sparkles, ArrowRight } from "lucide-react";

export function NetworkMarketplaceSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge 
            className="mb-6 border border-primary/20 px-3 py-1 text-xs bg-primary/5 text-primary animate-pulse" 
            variant="outline"
            data-testid="badge-coming-2026"
          >
            <Sparkles className="mr-2 h-3 w-3" />
            {t('networkMarketplace.badge')}
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground" data-testid="text-network-title">
            {t('networkMarketplace.title')}
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8" data-testid="text-network-subtitle">
            {t('networkMarketplace.subtitle')}
          </p>
        </div>

        {/* Feature Cards with Border Design */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="relative group" data-testid="card-network-feature-1">
            <div className="absolute inset-0 bg-primary/5 rounded-lg transform group-hover:scale-105 transition-transform duration-300"></div>
            <div className="relative bg-white p-8 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Network className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-center">Nationwide Network</h3>
              <p className="text-sm text-muted-foreground text-center">Connect with verified dealers across Canada</p>
            </div>
          </div>

          <div className="relative group" data-testid="card-network-feature-2">
            <div className="absolute inset-0 bg-primary/5 rounded-lg transform group-hover:scale-105 transition-transform duration-300"></div>
            <div className="relative bg-white p-8 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-center">Boost Sales</h3>
              <p className="text-sm text-muted-foreground text-center">Move inventory faster and increase revenue</p>
            </div>
          </div>

          <div className="relative group" data-testid="card-network-feature-3">
            <div className="absolute inset-0 bg-primary/5 rounded-lg transform group-hover:scale-105 transition-transform duration-300"></div>
            <div className="relative bg-white p-8 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-center">Trusted Ecosystem</h3>
              <p className="text-sm text-muted-foreground text-center">Verified dealers with transparent transaction history</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center border border-border">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Be First to Access the Network</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join the waitlist for exclusive early access to the RVClaims Dealer Network Marketplace in 2026
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-network-join">
              <Link href="/network-marketplace" className="gap-2">
                {t('networkMarketplace.cta.secondary')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild 
              data-testid="button-network-contact"
            >
              <Link href="/contact">
                {t('networkMarketplace.cta.primary')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
