import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Search, BookOpen, FileText, DollarSign, Shield, Store, CreditCard, HelpCircle } from "lucide-react";

const categories = [
  {
    icon: BookOpen,
    title: "Getting Started",
    articles: [
      "How to create your dealer account",
      "Understanding the onboarding process",
      "Adding your first unit to the platform",
      "Setting up staff accounts and permissions",
    ],
  },
  {
    icon: FileText,
    title: "Claims Processing",
    articles: [
      "How to create a new claim",
      "Understanding DAF vs PDI vs Warranty claims",
      "Photo requirements by claim type",
      "How to add FRC lines to a claim",
      "Reading claim status updates",
    ],
  },
  {
    icon: DollarSign,
    title: "Financing",
    articles: [
      "How to submit a financing application",
      "Understanding lender decision statuses",
      "Financing documentation requirements",
      "How to track a deal through approval",
    ],
  },
  {
    icon: Shield,
    title: "Warranty Management",
    articles: [
      "Extended warranty plan options",
      "How to attach a warranty plan to a unit",
      "Making a warranty claim as a customer",
      "Understanding warranty coverage terms",
    ],
  },
  {
    icon: Store,
    title: "Marketplace",
    articles: [
      "How to list a unit in the marketplace",
      "Understanding auction vs. direct sale",
      "Marketplace verification requirements",
      "Bid management and auction rules",
    ],
  },
  {
    icon: CreditCard,
    title: "Account & Billing",
    articles: [
      "Understanding Plan A vs Plan B billing",
      "How to top up your pre-funded wallet",
      "Reading and understanding your invoice",
      "Updating your payment method",
      "Requesting a billing adjustment",
    ],
  },
];

export default function KnowledgeBase() {
  return (
    <PageLayout
      seoTitle="Knowledge Base | Dealer Suite 360"
      seoDescription="Find answers to your Dealer Suite 360 questions. Browse articles on claims, financing, billing, marketplace, and platform setup."
      canonical="/knowledge-base"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Knowledge Base
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Everything you need to use Dealer Suite 360 effectively — organized by topic.
          </p>
          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-4 border border-border rounded-xl bg-background text-foreground text-base focus:outline-none focus:border-primary shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <cat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{cat.title}</h3>
                </div>
                <ul className="space-y-2.5">
                  {cat.articles.map((article, j) => (
                    <li key={j} className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-default flex items-start gap-2">
                      <span className="text-muted-foreground/40 mt-0.5">›</span>
                      {article}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-xl p-10 border border-border text-center">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Can't Find What You Need?</h2>
            <p className="text-muted-foreground mb-8">
              Our support team is available Monday–Friday 8am–6pm EST. We typically respond within 2 hours during business hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Contact Support
                </button>
              </Link>
              <Link href="/help-center">
                <button className="border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:border-primary/40 transition-colors">
                  Visit Help Center
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
