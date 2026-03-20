import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { CheckCircle } from "lucide-react";

type RvTypeKey = 'travelTrailers' | 'fifthWheels' | 'classA' | 'classC' | 'vanCamper' | 'smallTrailer' | 'popUp' | 'toyHauler' | 'truckCamper' | 'destinationTrailer';

const rvTypes: RvTypeKey[] = [
  'travelTrailers',
  'fifthWheels',
  'classA',
  'classC',
  'vanCamper',
  'smallTrailer',
  'popUp',
  'toyHauler',
  'truckCamper',
  'destinationTrailer',
];

export default function RvCoverage() {
  const { t } = useLanguage();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "RV Warranty Claims Processing — All RV Types",
    "provider": {
      "@type": "Organization",
      "name": "RV Claims Canada"
    },
    "description": "Expert warranty claims processing for all 10 RV types in Canada: Travel Trailers, Fifth Wheels, Class A & C Motorhomes, Van Campers, Small Trailers, Pop-Ups, Toy Haulers, Truck Campers, and Destination Trailers.",
    "url": "https://rvclaims.ca/rv-types"
  };

  return (
    <PageLayout
      seoTitle="RV Types Covered | Travel Trailers, Fifth Wheels, Class A & More | RV Claims Canada"
      seoDescription="Expert warranty claims processing for all 10 RV types in Canada. Travel Trailers, Fifth Wheels, Class A, Class C, Van Campers, Pop-Ups, Toy Haulers, Truck Campers, and Destination Trailers."
      seoKeywords="travel trailer warranty claims, fifth wheel claims, Class A motorhome claims, Class C RV claims, van camper warranty, pop-up trailer claims, toy hauler warranty, truck camper claims, destination trailer"
      canonical="/rv-types"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-6 border border-primary/20 px-3 py-1 text-xs" variant="outline">
            {t('rvCoveragePage.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl mx-auto">
            {t('rvCoveragePage.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('rvCoveragePage.description')}
          </p>
        </div>
      </section>

      {/* All 10 RV Types */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rvTypes.map((type) => (
              <div key={type} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <h3 className="text-xl font-semibold mb-3">{t(`rvCoveragePage.${type}.title`)}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{t(`rvCoveragePage.${type}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Manufacturers */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Supported Manufacturers</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            We process warranty claims across all 10 RV types for these manufacturers. Additional manufacturers are added regularly.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            {['Jayco', 'Forest River', 'Heartland', 'Columbia NW', 'Keystone', 'Midwest Auto'].map((mfr) => (
              <Badge key={mfr} variant="outline" className="px-4 py-2 text-sm border-primary/30">
                {mfr}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* What we process */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Every Claim Type. Every RV Type.</h2>
              <p className="text-muted-foreground mb-6">
                Regardless of which RV type your dealership carries, we process all five claim types for each:
              </p>
              <div className="space-y-3">
                {[
                  { label: 'DAF', desc: 'Dealer Authorization Form — unit arrival inspection' },
                  { label: 'PDI', desc: 'Pre-Delivery Inspection — before customer handoff' },
                  { label: 'Warranty', desc: 'Manufacturer warranty claims during coverage period' },
                  { label: 'Extended Warranty', desc: 'Claims under purchased protection plans' },
                  { label: 'Insurance', desc: 'Collision, weather, theft and liability claims' },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{label}</span>
                      <span className="text-muted-foreground text-sm ml-2">— {desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
              <h3 className="font-bold text-lg mb-4">{t('rvCoveragePage.ctaHeading')}</h3>
              <p className="text-muted-foreground mb-6">{t('rvCoveragePage.ctaBody')}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link href="/signup">{t('rvCoveragePage.ctaButton')}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/claims-processing">Our Claims Process</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
