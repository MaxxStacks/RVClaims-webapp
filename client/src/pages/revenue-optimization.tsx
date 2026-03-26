import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { TrendingUp, BarChart3, Clock, DollarSign, CheckCircle, Target, LineChart, Award } from "lucide-react";

export default function RevenueOptimization() {
  return (
    <PageLayout
      seoTitle="Revenue Optimization for RV Dealerships | Dealer Suite 360"
      seoDescription="AI-powered tools and expert strategies to maximize claims approval rates, F&I penetration, and dealership revenue. Built for RV dealerships."
      canonical="/revenue-optimization"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Revenue Optimization —<br />Tools Built to Grow Your Bottom Line
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Every uncollected claim dollar, every F&I product not presented, every warranty plan not sold — it adds up. Dealer Suite 360 systematically closes those gaps.
          </p>
          <Link href="/contact">
            <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
              Start Optimizing Your Revenue →
            </button>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "40%", label: "Faster average claim processing" },
              { value: "25%", label: "Higher F&I product penetration" },
              { value: "15+", label: "Years of RV claims expertise" },
              { value: "6+", label: "Manufacturer portals integrated" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Optimization Areas */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Four Areas We Optimize</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Revenue leaks in dealerships fall into predictable categories. We've built tools and processes to close each one.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Target,
                title: "Claims Approval Rate Improvement",
                body: "Our expert team reviews every claim line before manufacturer submission. AI photo quality analysis flags documentation issues before they cause denials. We know what each manufacturer looks for — and we prepare submissions to match those standards exactly.",
                points: [
                  "Pre-submission claim readiness scoring",
                  "Photo quality AI analysis per claim line",
                  "Manufacturer-specific FRC code matching",
                  "Denial pattern tracking and prevention",
                ],
              },
              {
                icon: DollarSign,
                title: "Warranty Plan Margin Optimization",
                body: "Extended warranty and service plan sales are high-margin revenue streams that many dealers underutilize. We provide tools to present the right plan at the right time, with clear coverage comparisons and automated follow-up for unconverted leads.",
                points: [
                  "Dynamic plan presentation based on unit type",
                  "Coverage gap analysis per customer",
                  "Automated follow-up for pending deals",
                  "Commission tracking and reporting",
                ],
              },
              {
                icon: TrendingUp,
                title: "F&I Penetration Increase",
                body: "Finance and insurance product penetration is one of the highest-leverage opportunities in dealership revenue. Our F&I module provides deal structuring tools, compliance workflows, and product presentation support that consistently drives penetration above industry averages.",
                points: [
                  "Deal structuring and payment calculator",
                  "Product presentation workflows",
                  "Lender integration and approval optimization",
                  "Menu selling tools for consistent presentation",
                ],
              },
              {
                icon: Clock,
                title: "Time Savings That Compound",
                body: "Dealer staff spend an average of 25–40 hours per week on warranty administration. By moving that work to our platform and team, those hours are freed for customer-facing activities that directly generate revenue.",
                points: [
                  "Complete claim handling — end to end",
                  "Automated status updates to dealer portal",
                  "Parts order tracking integrated with claims",
                  "Billing and invoicing automation",
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

      {/* Tools Overview */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">The Analytics You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              You can't optimize what you can't measure. Every dealer portal includes real-time revenue analytics and benchmarks.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Analytics Dashboard",
                body: "Live view of claims volume, approval rates, denial reasons, average processing time, and monthly revenue impact — updated in real time as claims move through the pipeline.",
              },
              {
                icon: LineChart,
                title: "Revenue Reports",
                body: "Monthly and quarterly revenue reports showing claims revenue recovered, F&I income, warranty plan sales, and parts margins. Exportable to PDF for management review.",
              },
              {
                icon: Award,
                title: "Benchmark Comparisons",
                body: "See how your dealership's approval rate, F&I penetration, and warranty plan attach rate compare to anonymized platform averages across your region and unit type.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How quickly will I see revenue improvements after onboarding?",
                a: "Most dealers see measurable improvement in their claims approval rate within the first 30 days. F&I and warranty plan improvements typically show up in monthly reports after the first full billing cycle. Revenue impact varies by dealership size, unit volume, and starting baseline.",
              },
              {
                q: "Do I need to change my existing DMS or software?",
                a: "No. Dealer Suite 360 works alongside your existing DMS. Our platform handles claims processing, billing, and reporting independently. API integration for data sync is available for dealers who want tighter system integration.",
              },
              {
                q: "How does the claims approval rate improvement actually work?",
                a: "Our operator team reviews every claim line before it goes to the manufacturer. We check photo quality, FRC code accuracy, description completeness, and compliance with that specific manufacturer's submission requirements. Issues are flagged and corrected before submission — not after denial.",
              },
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

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Recover Lost Revenue?</h2>
          <p className="text-white/80 mb-8 text-lg">
            Schedule a free consultation and we'll show you exactly where your dealership is leaving money on the table.
          </p>
          <Link href="/contact">
            <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-lg">
              Start Optimizing Your Revenue →
            </button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
