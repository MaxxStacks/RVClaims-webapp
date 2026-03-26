import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { FileBarChart, Download, CheckCircle } from "lucide-react";

const reports = [
  {
    title: "State of RV Warranty Claims 2026",
    description: "An analysis of 12,000+ warranty claims processed across the Dealer Suite 360 network in 2025–2026. Covers approval rates by manufacturer, denial reasons breakdown, average processing times, photo quality impact on outcomes, and FRC code patterns by RV type.",
    pages: "32 pages",
    published: "March 2026",
    tags: ["Claims", "Industry Data"],
  },
  {
    title: "Dealer Revenue Optimization Report",
    description: "How leading RV dealerships in Canada and the US are using technology and outsourced services to increase per-unit profitability. Covers F&I penetration benchmarks, claims revenue recovery rates, warranty plan attach rates, and the ROI of platform adoption.",
    pages: "28 pages",
    published: "February 2026",
    tags: ["Revenue", "F&I", "Best Practices"],
  },
  {
    title: "F&I Trends in the RV Industry",
    description: "Consumer financing behaviour in the RV market is shifting. This report covers the move toward longer amortizations, rising GAP insurance uptake, the growing popularity of extended warranty plans, and what these trends mean for dealership F&I strategy.",
    pages: "24 pages",
    published: "January 2026",
    tags: ["F&I", "Financing", "Consumer Trends"],
  },
  {
    title: "North American RV Market Outlook",
    description: "A forward-looking analysis of the RV market across Canada and the United States. Covers dealer count trends, unit sales projections, manufacturer capacity changes, demographic shifts in the buyer base, and the accelerating role of technology in dealership operations.",
    pages: "40 pages",
    published: "Q4 2025",
    tags: ["Market Analysis", "Forecasting"],
  },
];

export default function IndustryReports() {
  const [emailForms, setEmailForms] = useState<Record<number, string>>({});
  const [downloaded, setDownloaded] = useState<Record<number, boolean>>({});
  const [activeForm, setActiveForm] = useState<number | null>(null);

  const handleRequest = (i: number, e: React.FormEvent) => {
    e.preventDefault();
    setDownloaded((prev) => ({ ...prev, [i]: true }));
    setActiveForm(null);
  };

  return (
    <PageLayout
      seoTitle="RV Industry Reports & Insights | Dealer Suite 360"
      seoDescription="Free industry reports on RV warranty claims, dealer revenue, F&I trends, and market outlook for North American RV dealerships."
      canonical="/industry-reports"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Industry Reports & Insights
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Data-driven research from the Dealer Suite 360 network. Real numbers from real dealerships, analyzed by our team to help you make better business decisions.
          </p>
        </div>
      </section>

      {/* Reports */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {reports.map((report, i) => (
              <div key={i} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileBarChart className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {report.tags.map((tag, j) => (
                        <span key={j} className="bg-muted text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{report.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{report.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{report.pages}</span>
                      <span>·</span>
                      <span>Published {report.published}</span>
                    </div>

                    {downloaded[i] ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Report requested — check your inbox!
                      </div>
                    ) : activeForm === i ? (
                      <form onSubmit={(e) => handleRequest(i, e)} className="flex flex-col sm:flex-row gap-3 max-w-md">
                        <input
                          type="email"
                          required
                          value={emailForms[i] || ""}
                          onChange={(e) => setEmailForms((prev) => ({ ...prev, [i]: e.target.value }))}
                          placeholder="Enter your email"
                          className="flex-1 px-4 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                        />
                        <button type="submit" className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
                          Send Report
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setActiveForm(i)}
                        className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Get the Latest Report</h2>
            <p className="text-muted-foreground mb-8">
              New research is published quarterly. Subscribe to receive each report as it's released — no spam, just data.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
              />
              <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
