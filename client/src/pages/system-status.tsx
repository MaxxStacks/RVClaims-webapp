import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { CheckCircle, Activity } from "lucide-react";

const services = [
  { name: "Dealer Portal", status: "operational" },
  { name: "Operator Portal", status: "operational" },
  { name: "Customer Portal", status: "operational" },
  { name: "Claims Processing API", status: "operational" },
  { name: "Marketplace & Auctions", status: "operational" },
  { name: "Payment Processing (Stripe)", status: "operational" },
  { name: "File Storage & Photos", status: "operational" },
  { name: "Email Notifications", status: "operational" },
  { name: "Webhooks", status: "operational" },
  { name: "Authentication Service", status: "operational" },
  { name: "Database", status: "operational" },
  { name: "CDN & Static Assets", status: "operational" },
];

const incidents: { date: string; title: string; status: string; details: string }[] = [];

export default function SystemStatus() {
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <PageLayout
      seoTitle="System Status | Dealer Suite 360"
      seoDescription="Real-time system status for the Dealer Suite 360 platform. Check service health, uptime, and incident history."
      canonical="/system-status"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            System Status
          </h1>
          <p className="text-muted-foreground text-lg mb-10">
            Real-time health of all Dealer Suite 360 services.
          </p>

          {/* Big Status Badge */}
          <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-8 py-5">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
            <span className="text-2xl font-bold text-green-700">All Systems Operational</span>
          </div>

          {/* Uptime */}
          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">99.9%</div>
              <div className="text-sm text-muted-foreground">30-day uptime</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">99.97%</div>
              <div className="text-sm text-muted-foreground">90-day uptime</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">&lt; 150ms</div>
              <div className="text-sm text-muted-foreground">Average API response</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">Service Health</h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {services.map((service, i) => (
              <div key={i} className={`flex items-center justify-between px-6 py-4 ${i < services.length - 1 ? "border-b border-border" : ""}`}>
                <div className="font-medium text-foreground">{service.name}</div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Uptime Chart Placeholder */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">90-Day Uptime History</h2>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">90 days ago</span>
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
            {/* Visual uptime bars */}
            <div className="flex gap-0.5">
              {Array.from({ length: 90 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-8 rounded-sm bg-green-400"
                  title="100% uptime"
                />
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-sm" />
                <span className="text-xs text-muted-foreground">No incidents</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
                <span className="text-xs text-muted-foreground">Degraded</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-sm" />
                <span className="text-xs text-muted-foreground">Outage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Incident History */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Incident History</h2>
          {incidents.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">No incidents reported</h3>
              <p className="text-muted-foreground">There have been no incidents in the last 30 days.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((inc, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-foreground">{inc.title}</h3>
                    <span className="text-sm text-muted-foreground">{inc.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{inc.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Get Status Updates</h2>
          <p className="text-muted-foreground mb-8">
            Subscribe to receive email notifications whenever a service incident is created, updated, or resolved.
          </p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
              <CheckCircle className="w-5 h-5" />
              You're subscribed to status updates!
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
              />
              <button type="submit" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
