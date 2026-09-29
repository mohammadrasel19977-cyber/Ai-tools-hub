import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AI_TOOLS, CATEGORY_INFO } from '../data/tools';
import { ToolCard } from '../components/ToolCard';
import { DynamicIcon } from '../components/DynamicIcon';
import { UsageHistoryItem } from '../types';
import { 
  User, 
  Zap, 
  History, 
  Star, 
  BarChart3, 
  Sparkles, 
  ArrowUpRight, 
  CreditCard, 
  Copy, 
  Check, 
  Eye, 
  X,
  ExternalLink,
  Plus
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    currentUser, 
    usageHistory, 
    creditTransactions,
    favorites, 
    openTool, 
    navigateTo, 
    addToast 
  } = useApp();

  const [selectedHistoryItem, setSelectedHistoryItem] = useState<UsageHistoryItem | null>(null);
  const [copied, setCopied] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-slate-400">Please sign in to view your dashboard.</p>
        <button
          onClick={() => navigateTo('login')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const favoriteTools = AI_TOOLS.filter((t) => favorites.includes(t.id));
  const creditPct = Math.min(100, Math.round((currentUser.credits / currentUser.maxCredits) * 100));

  // Category usage breakdown
  const categoryCounts = usageHistory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRuns = usageHistory.length;
  const totalCreditsUsed = creditTransactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const handleCopyHistory = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast({ title: 'Copied output to clipboard', type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Profile & Quick Overview Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20 shrink-0">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center text-xl font-bold text-white uppercase">
              {currentUser.name.charAt(0)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {currentUser.name}
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentUser.plan}
              </span>
              {currentUser.role === 'admin' && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{currentUser.email}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Member since {currentUser.joinedDate}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              addToast({
                title: 'Upgrade — Coming Soon',
                description: 'Paid plans & credit packs are coming soon! Enjoy your 100 free welcome credits.',
                type: 'info',
              });
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Upgrade — Coming Soon</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Credit Balance Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Current Credit Balance</span>
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-white">
                ⚡ {currentUser.credits.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-mono">Credits</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-indigo-500 h-1.5 rounded-full transition-all"
                style={{ width: `${creditPct}%` }}
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Authoritative server balance</span>
            <span className="text-amber-400 font-mono text-[10px]">{currentUser.credits} left</span>
          </p>
        </div>

        {/* Total Credits Used */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total Credits Used</span>
            <CreditCard className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalCreditsUsed} cr</p>
          <p className="text-[11px] text-slate-400">Deducted across all AI tools</p>
        </div>

        {/* Total Runs */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Total AI Generations</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white">{totalRuns}</p>
          <p className="text-[11px] text-slate-400">Recorded in usage history</p>
        </div>

        {/* Favorite Tools */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Starred Favorites</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          </div>
          <p className="text-2xl font-extrabold text-white">{favoriteTools.length}</p>
          <p className="text-[11px] text-slate-400">Quick-access tools pinned</p>
        </div>
      </div>

      {/* 3. Usage Statistics & Category Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Usage Analytics & Tool Distribution</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Last 30 days</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(['writing', 'image', 'video', 'business', 'seo'] as const).map((cat) => {
            const count = categoryCounts[cat] || 0;
            const info = CATEGORY_INFO[cat];
            const pct = totalRuns > 0 ? Math.round((count / totalRuns) * 100) : 0;
            return (
              <div key={cat} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">{info.name}</span>
                  <span className={`text-xs font-mono font-bold ${info.color}`}>{count} runs</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full ${info.color.replace('text-', 'bg-')}`} style={{ width: `${Math.max(5, pct)}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 font-mono">{pct}% of total activity</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Favorite Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            <span>Favorite Tools ({favoriteTools.length})</span>
          </div>
          <button
            onClick={() => navigateTo('home')}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Browse all 26 tools →
          </button>
        </div>

        {favoriteTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 space-y-2">
            <p className="text-xs">You haven't added any favorite tools yet.</p>
            <p className="text-[11px] text-slate-500">Click the star icon on any tool card to pin it here.</p>
          </div>
        )}
      </div>

      {/* 5. Recent Tool Usage History */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Recent Generation Activity</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">{usageHistory.length} events logged</span>
        </div>

        {usageHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tool Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Prompt / Summary</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {usageHistory.map((item) => {
                  const catInfo = CATEGORY_INFO[item.category];
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <button
                          onClick={() => openTool(item.toolId)}
                          className="hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5"
                        >
                          <span>{item.toolName}</span>
                          <ArrowUpRight className="w-3 h-3 text-slate-500" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catInfo.bg} ${catInfo.color}`}>
                          {catInfo.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate font-mono text-[11px]">
                        {item.promptSummary}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-amber-300">
                        -{item.creditsUsed} cr
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {item.timestamp}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedHistoryItem(item)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors inline-flex items-center gap-1 text-[11px]"
                        >
                          <Eye className="w-3 h-3 text-indigo-400" />
                          <span>View Output</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No generation history yet. Run any AI tool to see your activity logs here.
          </div>
        )}
      </div>

      {/* 6. Authoritative Credit Transaction History (Audit Trail) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Credit Transaction Audit History</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">{creditTransactions.length} records</span>
        </div>

        {creditTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Description / Event</th>
                  <th className="py-3 px-4">Tool / Ref ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {creditTransactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {tx.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              tx.type === 'welcome_bonus'
                                ? 'bg-emerald-400'
                                : tx.type === 'refund'
                                ? 'bg-cyan-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span>{tx.description || tx.type}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {tx.toolId ? (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {tx.toolId}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] ${
                            isPositive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {isPositive ? `+${tx.amount}` : tx.amount} credits
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(tx.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            No credit transactions recorded yet.
          </div>
        )}
      </div>

      {/* History Item Modal */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 z-10 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedHistoryItem.toolName}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedHistoryItem.timestamp} • {selectedHistoryItem.creditsUsed} credits expended
                </p>
              </div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Prompt / Subject:</label>
              <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono">
                {selectedHistoryItem.promptSummary}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              <label className="text-xs font-semibold text-slate-400">Generated Result:</label>
              <pre className="text-xs text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap font-mono leading-relaxed max-h-80 overflow-y-auto">
                {selectedHistoryItem.result}
              </pre>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleCopyHistory(selectedHistoryItem.result)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Output'}</span>
              </button>
              <button
                onClick={() => {
                  openTool(selectedHistoryItem.toolId);
                  setSelectedHistoryItem(null);
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Open Tool Again →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
