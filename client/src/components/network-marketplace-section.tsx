import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Network, TrendingUp, Users, Sparkles } from "lucide-react";

export function NetworkMarketplaceSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <Badge 
            className="mb-6 bg-white/20 border-white/30 text-white px-3 py-1 text-xs animate-pulse backdrop-blur-sm" 
            variant="outline"
            data-testid="badge-coming-2026"
          >
            <Sparkles className="mr-2 h-3 w-3" />
            {t('networkMarketplace.badge')}
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-network-title">
            {t('networkMarketplace.title')}
          </h2>
          
          <p className="text-lg md:text-xl text-white/90 mb-8" data-testid="text-network-subtitle">
            {t('networkMarketplace.subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20" data-testid="card-network-feature-1">
              <Network className="h-10 w-10 mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Nationwide Network</h3>
              <p className="text-sm text-white/80">Connect with verified dealers across Canada</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20" data-testid="card-network-feature-2">
              <TrendingUp className="h-10 w-10 mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Boost Sales</h3>
              <p className="text-sm text-white/80">Move inventory faster and increase revenue</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20" data-testid="card-network-feature-3">
              <Users className="h-10 w-10 mb-3 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">Trusted Ecosystem</h3>
              <p className="text-sm text-white/80">Verified dealers with transparent transaction history</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild data-testid="button-network-join">
              <Link href="/network-marketplace">
                {t('networkMarketplace.cta.secondary')}
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-transparent border-white text-white hover:bg-white hover:text-primary"
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
