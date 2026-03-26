import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Star } from "lucide-react";

const StarRating = ({ count = 5 }: { count?: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

const featured = {
  quote: "Dealer Suite 360 changed how we run our service department entirely. Before, we had a part-time admin spending 25+ hours a week just chasing claim paperwork. Now that same person manages 40% more claims in half the time — and our approval rate went from 71% to 94% in six months. The AI photo review alone has saved us from submitting dozens of claims that would have been denied on the spot.",
  name: "Michael Bouchard",
  title: "General Manager",
  dealership: "Bouchard RV & Trailer",
  location: "Edmonton, Alberta",
  stars: 5,
};

const claimsTestimonials = [
  {
    quote: "We were losing serious money on denied DAF and PDI claims — mostly because our photos weren't meeting manufacturer standards. The operator team caught every issue before submission. Our denial rate dropped by over 60% in the first three months.",
    name: "Sandra Kowalski",
    title: "Service Manager",
    dealership: "Prairie RV Centre",
    location: "Saskatoon, Saskatchewan",
    stars: 5,
  },
  {
    quote: "I was skeptical about outsourcing claims — I thought we'd lose control. The opposite happened. We have more visibility into every claim than we ever did when we were doing it ourselves. The portal shows us exactly where each claim is at all times.",
    name: "James Tran",
    title: "Dealer Principal",
    dealership: "Pacific RV Group",
    location: "Surrey, British Columbia",
    stars: 5,
  },
  {
    quote: "Warranty claim turnaround time dropped from an average of 18 days to under 7. That's money coming back to the dealership faster. For our Jayco and Forest River lines especially, the operator team knows the submission requirements cold.",
    name: "Robert Steinberg",
    title: "Parts & Service Director",
    dealership: "Great Lakes RV Superstore",
    location: "Grand Rapids, Michigan",
    stars: 5,
  },
];

const financingTestimonials = [
  {
    quote: "The financing module integration was seamless. Our F&I penetration on new units jumped from 48% to 63% within the first quarter. Having a structured workflow and real-time lender status visibility made a massive difference for our finance team.",
    name: "Lisa Fernandez",
    title: "Finance Director",
    dealership: "Sunshine RV of Florida",
    location: "Orlando, Florida",
    stars: 5,
  },
  {
    quote: "F&I revenue increased 35% year-over-year after we fully integrated the platform. The deal structuring tools and compliance documentation are built for Canada — we're not trying to adapt American software anymore.",
    name: "Pierre Lavoie",
    title: "F&I Manager",
    dealership: "Lavoie RV & Sports",
    location: "Quebec City, Quebec",
    stars: 5,
  },
];

const overallTestimonials = [
  {
    quote: "We evaluated four different platforms over six months before choosing Dealer Suite 360. Nothing else came close to the combination of claims expertise, platform depth, and bilingual support. Being able to run our Quebec and Ontario locations from one dashboard in French and English is worth the subscription alone.",
    name: "Alain Brossard",
    title: "Owner",
    dealership: "Brossard Camping & RV",
    location: "Laval, Quebec",
    stars: 5,
  },
  {
    quote: "What impressed me most was how quickly the onboarding went. We had our first claim submitted through the platform on day two. The team responded within hours every time I had a question. For a Texas dealership working with a Canadian platform, the service level has been outstanding.",
    name: "Dan Whitmore",
    title: "Owner / Operator",
    dealership: "Texas Trail RV",
    location: "Austin, Texas",
    stars: 5,
  },
];

function TestimonialCard({ t }: { t: typeof claimsTestimonials[0] }) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col">
      <StarRating count={t.stars} />
      <p className="text-muted-foreground leading-relaxed mt-4 mb-6 flex-1">"{t.quote}"</p>
      <div>
        <div className="font-bold text-foreground text-sm">{t.name}</div>
        <div className="text-sm text-muted-foreground">{t.title}, {t.dealership}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{t.location}</div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <PageLayout
      seoTitle="Customer Testimonials | Dealer Suite 360"
      seoDescription="Read what RV dealerships across North America are saying about Dealer Suite 360 — real results, real dealers, real impact."
      canonical="/testimonials"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            What Dealers Are Saying
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real results from real dealerships. These aren't marketing quotes — they're outcomes our dealers measure every quarter.
          </p>
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-10">
            <StarRating count={featured.stars} />
            <p className="text-foreground text-lg leading-relaxed mt-6 mb-8 italic">
              "{featured.quote}"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                {featured.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-foreground">{featured.name}</div>
                <div className="text-sm text-muted-foreground">{featured.title}, {featured.dealership}</div>
                <div className="text-xs text-muted-foreground">{featured.location}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "94%", label: "Average approval rate on processed claims" },
              { value: "60%", label: "Reduction in claim denial rates" },
              { value: "35%", label: "Average F&I revenue increase" },
              { value: "7 days", label: "Average claim turnaround time" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claims Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Claims Processing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {claimsTestimonials.map((t, i) => <TestimonialCard key={i} t={t} />)}
          </div>
        </div>
      </section>

      {/* Financing Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Financing & F&I</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {financingTestimonials.map((t, i) => <TestimonialCard key={i} t={t} />)}
          </div>
        </div>
      </section>

      {/* Overall Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Overall Platform</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {overallTestimonials.map((t, i) => <TestimonialCard key={i} t={t} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join These Successful Dealers</h2>
          <p className="text-white/80 mb-8 text-lg">
            Get started today — no credit card required and free onboarding consultation included.
          </p>
          <Link href="/sign-up">
            <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-lg">
              Get Started →
            </button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
