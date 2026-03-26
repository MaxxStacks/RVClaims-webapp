import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";

export default function CookiePolicy() {
  return (
    <PageLayout
      seoTitle="Cookie Policy | Dealer Suite 360"
      seoDescription="Learn how Dealer Suite 360 uses cookies and similar tracking technologies on our platform."
      canonical="/cookie-policy"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-3">Cookie Policy</h1>
        <p className="text-muted-foreground mb-12">Last Updated: March 1, 2026</p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">What Are Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Cookies are small text files that are placed on your device when you visit a website or use a web application. They allow the site to remember your preferences, keep you logged in, and understand how you interact with the platform. Cookies do not contain personally identifiable information on their own, but they may be combined with other data we collect to identify you.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies including local storage and session tokens across the Dealer Suite 360 platform at dealersuite360.com and its white-label deployments (including rvclaims.ca).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Cookies We Use</h2>

            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Always Active</span>
                  <h3 className="text-lg font-semibold text-foreground">Essential Cookies</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  These cookies are necessary for the platform to function and cannot be turned off. They are set in response to actions you take, such as logging in, setting your language preference, or adjusting your display settings.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                  <div className="flex justify-between"><span className="font-medium text-foreground">ds360-auth</span><span className="text-muted-foreground">JWT session token, expires after 7 days</span></div>
                  <div className="flex justify-between"><span className="font-medium text-foreground">ds360-lang</span><span className="text-muted-foreground">Language preference (EN/FR), persistent</span></div>
                  <div className="flex justify-between"><span className="font-medium text-foreground">ds360-theme</span><span className="text-muted-foreground">Dark/light mode preference, persistent</span></div>
                  <div className="flex justify-between"><span className="font-medium text-foreground">csrf-token</span><span className="text-muted-foreground">Security token, session-scoped</span></div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">Analytics</span>
                  <h3 className="text-lg font-semibold text-foreground">Analytics Cookies</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We use analytics cookies to understand how visitors interact with our marketing website. This helps us improve page performance, content relevance, and user experience. Analytics data is aggregated and does not identify individual users. You can opt out of analytics cookies through our cookie consent banner.
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">Preferences</span>
                  <h3 className="text-lg font-semibold text-foreground">Preference Cookies</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Preference cookies allow the platform to remember choices you have made — such as your portal layout, notification settings, and dashboard configuration. These are not strictly necessary but significantly improve your experience.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Third-Party Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Certain features of our platform use third-party services that may set their own cookies. We have no direct control over these cookies, and they are governed by the respective third-party privacy policies.
            </p>
            <div className="space-y-4">
              {[
                { name: "Stripe", purpose: "Payment processing. Stripe uses cookies to prevent fraud, remember payment methods, and comply with PCI-DSS requirements. See stripe.com/privacy." },
                { name: "Google Analytics", purpose: "Website analytics on our public marketing pages. Collects anonymized usage data including page views, session duration, and referral sources. See policies.google.com/privacy." },
                { name: "Google Fonts / OAuth", purpose: "If you choose to sign in with Google, Google sets authentication cookies governed by Google's privacy policy." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="font-semibold text-foreground text-sm w-36 flex-shrink-0">{item.name}</div>
                  <div className="text-muted-foreground text-sm leading-relaxed">{item.purpose}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">How to Manage Cookies</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can control and manage cookies in several ways. Our cookie consent banner allows you to accept or decline non-essential cookies when you first visit the site. You can also change your preferences at any time through the cookie settings link in the footer.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Most web browsers also allow you to manage cookies through browser settings. You can delete existing cookies, block cookies from specific sites, or configure your browser to reject all cookies. Be aware that disabling cookies — particularly essential cookies — will impair your ability to use the Dealer Suite 360 platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For instructions on managing cookies in popular browsers, visit the help documentation for Chrome, Firefox, Safari, or Edge.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about our use of cookies, contact us at{" "}
              <a href="mailto:privacy@dealersuite360.com" className="text-primary hover:underline">privacy@dealersuite360.com</a> or visit our{" "}
              <Link href="/contact" className="text-primary hover:underline">Contact page</Link>.
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
