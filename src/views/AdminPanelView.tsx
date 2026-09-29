import React, { useState } from 'react';
import { useApp, AdminTab } from '../context/AppContext';
import { INITIAL_ADMIN_USERS, INITIAL_AUDIT_LOGS, INITIAL_PROMPT_TEMPLATES } from '../data/mockAdmin';
import { AI_TOOLS } from '../data/tools';
import { PRICING_PLANS } from '../data/pricing';
import { 
  ShieldCheck, 
  Users, 
  Wrench, 
  FileCode, 
  Coins, 
  DollarSign, 
  BarChart3, 
  ShieldAlert, 
  Key, 
  Search, 
  Check, 
  Plus, 
  AlertCircle, 
  Edit3, 
  ToggleLeft, 
  ToggleRight, 
  Lock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Cpu,
  RefreshCw,
  Sliders
} from 'lucide-react';

export const AdminPanelView: React.FC = () => {
  const { adminTab, setAdminTab, addToast } = useApp();

  const [users, setUsers] = useState(INITIAL_ADMIN_USERS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [prompts, setPrompts] = useState(INITIAL_PROMPT_TEMPLATES);
  const [toolCosts, setToolCosts] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    AI_TOOLS.forEach((t) => { map[t.id] = t.creditCost; });
    return map;
  });

  const [userSearch, setUserSearch] = useState('');
  const [logFilter, setLogFilter] = useState('ALL');
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(null);
  const [promptText, setPromptText] = useState('');

  const tabs: { id: AdminTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'tools', label: 'AI Tools Management', icon: Wrench },
    { id: 'prompts', label: 'Prompt Management', icon: FileCode },
    { id: 'credits', label: 'Credit Management', icon: Coins },
    { id: 'pricing', label: 'Pricing Management', icon: DollarSign },
    { id: 'analytics', label: 'Usage Analytics', icon: TrendingUp },
    { id: 'security', label: 'Security & Audit Logs', icon: ShieldAlert },
    { id: 'api-settings', label: 'API Settings', icon: Key },
  ];

  // Quick Action Handlers
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
      )
    );
    addToast({ title: 'User status updated', type: 'info' });
  };

  const handleGrantUserCredits = (userId: string, amount: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, credits: u.credits + amount } : u))
    );
    addToast({ title: `Granted +${amount} credits to user`, type: 'success' });
  };

  const handleUpdateToolCost = (toolId: string, newCost: number) => {
    setToolCosts((prev) => ({ ...prev, [toolId]: Math.max(1, newCost) }));
    addToast({ title: `Updated credit cost for ${toolId}`, type: 'success' });
  };

  const handleEditPrompt = (index: number) => {
    setEditingPromptIndex(index);
    setPromptText(prompts[index].systemPrompt);
  };

  const handleSavePrompt = (index: number) => {
    setPrompts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], systemPrompt: promptText, lastUpdated: 'Today' };
      return next;
    });
    setEditingPromptIndex(null);
    addToast({ title: 'System prompt template saved', type: 'success' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Admin Control Center
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Protected Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enterprise management interface for users, credits, prompt engineering, and security telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Server Proxy: Online (Gemini 2.5)</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: OVERVIEW / DASHBOARD ================= */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Registered Users</span>
              <p className="text-2xl font-bold text-white">12,480</p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <TrendingUp className="w-3.5 h-3.5" /> +14.2% this month
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">24h AI Invocations</span>
              <p className="text-2xl font-bold text-indigo-400">48,290</p>
              <p className="text-[11px] text-slate-400 font-mono">Avg Latency: 920ms</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Credits Consumed (Today)</span>
              <p className="text-2xl font-bold text-amber-400">142,500</p>
              <p className="text-[11px] text-slate-400 font-mono">Across 26 tools</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Server Security Status</span>
              <p className="text-2xl font-bold text-emerald-400">Healthy</p>
              <p className="text-[11px] text-slate-400 font-mono">Zero Key Leaks • TLS 1.3</p>
            </div>
          </div>

          {/* Quick System Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Server-Side Proxy Pipeline</h3>
              <p className="text-xs text-slate-400">
                All requests routed through <code className="text-indigo-300">/api/generate</code>. Gemini credentials remain isolated in server environment.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">Status: Ready for deployment</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Database Synchronization</h3>
              <p className="text-xs text-slate-400">
                Supabase PostgreSQL schemas configured with Row Level Security (RLS) for user-scoped credits.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">Schema version: 2.1.0</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Payment Gateway</h3>
              <p className="text-xs text-slate-400">
                Stripe webhook endpoints verified. Automated credit top-ups mapped to starter, pro, and business tiers.
              </p>
              <div className="text-[11px] text-slate-500 font-mono">Webhooks: Active</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: USER MANAGEMENT ================= */}
      {adminTab === 'users' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">User Accounts ({users.length})</h2>
              <p className="text-xs text-slate-400">Search, manage subscriber tiers, and grant test credits</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {users
                  .filter((u) => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div>{u.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'admin' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-indigo-400 font-mono text-[11px]">
                        {u.plan}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                        {u.credits.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.status === 'active' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {u.lastActive}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleGrantUserCredits(u.id, 500)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-medium transition-colors"
                        >
                          +500 cr
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                            u.status === 'active' ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: AI TOOLS MANAGEMENT ================= */}
      {adminTab === 'tools' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">All 26 AI Generation Tools</h2>
            <p className="text-xs text-slate-400">Configure credit costs, active states, and engine parameters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {AI_TOOLS.map((tool) => {
              const currentCost = toolCosts[tool.id] || tool.creditCost;
              return (
                <div
                  key={tool.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">{tool.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-mono">{tool.category}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Cost:</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={currentCost}
                      onChange={(e) => handleUpdateToolCost(tool.id, parseInt(e.target.value) || 1)}
                      className="w-14 text-xs p-1 rounded bg-slate-900 border border-slate-700 text-amber-300 text-center font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-500">cr</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 4: PROMPT MANAGEMENT ================= */}
      {adminTab === 'prompts' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">System Prompt Engineering</h2>
            <p className="text-xs text-slate-400">Tune and version the master system instructions sent to Gemini API</p>
          </div>

          <div className="space-y-4">
            {prompts.map((p, idx) => {
              const isEditing = editingPromptIndex === idx;
              return (
                <div key={p.toolId} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">{p.toolId}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        v{p.version}
                      </span>
                      <span className="text-[10px] text-slate-500">Updated: {p.lastUpdated}</span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingPromptIndex(null)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSavePrompt(idx)}
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditPrompt(idx)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-indigo-400" />
                        <span>Edit Template</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg bg-slate-900 border border-indigo-500 text-slate-200 font-mono focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs text-slate-300 font-mono bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                      "{p.systemPrompt}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 5: CREDIT MANAGEMENT ================= */}
      {adminTab === 'credits' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Credit Quota & Grant System</h2>
            <p className="text-xs text-slate-400">Configure default allowances and perform manual credit grants</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-white">Default Free Tier</p>
              <p className="text-xl font-bold text-amber-400">50 Credits</p>
              <p className="text-[11px] text-slate-500">Allocated immediately on sign-up</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-white">Default Starter Tier</p>
              <p className="text-xl font-bold text-amber-400">500 Credits / mo</p>
              <p className="text-[11px] text-slate-500">Refilled on Stripe renewal</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-white">Default Pro Tier</p>
              <p className="text-xl font-bold text-amber-400">2,000 Credits / mo</p>
              <p className="text-[11px] text-slate-500">Priority generation queue</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Batch Credit Allocation</h3>
            <p className="text-xs text-slate-300">
              Grant complimentary credits to all active users for promotional testing:
            </p>
            <button
              onClick={() => {
                setUsers((prev) => prev.map((u) => ({ ...u, credits: u.credits + 100 })));
                addToast({ title: 'Granted +100 credits to all users', type: 'success' });
              }}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Dispatch +100 Global Bonus Credits
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 6: PRICING MANAGEMENT ================= */}
      {adminTab === 'pricing' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white">Pricing & Stripe Plans</h2>
            <p className="text-xs text-slate-400">Manage public tiers, monthly prices, and credit limits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PRICING_PLANS.map((plan) => (
              <div key={plan.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{plan.name}</h3>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase">{plan.id}</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">${plan.priceMonthly}</span>
                  <span className="text-xs text-slate-500">/mo</span>
                </div>
                <div className="text-xs text-amber-300 font-mono">
                  {plan.credits.toLocaleString()} credits / mo
                </div>
                <p className="text-[11px] text-slate-400">
                  Stripe ID: <code className="text-slate-500">price_{plan.id}_tier</code>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 7: USAGE ANALYTICS ================= */}
      {adminTab === 'analytics' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Usage Analytics & Model Telemetry</h2>
            <p className="text-xs text-slate-400">Track tool demand, peak execution hours, and token consumption</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Top Tool By Volume</span>
              <p className="text-base font-bold text-white">Blog Writer</p>
              <p className="text-[11px] text-slate-500">32.4% of total requests</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Fastest Inference</span>
              <p className="text-base font-bold text-white">Slogan Generator</p>
              <p className="text-[11px] text-slate-500">Avg 420ms response time</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Highest Credit Draw</span>
              <p className="text-base font-bold text-white">AI Image Generator</p>
              <p className="text-[11px] text-slate-500">4 credits per synthesis</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 8: SECURITY & AUDIT LOGS ================= */}
      {adminTab === 'security' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Security & Audit Logs</h2>
              <p className="text-xs text-slate-400">Real-time system events, API invocations, and auth audits</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Filter:</span>
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1"
              >
                <option value="ALL">All Categories</option>
                <option value="TOOL_EXECUTION">TOOL_EXECUTION</option>
                <option value="AUTH">AUTH</option>
                <option value="CREDIT">CREDIT</option>
                <option value="SECURITY">SECURITY</option>
                <option value="ADMIN_CHANGE">ADMIN_CHANGE</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs
                  .filter((log) => logFilter === 'ALL' || log.category === logFilter)
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-500">{log.timestamp}</td>
                      <td className="py-3 px-4 text-indigo-300 font-semibold">{log.category}</td>
                      <td className="py-3 px-4 text-slate-200">{log.action}</td>
                      <td className="py-3 px-4 text-slate-400">{log.userEmail}</td>
                      <td className="py-3 px-4 text-slate-500">{log.ipAddress}</td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{log.details}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 9: API SETTINGS ================= */}
      {adminTab === 'api-settings' && (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">API Settings & Credentials Isolation</h2>
            <p className="text-xs text-slate-400">Strict server-side verification of external services</p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Lock className="w-4 h-4" />
              <span>Zero Client-Side Secret Exposure Standard</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              No API keys or secret tokens are embedded in frontend client builds. All operations route through the backend server proxy.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Google Gemini API</p>
                <p className="text-[11px] text-slate-500 font-mono">Environment Var: GEMINI_API_KEY (Server-side)</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Configured Server-Side
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Supabase Authentication & Database</p>
                <p className="text-[11px] text-slate-500 font-mono">Environment Var: SUPABASE_SERVICE_ROLE_KEY</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Ready for Connection
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Stripe Webhook Secret</p>
                <p className="text-[11px] text-slate-500 font-mono">Environment Var: STRIPE_WEBHOOK_SECRET</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Ready for Connection
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
