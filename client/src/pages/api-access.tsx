import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Code, Webhook, Zap, FileText, CheckCircle, Building2, Store, Cpu } from "lucide-react";

export default function ApiAccess() {
  const [formData, setFormData] = useState({
    name: "", email: "", company: "", useCase: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout
      seoTitle="API Access | Dealer Suite 360"
      seoDescription="Integrate with Dealer Suite 360 via our REST API. Access claims data, inventory, billing, and more. Available to approved technology partners."
      canonical="/api-access"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            API Access
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Build integrations with the Dealer Suite 360 platform. Our REST API exposes dealer data, claims, inventory, and billing for approved technology partners and enterprise clients.
          </p>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Who the API Is For</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu,
                title: "Technology Partners",
                body: "DMS vendors, accounting platforms, and CRM providers can sync data bidirectionally with Dealer Suite 360 for a seamless dealer experience.",
              },
              {
                icon: Building2,
                title: "Enterprise Dealers",
                body: "Multi-location dealer groups that need to pull claims, inventory, and billing data into their own reporting and analytics tools.",
              },
              {
                icon: Store,
                title: "Custom Integrations",
                body: "Dealerships or development teams building custom internal tools that need to read or write data to the Dealer Suite 360 platform.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">API Features</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Code, title: "RESTful API", body: "Standard REST endpoints with JSON request/response. Bearer token authentication with scoped API keys per integration." },
              { icon: Webhook, title: "Webhook Support", body: "Real-time event notifications for claim status changes, new units, billing events, and more. Configurable retry logic for reliability." },
              { icon: Zap, title: "Real-Time Data Sync", body: "Low-latency endpoints for claim status, inventory changes, and billing updates. WebSocket streaming available for real-time applications." },
              { icon: FileText, title: "Comprehensive Docs", body: "OpenAPI 3.0 specification with full endpoint documentation, code samples in Node.js, Python, and PHP, and a sandbox environment for testing." },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Getting Started</h2>
          </div>
          <div className="space-y-4">
            {[
              { step: "1", title: "Request API Access", body: "Submit the form below with your use case. Our team reviews all API requests to ensure compatibility and security compliance." },
              { step: "2", title: "Receive Credentials", body: "Approved partners receive sandbox credentials within 2 business days, plus access to our developer documentation portal." },
              { step: "3", title: "Build in Sandbox", body: "Develop and test your integration in our isolated sandbox environment with sample data. No real dealer data is accessible during development." },
              { step: "4", title: "Production Approval", body: "Submit your integration for production review. Once approved, receive production API keys with agreed rate limits and scopes." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start bg-card rounded-xl p-6 border border-border">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Snippet */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">Sample API Endpoint</h2>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
            <div className="text-green-400 mb-2">// GET dealer claims with filters</div>
            <div className="text-blue-300">GET <span className="text-white">https://api.dealersuite360.com/v1/claims</span></div>
            <div className="text-gray-400 mt-3 mb-1">Authorization: <span className="text-yellow-300">Bearer ds360_your_api_key</span></div>
            <div className="text-gray-400 mb-4">Content-Type: <span className="text-yellow-300">application/json</span></div>
            <div className="text-green-400 mb-2">// Query parameters</div>
            <div className="text-gray-300">?dealer_id=<span className="text-yellow-300">dlr_abc123</span></div>
            <div className="text-gray-300">&status=<span className="text-yellow-300">in_progress</span></div>
            <div className="text-gray-300">&claim_type=<span className="text-yellow-300">warranty</span></div>
            <div className="text-gray-300 mt-4">{`// Response`}</div>
            <div className="text-gray-300">{`{`}</div>
            <div className="text-gray-300 ml-4">{`"data": [`}</div>
            <div className="text-gray-300 ml-8">{`{ "id": "clm_xyz789", "vin": "1FMJU1JT...", "status": "in_review", ... }`}</div>
            <div className="text-gray-300 ml-4">{`],`}</div>
            <div className="text-gray-300 ml-4">{`"meta": { "total": 42, "page": 1, "per_page": 20 }`}</div>
            <div className="text-gray-300">{`}`}</div>
          </div>
        </div>
      </section>

      {/* Request Form */}
      <section className="py-20 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Request API Access</h2>
            <p className="text-muted-foreground">Tell us about your integration. We review all requests and respond within 2 business days.</p>
          </div>

          {submitted ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Request Submitted</h3>
              <p className="text-muted-foreground">We'll review your integration details and reach out within 2 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Your Name</label>
                  <input type="text" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                    value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Jane Smith" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <input type="email" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                    value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="jane@company.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Company / Organization</label>
                <input type="text" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                  value={formData.company} onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))} placeholder="Your company name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Describe your integration use case</label>
                <textarea required rows={5} className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                  value={formData.useCase} onChange={(e) => setFormData(p => ({ ...p, useCase: e.target.value }))}
                  placeholder="What are you building? What data do you need to read or write? How many dealers or units are in scope?" />
              </div>
              <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Submit API Request →
              </button>
            </form>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
