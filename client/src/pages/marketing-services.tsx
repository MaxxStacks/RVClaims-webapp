import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Megaphone, Search, Share2, Mail, BarChart3, CheckCircle } from "lucide-react";

export default function MarketingServices() {
  return (
    <PageLayout
      seoTitle="Digital Marketing Services for RV Dealerships | Dealer Suite 360"
      seoDescription="Lead generation, SEO, PPC, social media, and email marketing built specifically for RV dealerships. Included with the Professional plan."
      canonical="/marketing-services"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Megaphone className="w-4 h-4" />
            Launching Q3 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Marketing Services<br />That Drive Sales
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Most RV dealerships rely on manufacturer co-op programs and walk-in traffic. We give you a modern digital marketing engine — designed for the RV market, built into the platform you already use.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                Start Generating Leads →
              </button>
            </Link>
            <Link href="/pricing">
              <button className="border-2 border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:border-primary/40 transition-colors">
                View Pricing
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Four Marketing Channels, One Platform</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each channel is managed by our team, tracked in your dashboard, and optimized for the RV buyer's purchase journey.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Search,
                title: "Lead Generation",
                body: "Capture in-market RV buyers through search, display, and retargeting campaigns. Leads are delivered to your CRM in real time with source attribution — so you know which campaign is driving which sale.",
                points: [
                  "Landing pages optimized for RV searches",
                  "Lead form design and A/B testing",
                  "CRM integration for instant lead delivery",
                  "Lead quality scoring and filtering",
                ],
              },
              {
                icon: BarChart3,
                title: "Digital Advertising (SEO/PPC)",
                body: "Get found when buyers search for RVs in your market. We manage your Google Ads and organic search presence — from keyword strategy to ad copy to bid optimization.",
                points: [
                  "Google Ads campaign management",
                  "Local SEO optimization",
                  "Inventory-specific ad campaigns",
                  "Monthly performance reporting",
                ],
              },
              {
                icon: Share2,
                title: "Social Media Management",
                body: "RV buyers spend significant time on social media researching their purchase. We create and schedule content that builds your dealership's brand, showcases inventory, and drives engagement.",
                points: [
                  "Facebook and Instagram content creation",
                  "Inventory posts and new arrival announcements",
                  "Customer review management",
                  "Paid social campaigns for in-market audiences",
                ],
              },
              {
                icon: Mail,
                title: "Email Campaigns",
                body: "Your customer database is a revenue asset. We design and send campaigns that bring previous buyers back for trade-ins, upgrades, service appointments, and accessory purchases.",
                points: [
                  "Database segmentation by unit type and purchase date",
                  "Seasonal campaign calendar",
                  "Trade-in valuation email sequences",
                  "Service department appointment reminders",
                ],
              },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-5">{item.body}</p>
                <ul className="space-y-2">
                  {item.points.map((p, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Tracking */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Track Every Dollar You Spend</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Marketing without attribution is just guessing. Every campaign we run for your dealership is tracked from click to sale — so you know your cost per lead, cost per sale, and return on every marketing dollar.
              </p>
              <ul className="space-y-3">
                {[
                  "Real-time lead dashboard inside your dealer portal",
                  "Source attribution for every lead",
                  "Campaign spend vs. revenue reporting",
                  "Monthly performance reviews with recommendations",
                  "Industry benchmark comparisons",
                ].map((p, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-primary mb-2">$199</div>
                <div className="text-muted-foreground text-sm">/month</div>
                <div className="text-foreground font-semibold mt-1">Marketing Services Module</div>
              </div>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Starting price. Custom packages available based on ad spend budget and campaign scope.
              </p>
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 text-center">
                Included with the Professional plan — no additional charge for platform subscribers.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is marketing services included in my subscription?", a: "Marketing services are included in the Professional plan at no additional cost for core campaign management. Ad spend budgets are managed separately and billed directly to your preferred payment method. Custom packages with higher ad spend are available on request." },
              { q: "Do I need to provide content and photos?", a: "We work with what you have. Your inventory photos, dealership photos, and brand assets are the starting point. We can also coordinate professional photography sessions through our marketing partner network if you need to upgrade your visual content." },
              { q: "How long until I see results from marketing campaigns?", a: "PPC campaigns typically generate leads within the first week. SEO results build over 3–6 months as your organic rankings improve. Email campaigns produce results immediately on send. Social media audience building is a 3–6 month investment before significant organic reach develops." },
              { q: "Can I pause or adjust campaigns at any time?", a: "Yes. You have full visibility into campaign spending and can pause, adjust budget, or change campaign focus at any time through your dealer portal or by contacting your account manager." },
            ].map((item, i) => (
              <details key={i} className="border border-border rounded-lg bg-card">
                <summary className="p-4 cursor-pointer font-medium hover:text-primary list-none flex justify-between items-center">
                  {item.q}<span className="text-muted-foreground text-lg">+</span>
                </summary>
                <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
