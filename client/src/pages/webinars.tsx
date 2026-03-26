import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Video, Calendar, Clock, CheckCircle, Play } from "lucide-react";

const webinars = [
  {
    title: "Maximizing Claims Approval Rates",
    date: "April 15, 2026",
    time: "2:00 PM EST / 11:00 AM PST",
    duration: "60 minutes",
    status: "upcoming",
    description: "Our lead claims processor walks through the most common approval failures and the exact documentation changes that eliminate them. Includes a live demo of our AI photo quality review tool and a Q&A session.",
    topics: [
      "Top 10 denial reasons — and how to fix each one",
      "Photo documentation standards by manufacturer",
      "FRC code selection strategies",
      "Live AI photo review demonstration",
    ],
  },
  {
    title: "Introduction to AI F&I — The Future of Finance Presenting",
    date: "May 6, 2026",
    time: "2:00 PM EST / 11:00 AM PST",
    duration: "45 minutes",
    status: "upcoming",
    description: "An introduction to AI-powered F&I presentation tools including virtual F&I advisors, deal structuring automation, and compliance documentation. Includes a live demo of the upcoming AI F&I Presenter feature.",
    topics: [
      "What AI F&I actually means (vs. the hype)",
      "Virtual F&I presenter demo (Tavus integration preview)",
      "Menu selling with AI-suggested product packages",
      "Compliance documentation automation",
    ],
  },
  {
    title: "Building a Dealer Marketplace Strategy",
    date: "March 12, 2026",
    time: "2:00 PM EST / 11:00 AM PST",
    duration: "50 minutes",
    status: "past",
    description: "Preparing for the Q3 2026 marketplace launch — what dealers need to do now to position their inventory for the dealer-to-dealer marketplace and live auction platform. How to evaluate which units to list and which to keep.",
    topics: [
      "Marketplace vs. auction — which strategy for which unit",
      "Preparing inventory data for marketplace listing",
      "Pricing strategies for dealer-to-dealer sales",
      "Building your buyer and seller reputation score",
    ],
  },
  {
    title: "2026 Warranty Landscape — What's Changing",
    date: "February 18, 2026",
    time: "2:00 PM EST / 11:00 AM PST",
    duration: "55 minutes",
    status: "past",
    description: "An annual review of changes to manufacturer warranty programs, new FRC code additions, and evolving documentation requirements across Jayco, Forest River, Heartland, Keystone, Columbia NW, and Midwest Auto.",
    topics: [
      "2026 changes by manufacturer — what's new",
      "New FRC codes added in 2025–2026",
      "Documentation requirement changes",
      "Upcoming manufacturer portal updates",
    ],
  },
];

export default function Webinars() {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  return (
    <PageLayout
      seoTitle="Webinars & Online Events | Dealer Suite 360"
      seoDescription="Free webinars for RV dealerships on warranty claims, F&I, marketplace strategy, and platform features. Register for upcoming events."
      canonical="/webinars"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Webinars & Online Events
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Free educational sessions from our expert team. Live Q&A, real demos, and practical takeaways — no sales pitch.
          </p>
        </div>
      </section>

      {/* Upcoming */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Upcoming Webinars</h2>
          <div className="space-y-6">
            {webinars.filter(w => w.status === "upcoming").map((webinar, i) => (
              <div key={i} className="bg-card rounded-xl p-8 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Upcoming</span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />{webinar.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />{webinar.time} · {webinar.duration}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{webinar.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{webinar.description}</p>
                    <ul className="space-y-2 mb-6">
                      {webinar.topics.map((topic, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />{topic}
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact">
                      <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm">
                        Register for Free →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Past Webinars</h2>
          <div className="space-y-6">
            {webinars.filter(w => w.status === "past").map((webinar, i) => (
              <div key={i} className="bg-card rounded-xl p-8 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                    <Play className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="bg-muted text-muted-foreground text-xs font-semibold px-2.5 py-1 rounded-full">Recording Available</span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />{webinar.date}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{webinar.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{webinar.description}</p>
                    <Link href="/contact">
                      <button className="border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:border-primary/40 hover:text-primary transition-colors text-sm">
                        Watch Recording →
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Notify */}
      <section className="py-20 bg-background">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Get Notified of Upcoming Webinars</h2>
          <p className="text-muted-foreground mb-8">
            We run 2–4 webinars per month. Subscribe to get early access to registration — sessions fill up fast.
          </p>
          {notifySubmitted ? (
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
              <CheckCircle className="w-5 h-5" />
              You're on the list! We'll notify you of upcoming sessions.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setNotifySubmitted(true); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
              />
              <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
                Notify Me
              </button>
            </form>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
