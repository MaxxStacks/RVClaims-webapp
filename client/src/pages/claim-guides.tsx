import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { BookOpen, Camera, FileText, AlertCircle, Factory, CheckCircle, Download } from "lucide-react";

const guides = [
  {
    icon: FileText,
    title: "How to File a DAF Claim",
    description: "A step-by-step walkthrough of the Dealer Authorization Form process — from unit arrival inspection through submission on the manufacturer portal. Includes what to document and common mistakes to avoid.",
    tag: "Getting Started",
  },
  {
    icon: BookOpen,
    title: "Understanding FRC Codes",
    description: "FRC (Failure Reason Codes) are manufacturer-specific codes that determine whether a claim gets approved or denied. Learn what FRC codes are, how to find the right one, and why code accuracy directly impacts your approval rate.",
    tag: "Claims Knowledge",
  },
  {
    icon: CheckCircle,
    title: "Warranty Claim Best Practices",
    description: "The operational habits that consistently produce high approval rates — from the moment a customer reports an issue to the day the claim is paid. Covers claim organization, communication with manufacturers, and escalation procedures.",
    tag: "Best Practices",
  },
  {
    icon: AlertCircle,
    title: "Common Claim Denials and How to Avoid Them",
    description: "The top 10 reasons warranty claims are denied and exactly what to do differently. Poor photo quality, incorrect FRC codes, missing labor descriptions, and outside-warranty submissions are all covered with specific prevention steps.",
    tag: "Denial Prevention",
  },
  {
    icon: Factory,
    title: "Manufacturer-Specific Claim Requirements",
    description: "Each manufacturer has unique submission portals, documentation standards, and approval timelines. This guide covers Jayco, Forest River, Heartland, Keystone, Columbia NW, and Midwest Auto — what they require and how they differ.",
    tag: "Manufacturer Guides",
  },
  {
    icon: Camera,
    title: "Photo Documentation Guide",
    description: "Photo quality is one of the highest-impact factors in claim approval. Learn the exact photo standards required by major manufacturers — lighting, angles, distance, context shots, and how to document damage vs. repair.",
    tag: "Documentation",
  },
];

export default function ClaimGuides() {
  const [email, setEmail] = useState("");
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    setDownloaded(true);
  };

  return (
    <PageLayout
      seoTitle="RV Warranty Claim Guides & Resources | Dealer Suite 360"
      seoDescription="Free claim processing guides for RV dealerships. DAF, PDI, warranty claim best practices, FRC code guides, photo documentation standards, and more."
      canonical="/claim-guides"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Claim Processing Guides<br />& Resources
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to understand the warranty claims process — from first principles to manufacturer-specific requirements. Written by our expert processing team.
          </p>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Guides & Articles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our processing team writes these guides based on real patterns they see every day — not generic warranty advice.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <guide.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">
                    {guide.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{guide.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{guide.description}</p>
                <Link href="/contact">
                  <button className="w-full border border-primary text-primary py-2.5 rounded-lg text-sm font-semibold hover:bg-primary hover:text-white transition-colors">
                    Read Guide →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl p-10 border border-border text-center shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Download className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Download the Complete Claims Guide</h2>
            <p className="text-muted-foreground mb-8">
              Get our comprehensive 40-page claims processing handbook — all six guides combined into one PDF, plus bonus checklists for DAF, PDI, and warranty submissions.
            </p>
            {downloaded ? (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-foreground font-semibold">Check your inbox!</p>
                <p className="text-muted-foreground text-sm mt-1">We'll send the guide to {email} shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleDownload} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                />
                <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
                  Get the Guide
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Let Us Handle the Claims?</h2>
          <p className="text-white/80 mb-8 text-lg">
            Reading guides is great — but having our expert team process your claims is better. Get started today.
          </p>
          <Link href="/sign-up">
            <button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-lg">
              Start Processing Claims →
            </button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
