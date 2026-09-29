export type ToolCategory = 'writing' | 'image' | 'video' | 'business' | 'seo';

export interface ToolInputField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'number' | 'slider';
  placeholder?: string;
  description?: string;
  defaultValue?: string | number;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  required?: boolean;
}

export interface AITool {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  description: string;
  shortDesc: string;
  icon: string; // Lucide icon name
  badge?: 'Popular' | 'Pro' | 'New' | 'Featured';
  creditCost: number;
  inputs: ToolInputField[];
  samplePrompts: string[];
  outputType: 'text' | 'markdown' | 'code' | 'image' | 'palette' | 'table';
  defaultOutputPlaceholder?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'free' | 'starter' | 'pro' | 'business';
  credits: number;
  maxCredits: number;
  favorites: string[];
  joinedDate: string;
  avatarUrl?: string;
}

export interface UsageHistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  category: ToolCategory;
  timestamp: string;
  creditsUsed: number;
  promptSummary: string;
  result: string;
  metadata?: Record<string, any>;
}

export interface PricingPlan {
  id: 'free' | 'starter' | 'pro' | 'business';
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnual: number;
  credits: number;
  popular?: boolean;
  features: string[];
  limits: string[];
  badge?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  category: 'AUTH' | 'CREDIT' | 'TOOL_EXECUTION' | 'ADMIN_CHANGE' | 'SECURITY';
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  ipAddress: string;
  details: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'free' | 'starter' | 'pro' | 'business';
  credits: number;
  status: 'active' | 'suspended';
  lastActive: string;
  totalRuns: number;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'welcome_bonus' | 'tool_usage' | 'refund' | 'admin_grant' | string;
  toolId?: string;
  requestId?: string;
  description: string;
  createdAt: string;
}
