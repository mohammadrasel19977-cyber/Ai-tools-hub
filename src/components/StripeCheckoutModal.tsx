import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PRICING_PLANS } from '../data/pricing';
import { Check, ShieldCheck, CreditCard, X, ArrowRight, Lock } from 'lucide-react';

export const StripeCheckoutModal: React.FC = () => {
  const { 
    stripeModalOpen, 
    setStripeModalOpen, 
    selectedPlanForCheckout, 
    updateUserPlan, 
    currentUser 
  } = useApp();

  const [processing, setProcessing] = useState(false);

  if (!stripeModalOpen) return null;

  const plan = PRICING_PLANS.find((p) => p.id === selectedPlanForCheckout) || PRICING_PLANS[2];

  const handleSimulatedUpgrade = () => {
    setProcessing(true);
    setTimeout(() => {
      updateUserPlan(plan.id);
      setProcessing(false);
      setStripeModalOpen(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="fixed inset-0" 
        onClick={() => setStripeModalOpen(false)}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Stripe Checkout Gateway</h3>
              <p className="text-xs text-slate-400">Simulated subscription billing environment</p>
            </div>
          </div>
          <button
            onClick={() => setStripeModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Plan Summary Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Selected Tier
            </span>
            <h4 className="text-base font-bold text-white mt-1.5">{plan.name}</h4>
            <p className="text-xs text-slate-400">{plan.credits.toLocaleString()} monthly AI credits</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-white">${plan.priceMonthly}</span>
            <span className="text-xs text-slate-400">/mo</span>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-300">Included in this upgrade:</p>
          <ul className="space-y-1.5">
            {plan.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Architecture Note */}
        <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-[11px] text-slate-400 space-y-1 font-mono">
          <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Stripe Webhook Architecture</span>
          </div>
          <p>
            In production: \`POST /api/create-checkout-session\` redirects to Stripe Hosted Checkout. On success, webhook updates user quota in PostgreSQL.
          </p>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleSimulatedUpgrade}
            disabled={processing}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {processing ? (
              <span>Activating Subscription...</span>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Simulate Stripe Payment (${plan.priceMonthly}/mo)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-slate-500">
            Safe demo mode: No real credit card charged. Upgrades test state immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
