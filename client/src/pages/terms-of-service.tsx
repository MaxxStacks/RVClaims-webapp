import { PageLayout } from "@/components/page-layout";
import logoEN from "@assets/DS360_logo_light.png";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <PageLayout
      seoTitle="Terms of Service | Dealer Suite 360"
      seoDescription="Terms of Service for Dealer Suite 360, the comprehensive dealership management platform for RV dealers across North America."
      canonical="/terms-of-service"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col items-center mb-12">
          <Link href="/">
            <img src={logoEN} alt="Dealer Suite 360" className="h-24 w-auto mb-8" />
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-3 text-center">Terms of Service</h1>
          <p className="text-muted-foreground text-center">Effective Date: March 1, 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10">
          <p className="text-muted-foreground leading-relaxed text-base">
            These Terms of Service ("Terms") govern your access to and use of the Dealer Suite 360 platform ("Platform"), operated by Dealer Suite 360 Inc. ("Company," "we," "us," or "our"). By creating an account, accessing the Platform, or using any of our services, you agree to be bound by these Terms. If you do not agree, you may not use the Platform.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">1. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Dealer Suite 360 is a SaaS platform providing RV dealerships with tools and managed services including warranty claims processing, financing support, F&I outsourcing, parts management, digital marketing, dealer marketplace, and live auction capabilities. Not all services are available in all regions or plan tiers. Service availability is described in your subscription agreement.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The Platform is offered as a two-sided marketplace: dealers (clients) subscribe to receive services, and our operator team delivers those services on their behalf. Claims processing services involve submitting and managing warranty claims on manufacturer portals — the Company does not guarantee manufacturer approval of any claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">2. Account Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You must be a licensed RV dealership or authorized representative to create a dealer account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorized access.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Each dealership account is a single tenant — your data is isolated from other dealers. You may create staff accounts within your subscription limit. You are responsible for your staff accounts and their compliance with these Terms.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The Company reserves the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or misuse the Platform in any way that harms other dealers, manufacturers, or the Company.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">3. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Subscriptions are billed monthly or annually as selected at the time of enrollment. All fees are in Canadian dollars unless otherwise stated. For U.S. dealers, fees are billed in USD at the applicable exchange rate. Subscription fees are non-refundable except as required by applicable law.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Pre-funded wallet plans require a minimum balance to remain active. If your wallet balance falls below the threshold for your plan, claim processing may be paused until funds are added. Auto-top-up is available and encouraged for uninterrupted service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Per-claim and per-transaction fees are charged as services are consumed. The Company reserves the right to adjust pricing with 30 days' written notice. Continued use of the Platform after a price change constitutes acceptance of the new pricing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree to use the Platform only for lawful purposes and in accordance with these Terms. You may not use the Platform to submit fraudulent claims, misrepresent vehicle conditions, manipulate claim data, or engage in any activity that violates manufacturer warranty terms or applicable law.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You may not attempt to gain unauthorized access to any portion of the Platform, reverse-engineer the software, scrape data, or interfere with the proper functioning of the service. Violations may result in immediate account suspension and potential legal action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The Platform, including all software, AI models, content, trademarks, and design elements, is owned by or licensed to Dealer Suite 360 Inc. You are granted a limited, non-exclusive, non-transferable license to use the Platform for your internal business operations.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Your dealership data, including claims history, customer records, and financial data, remains your property. By using the Platform, you grant us a limited license to process that data to deliver the services you have subscribed to.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To the maximum extent permitted by law, the Company shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost revenue, lost profits, or data loss arising out of or relating to your use of the Platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our total aggregate liability for any claims arising under these Terms shall not exceed the fees paid by you to us in the three months preceding the claim. This limitation applies regardless of the legal theory under which the claim is brought.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">7. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              Either party may terminate the subscription with 30 days' written notice. Upon termination, you will retain access to your data export for 90 days, after which data may be deleted in accordance with our data retention policy. Outstanding fees are due at termination. The Company may terminate accounts immediately for material breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">8. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">Canadian Dealers:</strong> These Terms are governed by the laws of the Province of Alberta and the federal laws of Canada applicable therein. Disputes shall be resolved in the courts of Alberta, Canada.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">U.S. Dealers:</strong> These Terms are governed by the laws of the State of Delaware. Disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association, with proceedings conducted in English.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these Terms should be directed to <a href="mailto:legal@dealersuite360.com" className="text-primary hover:underline">legal@dealersuite360.com</a>.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
