import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { BookOpen, FileText, MessageCircle, Activity, HelpCircle, ChevronRight } from "lucide-react";

const quickLinks = [
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Browse articles by topic — claims, billing, platform setup, and more.",
    href: "/knowledge-base",
  },
  {
    icon: FileText,
    title: "Documentation",
    description: "Detailed guides for every platform feature and workflow.",
    href: "/documentation",
  },
  {
    icon: MessageCircle,
    title: "Contact Support",
    description: "Reach our support team by email. Response within 2 hours during business hours.",
    href: "/contact",
  },
  {
    icon: Activity,
    title: "System Status",
    description: "Check real-time platform health, uptime, and incident reports.",
    href: "/system-status",
  },
];

const faqs = [
  {
    q: "How do I add a new unit to my dealer account?",
    a: "Navigate to My Units in your dealer portal and click 'Add Unit'. Enter the VIN, unit type, year, make, and model. The platform will pre-fill available details from the VIN. You can then add inspection photos and create the first claim from the unit detail page.",
  },
  {
    q: "What happens after I submit a claim to the operator?",
    a: "The operator team reviews your claim within 1 business day. They verify photo quality, FRC code selections, and documentation completeness. If anything needs correction, they'll flag it in your portal with specific instructions. Once approved, the claim is submitted on the manufacturer portal and you'll receive status updates as the manufacturer processes each line.",
  },
  {
    q: "How do I top up my pre-funded wallet?",
    a: "Go to Billing in your dealer portal and select 'Wallet Top-Up'. Enter the amount you want to add and confirm with your saved payment method. Funds are available immediately. You can also enable Auto Top-Up to automatically reload when your balance falls below a threshold you set.",
  },
  {
    q: "Can I invite my customers to view their claim status?",
    a: "Yes. From any claim detail page or from the Customer Portal Management section, you can send a customer invite email by entering their name and email address. They'll receive a secure link to create their customer portal account, where they can see claim status, documents, and submit support tickets.",
  },
  {
    q: "How do I add a staff member to my dealer account?",
    a: "As a Dealer Owner, go to Staff in your portal and click 'Add Staff Member'. Enter their name, email, and select their role (Staff). They'll receive an email invitation to set up their account. Staff members can access claims and units but cannot access billing, subscription, or staff management.",
  },
];

export default function HelpCenter() {
  return (
    <PageLayout
      seoTitle="Help Center | Dealer Suite 360"
      seoDescription="Get help with Dealer Suite 360. Browse the knowledge base, read documentation, check system status, or contact our support team."
      canonical="/help-center"
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Help Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers quickly. Browse the knowledge base, check our documentation, or reach our team directly.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((item, i) => (
              <Link key={i} href={item.href}>
                <div className="bg-card rounded-xl p-6 border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.description}</p>
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    Go <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-4">Top Questions</h2>
            <p className="text-muted-foreground">The questions our support team answers most often.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="border border-border rounded-lg bg-card">
                <summary className="p-4 cursor-pointer font-medium hover:text-primary list-none flex justify-between items-center">
                  {faq.q}<span className="text-muted-foreground text-lg flex-shrink-0 ml-4">+</span>
                </summary>
                <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact and Live Chat */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Submit a Support Ticket</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                For issues that need investigation or documentation. Our support team responds within 2 hours during business hours (Mon–Fri, 8am–6pm EST).
              </p>
              <Link href="/contact">
                <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors w-full">
                  Submit a Ticket →
                </button>
              </Link>
            </div>
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Live Chat</h3>
              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Real-time support chat is coming soon. In the meantime, use our chatbot widget (bottom right) for instant answers to common questions.
              </p>
              <div className="bg-muted/50 text-muted-foreground px-6 py-3 rounded-lg font-semibold w-full text-center text-sm">
                Coming Soon
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
