import { CreditTransaction, UsageHistoryItem, UserProfile } from '../types';
import { AI_TOOLS } from '../data/tools';

const TOKEN_KEY = 'ai_hub_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function removeStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  token?: string;
  error?: string;
  code?: string;
}

export const authApi = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    const token = getStoredToken();
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {}
    }
    removeStoredToken();
  },

  async getMe(): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const token = getStoredToken();
    if (!token) return { success: false, error: 'No active session' };

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        removeStoredToken();
        return { success: false, error: 'Session expired' };
      }
      return await res.json();
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  async getCredits(): Promise<{ success: boolean; balance?: number; maxCredits?: number }> {
    const token = getStoredToken();
    if (!token) return { success: false, balance: 0 };

    try {
      const res = await fetch('/api/user/credits', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return { success: false, balance: 0 };
      return await res.json();
    } catch {
      return { success: false, balance: 0 };
    }
  },

  async getTransactions(): Promise<CreditTransaction[]> {
    const token = getStoredToken();
    if (!token) return [];

    try {
      const res = await fetch('/api/user/transactions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return data.transactions || [];
    } catch {
      return [];
    }
  },

  async getUsageHistory(): Promise<UsageHistoryItem[]> {
    const token = getStoredToken();
    if (!token) return [];

    try {
      const res = await fetch('/api/user/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return (data.history || []).map((item: any) => ({
        id: item.id,
        toolId: item.toolId,
        toolName: item.toolName || item.toolId,
        category: AI_TOOLS.find((t) => t.id === item.toolId)?.category || 'writing',
        timestamp: new Date(item.createdAt).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        creditsUsed: item.creditsUsed,
        promptSummary: item.promptSummary || '',
        result: item.result || '',
      }));
    } catch {
      return [];
    }
  },
};
