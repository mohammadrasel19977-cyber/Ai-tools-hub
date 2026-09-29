import { PricingPlan } from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free Explorer',
    description: 'Perfect for trying out foundational AI writing, SEO, and business generation tools.',
    priceMonthly: 0,
    priceAnnual: 0,
    credits: 50,
    features: [
      '50 monthly AI generation credits',
      'Access to standard AI Writing & SEO tools',
      'Standard generation speed',
      'Community knowledge base & guides',
      'Export results as Markdown and Plain Text',
    ],
    limits: [
      'Standard model generation queue',
      'No batch processing',
      'No high-resolution 4K image upscaling',
    ],
  },
  {
    id: 'starter',
    name: 'Starter Creator',
    description: 'Designed for individual creators, freelancers, and marketers producing content daily.',
    priceMonthly: 19,
    priceAnnual: 15,
    credits: 500,
    features: [
      '500 monthly AI credits (refreshed monthly)',
      'Access to all 26 AI tools in all categories',
      'High-speed generation priority',
      'AI Image Generator (up to 2K resolution)',
      'Save unlimited favorites & history logs',
      'Export to Markdown, PDF, & JSON',
      'Standard email support',
    ],
    limits: [
      'Single user account',
      'Standard API throughput',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Professional',
    description: 'The optimal choice for growth agencies, power creators, and fast-scaling digital brands.',
    priceMonthly: 49,
    priceAnnual: 39,
    credits: 2000,
    popular: true,
    badge: 'Most Popular',
    features: [
      '2,000 monthly AI credits',
      'Highest priority processing with ultra-low latency',
      '4K Image generation & background remover studio',
      'Full cinematic video prompt & storyboard suites',
      'Export custom JSON-LD schema & brand palettes',
      'Early access to new experimental tools',
      'Priority 24/7 dedicated support',
      'Ready for Gemini 2.5 Flash API server integration',
    ],
    limits: [
      'Up to 3 team members (coming soon)',
    ],
  },
  {
    id: 'business',
    name: 'Business Enterprise',
    description: 'For organizations needing high-volume generation, custom templates, and team workflows.',
    priceMonthly: 129,
    priceAnnual: 99,
    credits: 8000,
    badge: 'Best Value',
    features: [
      '8,000 monthly AI credits + rollover option',
      'All 26 tools with unlimited history retention',
      'Dedicated enterprise server-side proxy queue',
      'Custom prompt template management',
      'Team workspace & audit log exports',
      'Commercial usage licensing for all outputs',
      'Custom webhook & Stripe invoice integration',
      'Dedicated account manager & SLA guarantee',
    ],
    limits: [],
  },
];

export const FAQ_ITEMS = [
  {
    question: 'How do credits work across the 26 AI tools?',
    answer: 'Each tool expends a small number of credits per execution based on complexity. For instance, quick text generations (AI Chat, Slogan Generator, Grammar Fixer) use 1 credit, while advanced tools like Image Generator or Long-form Blog Writer consume 3–4 credits. Unused credits rollover on Pro and Business tiers.',
  },
  {
    question: 'Is my credit card charged immediately?',
    answer: 'You can start for free with 50 complimentary credits without a credit card. When upgrading to Starter, Pro, or Business, our checkout is configured for secure Stripe billing with instant activation.',
  },
  {
    question: 'How does the server-side AI architecture ensure security?',
    answer: 'All generative requests are proxied through a secure server-side API. Your browser never accesses or stores sensitive API keys. In production, requests authenticate through Supabase Auth, verify credit balances in PostgreSQL, and securely invoke the Gemini API before returning formatted outputs.',
  },
  {
    question: 'Can I change or cancel my plan at any time?',
    answer: 'Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your billing portal with zero lock-in penalties.',
  },
];
