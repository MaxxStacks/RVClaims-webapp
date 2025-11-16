import { PageLayout } from "@/components/page-layout";
import { useLanguage } from "@/hooks/use-language";
import { Check, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Pricing() {
  const { t } = useLanguage();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: "Starter",
      price: "$299",
      annualPrice: "$2,870",
      description: "Perfect for small dealerships starting their claims journey",
      features: [
        "Up to 50 claims per month",
        "Basic claims processing",
        "Email support",
        "Standard reporting",
        "Mobile app access",
        "Basic integrations"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: "$599",
      annualPrice: "$5,750",
      description: "Ideal for growing dealerships with higher volume needs",
      features: [
        "Up to 200 claims per month",
        "A-Z claims processing",
        "Priority phone & email support",
        "Advanced analytics & reporting",
        "Mobile app access",
        "All manufacturer integrations",
        "Dedicated account manager",
        "Revenue optimization tools"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      annualPrice: "Custom",
      description: "Tailored solutions for multi-location dealership groups",
      features: [
        "Unlimited claims processing",
        "White-glove A-Z processing",
        "24/7 priority support",
        "Custom reporting & dashboards",
        "Mobile app access",
        "Full API access",
        "Multiple dedicated managers",
        "Custom integrations",
        "On-site training",
        "SLA guarantees"
      ],
      cta: "Contact Sales",
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
      unit: "per month",
      description: "Add dealership financing support tools",
      badge: "Q2 2026"
    },
    {
      name: "F&I Services Module",
      price: "$149",
      unit: "per month",
      description: "Complete F&I solutions integration",
      badge: "Q2 2026"
    },
    {
      name: "Marketing Services",
      price: "$199",
      unit: "per month",
      description: "Professional digital marketing support"
    },
    {
      name: "RV Marketplace Access",
      price: "$399",
      unit: "per month",
      description: "10 monthly listings, $0 processing fees, 0% commission",
      badge: "Q1 2026"
    },
    {
      name: "Live Auctions Access",
      price: "$299",
      unit: "per month",
      description: "Exclusive B2B wholesale auction platform",
      badge: "Q3 2026"
    }
  ];

  return (
    <PageLayout
      seoTitle="Pricing - RV Claims Canada"
      seoDescription="Transparent pricing for professional RV claims management services. Choose the plan that fits your dealership's needs with flexible monthly or annual billing options."
    >
      <div className="bg-white">
        {/* Header Section */}
        <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your dealership. All plans include our industry-leading claims processing technology.
            </p>
            
            {/* Billing Period Switcher */}
            <div className="inline-flex items-center gap-3">
              <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                    billingPeriod === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  data-testid="button-billing-monthly"
                >
                  Monthly
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
                  Annual
                </button>
              </div>
              <span className="inline-flex items-center justify-center text-sm bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-md">
                20% OFF ANNUAL PLANS
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
                  Save 20% with Annual Billing
                </h2>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-white text-lg opacity-95">
                Lock in your rate and save hundreds with our annual payment option
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
                      Most Popular
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
                            /{billingPeriod === 'annual' ? 'year' : 'month'}
                          </span>
                        )}
                      </div>
                      {billingPeriod === 'monthly' && plan.annualPrice !== "Custom" && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">or </span>
                          <span className="text-primary font-semibold">
                            {plan.annualPrice}/year
                          </span>
                          <span className="text-gray-500"> (save 20%)</span>
                        </div>
                      )}
                      {billingPeriod === 'annual' && plan.price !== "Custom" && (
                        <div className="mt-2 text-sm">
                          <span className="text-primary font-semibold">
                            20% savings
                          </span>
                          <span className="text-gray-500"> vs monthly billing</span>
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
                Additional Services & Modules
              </h2>
              <p className="text-xl text-gray-600">
                Enhance your plan with powerful add-ons tailored to your business needs
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
                  Contact Sales for Custom Package
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ or Trust Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions About Pricing?
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Our team is here to help you find the perfect solution for your dealership's needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button
                  className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  data-testid="button-schedule-demo"
                >
                  Schedule a Demo
                </button>
              </Link>
              <a href="tel:8882453204">
                <button
                  className="bg-white text-gray-900 border-2 border-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  data-testid="button-call-us"
                >
                  Call Us: (888) 245-3204
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
