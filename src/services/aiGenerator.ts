import { getStoredToken } from './authApi';

/**
 * AI Tool Generation Service
 * 
 * ARCHITECTURE NOTICE:
 * This client service currently operates in Demo Mode to safely simulate
 * realistic output generation without exposing API keys.
 * 
 * IN PRODUCTION:
 * Requests are dispatched via:
 * Browser -> POST /api/generate (Next.js/Express Server-Side Route)
 *   -> Auth Session Verification (Supabase Auth)
 *   -> Credit & Quota Validation (PostgreSQL)
 *   -> Google Gemini API (Using server-side process.env.GEMINI_API_KEY)
 *   -> Credit Deductions & Audit Logging
 *   -> Stream / Return Response to Client
 */

export interface GenerationRequest {
  toolId: string;
  inputs: Record<string, any>;
  options?: Record<string, any>;
}

export interface GenerationResponse {
  success: boolean;
  result: string;
  outputType: 'text' | 'markdown' | 'code' | 'image' | 'palette' | 'table';
  creditsDeducted: number;
  balance?: number;
  requestId?: string;
  executionTimeMs: number;
  isDemo: boolean;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const CONNECTED_GEMINI_TOOLS = [
  'ai-chat',
  'blog-writer',
  'facebook-post',
  'youtube-script',
  'email-writer',
  'product-description',
  'grammar-fixer',
  'translator',
  'video-prompt-generator',
  'storyboard-generator',
  'youtube-shorts-ideas',
  'reel-caption-generator',
  'business-name-generator',
  'slogan-generator',
  'brand-color-generator',
  'seo-article-writer',
  'keyword-generator',
  'meta-tags-generator',
  'faq-generator',
];

export function buildPromptForTool(toolId: string, inputs: Record<string, any>): string {
  switch (toolId) {
    case 'ai-chat':
      return inputs.message ? String(inputs.message).trim() : '';

    case 'blog-writer': {
      const topic = inputs.topic ? String(inputs.topic).trim() : '';
      if (!topic) throw new Error('Please enter a blog topic or title.');
      const tone = inputs.tone || 'informative';
      const length = inputs.length || 'medium';
      const audience = inputs.targetAudience ? `\nTarget Audience: ${inputs.targetAudience}` : '';
      const language = inputs.language ? `\nLanguage: ${inputs.language}` : '';
      return `Topic / Title: "${topic}"\nTone: ${tone}\nTarget Length: ${length}${audience}${language}`;
    }

    case 'facebook-post': {
      const topic = inputs.topic ? String(inputs.topic).trim() : 'Product Launch Announcement';
      const style = inputs.postStyle || 'story';
      const emojis = inputs.includeEmojis || 'moderate';
      return `Topic / Announcement: "${topic}"\nPost Style: ${style}\nEmoji Usage: ${emojis}`;
    }

    case 'youtube-script': {
      const topic = inputs.videoTopic ? String(inputs.videoTopic).trim() : 'Top AI Tools That Actually Save Time';
      const duration = inputs.targetDuration || '8min';
      const vibe = inputs.creatorVibe || 'fast-paced';
      return `Video Topic / Title: "${topic}"\nTarget Duration: ${duration}\nChannel Tone & Vibe: ${vibe}`;
    }

    case 'email-writer': {
      const purpose = inputs.purpose ? String(inputs.purpose).trim() : 'Partnership Collaboration';
      const emailType = inputs.emailType || 'cold-outreach';
      return `Email Purpose / Objective: "${purpose}"\nEmail Type / Framework: ${emailType}`;
    }

    case 'product-description': {
      const name = inputs.productName ? String(inputs.productName).trim() : 'Ergonomic Desk Accessory';
      const features = inputs.keyFeatures || 'Lightweight, ultra-durable battery, precision sensor';
      return `Product Name: "${name}"\nKey Features & Technical Specs: ${features}`;
    }

    case 'grammar-fixer': {
      const raw = inputs.rawText ? String(inputs.rawText).trim() : '';
      if (!raw) throw new Error('Please provide the text you would like to proofread and correct.');
      return `Please review, correct grammar, enhance vocabulary, and polish the following text:\n\n"${raw}"`;
    }

    case 'translator': {
      const source = inputs.sourceText ? String(inputs.sourceText).trim() : '';
      if (!source) throw new Error('Please provide the text you would like to translate.');
      const targetLang = inputs.targetLanguage || 'Spanish';
      const register = inputs.register || 'business';
      return `Translate the following text into ${targetLang} with a ${register} register:\n\n"${source}"`;
    }

    case 'video-prompt-generator': {
      const idea = inputs.videoIdea ? String(inputs.videoIdea).trim() : 'Cinematic drone shot over misty mountains at sunrise';
      const model = inputs.videoModel || 'runway';
      const movement = inputs.cameraMovement || 'smooth-dolly';
      return `Video Concept: "${idea}"\nTarget AI Video Generator: ${model}\nDesired Camera Movement: ${movement}`;
    }

    case 'storyboard-generator': {
      const concept = inputs.storyConcept ? String(inputs.storyConcept).trim() : 'Product launch commercial for innovative hardware';
      const scenes = inputs.totalScenes || '6';
      return `Story / Concept: "${concept}"\nTotal Number of Scenes: ${scenes}`;
    }

    case 'youtube-shorts-ideas': {
      const niche = inputs.niche ? String(inputs.niche).trim() : 'Tech & Productivity';
      const hookType = inputs.hookType || 'curiosity';
      return `Niche / Topic: "${niche}"\nHook Strategy: ${hookType}`;
    }

    case 'reel-caption-generator': {
      const summary = inputs.videoSummary ? String(inputs.videoSummary).trim() : 'Behind the scenes at our studio packaging customer orders';
      const cta = inputs.ctaGoal || 'save';
      return `Video Summary: "${summary}"\nPrimary CTA Goal: ${cta}`;
    }

    case 'business-name-generator': {
      const desc = inputs.description ? String(inputs.description).trim() : 'AI productivity software for remote creators';
      const style = inputs.nameStyle || 'modern-tech';
      return `Business / Startup Description: "${desc}"\nNaming Aesthetic: ${style}`;
    }

    case 'slogan-generator': {
      const vp = inputs.valueProp ? String(inputs.valueProp).trim() : 'Restore cloud backups in under 60 seconds';
      return `Product / Service Value Proposition: "${vp}"`;
    }

    case 'brand-color-generator': {
      const mood = inputs.brandMood ? String(inputs.brandMood).trim() : 'Sophisticated modern luxury';
      const base = inputs.primaryBase ? `Preferred Base Color: ${inputs.primaryBase}\n` : '';
      return `Brand Mood & Atmosphere: "${mood}"\n${base}Generate a comprehensive color system with hex codes, roles, and contrast analysis.`;
    }

    case 'seo-article-writer': {
      const kw = inputs.primaryKeyword ? String(inputs.primaryKeyword).trim() : 'Best Cloud Accounting Software';
      const sec = inputs.secondaryKeywords || 'small business bookkeeping, automated invoicing';
      return `Target Primary Keyword: "${kw}"\nSecondary Keywords: ${sec}\nWrite an in-depth, search-optimized article.`;
    }

    case 'keyword-generator': {
      const seed = inputs.seedKeyword ? String(inputs.seedKeyword).trim() : 'cold plunge tub';
      return `Seed Keyword / Topic: "${seed}"\nPerform comprehensive keyword clustering and search query intent analysis.`;
    }

    case 'meta-tags-generator': {
      const kw = inputs.targetKeyword ? String(inputs.targetKeyword).trim() : 'AI Resume Builder';
      return `Primary Target Keyword: "${kw}"\nGenerate high-CTR Google meta title tags and meta descriptions with character count compliance.`;
    }

    case 'faq-generator': {
      const topic = inputs.productOrTopic ? String(inputs.productOrTopic).trim() : 'Home solar panel installation';
      return `Product / Service / Topic: "${topic}"\nGenerate an authoritative, detailed FAQ answering essential customer questions.`;
    }

    default: {
      const entries = Object.entries(inputs).filter(
        ([_, v]) => v !== undefined && v !== null && String(v).trim() !== ''
      );
      return entries.map(([k, v]) => `${k}: ${v}`).join('\n');
    }
  }
}

async function callGeminiChatApi(
  toolId: string,
  prompt: string,
  inputs: Record<string, any>,
  extra?: { persona?: string; creativity?: string; requestId?: string }
) {
  const token = getStoredToken();
  const requestId = extra?.requestId || `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      toolId,
      message: prompt,
      inputs,
      persona: extra?.persona,
      creativity: extra?.creativity,
      requestId,
    }),
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned an invalid response (Status ${res.status}).`);
  }

  if (!res.ok || !data.success) {
    if (res.status === 401 || data.code === 'AUTH_REQUIRED') {
      const err = new Error('Please log in to continue.');
      (err as any).code = 'AUTH_REQUIRED';
      throw err;
    }
    if (data.code === 'ZERO_CREDITS') {
      const err = new Error('Your free credits are finished. You can continue using the AI tools when more credits become available.');
      (err as any).code = 'ZERO_CREDITS';
      (err as any).balance = data.balance ?? 0;
      throw err;
    }
    if (data.code === 'INSUFFICIENT_CREDITS') {
      const err = new Error("You don't have enough credits for this tool.");
      (err as any).code = 'INSUFFICIENT_CREDITS';
      (err as any).balance = data.balance;
      (err as any).cost = data.cost;
      throw err;
    }
    if (data.code === 'RATE_LIMIT_EXCEEDED') {
      const err = new Error(data.error || 'Too many requests. Please wait a moment and try again.');
      (err as any).code = 'RATE_LIMIT_EXCEEDED';
      throw err;
    }
    if (data.refunded) {
      const err = new Error(data.error || 'Generation failed. Your credits have been refunded.');
      (err as any).code = 'GENERATION_FAILED';
      (err as any).refunded = true;
      (err as any).balance = data.balance;
      (err as any).requestId = data.requestId;
      throw err;
    }
    if (data.code === 'MISSING_API_KEY' || res.status === 503) {
      throw new Error(
        'Gemini API key is not configured. Please configure the GEMINI_API_KEY secret in the Secrets panel.'
      );
    }
    const generalErr = new Error(data.error || `Failed to generate response for ${toolId} from Gemini API.`);
    if (data.balance !== undefined) {
      (generalErr as any).balance = data.balance;
    }
    throw generalErr;
  }

  return data;
}

export async function generateToolOutput(
  request: GenerationRequest,
  creditCost: number
): Promise<GenerationResponse> {
  const startTime = Date.now();
  const { toolId, inputs } = request;

  const isRealGeminiTool = CONNECTED_GEMINI_TOOLS.includes(toolId);

  // Only simulate artificial latency for mock/demo tools; real tools perform actual network requests
  if (!isRealGeminiTool) {
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }

  let result = '';
  let outputType: GenerationResponse['outputType'] = 'markdown';
  let metadata: Record<string, any> | undefined = undefined;
  let isDemo = !isRealGeminiTool;
  let serverBalance: number | undefined = undefined;
  let serverCreditsDeducted: number | undefined = undefined;
  let serverRequestId: string | undefined = undefined;

  switch (toolId) {
    // ---------------- 1. AI WRITING ----------------
    case 'ai-chat': {
      const msg = inputs.message ? String(inputs.message).trim() : '';
      if (!msg) {
        throw new Error('Please enter a message or prompt to send to Gemini.');
      }

      const data = await callGeminiChatApi(toolId, msg, inputs, {
        persona: inputs.persona,
        creativity: inputs.creativity,
      });

      serverBalance = data.balance;
      serverCreditsDeducted = data.creditsDeducted;
      serverRequestId = data.requestId;

      result = data.result || 'No response generated.';
      metadata = {
        model: data.model || 'gemini-2.5-flash-lite',
        persona: data.persona || inputs.persona || 'helpful',
        temperature: data.temperature ?? (inputs.creativity === 'precise' ? 0.2 : inputs.creativity === 'creative' ? 1.0 : 0.7),
      };
      isDemo = false;
      break;
    }

    case 'blog-writer': {
      const prompt = buildPromptForTool(toolId, inputs);
      const data = await callGeminiChatApi(toolId, prompt, inputs);

      serverBalance = data.balance;
      serverCreditsDeducted = data.creditsDeducted;
      serverRequestId = data.requestId;

      result = data.result || 'No article generated.';
      metadata = {
        model: data.model || 'gemini-2.5-flash-lite',
        tone: inputs.tone || 'informative',
        length: inputs.length || 'medium',
        targetAudience: inputs.targetAudience || undefined,
        temperature: data.temperature,
      };
      isDemo = false;
      break;
    }

    case 'facebook-post':
    case 'youtube-script':
    case 'email-writer':
    case 'product-description':
    case 'grammar-fixer':
    case 'translator': {
      const prompt = buildPromptForTool(toolId, inputs);
      const data = await callGeminiChatApi(toolId, prompt, inputs);

      serverBalance = data.balance;
      serverCreditsDeducted = data.creditsDeducted;
      serverRequestId = data.requestId;

      result = data.result || 'No output generated.';
      metadata = {
        model: data.model || 'gemini-2.5-flash-lite',
        toolId,
        temperature: data.temperature,
      };
      isDemo = false;
      break;
    }

    // ---------------- 2. AI IMAGE ----------------
    case 'ai-image-generator': {
      outputType = 'image';
      const prompt = inputs.prompt || 'Futuristic glass smartwatch on black volcanic sand';
      const ratio = inputs.aspectRatio || '1:1';
      const style = inputs.artStyle || 'photorealistic';
      metadata = {
        prompt,
        aspectRatio: ratio,
        style,
        resolution: '2048x2048 (Simulated 4K UHD)',
        engine: 'Gemini Imagen 3 / SDXL Architecture',
      };
      result = `IMAGE_GENERATED:${prompt}`;
      break;
    }

    case 'background-remover': {
      outputType = 'image';
      const subj = inputs.imageSubject || 'product';
      const prompt = inputs.prompt || 'Ceramic mug on wooden table';
      metadata = {
        subject: subj,
        prompt,
        transparency: 'PNG Alpha 32-bit with sub-pixel edge feathering',
        engine: 'DeepLab-v3 / Segment Anything (SAM)',
      };
      result = `IMAGE_BG_REMOVED:${prompt}`;
      break;
    }

    case 'image-upscaler': {
      outputType = 'image';
      const factor = inputs.upscaleFactor || '2x';
      const prompt = inputs.prompt || 'Vintage architectural photo';
      metadata = {
        upscaleFactor: factor,
        prompt,
        finalDimensions: factor === '4x' ? '3840 x 2160 (4K UHD)' : '1920 x 1080 (Full HD)',
        engine: 'Real-ESRGAN / SwinIR Neural Super-Resolution',
      };
      result = `IMAGE_UPSCALED:${prompt}`;
      break;
    }

    case 'image-to-prompt': {
      const desc = inputs.imageDescription || 'A minimalist dark room with sunlight beam';
      const engine = inputs.targetEngine || 'gemini';
      result = `### Reverse-Engineered AI Prompt (${engine.toUpperCase()})

**Primary Prompt Formula:**
\`\`\`text
${desc}, captured on Hasselblad H6D-100c, 80mm prime lens, f/2.8, cinematic chiaroscuro directional ray lighting, warm ambient dust particles, ultra-photorealistic texture fidelity, architectural digest photography, 8k resolution, color graded in DaVinci Resolve
\`\`\`

---

**Parameter Breakdown:**
* **Subject & Context:** ${desc}
* **Lighting Model:** Volumetric god rays with deep natural shadow roll-off
* **Camera / Lens:** Medium format 80mm f/2.8 for gentle depth of field
* **Negative Prompt:** \`blurry, noisy, low resolution, oversaturated, deformed edges, chromatic aberration\`

---
*Copy and paste directly into Midjourney, Stable Diffusion, or Gemini Imagen 3.*`;
      break;
    }

    case 'ai-avatar-generator': {
      outputType = 'image';
      const prompt = inputs.prompt || 'Professional corporate executive portrait in navy blazer';
      const style = inputs.avatarStyle || 'linkedin';
      metadata = {
        avatarStyle: style,
        prompt,
        lighting: 'Rembrandt 3-point softbox portrait lighting',
        engine: 'Photorealistic Digital Persona Synthesis',
      };
      result = `AVATAR_GENERATED:${prompt}`;
      break;
    }

    // ---------------- 3. AI VIDEO ----------------
    case 'video-prompt-generator':
    case 'storyboard-generator':
    case 'youtube-shorts-ideas':
    case 'reel-caption-generator': {
      const prompt = buildPromptForTool(toolId, inputs);
      const data = await callGeminiChatApi(toolId, prompt, inputs);

      serverBalance = data.balance;
      serverCreditsDeducted = data.creditsDeducted;
      serverRequestId = data.requestId;

      result = data.result || 'No output generated.';
      metadata = {
        model: data.model || 'gemini-2.5-flash-lite',
        toolId,
        temperature: data.temperature,
      };
      isDemo = false;
      break;
    }

    // ---------------- 4. BUSINESS TOOLS ----------------
    case 'logo-maker': {
      outputType = 'image';
      const brand = inputs.brandName || 'Apex Vault';
      const ind = inputs.industry || 'Cybersecurity';
      metadata = {
        brandName: brand,
        industry: ind,
        type: 'Vector Iconography & Geometric Mark',
        palette: ['#0F172A', '#6366F1', '#38BDF8', '#F8FAFC'],
      };
      result = `LOGO_GENERATED:${brand}`;
      break;
    }

    case 'business-name-generator':
    case 'slogan-generator': {
      const prompt = buildPromptForTool(toolId, inputs);
      const data = await callGeminiChatApi(toolId, prompt, inputs);

      serverBalance = data.balance;
      serverCreditsDeducted = data.creditsDeducted;
      serverRequestId = data.requestId;

      result = data.result || 'No output generated.';
      metadata = {
        model: data.model || 'gemini-2.5-flash-lite',
        toolId,
        temperature: data.temperature,
      };
      isDemo = false;
      break;
    }

    case 'brand-color-generator': {
      outputType = 'palette';
      const prompt = buildPromptForTool(toolId, inputs);
      const data = await callGeminiChatApi(toolId, prompt, inputs);

      serverBalance = data.balance;
      serverCreditsDeducted = data.creditsDeducted;
      serverRequestId = data.requestId;

      result = data.result || 'No output generated.';

      // Extract hex codes from the Gemini response to populate color palette tokens
      const hexMatches = Array.from(new Set(result.match(/#([0-9A-Fa-f]{6})/g) || []));
      const defaultHexes = ['#4F46E5', '#06B6D4', '#F59E0B', '#0F172A', '#1E293B', '#F8FAFC'];
      const paletteHexes = hexMatches.length >= 3 ? hexMatches.slice(0, 6) : defaultHexes;

      const roleNames = [
        'Primary Brand',
        'Secondary Accent',
        'Highlight Accent',
        'Deep Canvas',
        'Surface Card',
        'High Contrast Text',
      ];

      const tokens = paletteHexes.map((hex, idx) => ({
        name: roleNames[idx] || `Color Accent ${idx + 1}`,
        hex: hex.toUpperCase(),
        role:
          idx === 0
            ? 'Dominant brand tone, primary buttons & CTA'
            : idx === 1
            ? 'Secondary accents and badges'
            : idx === 2
            ? 'Warm energetic highlights'
            : idx === 3
            ? 'Deep background foundation'
            : idx === 4
            ? 'Card surfaces & containers'
            : 'Headings and high-contrast labels',
        contrastOnDark: idx >= 3 ? '1.4:1' : '8.5:1 (AAA)',
      }));

      metadata = {
        model: data.model || 'gemini-2.5-flash-lite',
        toolId,
        mood: inputs.brandMood || 'Custom Palette',
        tokens,
        temperature: data.temperature,
      };
      isDemo = false;
      break;
    }

    // ---------------- 5. SEO TOOLS ----------------
    case 'seo-article-writer':
    case 'keyword-generator':
    case 'meta-tags-generator':
    case 'faq-generator': {
      const prompt = buildPromptForTool(toolId, inputs);
      const data = await callGeminiChatApi(toolId, prompt, inputs);

      serverBalance = data.balance;
      serverCreditsDeducted = data.creditsDeducted;
      serverRequestId = data.requestId;

      result = data.result || 'No output generated.';
      metadata = {
        model: data.model || 'gemini-2.5-flash-lite',
        toolId,
        temperature: data.temperature,
      };
      isDemo = false;
      break;
    }

    case 'schema-generator': {
      outputType = 'code';
      const sType = inputs.schemaType || 'FAQPage';
      const details = inputs.entityDetails || 'Company details and common questions';
      result = `<!-- JSON-LD Schema generated for ${sType} -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "${sType}",
  "name": "AI Tools Hub Platform",
  "description": "Enterprise-ready AI generation hub with 26+ specialized tools.",
  "url": "https://aitoolshub.io",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All modern browsers",
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "1280"
  },
  "creator": {
    "@type": "Organization",
    "name": "AI Tools Hub Inc.",
    "logo": "https://aitoolshub.io/logo.png"
  }
}
</script>`;
      break;
    }

    default: {
      result = `### Generated Output for ${toolId}

Your request was processed successfully:
${JSON.stringify(inputs, null, 2)}

*Generated in Demo Simulation Mode • Ready for server-side Gemini API route hook.*`;
    }
  }

  const executionTimeMs = Date.now() - startTime;

  return {
    success: true,
    result,
    outputType,
    creditsDeducted: serverCreditsDeducted ?? creditCost,
    balance: serverBalance,
    requestId: serverRequestId,
    executionTimeMs,
    isDemo,
    timestamp: new Date().toLocaleTimeString(),
    metadata,
  };
}
