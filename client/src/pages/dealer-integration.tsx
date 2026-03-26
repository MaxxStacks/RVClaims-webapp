import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, FileCheck, Users, Settings, Upload, Laptop, Building2, ClipboardList } from "lucide-react";

const timeline = [
  {
    days: "Day 1–3",
    title: "Account Setup",
    icon: Settings,
    steps: [
      "Account created and dealer verified by operator team",
      "Subscription plan selected and billing activated",
      "Dealership profile — name, address, contact info, logo",
      "Initial manufacturer connection confirmed",
      "Staff access levels defined",
    ],
  },
  {
    days: "Day 4–7",
    title: "Platform Configuration",
    icon: Laptop,
    steps: [
      "Staff accounts created with assigned roles",
      "Branding and domain configuration (optional white-label)",
      "First unit added to inventory by VIN",
      "Claims workflow walkthrough with account manager",
      "Customer portal branded and configured",
    ],
  },
  {
    days: "Day 8–10",
    title: "Go Live",
    icon: Upload,
    steps: [
      "First claim created and submitted to operator",
      "Operator reviews and confirms claim meets standards",
      "Customer portal invitation sent to real customer",
      "Billing confirmed — first invoice reviewed",
      "90-day check-in call scheduled",
    ],
  },
];

const checklist = [
  { icon: Building2, item: "Account Setup", detail: "Dealership account verified and billing plan activated" },
  { icon: Settings, item: "Branding Configuration", detail: "Logo, brand colors, and domain configured for customer portal" },
  { icon: Users, item: "Staff Accounts", detail: "Owner and staff accounts created with correct roles and permissions" },
  { icon: FileCheck, item: "First Claim Submitted", detail: "At least one claim created, documented, and submitted to operator" },
  { icon: ClipboardList, item: "Customer Portal Setup", detail: "Customer portal activated and first invitation sent" },
];

const requirements = [
  "Valid business registration in Canada or the US",
  "Active RV dealership with manufacturer dealer agreements",
  "Designated dealer owner who will manage the Dealer Suite 360 account",
  "Business email domain for staff accounts",
  "Active subscription plan or pre-funded wallet balance",
];

export default function DealerIntegration() {
  return (
    <PageLayout
      seoTitle="Dealer Integration Guide | Dealer Suite 360"
      seoDescription="How to onboard your RV dealership onto Dealer Suite 360. Account setup, platform configuration, and go-live checklist."
      canonical="/dealer-integration"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Dealer Integration Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            From signup to your first processed claim in 10 days. This guide covers everything you need to integrate your dealership with Dealer Suite 360.
          </p>
          <Link href="/sign-up">
            <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
              Start Integration →
            </button>
          </Link>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Integration Timeline</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three structured phases get your dealership fully operational on the platform within 10 business days.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {timeline.map((phase, i) => (
              <div key={i} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <phase.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary uppercase tracking-wide">{phase.days}</div>
                    <h3 className="text-lg font-bold text-foreground">{phase.title}</h3>
                  </div>
                </div>
                <ul className="space-y-3">
                  {phase.steps.map((step, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Checklist */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Integration Checklist</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Five milestones to complete for a fully integrated dealership account. Your account manager tracks these with you.
            </p>
          </div>
          <div className="space-y-4">
            {checklist.map((item, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-foreground">{item.item}</div>
                  <div className="text-sm text-muted-foreground">{item.detail}</div>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <div className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-muted/50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Requirements</h2>
            <p className="text-muted-foreground">What you need to have in place before starting the integration process.</p>
          </div>
          <div className="bg-card rounded-xl p-8 border border-border">
            <ul className="space-y-4">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-4 pb-4 border-b border-border last:pb-0 last:border-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-sm">{i + 1}</span>
                  </div>
                  <span className="text-foreground">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 mb-8 text-lg">
            Create your account today. Our team will reach out within 24 hours to begin the onboarding process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-lg">
                Start Integration →
              </button>
            </Link>
            <Link href="/contact">
              <button className="border-2 border-white/40 text-white px-8 py-4 rounded-lg font-semibold hover:border-white/70 transition-colors">
                Talk to Our Team
              </button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
