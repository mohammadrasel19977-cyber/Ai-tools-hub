import React from 'react';
import { useApp } from '../context/AppContext';
import { ToolCategory } from '../types';
import { Sparkles, Shield, Lock, Server, Terminal, Github, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { openCategory, navigateTo } = useApp();

  const categories: { label: string; key: ToolCategory }[] = [
    { label: 'AI Writing Suite (8 Tools)', key: 'writing' },
    { label: 'AI Image Studio (5 Tools)', key: 'image' },
    { label: 'AI Video Engines (4 Tools)', key: 'video' },
    { label: 'Business & Branding (4 Tools)', key: 'business' },
    { label: 'SEO & Structured Data (5 Tools)', key: 'seo' },
  ];

  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs">
      {/* Security Architecture Callout */}
      <div className="border-b border-slate-800/60 bg-slate-900/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  Zero-Exposure Server-Side Security
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Production Architecture
                  </span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Browser → Server-side API (/api/generate) → Supabase Auth → PostgreSQL Quota → Gemini API
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs">API keys never exposed to client browser</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">AI Tools Hub</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The centralized multi-modal AI generation workspace. Create blogs, generate graphics, reverse-engineer prompts, and optimize search rankings seamlessly.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All 26 Generation Engines Operational</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">AI Tool Suites</h4>
            <ul className="space-y-2">
              {categories.map((c) => (
                <li key={c.key}>
                  <button
                    onClick={() => openCategory(c.key)}
                    className="hover:text-indigo-400 transition-colors text-left"
                  >
                    {c.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform & Account</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-indigo-400 transition-colors">
                  Overview & Showcase
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('pricing')} className="hover:text-indigo-400 transition-colors">
                  Pricing Plans & Stripe Billing
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('dashboard')} className="hover:text-indigo-400 transition-colors">
                  User Dashboard & Credits
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin')} className="hover:text-indigo-400 transition-colors">
                  Admin Panel & Security Logs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Architecture & Integration Readiness */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Enterprise Readiness</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engineered with clean separation of concerns for rapid backend deployment:
            </p>
            <div className="space-y-1.5 font-mono text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400">•</span>
                <span>Supabase Auth & RLS ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-400">•</span>
                <span>Stripe webhook subscriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-400">•</span>
                <span>Google Gemini 2.5 server SDK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© 2026 AI Tools Hub. Designed for modern high-performance SaaS production.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('pricing')} className="hover:text-slate-300">Privacy Policy</button>
            <button onClick={() => navigateTo('pricing')} className="hover:text-slate-300">Terms of Service</button>
            <button onClick={() => navigateTo('admin')} className="hover:text-slate-300">System Telemetry</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
