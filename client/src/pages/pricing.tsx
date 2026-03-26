import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Check, Sparkles, X, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { translations } from "@/lib/i18n";

export default function Pricing() {
  const { t, language } = useLanguage();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: t('pricingPage.plans.starter.name'),
      price: "$349",
      annualPrice: "$3,350",
      description: t('pricingPage.plans.starter.description'),
      features: translations[language].pricingPage.plans.starter.features,
      cta: t('pricingPage.plans.starter.cta'),
      popular: false
    },
    {
      name: t('pricingPage.plans.professional.name'),
      price: "$749",
      annualPrice: "$7,190",
      description: t('pricingPage.plans.professional.description'),
      features: translations[language].pricingPage.plans.professional.features,
      cta: t('pricingPage.plans.professional.cta'),
      popular: true
    },
    {
      name: t('pricingPage.plans.enterprise.name'),
      price: "Custom",
      annualPrice: "Custom",
      description: t('pricingPage.plans.enterprise.description'),
      features: translations[language].pricingPage.plans.enterprise.features,
      cta: t('pricingPage.plans.enterprise.cta'),
      popular: false
    }
  ];

  const addons = [
    {
      name: "Extra Claims Volume",
      price: "$2.50",
      unit: "per claim",
      description: "Process additional claims beyond your plan limit"
    },
    {
      name: "Financing Module",
      price: "$99",
      unit: t('pricingPage.addons.perMonth'),
      description: "Add dealership financing support tools",
      badge: "Q2 2026"
    },
    {
      name: "F&I Services Module",
      price: "$149",
      unit: t('pricingPage.addons.perMonth'),
      description: "Complete F&I solutions integration",
      badge: "Q2 2026"
    },
    {
      name: "Marketing Services",
      price: "$199",
      unit: t('pricingPage.addons.perMonth'),
      description: "Professional digital marketing support"
    },
    {
      name: t('pricingPage.addons.items.marketplace.name'),
      price: "$499",
      unit: "/year",
      description: t('pricingPage.addons.items.marketplace.description'),
      badge: "Q1 2026"
    },
    {
      name: t('pricingPage.addons.items.auctions.name'),
      price: "$99",
      unit: t('pricingPage.addons.perMonth'),
      description: t('pricingPage.addons.items.auctions.description'),
      badge: "Q3 2026"
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqItems = [
    {
      q: "What's included in each plan?",
      a: "Every plan includes Dealer Portal access, real-time claim tracking, FRC code lookup AI, and bilingual (EN/FR) support. The Professional plan adds the Customer Portal, AI photo quality checks, and claim readiness scoring. Enterprise adds denial prediction AI, dedicated account management, and custom integrations."
    },
    {
      q: "Can I upgrade or downgrade at any time?",
      a: "Yes. You can upgrade your plan at any time and the change takes effect immediately on a prorated basis. Downgrades take effect at the start of your next billing cycle. Contact our team or adjust your plan in the Dealer Portal under Billing & Subscription."
    },
    {
      q: "Is there a setup fee?",
      a: "No setup fees on any plan. Onboarding is included — we assign a team member to walk through your first claim submission and configure your portal settings at no additional cost."
    },
    {
      q: "Do you offer custom enterprise pricing?",
      a: "Yes. Enterprise pricing is fully custom based on your claim volume, number of locations, modules required, and integration complexity. Contact our sales team for a tailored quote."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards via Stripe for subscription billing and wallet top-ups. Canadian dealers may also use Interac e-Transfer for pre-funded wallet deposits. Invoice-based billing is available for Enterprise customers."
    }
  ];

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Dealer Suite 360 — Dealership Operating Platform",
    "description": "AI-powered RV dealership platform with claims processing, financing, F&I, marketplace, and auction services.",
    "url": "https://dealersuite360.com/pricing",
    "offers": [
      {
        "@type": "Offer",
        "name": "Starter",
        "price": "349",
        "priceCurrency": "CAD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "billingDuration": "P1M"
        },
        "description": "25 claims/month included. $4.50 per-claim processing fee. Dealer Portal access, FRC lookup AI, bilingual EN/FR."
      },
      {
        "@type": "Offer",
        "name": "Professional",
        "price": "749",
        "priceCurrency": "CAD",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "billingDuration": "P1M"
        },
        "description": "100 claims/month included. $3.50 per-claim processing fee. Customer Portal, AI photo quality, claim readiness score, priority support."
      },
      {
        "@type": "Offer",
        "name": "Enterprise",
        "price": "0",
        "priceCurrency": "CAD",
        "description": "Unlimited claims. Custom pricing. Denial Prediction AI, dedicated account manager, custom integrations, F&I module included."
      }
    ]
  };

  return (
    <PageLayout
      seoTitle="Pricing - Dealer Suite 360"
      seoDescription="Transparent pricing for professional RV claims management services. Choose the plan that fits your dealership's needs with flexible monthly or annual billing options."
      seoKeywords="RV dealer software pricing, dealership management pricing, claims processing cost, dealer platform subscription"
      canonical="/pricing"
      schema={pricingSchema}
    >
      <div className="bg-white">
        {/* Header Section */}
        <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('pricingPage.title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {t('pricingPage.description')}
            </p>
            
            {/* Billing Period Switcher */}
            <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 gap-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                data-testid="button-billing-monthly"
              >
                {t('pricingPage.billingToggle.monthly')}
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                data-testid="button-billing-annual"
              >
                {t('pricingPage.billingToggle.annual')}
              </button>
              <span className="inline-flex items-center justify-center bg-primary text-white px-6 py-2 rounded-md font-semibold">
                {t('pricingPage.billingToggle.discount')}
              </span>
            </div>
          </div>
        </div>

        {/* Annual Discount Banner */}
        {billingPeriod === 'annual' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
            <div className="bg-primary rounded-2xl shadow-xl p-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-white" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {t('pricingPage.discountBanner.title')}
                </h2>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-lg opacity-95">
                {t('pricingPage.discountBanner.description')}
              </p>
            </div>
          </div>
        )}

        {/* Pricing Tables */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border-2 ${
                  plan.popular
                    ? 'border-primary shadow-2xl scale-105 bg-white'
                    : 'border-gray-200 bg-white hover:border-primary/50 transition-all duration-300'
                }`}
                data-testid={`card-pricing-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-white px-6 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                      {t('pricingPage.badges.mostPopular')}
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-sm min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6 pb-6 border-b border-gray-200">
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold text-gray-900">
                          {billingPeriod === 'annual' ? plan.annualPrice : plan.price}
                        </span>
                        {plan.price !== "Custom" && (
                          <span className="text-gray-600 text-lg">
                            {billingPeriod === 'annual' ? t('pricingPage.pricing.perYear') : t('pricingPage.pricing.perMonth')}
                          </span>
                        )}
                      </div>
                      {billingPeriod === 'monthly' && plan.annualPrice !== "Custom" && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">{t('pricingPage.pricing.or')} </span>
                          <span className="text-primary font-semibold">
                            {plan.annualPrice}{t('pricingPage.pricing.perYear')}
                          </span>
                          <span className="text-gray-500"> ({t('pricingPage.pricing.save')} 20%)</span>
                        </div>
                      )}
                      {billingPeriod === 'annual' && plan.price !== "Custom" && (
                        <div className="mt-2 text-sm">
                          <span className="text-primary font-semibold">
                            20% {t('pricingPage.pricing.savings')}
                          </span>
                          <span className="text-gray-500"> {t('pricingPage.pricing.vsBilling')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href="/contact">
                    <button
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                        plan.popular
                          ? 'bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                      data-testid={`button-${plan.name.toLowerCase()}-cta`}
                    >
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Addons Section */}
        <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('pricingPage.addons.title')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('pricingPage.addons.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addons.map((addon, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                  data-testid={`card-addon-${index}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {addon.name}
                    </h3>
                    {addon.badge && (
                      <span className="h-[18px] inline-flex items-center justify-center text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-semibold">
                        {addon.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
                    {addon.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-primary">
                      {addon.price}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {addon.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/contact">
                <button
                  className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                  data-testid="button-contact-sales"
                >
                  {t('pricingPage.addons.cta')}
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Full Feature Comparison
            </h2>
            <p className="text-xl text-gray-600">
              See exactly what's included in every plan — no surprises.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-gray-700 font-semibold bg-gray-50 w-1/2">Feature</th>
                  <th className="px-6 py-4 text-center text-gray-700 font-semibold bg-gray-50">Starter</th>
                  <th className="px-6 py-4 text-center text-primary font-semibold bg-primary/5">Professional</th>
                  <th className="px-6 py-4 text-center text-gray-700 font-semibold bg-gray-50">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { feature: 'Monthly Claims Included', starter: '25', pro: '100', enterprise: 'Unlimited' },
                  { feature: 'Per-Claim Processing Fee', starter: '$4.50', pro: '$3.50', enterprise: 'Custom' },
                  { feature: 'Dealer Portal Access', starter: true, pro: true, enterprise: true },
                  { feature: 'Customer Portal', starter: false, pro: true, enterprise: true },
                  { feature: 'Real-Time Claim Tracking', starter: true, pro: true, enterprise: true },
                  { feature: 'AI Photo Quality Check', starter: false, pro: true, enterprise: true },
                  { feature: 'FRC Code Lookup AI', starter: true, pro: true, enterprise: true },
                  { feature: 'Claim Readiness Score', starter: false, pro: true, enterprise: true },
                  { feature: 'Denial Prediction AI', starter: false, pro: false, enterprise: true },
                  { feature: 'Financing Module', starter: 'Add-on', pro: 'Included', enterprise: 'Included' },
                  { feature: 'F&I Module', starter: 'Add-on', pro: 'Add-on', enterprise: 'Included' },
                  { feature: 'Network Marketplace', starter: 'Add-on', pro: 'Add-on', enterprise: 'Add-on' },
                  { feature: 'Dedicated Account Manager', starter: false, pro: false, enterprise: true },
                  { feature: 'Priority Support', starter: false, pro: true, enterprise: true },
                  { feature: 'Custom Integrations', starter: false, pro: false, enterprise: true },
                  { feature: 'Bilingual (EN/FR)', starter: true, pro: true, enterprise: true },
                ].map((row, i) => {
                  const renderCell = (val: boolean | string) => {
                    if (val === true) return <span className="text-green-600 font-bold text-base">✓</span>;
                    if (val === false) return <span className="text-gray-300 font-bold text-base">✗</span>;
                    return <span className="text-gray-700 font-medium">{val}</span>;
                  };
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-6 py-3.5 text-gray-800 font-medium">{row.feature}</td>
                      <td className="px-6 py-3.5 text-center">{renderCell(row.starter)}</td>
                      <td className="px-6 py-3.5 text-center bg-primary/5">{renderCell(row.pro)}</td>
                      <td className="px-6 py-3.5 text-center">{renderCell(row.enterprise)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about our plans and pricing.
              </p>
            </div>
            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  data-testid={`faq-item-${i}`}
                >
                  <button
                    className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-semibold text-gray-900">{item.q}</span>
                    {openFaq === i
                      ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0 ml-4" />
                      : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 ml-4" />
                    }
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <p className="text-gray-600 mb-4">Still have questions? Our team is here to help.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <button
                    className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                    data-testid="button-schedule-demo"
                  >
                    {t('pricingPage.faq.ctaDemo')}
                  </button>
                </Link>
                <a href="tel:8884432204">
                  <button
                    className="bg-white text-gray-900 border-2 border-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    data-testid="button-call-us"
                  >
                    {t('pricingPage.faq.ctaCall')}
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
