import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AI_TOOLS, CATEGORY_INFO, POPULAR_TOOL_IDS } from '../data/tools';
import { PRICING_PLANS } from '../data/pricing';
import { ToolCard } from '../components/ToolCard';
import { DynamicIcon } from '../components/DynamicIcon';
import { ToolCategory } from '../types';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Check, 
  Lock, 
  Sliders, 
  ChevronRight,
  TrendingUp,
  Cpu,
  Star
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { navigateTo, openCategory, openTool, setSearchModalOpen, setStripeModalOpen } = useApp();
  const [heroSearch, setHeroSearch] = useState('');
  const [pricingInterval, setPricingInterval] = useState<'monthly' | 'annual'>('monthly');

  const popularTools = AI_TOOLS.filter((t) => POPULAR_TOOL_IDS.includes(t.id));
  const writingTools = AI_TOOLS.filter((t) => t.category === 'writing');
  const imageTools = AI_TOOLS.filter((t) => t.category === 'image');
  const videoTools = AI_TOOLS.filter((t) => t.category === 'video');
  const businessTools = AI_TOOLS.filter((t) => t.category === 'business');
  const seoTools = AI_TOOLS.filter((t) => t.category === 'seo');

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      setSearchModalOpen(true);
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 border-b border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>26 Production-Ready AI Tools • One Single Platform</span>
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              All Your AI Tools in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-300">One Place</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Supercharge your creative and engineering workflows with centralized AI writing, image generation, video prompts, business naming, and search optimization tools.
            </p>
          </div>

          {/* Search AI Tools Bar */}
          <div className="max-w-2xl mx-auto">
            <form 
              onSubmit={handleHeroSearchSubmit}
              className="relative flex items-center p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
            >
              <Search className="w-5 h-5 text-slate-400 ml-3" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search AI tools (e.g. blog writer, logo maker, schema, youtube script)..."
                className="w-full bg-transparent px-3 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0 shadow-md shadow-indigo-500/20"
              >
                Search
              </button>
            </form>

            {/* Quick Category Chips */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-500">Popular:</span>
              <button
                onClick={() => openTool('blog-writer')}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                Blog Writer
              </button>
              <button
                onClick={() => openTool('ai-image-generator')}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                AI Image Generator
              </button>
              <button
                onClick={() => openTool('youtube-script')}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                YouTube Script
              </button>
              <button
                onClick={() => openTool('seo-article-writer')}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
              >
                SEO Article Writer
              </button>
            </div>
          </div>

          {/* Value Stats */}
          <div className="pt-8 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-2xl font-bold text-white">26+</p>
              <p className="text-xs text-slate-400 mt-0.5">Specialized AI Tools</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-2xl font-bold text-indigo-400">5 Suites</p>
              <p className="text-xs text-slate-400 mt-0.5">Writing, Image, Video, Biz, SEO</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-2xl font-bold text-emerald-400">0 ms</p>
              <p className="text-xs text-slate-400 mt-0.5">Zero API Key Sprawl</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
              <p className="text-2xl font-bold text-amber-400">100%</p>
              <p className="text-xs text-slate-400 mt-0.5">Server-Side Protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR TOOLS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Star className="w-4 h-4 fill-indigo-400/20" />
              <span>Community Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
              Popular AI Tools
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              The highest-utilized tools for instant content creation and media synthesis.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} featured />
          ))}
        </div>
      </section>

      {/* 3. AI WRITING TOOLS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
              8 Tools Available
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
              AI Writing Tools
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Draft long-form blog articles, conversational chat replies, video scripts, and marketing copy.
            </p>
          </div>
          <button
            onClick={() => openCategory('writing')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View all 8 tools <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {writingTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* 4. AI IMAGE TOOLS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              5 Tools Available
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
              AI Image Tools
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Photorealistic imagery, transparent background isolation, 4K upscaling, and persona avatars.
            </p>
          </div>
          <button
            onClick={() => openCategory('image')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View all 5 tools <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {imageTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* 5. AI VIDEO TOOLS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
              4 Tools Available
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
              AI Video Tools
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Formulas for Runway & Sora, scene-by-scene storyboard panels, and viral Reels captions.
            </p>
          </div>
          <button
            onClick={() => openCategory('video')}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            View all 4 tools <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videoTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* 6. BUSINESS TOOLS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              4 Tools Available
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
              Business & Branding Tools
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Vector logos, brandable company names, catchy marketing taglines, and accessible color palettes.
            </p>
          </div>
          <button
            onClick={() => openCategory('business')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            View all 4 tools <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {businessTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* 7. SEO TOOLS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              5 Tools Available
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-2">
              SEO & Structured Data Tools
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Rank in Google SERPs with keyword research, CTR meta descriptions, and JSON-LD schema.
            </p>
          </div>
          <button
            onClick={() => openCategory('seo')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View all 5 tools <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seoTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* 8. PRICING PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
            Predictable Quota
          </span>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Transparent, Usage-Based Plans
          </h2>
          <p className="text-sm text-slate-400">
            Start free, then scale seamlessly with high-throughput priority generation.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <span className={`text-xs ${pricingInterval === 'monthly' ? 'text-white font-semibold' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setPricingInterval(pricingInterval === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-12 h-6 rounded-full bg-slate-800 p-1 transition-colors"
            >
              <div className={`w-4 h-4 rounded-full bg-indigo-500 transition-transform ${
                pricingInterval === 'annual' ? 'translate-x-6' : ''
              }`} />
            </button>
            <span className={`text-xs ${pricingInterval === 'annual' ? 'text-white font-semibold' : 'text-slate-400'} flex items-center gap-1.5`}>
              Annual <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan) => {
            const price = pricingInterval === 'annual' ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between bg-slate-900/70 transition-all ${
                  plan.popular
                    ? 'border-indigo-500/60 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/10'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    {plan.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 min-h-[36px]">{plan.description}</p>

                  <div className="mt-4 mb-6">
                    <span className="text-3xl font-extrabold text-white">${price}</span>
                    <span className="text-xs text-slate-400"> / month</span>
                    <p className="text-xs text-indigo-400 font-semibold mt-1">
                      {plan.credits.toLocaleString()} Credits / mo
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-4">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => setStripeModalOpen(true, plan.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {plan.id === 'free' ? 'Get Started Free' : `Upgrade to ${plan.name.split(' ')[0]}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. CALL TO ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-indigo-500/30 bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-950 p-8 sm:p-12 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Consolidate Your Entire AI Stack?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Join thousands of founders, creators, and engineers accelerating their creative output with one centralized, secure AI dashboard.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => openTool('blog-writer')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/20 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore AI Tools Now</span>
            </button>

            <button
              onClick={() => navigateTo('pricing')}
              className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium text-sm transition-colors"
            >
              Compare Plans & Pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
