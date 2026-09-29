import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ToolCategory } from '../types';
import { 
  Sparkles, 
  Search, 
  Zap, 
  Menu, 
  X, 
  User, 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard, 
  CreditCard,
  Layers,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    currentView, 
    navigateTo, 
    openCategory, 
    setSearchModalOpen, 
    setStripeModalOpen, 
    logout 
  } = useApp();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const categories: { label: string; key: ToolCategory }[] = [
    { label: 'AI Writing', key: 'writing' },
    { label: 'AI Image', key: 'image' },
    { label: 'AI Video', key: 'video' },
    { label: 'Business', key: 'business' },
    { label: 'SEO', key: 'seo' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div 
            id="brand-logo-btn"
            onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                AI Tools Hub
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  26+ Tools
                </span>
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-300">
            <button
              id="nav-home-btn"
              onClick={() => navigateTo('home')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'home' ? 'text-white bg-slate-800/80' : 'hover:text-white hover:bg-slate-900'
              }`}
            >
              Home
            </button>

            {categories.map((cat) => (
              <button
                key={cat.key}
                id={`nav-cat-${cat.key}-btn`}
                onClick={() => openCategory(cat.key)}
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-900 transition-colors"
              >
                {cat.label}
              </button>
            ))}

            <button
              id="nav-pricing-btn"
              onClick={() => navigateTo('pricing')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentView === 'pricing' ? 'text-white bg-slate-800/80' : 'hover:text-white hover:bg-slate-900'
              }`}
            >
              Pricing
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search Button */}
            <button
              id="quick-search-trigger"
              onClick={() => setSearchModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-slate-200 transition-colors"
              title="Search AI Tools (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search tools...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Credit Pill (if logged in) */}
            {currentUser && (
              <button
                id="user-credits-pill"
                onClick={() => navigateTo('dashboard')}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all"
                title="Your Authoritative Credit Balance (Click to view dashboard)"
              >
                <span>⚡ {currentUser.credits.toLocaleString()} Credits</span>
              </button>
            )}

            {/* User Profile / Auth State */}
            {currentUser ? (
              <div className="relative">
                <button
                  id="user-dropdown-toggle"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-slate-200 hidden md:inline max-w-[100px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-50 text-xs text-slate-300"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800/80">
                      <p className="font-semibold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {currentUser.plan} plan
                        </span>
                        {currentUser.role === 'admin' && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        id="dropdown-dashboard-btn"
                        onClick={() => navigateTo('dashboard')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                        <span>User Dashboard</span>
                      </button>

                      <button
                        id="dropdown-profile-btn"
                        onClick={() => navigateTo('profile')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Account Profile</span>
                      </button>

                      <button
                        id="dropdown-billing-btn"
                        onClick={() => navigateTo('pricing')}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Pricing & Plans</span>
                      </button>

                      {currentUser.role === 'admin' && (
                        <button
                          id="dropdown-admin-btn"
                          onClick={() => navigateTo('admin')}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-rose-300 text-left transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                          <span>Admin Control Panel</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800/80">
                      <button
                        id="dropdown-logout-btn"
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 text-left transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => navigateTo('login')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-lg hover:bg-slate-900 transition-colors"
                >
                  Log In
                </button>
                <button
                  id="nav-signup-btn"
                  onClick={() => navigateTo('signup')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-500/20 transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2">
          <div className="space-y-1">
            <button
              onClick={() => { navigateTo('home'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
            >
              Home
            </button>
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => { openCategory(cat.key); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900"
              >
                {cat.label}
              </button>
            ))}
            <button
              onClick={() => { navigateTo('pricing'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-900"
            >
              Pricing
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => { navigateTo('dashboard'); setMobileMenuOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-slate-200"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    Dashboard
                  </span>
                  <span className="text-xs text-amber-300 font-semibold">{currentUser.credits} credits</span>
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => { navigateTo('admin'); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => { navigateTo('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2 text-center text-sm font-medium rounded-lg bg-slate-900 text-slate-200 border border-slate-800"
                >
                  Log In
                </button>
                <button
                  onClick={() => { navigateTo('signup'); setMobileMenuOpen(false); }}
                  className="w-full py-2 text-center text-sm font-semibold rounded-lg bg-indigo-600 text-white"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
