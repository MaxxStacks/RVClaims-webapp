import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { GraduationCap, CheckCircle, Calendar, Users, BookOpen, Award, Play } from "lucide-react";

const onboardingTimeline = [
  {
    days: "Day 1–3",
    title: "Account Setup",
    steps: [
      "Account created and verified by operator",
      "First login and password setup",
      "Staff accounts created",
      "Branding and dealership profile configured",
      "Billing plan selected and activated",
    ],
  },
  {
    days: "Day 4–7",
    title: "Platform Training",
    steps: [
      "1-on-1 onboarding call with your account manager",
      "Live platform walkthrough — all modules",
      "Claims submission training with sample claim",
      "Staff training session (up to 5 staff)",
      "Q&A and workflow customization",
    ],
  },
  {
    days: "Day 8–10",
    title: "Go Live",
    steps: [
      "First real claim submitted through the platform",
      "First unit added to your inventory",
      "Customer portal invitation sent to a real customer",
      "Confirm billing is working correctly",
      "90-day check-in call scheduled",
    ],
  },
];

const trainingModules = [
  {
    icon: BookOpen,
    title: "Claims Processing Fundamentals",
    description: "Everything your service advisors and warranty administrators need to create, submit, and track warranty claims effectively. Covers all five claim types and manufacturer-specific requirements.",
    duration: "2 hours",
  },
  {
    icon: Users,
    title: "Customer Portal Management",
    description: "How to invite customers to their portal, manage their view of claim statuses, and use the customer-facing tools to improve communication and reduce phone calls.",
    duration: "1 hour",
  },
  {
    icon: Award,
    title: "Billing & Financial Management",
    description: "For dealer owners and office managers. Covers invoice review, wallet top-ups, subscription management, and how to read your monthly revenue reports.",
    duration: "1.5 hours",
  },
  {
    icon: GraduationCap,
    title: "Advanced Claims Strategy",
    description: "For dealers who want to go deeper. Photo documentation best practices, FRC code optimization, denial pattern analysis, and working effectively with the operator team.",
    duration: "2.5 hours",
  },
];

export default function DealerTraining() {
  return (
    <PageLayout
      seoTitle="Dealer Training & Onboarding | Dealer Suite 360"
      seoDescription="Structured onboarding and training for RV dealerships joining Dealer Suite 360. Go live in 10 days with our guided onboarding program."
      canonical="/dealer-training"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Dealer Training & Onboarding
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Go from signup to your first processed claim in 10 days. Our guided onboarding program and structured training modules get your whole team up to speed — fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                Schedule Training →
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="border-2 border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:border-primary/40 transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Onboarding Timeline */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Your First 10 Days</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A structured onboarding sequence that gets you live quickly without overwhelming your team.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {onboardingTimeline.map((phase, i) => (
              <div key={i} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-primary uppercase tracking-wide">{phase.days}</div>
                    <h3 className="text-lg font-bold text-foreground">{phase.title}</h3>
                  </div>
                </div>
                <ul className="space-y-2.5">
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

      {/* Training Modules */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Training Modules</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Structured learning tracks for different roles in your dealership. Live training with your account manager, plus self-paced video modules.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {trainingModules.map((mod, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <mod.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{mod.title}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{mod.duration}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Placeholders */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Platform Walkthrough Videos</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Short video walkthroughs for each key platform feature. Available to all active subscribers.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Platform Walkthrough — Dealer Portal Overview",
              "Creating and Submitting Your First Claim",
              "Managing Your Customer Portal",
            ].map((title, i) => (
              <div key={i} className="bg-muted/50 rounded-xl border border-border overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Play className="w-6 h-6 text-primary ml-0.5" />
                    </div>
                    <div className="text-xs text-muted-foreground">Available after account activation</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm font-semibold text-foreground">{title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Award className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Dealer Certification Program</h2>
          <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
            Complete all four training modules and your first 10 processed claims to earn the Dealer Suite 360 Certified status. Certified dealers receive priority operator response times, dedicated account manager access, and a certification badge for your dealership listings.
          </p>
          <div className="bg-card border border-border rounded-xl p-6 inline-block">
            <div className="text-sm text-muted-foreground">Certification Program launching Q2 2026</div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
