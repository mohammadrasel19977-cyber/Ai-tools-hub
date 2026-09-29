import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UsageHistoryItem, ToolCategory, CreditTransaction } from '../types';
import { AI_TOOLS } from '../data/tools';
import { authApi, getStoredToken } from '../services/authApi';

export type AppView = 
  | 'home'
  | 'category'
  | 'tool'
  | 'pricing'
  | 'dashboard'
  | 'profile'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'admin';

export type AdminTab = 
  | 'overview'
  | 'users'
  | 'tools'
  | 'prompts'
  | 'credits'
  | 'pricing'
  | 'analytics'
  | 'security'
  | 'api-settings';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: UserProfile | null;
  currentView: AppView;
  selectedCategory: ToolCategory;
  selectedToolId: string;
  adminTab: AdminTab;
  searchModalOpen: boolean;
  stripeModalOpen: boolean;
  selectedPlanForCheckout: string | null;
  toasts: ToastMessage[];
  usageHistory: UsageHistoryItem[];
  creditTransactions: CreditTransaction[];
  favorites: string[];
  authLoading: boolean;

  // Actions
  navigateTo: (view: AppView, params?: { category?: ToolCategory; toolId?: string; adminTab?: AdminTab }) => void;
  openTool: (toolId: string) => void;
  openCategory: (category: ToolCategory) => void;
  setSearchModalOpen: (open: boolean) => void;
  setStripeModalOpen: (open: boolean, planId?: string) => void;
  toggleFavorite: (toolId: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  deductCredits: (amount: number) => boolean;
  addCredits: (amount: number) => void;
  setAuthoritativeBalance: (newBalance: number) => void;
  refreshBalance: () => Promise<number>;
  refreshTransactions: () => Promise<void>;
  recordToolUsage: (item: Omit<UsageHistoryItem, 'id' | 'timestamp'>) => void;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserPlan: (plan: 'free' | 'starter' | 'pro' | 'business') => void;
  setAdminTab: (tab: AdminTab) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('writing');
  const [selectedToolId, setSelectedToolId] = useState<string>('ai-chat');
  const [adminTab, setAdminTabState] = useState<AdminTab>('overview');
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [stripeModalOpen, setStripeModalOpenState] = useState<boolean>(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<string | null>('pro');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageHistoryItem[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [favorites, setFavorites] = useState<string[]>([
    'ai-chat',
    'blog-writer',
    'facebook-post',
    'youtube-script',
    'seo-article-writer'
  ]);

  // Synchronize session on initial mount
  useEffect(() => {
    const initSession = async () => {
      setAuthLoading(true);
      const token = getStoredToken();
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            setCurrentUser(res.user);
            const [txs, hist] = await Promise.all([
              authApi.getTransactions(),
              authApi.getUsageHistory(),
            ]);
            setCreditTransactions(txs);
            if (hist && hist.length > 0) {
              setUsageHistory(hist);
            }
          } else {
            setCurrentUser(null);
          }
        } catch (err) {
          console.error('Session initialization error:', err);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    };

    initSession();
  }, []);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateTo = (view: AppView, params?: { category?: ToolCategory; toolId?: string; adminTab?: AdminTab }) => {
    if (params?.category) setSelectedCategory(params.category);
    if (params?.toolId) setSelectedToolId(params.toolId);
    if (params?.adminTab) setAdminTabState(params.adminTab);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTool = (toolId: string) => {
    const found = AI_TOOLS.find((t) => t.id === toolId || t.slug === toolId);
    if (found) {
      setSelectedToolId(found.id);
      setSelectedCategory(found.category);
      setCurrentView('tool');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openCategory = (category: ToolCategory) => {
    setSelectedCategory(category);
    setCurrentView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setStripeModalOpen = (open: boolean, planId?: string) => {
    if (planId) setSelectedPlanForCheckout(planId);
    setStripeModalOpenState(open);
  };

  const toggleFavorite = (toolId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(toolId);
      const next = exists ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      if (currentUser) {
        setCurrentUser({ ...currentUser, favorites: next });
      }
      addToast({
        title: exists ? 'Removed from favorites' : 'Added to favorites',
        type: 'info',
      });
      return next;
    });
  };

  const deductCredits = (amount: number): boolean => {
    if (!currentUser) return false;
    if (currentUser.credits < amount) {
      addToast({
        title: 'Insufficient credits',
        description: "You don't have enough credits for this tool.",
        type: 'warning',
      });
      return false;
    }
    setCurrentUser((prev) => (prev ? { ...prev, credits: Math.max(0, prev.credits - amount) } : null));
    return true;
  };

  const setAuthoritativeBalance = (newBalance: number) => {
    setCurrentUser((prev) => (prev ? { ...prev, credits: newBalance } : null));
  };

  const refreshBalance = async (): Promise<number> => {
    const res = await authApi.getCredits();
    if (res.success && res.balance !== undefined) {
      setAuthoritativeBalance(res.balance);
      return res.balance;
    }
    return currentUser?.credits ?? 0;
  };

  const refreshTransactions = async (): Promise<void> => {
    const txs = await authApi.getTransactions();
    setCreditTransactions(txs);
  };

  const addCredits = (amount: number) => {
    if (!currentUser) return;
    setCurrentUser((prev) => (prev ? { ...prev, credits: prev.credits + amount } : null));
    addToast({
      title: `Added ${amount} credits`,
      type: 'success',
    });
  };

  const recordToolUsage = (item: Omit<UsageHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: UsageHistoryItem = {
      ...item,
      id: `hist_${Date.now()}`,
      timestamp: 'Just now',
    };
    setUsageHistory((prev) => [newItem, ...prev.slice(0, 49)]);
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      const pass = password || (email === 'admin@aitoolshub.io' ? 'Admin1234!' : 'Demo1234!');
      const res = await authApi.login(email, pass);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        addToast({
          title: `Welcome back, ${res.user.name}!`,
          description: `Credit Balance: ${res.user.credits} credits`,
          type: 'success',
        });
        const [txs, hist] = await Promise.all([
          authApi.getTransactions(),
          authApi.getUsageHistory(),
        ]);
        setCreditTransactions(txs);
        if (hist.length > 0) {
          setUsageHistory(hist);
        }
        navigateTo('dashboard');
        return true;
      } else {
        addToast({
          title: 'Sign In Failed',
          description: res.error || 'Invalid credentials.',
          type: 'error',
        });
        return false;
      }
    } catch (err: any) {
      addToast({
        title: 'Sign In Failed',
        description: err.message || 'Server connection failed.',
        type: 'error',
      });
      return false;
    }
  };

  const register = async (name: string, email: string, password?: string): Promise<boolean> => {
    try {
      const pass = password || 'Demo1234!';
      const res = await authApi.register(name, email, pass);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        addToast({
          title: `Account Created Successfully!`,
          description: `You have received ${res.user.credits} free credits to use across all AI tools.`,
          type: 'success',
        });
        const [txs, hist] = await Promise.all([
          authApi.getTransactions(),
          authApi.getUsageHistory(),
        ]);
        setCreditTransactions(txs);
        if (hist.length > 0) {
          setUsageHistory(hist);
        }
        navigateTo('dashboard');
        return true;
      } else {
        addToast({
          title: 'Registration Failed',
          description: res.error || 'Failed to create account.',
          type: 'error',
        });
        return false;
      }
    } catch (err: any) {
      addToast({
        title: 'Registration Failed',
        description: err.message || 'Server connection failed.',
        type: 'error',
      });
      return false;
    }
  };

  const logout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setCreditTransactions([]);
    setUsageHistory([]);
    addToast({
      title: 'Signed out successfully',
      description: 'You are now viewing as a guest.',
      type: 'info',
    });
    navigateTo('home');
  };

  const updateUserPlan = (plan: 'free' | 'starter' | 'pro' | 'business') => {
    if (!currentUser) return;
    addToast({
      title: 'Upgrade Coming Soon',
      description: 'Upgrade plans coming soon! Enjoy your free trial credits.',
      type: 'info',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentView,
        selectedCategory,
        selectedToolId,
        adminTab,
        searchModalOpen,
        stripeModalOpen,
        selectedPlanForCheckout,
        toasts,
        usageHistory,
        creditTransactions,
        favorites,
        authLoading,
        navigateTo,
        openTool,
        openCategory,
        setSearchModalOpen,
        setStripeModalOpen,
        toggleFavorite,
        addToast,
        removeToast,
        deductCredits,
        addCredits,
        setAuthoritativeBalance,
        refreshBalance,
        refreshTransactions,
        recordToolUsage,
        login,
        register,
        logout,
        updateUserPlan,
        setAdminTab: setAdminTabState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
