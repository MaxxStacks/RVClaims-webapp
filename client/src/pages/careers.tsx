import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { MapPin, Briefcase, Users, TrendingUp, Laptop, Heart } from "lucide-react";

const positions = [
  {
    title: "Account Manager — Dealer Relations",
    department: "Client Success",
    location: "Remote / Canada",
    type: "Full-Time",
    description: "Build and manage long-term relationships with our dealer clients. You'll be the primary point of contact for a portfolio of dealerships, ensuring they get maximum value from the platform, resolve issues quickly, and expand their use of our service modules over time.",
  },
  {
    title: "Sales Representative — New Business Development",
    department: "Sales",
    location: "Remote / Canada",
    type: "Full-Time",
    description: "Drive new dealer acquisition across Canada and the US. You'll prospect, qualify, and close RV dealerships as new Dealer Suite 360 clients. Deep knowledge of the RV industry is a strong asset — you'll be selling to owners and GMs who know their business.",
  },
  {
    title: "Marketing Coordinator",
    department: "Marketing",
    location: "Remote / Canada",
    type: "Full-Time",
    description: "Own our content, social media, and email marketing programs. You'll produce thought leadership content, manage campaigns, coordinate webinars, and help position Dealer Suite 360 as the go-to platform brand for RV dealerships in North America.",
  },
  {
    title: "Customer Success Specialist",
    department: "Client Success",
    location: "Remote / Canada",
    type: "Full-Time",
    description: "Support dealers through onboarding and day-to-day platform use. You'll answer questions, run training sessions, identify at-risk accounts, and work with the product team to feed real dealer feedback into our roadmap.",
  },
  {
    title: "Technical Support Representative",
    department: "Support",
    location: "Remote / Canada",
    type: "Full-Time",
    description: "Handle technical support inquiries from dealers, staff users, and customer portal users. You'll troubleshoot platform issues, escalate bugs to engineering, write knowledge base articles, and help build the support infrastructure as we scale.",
  },
];

const benefits = [
  {
    icon: Laptop,
    title: "Fully Remote",
    body: "Work from anywhere in Canada. We're a remote-first team that trusts you to manage your schedule and deliver results.",
  },
  {
    icon: TrendingUp,
    title: "Startup Growth Opportunity",
    body: "Join early and grow with the company. As Dealer Suite 360 scales across North America, the opportunities for career advancement are real and significant.",
  },
  {
    icon: Heart,
    title: "Competitive Compensation",
    body: "Base salary, performance incentives, and equity participation for early team members. We reward people who make a real impact.",
  },
  {
    icon: Users,
    title: "Small Team, Big Impact",
    body: "Your work matters here. Every team member has direct influence on the product, the brand, and the experience of hundreds of dealerships.",
  },
];

export default function Careers() {
  return (
    <PageLayout
      seoTitle="Careers | Dealer Suite 360"
      seoDescription="Join the team building the future of RV dealership technology. Remote-first roles in sales, client success, marketing, and support."
      canonical="/careers"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Build the Future of<br />Dealership Technology
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Dealer Suite 360 is building the platform that powers North American RV dealerships. We're a lean, focused team tackling a real industry problem — and we're looking for people who want to do meaningful work and grow with us.
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            We're a remote-first company. We hire for attitude, expertise, and drive. If you want your work to matter and your career to accelerate, we want to meet you.
          </p>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Open Positions</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All roles are remote unless otherwise noted. We're building a team that can work from anywhere.
            </p>
          </div>

          <div className="space-y-6">
            {positions.map((pos, i) => (
              <div key={i} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">{pos.title}</h3>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" /> {pos.department}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" /> {pos.location}
                      </span>
                      <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                        {pos.type}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{pos.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <a
                      href={`mailto:careers@dealersuite360.com?subject=Application: ${encodeURIComponent(pos.title)}`}
                      className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
                    >
                      Apply Now →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Join Dealer Suite 360</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're at the start of something big. The RV industry has been underserved by technology for decades — we're changing that.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Application */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">Don't See Your Role?</h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            We're always interested in exceptional people. Send us your resume and tell us what you'd bring to the team — we read every application.
          </p>
          <a
            href="mailto:careers@dealersuite360.com?subject=General Application — Dealer Suite 360"
            className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            Send Your Resume →
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
