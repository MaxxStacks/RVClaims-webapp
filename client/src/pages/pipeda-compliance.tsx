import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export default function PipedaCompliance() {
  return (
    <PageLayout
      seoTitle="PIPEDA Compliance | Dealer Suite 360"
      seoDescription="Dealer Suite 360's commitment to PIPEDA compliance and the privacy rights of Canadian dealerships and their customers."
      canonical="/pipeda-compliance"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">PIPEDA Compliance</h1>
            <p className="text-muted-foreground">Last Updated: March 1, 2026</p>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-12">
          <p className="text-foreground leading-relaxed">
            Dealer Suite 360 Inc. is committed to protecting the privacy of individuals whose personal information we collect, use, or disclose in the course of our commercial activities. This statement describes how we comply with the <strong>Personal Information Protection and Electronic Documents Act (PIPEDA)</strong> and applicable provincial privacy legislation in Canada.
          </p>
        </div>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Our Commitment</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We are accountable for the personal information under our control. Our Privacy Officer oversees compliance with PIPEDA and ensures that our data handling practices meet or exceed the requirements of Canadian privacy law. We have implemented policies, procedures, and training to protect personal information at every stage of its lifecycle.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              As a SaaS platform serving RV dealerships across Canada, we act as both a data controller (for our own business records) and a data processor (for the dealership and customer data our clients entrust to us). We take both roles seriously and apply the same standards of care to all personal information we handle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Data Collection Practices</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect personal information only for purposes that a reasonable person would consider appropriate in the circumstances. The information we collect includes:
            </p>
            <ul className="space-y-3 mb-4">
              {[
                "Dealer account information: business name, contact person, address, phone, email",
                "Staff account information: name, email, role, login activity",
                "Claims data: VIN, claim details, manufacturer correspondence, approval/denial records",
                "Financial data: payment records, invoice history, wallet transactions (processed via Stripe)",
                "Customer portal data: only what dealers choose to share with their customers through our platform",
                "Usage data: session logs, feature usage, error reports (for platform improvement)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell personal information to third parties. We do not use personal information for advertising or profiling purposes unrelated to delivering our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Consent</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We obtain meaningful consent from individuals whose personal information we collect. For dealer accounts, consent is obtained through the acceptance of our Terms of Service and Privacy Policy at account creation. For customer portal users, consent is obtained at the time of first login through their dealership's portal.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Where we collect personal information for purposes beyond those described at collection, we obtain additional consent. Individuals may withdraw consent at any time, subject to legal and contractual restrictions, by contacting our Privacy Officer. Withdrawal of consent may affect our ability to provide certain services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Access & Correction Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Individuals have the right to access their personal information held by Dealer Suite 360 and to request corrections if it is inaccurate or incomplete. Requests for access must be submitted in writing to our Privacy Officer. We will respond within 30 days, or provide notice if additional time is required.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Dealer account holders can access and update most of their personal information directly through the dealer portal. For information that cannot be self-corrected, contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We retain personal information only as long as necessary to fulfill the purposes for which it was collected, or as required by law. Claim records are retained for a minimum of 7 years to satisfy manufacturer warranty audit requirements and applicable Canadian accounting regulations.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Upon account termination, personal information is retained for 90 days to allow for data export, then securely deleted or anonymized. Financial records may be retained longer as required by the Income Tax Act (Canada).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Breach Notification</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              In the event of a data breach that poses a real risk of significant harm to individuals, we will notify affected individuals and the Office of the Privacy Commissioner of Canada (OPC) as required under PIPEDA's mandatory breach notification rules. We maintain a record of all breaches regardless of whether notification is required.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We have implemented technical and organizational safeguards to minimize the risk of a breach, including encryption at rest and in transit, role-based access controls, audit logging, and regular security reviews.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Privacy Officer Contact</h2>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground leading-relaxed mb-4">
                All privacy inquiries, access requests, and complaints should be directed to our Privacy Officer:
              </p>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium text-foreground">Email:</span> <a href="mailto:privacy@dealersuite360.com" className="text-primary hover:underline">privacy@dealersuite360.com</a></div>
                <div><span className="font-medium text-foreground">Platform:</span> <Link href="/contact" className="text-primary hover:underline">Contact Form</Link></div>
                <div><span className="font-medium text-foreground">Response Time:</span> Within 30 days of receipt</div>
              </div>
              <p className="text-muted-foreground text-sm mt-4">
                If you are unsatisfied with our response, you have the right to file a complaint with the Office of the Privacy Commissioner of Canada at <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">priv.gc.ca</a>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
