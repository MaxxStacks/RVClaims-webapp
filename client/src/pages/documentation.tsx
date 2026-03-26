import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { BookOpen, Users, User, Code, Plug, GitBranch, ChevronRight } from "lucide-react";

const sections = [
  {
    icon: BookOpen,
    title: "Platform Overview",
    description: "Introduction to Dealer Suite 360 — architecture, service modules, user roles, and how the platform is structured. Start here if you're new to the platform.",
    articles: [
      "Platform architecture and three-portal system",
      "The four user roles (Dealer Owner, Staff, Operator Admin, Operator Staff)",
      "Module availability and launch timeline",
      "Data isolation and multi-tenant security model",
    ],
  },
  {
    icon: Users,
    title: "Dealer Portal Guide",
    description: "Complete guide to every feature in the Dealer Portal — claims, units, billing, staff management, customer portal, and settings.",
    articles: [
      "Dashboard overview and key metrics",
      "Claims — creating, managing, and tracking",
      "Units — adding, editing, VIN management",
      "Billing — invoices, wallet, subscriptions",
      "Customer portal — inviting and managing customers",
    ],
  },
  {
    icon: User,
    title: "Customer Portal Guide",
    description: "Documentation for RV owners using the customer-facing portal — claim status, warranty coverage, support tickets, and documents.",
    articles: [
      "Activating your customer portal access",
      "Understanding claim status and timeline",
      "Warranty and coverage information",
      "Submitting and tracking support tickets",
    ],
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Technical reference for the Dealer Suite 360 REST API. Covers authentication, endpoints, request/response formats, rate limits, and error codes.",
    articles: [
      "Authentication and API key management",
      "Dealer and unit endpoints",
      "Claims data endpoints",
      "Billing and subscription endpoints",
      "Webhooks and event notifications",
    ],
  },
  {
    icon: Plug,
    title: "Integration Guides",
    description: "Step-by-step guides for integrating Dealer Suite 360 with external systems — DMS platforms, accounting software, and CRM tools.",
    articles: [
      "DMS integration overview",
      "Accounting platform sync (QuickBooks, Xero)",
      "CRM integration for lead management",
      "Webhook configuration and event handling",
    ],
  },
  {
    icon: GitBranch,
    title: "Release Notes",
    description: "Full changelog of every platform release — new features, improvements, bug fixes, and breaking changes. Updated with each deployment.",
    articles: [
      "v2.1.0 — JWT auth, PostgreSQL, real API (April 2026)",
      "v2.0.0 — Three-portal system, dark mode, EN/FR (March 2026)",
      "v1.0.0 — Original single-portal (November 2025)",
      "v0.1.0 — Marketing website (October 2025)",
    ],
  },
];

export default function Documentation() {
  return (
    <PageLayout
      seoTitle="Documentation | Dealer Suite 360"
      seoDescription="Complete platform documentation for Dealer Suite 360 — dealer portal guide, API reference, integration guides, and release notes."
      canonical="/documentation"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Documentation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Everything you need to set up, use, and integrate with Dealer Suite 360. Structured guides for all user types.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/knowledge-base">
              <button className="border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:border-primary/40 transition-colors text-sm">
                Knowledge Base
              </button>
            </Link>
            <Link href="/api-access">
              <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm">
                API Access
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <section.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{section.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{section.description}</p>
                <ul className="space-y-2 mb-4">
                  {section.articles.map((article, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-muted-foreground/40 mt-0.5 flex-shrink-0">›</span>
                      {article}
                    </li>
                  ))}
                </ul>
                <Link href="/help-center">
                  <span className="text-sm font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all">
                    View Documentation <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-card rounded-2xl p-10 border border-border">
            <Code className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Building an Integration?</h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              The Dealer Suite 360 API is available to approved technology partners and enterprise clients. Request API access to receive credentials and full developer documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/api-access">
                <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Request API Access →
                </button>
              </Link>
              <Link href="/contact">
                <button className="border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:border-primary/40 transition-colors">
                  Talk to Our Team
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
