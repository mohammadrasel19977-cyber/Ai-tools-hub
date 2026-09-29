import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRICING_PLANS, FAQ_ITEMS } from '../data/pricing';
import { Check, HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Zap, ArrowRight, Sparkles } from 'lucide-react';

export const PricingView: React.FC = () => {
  const { setStripeModalOpen, currentUser } = useApp();
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Flexible Usage-Based Plans</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Supercharge Your Workflow at Any Scale
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Access all 26 writing, image, video, business, and SEO tools. Start for free, upgrade when you need higher priority inference and monthly quota.
        </p>

        {/* Monthly / Annual Toggle */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <span className={`text-xs font-medium ${interval === 'monthly' ? 'text-white font-bold' : 'text-slate-400'}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setInterval(interval === 'monthly' ? 'annual' : 'monthly')}
            className="relative w-14 h-7 rounded-full bg-slate-800 p-1 transition-colors border border-slate-700"
          >
            <div className={`w-5 h-5 rounded-full bg-indigo-500 transition-transform ${
              interval === 'annual' ? 'translate-x-7' : ''
            }`} />
          </button>
          <span className={`text-xs font-medium ${interval === 'annual' ? 'text-white font-bold' : 'text-slate-400'} flex items-center gap-1.5`}>
            Annual Billing
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => {
          const price = interval === 'annual' ? plan.priceAnnual : plan.priceMonthly;
          const isCurrentPlan = currentUser?.plan === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl border p-6 flex flex-col justify-between bg-slate-900/80 transition-all ${
                plan.popular
                  ? 'border-indigo-500/60 ring-2 ring-indigo-500/30 shadow-2xl shadow-indigo-500/10 bg-slate-900'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  {plan.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 min-h-[40px] leading-relaxed">
                  {plan.description}
                </p>

                <div className="py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">${price}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
                    <Zap className="w-3.5 h-3.5 fill-indigo-400/20" />
                    <span>{plan.credits.toLocaleString()} AI Credits per month</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included Features:</p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="pt-6 border-t border-slate-800 mt-6">
                <button
                  onClick={() => setStripeModalOpen(true, plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    isCurrentPlan
                      ? 'bg-slate-800 text-slate-400 cursor-default border border-slate-700/60'
                      : plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {isCurrentPlan ? (
                    'Current Plan'
                  ) : plan.id === 'free' ? (
                    'Get Started Free'
                  ) : (
                    <>
                      <span>Upgrade to {plan.name.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Webhook Integration Callout */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Stripe Integration Ready</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Configured with standard customer checkout session endpoints, webhook idempotency, and automated credit allocation in PostgreSQL.
            </p>
          </div>
        </div>
        <button
          onClick={() => setStripeModalOpen(true, 'pro')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
        >
          Test Stripe Checkout Modal
        </button>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about credits, security, and subscriptions</p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
