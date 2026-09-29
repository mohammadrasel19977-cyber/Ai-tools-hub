import { GoogleGenAI } from '@google/genai';

export interface GeminiChatRequest {
  message?: string;
  prompt?: string;
  toolId?: string;
  inputs?: Record<string, any>;
  persona?: 'helpful' | 'technical' | 'creative' | 'executive';
  creativity?: 'precise' | 'balanced' | 'creative';
  temperature?: number;
}

export interface GeminiChatResponse {
  success: boolean;
  result?: string;
  error?: string;
  code?: string;
  model?: string;
  toolId?: string;
  persona?: string;
  temperature?: number;
}

export interface GeminiBlogRequest {
  topic: string;
  tone?: 'informative' | 'analytical' | 'conversational' | 'inspirational' | string;
  length?: 'short' | 'medium' | 'long' | string;
  targetAudience?: string;
  language?: string;
}

export interface GeminiBlogResponse {
  success: boolean;
  result?: string;
  error?: string;
  code?: string;
  model?: string;
  tone?: string;
  length?: string;
}

export const TOOL_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  'ai-chat':
    'You are a helpful, friendly, and knowledgeable AI assistant. Provide thoughtful, well-structured, clear, and actionable responses using clean Markdown formatting.',
  'blog-writer':
    'You are an elite content strategist and master blog writer. Write full-length, structured, search-optimized articles with engaging introduction hooks, clear H2 and H3 headings, actionable takeaways, and a compelling conclusion or call-to-action. Format with clean Markdown.',
  'facebook-post':
    'You are an expert social media marketer and copywriter specializing in high-engagement Facebook posts. Craft scroll-stopping posts with strong opening hooks, readable paragraph spacing, engaging value points, tasteful emojis, relevant hashtags, and high-conversion calls-to-action or conversation-starting questions.',
  'youtube-script':
    'You are an acclaimed YouTube video director and scriptwriter. Create structured video scripts with attention-grabbing 5-second opening hooks, timestamped sections, B-roll visual cues in brackets [Visual: ...], host narration, pacing directions, and subscriber calls to action.',
  'email-writer':
    'You are a master direct-response email copywriter. Write conversion-focused emails including 3 high-open-rate subject lines (A/B testing options), a personalized greeting, persuasive body copy using proven copywriting frameworks (e.g., PAS, AIDA, BAB), clear value propositions, and unambiguous calls to action.',
  'product-description':
    'You are a top-tier e-commerce copywriter. Write persuasive, benefit-driven product descriptions that turn browsers into buyers. Highlight sensory details, emotional benefits, core technical specs, and practical applications. Include a captivating headline, bulleted key features/benefits, and a strong buy CTA.',
  'grammar-fixer':
    'You are a world-class editor, proofreader, and linguist. Analyze the provided text for grammatical precision, spelling, punctuation, syntax, tone consistency, and flow. Provide the polished, corrected text followed by a concise breakdown of key improvements and stylistic enhancements made.',
  'translator':
    'You are an expert polyglot linguist and localization specialist. Translate the provided text with complete semantic accuracy, natural native cadence, and appropriate cultural nuances. Maintain the original formatting, tone, and intent. Mention the source and target languages clearly.',
  'video-prompt-generator':
    'You are a cinematic prompt engineer for cutting-edge AI video models (Runway Gen-3, Sora, Pika, Kling, Luma Dream Machine). Generate detailed, production-ready video prompts specifying camera motion (pan, tilt, orbit, tracking), lighting (golden hour, volumetric, chiaroscuro), lens/focal length, depth of field, art style, subject movement, and atmosphere.',
  'storyboard-generator':
    'You are an expert creative director and film storyboard artist. Turn video concepts into detailed, sequential shot-by-shot storyboards. For each shot or scene, detail: Scene #, Duration, Camera Angle/Movement, Visual Action & Composition, Lighting & Mood, Audio/Dialogue/SFX, and Transition.',
  'youtube-shorts-ideas':
    'You are a viral short-form video strategist specializing in YouTube Shorts and TikTok. Generate punchy, high-retention video concepts. For each idea, provide: A viral hook title, 0-3 second visual hook, step-by-step 30-60s retention storyline, on-screen text overlays, audio/pacing style, and pinned comment CTA.',
  'reel-caption-generator':
    'You are an expert Instagram & TikTok copywriter. Create viral, scroll-stopping reel captions. Include an irresistible first-line hook (before the \'...more\' cut), engaging micro-story or value points, engaging discussion question, tailored call-to-action (Share/Save/Comment), and 15-20 targeted, relevant hashtags categorized by reach.',
  'business-name-generator':
    'You are a master branding consultant and namer. Generate memorable, creative, and brandable business and startup names. Categorize them into styles (Modern/Minimalist, Compound/Clever, Evocative/Metaphorical, Tech-forward). For each name, provide its pronunciation, rationale/meaning, and suggested domain extensions (.com, .io, .ai).',
  'slogan-generator':
    'You are an acclaimed creative advertising director. Craft unforgettable brand slogans and taglines. Categorize them by emotional resonance: Action-Oriented, Visionary/Aspirational, Clever/Playful, Concise/Direct, and Problem-Solver. Explain the brand positioning behind each concept.',
  'brand-color-generator':
    'You are a master brand designer and color theorist. Design cohesive, emotionally resonant brand color palettes. For each color, provide: Name, Hex Code (#RRGGBB), Recommended Role (Primary, Secondary, Accent, Neutral Dark, Neutral Light, Background), Contrast Rating, and the psychological/emotional impact of the palette.',
  'seo-article-writer':
    'You are an elite SEO content strategist and writer. Generate comprehensive, search-engine-optimized long-form articles that rank on Google. Structure with target primary and secondary keywords naturally integrated, optimized H1, H2, H3 hierarchy, rich introductory answer box / quick summary, in-depth sections, FAQ schema section, and natural keyword density without keyword stuffing.',
  'keyword-generator':
    'You are an expert SEO specialist and search marketing analyst. Generate high-value keyword clusters based on the given topic. Group keywords by Search Intent (Informational, Commercial, Transactional, Navigational), Search Volume / Competition tier, Long-tail opportunities, and Question-based queries (People Also Ask).',
  'meta-tags-generator':
    'You are an expert technical SEO and copywriter. Generate high-CTR, Google-compliant meta titles (50-60 characters max) and meta descriptions (140-160 characters max). Provide 3 distinct variations (High Click-Through/Emotional, Direct/Benefit-Driven, Keyword-Optimized) along with character counts and Open Graph tags for social sharing.',
  'faq-generator':
    'You are an expert customer experience and technical documentation specialist. Generate a comprehensive FAQ section addressing the most critical, common, and nuanced questions customers or users would have. Provide clear, authoritative, and helpful answers formatted in clean Markdown, complete with structured FAQ schema format suggestion.',
};

export const TOOL_TEMPERATURE_MAP: Record<string, number> = {
  'ai-chat': 0.7,
  'blog-writer': 0.7,
  'facebook-post': 0.8,
  'youtube-script': 0.7,
  'email-writer': 0.6,
  'product-description': 0.7,
  'grammar-fixer': 0.2,
  'translator': 0.3,
  'video-prompt-generator': 0.9,
  'storyboard-generator': 0.7,
  'youtube-shorts-ideas': 0.9,
  'reel-caption-generator': 0.8,
  'business-name-generator': 0.9,
  'slogan-generator': 0.9,
  'brand-color-generator': 0.7,
  'seo-article-writer': 0.6,
  'keyword-generator': 0.4,
  'meta-tags-generator': 0.4,
  'faq-generator': 0.5,
};

const PERSONA_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  helpful:
    'You are a helpful, friendly, and knowledgeable AI assistant. Provide thoughtful, well-structured, clear, and actionable responses using clean Markdown formatting.',
  technical:
    'You are a senior technical architect and software engineer. Provide concise, precise, and technically sound answers with clear reasoning, best practices, and clean code snippets with language tags where appropriate.',
  creative:
    'You are an imaginative, engaging, and creative copywriter and brainstorm partner. Use expressive, vivid language, compelling hooks, and novel perspectives.',
  executive:
    'You are an executive business advisor and strategist. Provide high-level, actionable, structured insights with strategic focus, risk considerations, and clear business outcomes.',
};

const TEMPERATURE_MAP: Record<string, number> = {
  precise: 0.2,
  balanced: 0.7,
  creative: 1.0,
};

export const GEMINI_MODEL = 'gemini-2.5-flash-lite';

export function formatInputsToPrompt(toolId: string, inputs: Record<string, any>): string {
  if (!inputs || typeof inputs !== 'object') return '';
  const entries = Object.entries(inputs).filter(
    ([_, v]) => v !== undefined && v !== null && String(v).trim() !== ''
  );
  if (entries.length === 0) return '';

  return `Tool: ${toolId}\n` + entries
    .map(([key, val]) => `${key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}: ${val}`)
    .join('\n');
}

function formatErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  const rawMsg = error.message || String(error);
  try {
    const parsed = JSON.parse(rawMsg);
    if (parsed?.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // not JSON, use raw
  }
  return rawMsg;
}

async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 2) {
  let lastError: any = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || '';

      // If gemini-2.5-flash-lite is rejected due to API deprecation for new users, fallback to the recommended replacement
      if (
        msg.includes('no longer available') ||
        (msg.includes('NOT_FOUND') && String(params.model).includes('flash-lite'))
      ) {
        try {
          return await ai.models.generateContent({
            ...params,
            model: 'gemini-3.5-flash-lite',
          });
        } catch (fallbackErr) {
          lastError = fallbackErr;
        }
      }

      const isTransient =
        msg.includes('503') ||
        msg.includes('high demand') ||
        msg.includes('UNAVAILABLE') ||
        err?.status === 503;
      if (isTransient && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
}

export async function handleGeminiChat(
  payload: GeminiChatRequest
): Promise<{ status: number; body: GeminiChatResponse }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return {
      status: 503,
      body: {
        success: false,
        error:
          'Gemini API key is not configured. Please configure the GEMINI_API_KEY secret in the AI Studio Secrets panel.',
        code: 'MISSING_API_KEY',
      },
    };
  }

  const {
    toolId = 'ai-chat',
    persona = 'helpful',
    creativity = 'balanced',
  } = payload || {};

  const userPrompt =
    (typeof payload?.message === 'string' && payload.message.trim()) ||
    (typeof payload?.prompt === 'string' && payload.prompt.trim()) ||
    (payload?.inputs ? formatInputsToPrompt(toolId, payload.inputs) : '');

  if (!userPrompt) {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Please provide a message or prompt to send to Gemini.',
        code: 'INVALID_INPUT',
      },
    };
  }

  const systemInstruction =
    TOOL_SYSTEM_INSTRUCTIONS[toolId] ||
    PERSONA_SYSTEM_INSTRUCTIONS[persona] ||
    PERSONA_SYSTEM_INSTRUCTIONS.helpful;

  const temperature =
    payload.temperature ??
    (payload.creativity ? TEMPERATURE_MAP[payload.creativity] : undefined) ??
    TOOL_TEMPERATURE_MAP[toolId] ??
    0.7;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await generateContentWithRetry(ai, {
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature,
      },
    });

    const outputText = response.text || '';

    return {
      status: 200,
      body: {
        success: true,
        result: outputText,
        model: GEMINI_MODEL,
        toolId,
        persona,
        temperature,
      },
    };
  } catch (error: any) {
    const message = formatErrorMessage(error) || 'Failed to generate response from Gemini API';
    return {
      status: 500,
      body: {
        success: false,
        error: message,
        code: 'GEMINI_API_ERROR',
      },
    };
  }
}

const BLOG_TONE_INSTRUCTIONS: Record<string, string> = {
  informative: 'Informative, authoritative, educational, and clear.',
  analytical: 'Thought-provoking, analytical, objective, and deeply reasoned.',
  conversational: 'Conversational, warm, engaging, and relatable with an organic storytelling flow.',
  inspirational: 'Inspirational, motivational, energizing, and forward-looking.',
};

const BLOG_LENGTH_GUIDELINES: Record<string, string> = {
  short: 'Concise quick-read format (~600 words). Highly structured with 3-4 focused sections.',
  medium: 'Comprehensive standard article (~1,200 words). In-depth exploration with 5-6 well-developed sections and actionable takeaways.',
  long: 'Extensive pillar post / ultimate guide (~1,800–2,000+ words). Thorough architectural/strategic analysis, deep-dive sub-sections, practical examples, and exhaustive recommendations.',
};

export async function handleGeminiBlog(
  payload: GeminiBlogRequest
): Promise<{ status: number; body: GeminiBlogResponse }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return {
      status: 503,
      body: {
        success: false,
        error:
          'Gemini API key is not configured. Please configure the GEMINI_API_KEY secret in the AI Studio Secrets panel.',
        code: 'MISSING_API_KEY',
      },
    };
  }

  const { topic, tone = 'informative', length = 'medium', targetAudience, language } = payload || {};

  if (!topic || typeof topic !== 'string' || topic.trim() === '') {
    return {
      status: 400,
      body: {
        success: false,
        error: 'Please provide a blog topic or title to generate an article.',
        code: 'INVALID_INPUT',
      },
    };
  }

  const toneDesc = BLOG_TONE_INSTRUCTIONS[tone] || BLOG_TONE_INSTRUCTIONS.informative;
  const lengthDesc = BLOG_LENGTH_GUIDELINES[length] || BLOG_LENGTH_GUIDELINES.medium;

  const systemInstruction =
    'You are a world-class professional content strategist and senior editorial writer. ' +
    'Your mission is to produce comprehensive, engaging, publication-grade blog posts in rich Markdown format. ' +
    'Structure the post with a captivating H1 title, a hook in the introduction, clear H2 and H3 subheadings, bulleted or numbered insights, actionable takeaways, and a compelling conclusion with call-to-action. ' +
    'Do not include meta commentary or introductory pleasantries like "Sure, here is your blog post". Output only the ready-to-publish article.';

  const promptParts = [
    `Please craft a complete, high-quality blog article on the following topic:\n`,
    `**Title / Topic:** ${topic.trim()}`,
    `**Editorial Tone:** ${toneDesc}`,
    `**Target Length & Depth:** ${lengthDesc}`,
  ];

  if (targetAudience && targetAudience.trim()) {
    promptParts.push(`**Target Audience:** ${targetAudience.trim()}`);
  }

  if (language && language.trim()) {
    promptParts.push(`**Language:** ${language.trim()}`);
  }

  promptParts.push(
    `\nEnsure thorough coverage, smooth transitions between headers, and actionable insights tailored to the reader.`
  );

  const prompt = promptParts.join('\n');

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await generateContentWithRetry(ai, {
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const outputText = response.text || '';

    return {
      status: 200,
      body: {
        success: true,
        result: outputText,
        model: GEMINI_MODEL,
        tone,
        length,
      },
    };
  } catch (error: any) {
    const message = formatErrorMessage(error) || 'Failed to generate blog post from Gemini API';
    return {
      status: 500,
      body: {
        success: false,
        error: message,
        code: 'GEMINI_API_ERROR',
      },
    };
  }
}

