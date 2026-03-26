import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { CheckCircle, Clock, Users, Award, Calendar } from "lucide-react";

const topics = [
  { value: "platform-demo", label: "Platform Demo" },
  { value: "claims-strategy", label: "Claims Processing Strategy" },
  { value: "revenue-optimization", label: "Revenue Optimization" },
  { value: "marketplace-strategy", label: "Marketplace Strategy" },
  { value: "custom-enterprise", label: "Custom Enterprise Solutions" },
  { value: "other", label: "Other / Not Sure" },
];

const topicDetails = [
  {
    title: "Platform Demo",
    description: "A guided walkthrough of the full Dealer Suite 360 platform — dealer portal, operator portal, claims processing, billing, and upcoming modules. Best for decision-makers evaluating the platform.",
  },
  {
    title: "Claims Processing Strategy",
    description: "Deep dive into how our claims processing service works for your specific manufacturers and claim volume. Includes review of your current process and specific improvement opportunities.",
  },
  {
    title: "Revenue Optimization",
    description: "Analyse your dealership's current claims approval rates, F&I penetration, and warranty plan attach rates. We'll identify the top 3–5 revenue opportunities and show you how to capture them.",
  },
  {
    title: "Marketplace Strategy",
    description: "Planning for the Q3 2026 marketplace launch. How to prepare your inventory data, evaluate which units to list, build your buyer/seller reputation, and maximize your return on auction units.",
  },
  {
    title: "Custom Enterprise Solutions",
    description: "For dealer groups, OEM partners, and large organizations that need custom integrations, volume pricing, dedicated support, or white-label deployment. We'll discuss your requirements and scope a solution.",
  },
];

export default function ExpertConsultation() {
  const [formData, setFormData] = useState({
    name: "", email: "", company: "", topic: "", preferredDate: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <PageLayout
      seoTitle="Book an Expert Consultation | Dealer Suite 360"
      seoDescription="Book a free consultation with the Dealer Suite 360 expert team. Platform demos, claims strategy, revenue optimization, and enterprise solutions."
      canonical="/expert-consultation"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Book an Expert Consultation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Schedule a free session with our team. We'll answer your questions, demonstrate the platform, and show you exactly how Dealer Suite 360 fits your dealership.
          </p>
          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: Award, text: "Free — no obligation" },
              { icon: Clock, text: "24-hour response" },
              { icon: Users, text: "Expert team, not sales reps" },
            ].map((signal, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
                <signal.icon className="w-4 h-4 text-primary" />
                {signal.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What Can We Talk About?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the topic that best fits where your dealership is right now. All consultations are free and confidential.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicDetails.map((topic, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-bold text-foreground mb-2">{topic.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Book Your Session</h2>
            <p className="text-muted-foreground">Fill in your details and we'll reach out within 24 hours to confirm a time.</p>
          </div>

          {submitted ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">Consultation Requested!</h3>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Thank you, <strong>{formData.name}</strong>. We've received your request for a{" "}
                <strong>{topics.find(t => t.value === formData.topic)?.label || "consultation"}</strong> session.
              </p>
              <p className="text-muted-foreground">
                Our team will reach out to {formData.email} within 24 business hours to confirm your preferred date and time.
              </p>
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
                    value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="jane@dealership.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Dealership / Company</label>
                <input type="text" required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                  value={formData.company} onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))} placeholder="Smith's RV Centre" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Consultation Topic</label>
                  <select required className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                    value={formData.topic} onChange={(e) => setFormData(p => ({ ...p, topic: e.target.value }))}>
                    <option value="">Select a topic...</option>
                    {topics.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Preferred Date
                  </label>
                  <input type="date" className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary"
                    value={formData.preferredDate} onChange={(e) => setFormData(p => ({ ...p, preferredDate: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tell us about your dealership <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea rows={4} className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-primary resize-none"
                  value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                  placeholder="Location, unit volume, manufacturers you work with, current challenges..." />
              </div>
              <button type="submit" className="w-full bg-primary text-white py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-base">
                Book My Free Consultation →
              </button>
              <p className="text-center text-xs text-muted-foreground">
                No obligation. No sales pressure. Just a conversation.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* More ways to connect */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { title: "Free Consultation", body: "No credit card, no obligation. We're here to help you decide if the platform is right for you." },
              { title: "24-Hour Response", body: "We respond to every consultation request within 24 business hours to confirm your booking." },
              { title: "Expert Team", body: "You'll speak with our operations or account team — people who know the platform and the RV industry." },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-xl p-6 border border-border">
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
