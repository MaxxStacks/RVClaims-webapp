import { useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Link } from "wouter";
import { Camera, Bell, Wifi, Smartphone, CheckCircle, Upload } from "lucide-react";

const appFeatures = [
  { icon: Camera, title: "In-Bay Photo Upload", desc: "Snap claim photos directly from the service bay. AI quality check happens on upload — no blurry or inadequate photos reach the operator." },
  { icon: Bell, title: "Real-Time Notifications", desc: "Push notifications for claim approvals, manufacturer responses, parts arrivals, and invoice activity — no missed updates." },
  { icon: Upload, title: "Claim Creation on Mobile", desc: "Create new claims, add FRC lines, and upload documentation from your phone. The full claim workflow, mobile-optimized." },
  { icon: Wifi, title: "Offline-Ready", desc: "Draft claims and queue photos for upload when connectivity returns. Service bay dead zones don't interrupt your workflow." },
  { icon: Smartphone, title: "All 3 Portals Accessible", desc: "Dealer Portal, Client Portal, and Bidder Portal all accessible from the app. Log in with your existing credentials." },
  { icon: CheckCircle, title: "iOS & Android", desc: "Native app available on App Store and Google Play. Progressive Web App (PWA) install also available from any browser." },
];

const faqs = [
  { q: "Is the mobile app separate from the web portal?", a: "The DS360 Mobile App provides native access to the same platform as the web portal. You use the same login credentials. All data syncs in real time — a claim started on your phone appears immediately in the web portal." },
  { q: "What makes the mobile app essential for service technicians?", a: "Technicians can photograph claim damage in the service bay and upload directly to the claim from their phone. AI quality checks happen on upload, flagging inadequate photos before they reach the operator. This eliminates the round-trip of photos going from phone to computer to portal." },
  { q: "Does the mobile app work offline?", a: "Yes — the app is built as a Progressive Web App with offline capability. You can draft claims, write descriptions, and queue photos for upload. When connectivity is restored, everything syncs automatically." },
  { q: "When will the dedicated native app launch?", a: "The DS360 Mobile App is currently available as a Progressive Web App — install it from your browser like a native app. Dedicated App Store and Google Play listings are in development for Q3 2026 with enhanced camera and notification features." },
  { q: "Does the app support both English and French?", a: "Yes. The DS360 Mobile App is fully bilingual — English and French, matching the same i18n system as the web portals. Language preference syncs with your account setting." },
];

export default function MobileApp() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const schema = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": "DS360 Mobile App",
    "description": "DS360 on iOS and Android — claim photos from the service bay, real-time notifications, and full portal access from your phone.",
    "operatingSystem": "iOS, Android",
    "applicationCategory": "BusinessApplication",
    "url": "https://dealersuite360.com/mobile-app"
  };

  return (
    <PageLayout
      seoTitle="DS360 Mobile App — RV Dealer Claims & Portal on iOS & Android"
      seoDescription="Take DS360 to the service bay. Submit claim photos, receive push notifications for approvals, create claims, and manage your dealership from your phone — iOS and Android."
      seoKeywords="RV dealer mobile app, claims processing mobile, dealer portal app, iOS Android RV dealer, DS360 app"
      canonical="/mobile-app"
      schema={schema}
    >
      {/* Hero */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                <Link href="/technology" className="hover:text-primary transition-colors">← Technology</Link>
              </div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">DS360 Mobile · iOS & Android</span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                DS360 in Your Pocket.<br />
                <span className="text-primary">The Service Bay, Connected.</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Your service technicians are not at their desks. They're in the bay, under the unit, with a phone in their pocket. DS360 Mobile brings the full claim workflow to where the work actually happens — with AI photo checks, real-time notifications, and offline capability for dead-zone environments.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/sign-up"><button className="bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg">Get DS360 Access</button></Link>
                <Link href="/book-demo"><button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted/50 transition-colors">Book a Demo</button></Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-border">
                {[["iOS", "App Store"], ["Android", "Google Play"], ["PWA", "Install from Browser"]].map(([val, label]) => (
                  <div key={label}><div className="text-xl font-bold text-primary">{val}</div><div className="text-xs text-muted-foreground mt-1">{label}</div></div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-foreground rounded-[2.5rem] p-3 w-64 shadow-2xl">
                <div className="bg-background rounded-[2rem] overflow-hidden aspect-[9/19]">
                  <div className="bg-primary p-4 text-center">
                    <div className="text-white font-bold text-sm">DS360</div>
                    <div className="text-white/70 text-xs mt-0.5">Dealer Portal</div>
                  </div>
                  <div className="p-3 space-y-2">
                    {[
                      { label: "Active Claims", value: "12", color: "text-primary" },
                      { label: "Pending Approval", value: "3", color: "text-amber-600" },
                      { label: "Parts Expected", value: "5", color: "text-blue-600" },
                      { label: "Invoices Due", value: "2", color: "text-red-500" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-muted/30 rounded-lg px-3 py-2 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <span className={`text-sm font-bold ${color}`}>{value}</span>
                      </div>
                    ))}
                    <div className="bg-primary rounded-lg p-3 text-center mt-3">
                      <Camera className="w-4 h-4 text-white mx-auto mb-1" />
                      <div className="text-white text-xs font-semibold">Upload Claim Photos</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">App Features</span>
            <h2 className="text-3xl font-bold text-foreground mb-4">Built for How Dealers Actually Work</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Not a stripped-down mobile view. A purpose-built app for the service bay environment.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {appFeatures.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card rounded-xl border border-border p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo workflow */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">Photo Workflow</span>
              <h2 className="text-3xl font-bold text-foreground mb-4">From Service Bay to Claim — Without Leaving the Bay</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">The old workflow: technician takes phone photos, emails them to the service advisor, who downloads them, renames them, and uploads them to the portal. DS360 Mobile eliminates every step in that chain.</p>
              <div className="space-y-4">
                {[
                  ["Open the Claim in App", "Navigate to the active claim from your dashboard"],
                  ["Select the FRC Line", "Choose which repair line the photo documents"],
                  ["Snap or Upload Photo", "Take the photo directly in app or choose from your camera roll"],
                  ["AI Quality Check", "DS360 AI checks sharpness, lighting, and relevance before upload"],
                  ["Photo Attached Instantly", "Photo appears on the claim in the web portal in real time — no email, no download, no manual upload"],
                ].map(([step, desc], i) => (
                  <div key={step} className="flex gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                    <div><div className="font-semibold text-sm text-foreground">{step}</div><div className="text-sm text-muted-foreground mt-0.5">{desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
              <h3 className="font-bold text-foreground mb-6 text-center">Old Photo Workflow vs. DS360 Mobile</h3>
              <div className="space-y-3">
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <h4 className="font-bold text-red-700 text-sm mb-2">Without DS360 Mobile</h4>
                  <div className="text-xs text-red-600 space-y-1">
                    <div>1. Tech takes photos on personal phone</div>
                    <div>2. Emails or texts photos to service advisor</div>
                    <div>3. Advisor downloads, renames, organizes</div>
                    <div>4. Advisor uploads to portal manually</div>
                    <div>5. Wrong photos? Start over.</div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <h4 className="font-bold text-green-700 text-sm mb-2">With DS360 Mobile</h4>
                  <div className="text-xs text-green-600 space-y-1">
                    <div>1. Tech opens claim in DS360 app</div>
                    <div>2. Selects the FRC line</div>
                    <div>3. Takes the photo — AI validates quality</div>
                    <div>4. Photo appears on claim instantly</div>
                    <div>5. Done.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">FAQ</span>
            <h2 className="text-3xl font-bold text-foreground">Mobile App Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={`bg-card rounded-xl border transition-colors ${openFaq === i ? 'border-primary/40' : 'border-border'}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left">
                  <span className="font-semibold text-sm text-foreground pr-4">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${openFaq === i ? 'bg-primary' : 'bg-primary/10'}`}>
                    <span className={`text-lg font-bold inline-block ${openFaq === i ? 'text-white rotate-45' : 'text-primary'}`}>+</span>
                  </div>
                </button>
                {openFaq === i && <div className="px-6 pb-4"><p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Hybrid 1 */}
      <section className="cta-h1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="cta-h1-inner">
            <div>
              <h2>The Service Bay Is Where Claims Are Won or Lost. <span className="accent">DS360 Mobile Is Where You Win.</span></h2>
              <p>Put the full DS360 platform in your technicians' pockets and eliminate the photo workflow friction that costs you approval rate every single month.</p>
            </div>
            <div className="cta-h1-btns">
              <Link href="/sign-up"><button className="btn-solid">Get Started</button></Link>
              <Link href="/contact"><button className="btn-ghost">Talk to an Expert</button></Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
