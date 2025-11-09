import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Gavel, ArrowRight, Sparkles } from "lucide-react";

export function LiveAuctionsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-white" id="live-auctions">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1 mb-4">
              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded font-semibold">NEW</span>
              <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-semibold" data-testid="badge-auctions-launch">Q3 2026</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" data-testid="text-auctions-section-title">
              {t('liveAuctions.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="text-auctions-section-subtitle">
              {t('liveAuctions.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Gavel className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold" data-testid="text-sellers-section-title">
                  {t('liveAuctions.benefits.sellers.title')}
                </h3>
              </div>
              <ul className="space-y-3">
                {(t('liveAuctions.benefits.sellers.points') as string[]).slice(0, 3).map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-2" data-testid={`list-seller-point-${index}`}>
                    <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Gavel className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold" data-testid="text-buyers-section-title">
                  {t('liveAuctions.benefits.buyers.title')}
                </h3>
              </div>
              <ul className="space-y-3">
                {(t('liveAuctions.benefits.buyers.points') as string[]).slice(0, 3).map((point: string, index: number) => (
                  <li key={index} className="flex items-start gap-2" data-testid={`list-buyer-point-${index}`}>
                    <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-6" data-testid="text-auctions-coming-soon">
              {t('liveAuctions.comingSoon')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/live-auctions">
                <Button size="lg" data-testid="button-learn-more-auctions">
                  {t('liveAuctions.cta.secondary')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/network-marketplace">
                <Button size="lg" variant="outline" data-testid="button-join-waitlist-auctions">
                  {t('liveAuctions.cta.primary')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
