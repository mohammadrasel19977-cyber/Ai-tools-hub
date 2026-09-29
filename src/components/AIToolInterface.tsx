import React, { useState, useEffect } from 'react';
import { AITool } from '../types';
import { AI_TOOLS, CATEGORY_INFO } from '../data/tools';
import { DynamicIcon } from './DynamicIcon';
import { useApp } from '../context/AppContext';
import { generateToolOutput, GenerationResponse, CONNECTED_GEMINI_TOOLS } from '../services/aiGenerator';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  Star, 
  Zap, 
  ArrowLeft, 
  Clock, 
  ShieldAlert, 
  ExternalLink,
  Code,
  Palette,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';

interface AIToolInterfaceProps {
  tool?: AITool;
  toolId?: string;
}

export const AIToolInterface: React.FC<AIToolInterfaceProps> = ({ tool: propTool, toolId: propToolId }) => {
  const { 
    selectedToolId,
    currentUser, 
    favorites, 
    toggleFavorite, 
    deductCredits, 
    setAuthoritativeBalance,
    refreshTransactions,
    recordToolUsage, 
    addToast, 
    navigateTo, 
    setStripeModalOpen 
  } = useApp();

  const activeId = propTool?.id || propToolId || selectedToolId;
  const tool = propTool || AI_TOOLS.find((t) => t.id === activeId) || AI_TOOLS[0];

  // State for dynamic inputs
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Ready');
  const [output, setOutput] = useState<GenerationResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const isFav = favorites.includes(tool.id);
  const catInfo = CATEGORY_INFO[tool.category] || CATEGORY_INFO['writing'];

  // Initialize form default values
  useEffect(() => {
    if (!tool) return;
    const defaults: Record<string, any> = {};
    tool.inputs.forEach((field) => {
      defaults[field.id] = field.defaultValue !== undefined ? field.defaultValue : '';
    });
    setFormData(defaults);
    setOutput(null);
    setLoading(false);
  }, [tool?.id]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleApplySample = (sample: string) => {
    // Find primary text or textarea field
    const primaryField = tool.inputs.find((f) => f.type === 'textarea' || f.type === 'text');
    if (primaryField) {
      handleInputChange(primaryField.id, sample);
      addToast({ title: 'Sample prompt loaded', type: 'info' });
    }
  };

  const handleClear = () => {
    const cleared: Record<string, any> = {};
    tool.inputs.forEach((field) => {
      cleared[field.id] = field.defaultValue !== undefined ? field.defaultValue : '';
    });
    setFormData(cleared);
    setOutput(null);
    addToast({ title: 'Input cleared', type: 'info' });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Login required check (Requirement 8)
    if (!currentUser) {
      addToast({
        title: 'Login Required',
        description: 'Please log in to use this AI tool and receive your free credits.',
        type: 'warning',
      });
      navigateTo('login');
      return;
    }

    // 2. Credits exhausted check (Requirement 6)
    if (currentUser.credits === 0) {
      addToast({
        title: 'Credits Exhausted',
        description: 'Your free credits are finished. You can continue using the AI tools when more credits become available.',
        type: 'warning',
      });
      return;
    }

    // 3. Sufficient credits check (Requirement 4)
    if (currentUser.credits < tool.creditCost) {
      addToast({
        title: 'Insufficient Credits',
        description: `You don't have enough credits for this tool. (Current balance: ${currentUser.credits}, needed: ${tool.creditCost})`,
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    if (CONNECTED_GEMINI_TOOLS.includes(tool.id)) {
      setLoadingStep('Connecting to Gemini API...');
      setTimeout(() => {
        setLoadingStep('Generating output with Gemini 2.5 Flash Lite...');
      }, 500);
    } else {
      setLoadingStep('Authenticating session & verifying credits...');
      setTimeout(() => {
        setLoadingStep('Dispatching payload to server-side pipeline...');
      }, 400);

      setTimeout(() => {
        setLoadingStep('Synthesizing high-precision generative output...');
      }, 800);
    }

    try {
      const response = await generateToolOutput(
        { toolId: tool.id, inputs: formData },
        tool.creditCost
      );

      // Synchronize with server authoritative balance
      if (response.balance !== undefined) {
        setAuthoritativeBalance(response.balance);
      } else if (currentUser) {
        deductCredits(tool.creditCost);
      }
      refreshTransactions();

      // Record in history
      const promptSummary = 
        Object.values(formData).find((v) => typeof v === 'string' && v.trim().length > 0) ||
        tool.name;

      recordToolUsage({
        toolId: tool.id,
        toolName: tool.name,
        category: tool.category,
        creditsUsed: tool.creditCost,
        promptSummary: String(promptSummary).slice(0, 80),
        result: response.result,
        metadata: response.metadata,
      });

      setOutput(response);
      addToast({
        title: `${tool.name} completed!`,
        description: `Deducted ${tool.creditCost} credits. Remaining balance: ${response.balance ?? (currentUser.credits - tool.creditCost)} credits.`,
        type: 'success',
      });
    } catch (err: any) {
      if (err?.balance !== undefined) {
        setAuthoritativeBalance(err.balance);
        refreshTransactions();
      }
      const errorMsg = err?.message || 'An error occurred while synthesizing output.';
      addToast({
        title: err?.refunded ? 'Credits Refunded' : 'Generation failed',
        description: errorMsg.length > 90 ? errorMsg.slice(0, 87) + '...' : errorMsg,
        type: err?.refunded ? 'info' : 'error',
      });
      setOutput({
        success: false,
        result: `### ⚠️ Request Failed\n\n${errorMsg}`,
        outputType: 'markdown',
        creditsDeducted: 0,
        executionTimeMs: 0,
        isDemo: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setLoading(false);
      setLoadingStep('Ready');
    }
  };

  const handleCopy = () => {
    if (!output) return;
    let textToCopy = output.result;
    if (output.outputType === 'palette' && output.metadata?.tokens) {
      textToCopy = output.metadata.tokens.map((t: any) => `${t.name}: ${t.hex} (${t.role})`).join('\n');
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addToast({ title: 'Copied to clipboard!', type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    let content = output.result;
    let filename = `${tool.slug}-output.txt`;
    let mimeType = 'text/plain';

    if (output.outputType === 'code' || tool.id === 'schema-generator') {
      filename = `${tool.slug}-schema.json`;
      mimeType = 'application/json';
    } else if (output.outputType === 'markdown') {
      filename = `${tool.slug}-document.md`;
      mimeType = 'text/markdown';
    } else if (output.outputType === 'palette') {
      filename = `${tool.slug}-palette.json`;
      content = JSON.stringify(output.metadata?.tokens || [], null, 2);
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({ title: `Downloaded ${filename}`, type: 'success' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          id="back-to-category-btn"
          onClick={() => navigateTo('category', { category: tool.category })}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {catInfo.name}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            id="fav-tool-btn"
            onClick={() => toggleFavorite(tool.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isFav ? 'Favorited' : 'Favorite'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{tool.creditCost} Credits / run</span>
          </div>
        </div>
      </div>

      {/* Tool Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-xl border ${catInfo.bg} ${catInfo.color}`}>
            <DynamicIcon name={tool.icon} className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {tool.name}
              </h1>
              {tool.badge && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-400 max-w-2xl leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Real API vs Demo Mode Notice Badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono">
          <span className={`w-2 h-2 rounded-full ${CONNECTED_GEMINI_TOOLS.includes(tool.id) ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`}></span>
          <span>{CONNECTED_GEMINI_TOOLS.includes(tool.id) ? 'Gemini 2.5 Flash Lite • Real API' : 'Demo Engine Active • Server API Ready'}</span>
        </div>
      </div>

      {/* Main Grid: Left Inputs / Right Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Options */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
            {/* Sample Prompts */}
            {tool.samplePrompts && tool.samplePrompts.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Quick Inspiration Prompts
                </label>
                <div className="flex flex-col gap-1.5">
                  {tool.samplePrompts.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplySample(sample)}
                      className="text-left text-xs p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-slate-300 hover:text-white hover:border-indigo-500/40 hover:bg-slate-950 transition-colors line-clamp-1"
                    >
                      "{sample}"
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleGenerate} className="space-y-4">
              {tool.inputs.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label 
                    htmlFor={`input-${field.id}`}
                    className="block text-xs font-semibold text-slate-300"
                  >
                    {field.label} {field.required && <span className="text-rose-400">*</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={`input-${field.id}`}
                      required={field.required}
                      rows={field.rows || 4}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y font-sans"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={`input-${field.id}`}
                      value={formData[field.id] || field.defaultValue}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`input-${field.id}`}
                      type="text"
                      required={field.required}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full text-xs rounded-xl bg-slate-950 border border-slate-800 p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  )}
                </div>
              ))}

              {/* Login Required / Insufficient Credits Callouts */}
              {!currentUser ? (
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-200">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Login required to use this AI tool</p>
                      <p className="text-[11px] text-slate-400">Please log in to use this AI tool and receive your free credits.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      id="tool-login-prompt-btn"
                      onClick={() => navigateTo('login')}
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      id="tool-signup-prompt-btn"
                      onClick={() => navigateTo('signup')}
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm shadow-emerald-500/20 transition-colors"
                    >
                      Register (100 Free Credits)
                    </button>
                  </div>
                </div>
              ) : currentUser.credits === 0 ? (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white block">Free credits finished</span>
                    <span className="text-[11px] text-rose-300/90">
                      Your free credits are finished. You can continue using the AI tools when more credits become available.
                    </span>
                  </div>
                </div>
              ) : currentUser.credits < tool.creditCost ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                  <span className="text-[11px]">
                    You have <strong className="text-white">{currentUser.credits}</strong> credits. This tool requires <strong className="text-white">{tool.creditCost}</strong> credits.
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateTo('dashboard')}
                    className="text-[11px] text-amber-400 font-semibold underline hover:text-amber-300"
                  >
                    View Account
                  </button>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  id="clear-form-btn"
                  onClick={handleClear}
                  disabled={loading}
                  className="px-3 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                <button
                  type="submit"
                  id="generate-output-btn"
                  disabled={loading || (currentUser && currentUser.credits === 0)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                    !currentUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/20'
                      : currentUser.credits === 0
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-500/20'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Synthesizing...</span>
                    </>
                  ) : !currentUser ? (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Log In to Generate ({tool.creditCost} credits)</span>
                    </>
                  ) : currentUser.credits === 0 ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-slate-400" />
                      <span>Free Credits Finished (0 credits)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Generate with AI ({tool.creditCost} credits)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Architecture Context Note */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>Production Pipeline Architecture</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400 font-mono">
              Browser → /api/generate (Next.js/Express) → Auth &amp; Credit Check → Gemini API (Server Key) → Deduct &amp; Return
            </p>
            <p className="text-[11px] text-slate-500">
              *Your API key is never exposed to the client browser. In production, requests hit your protected server-side route.
            </p>
          </div>
        </div>

        {/* Right Column: Result Area */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex-1 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden min-h-[500px]">
            {/* Output Header Toolbar */}
            <div className="px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  Generation Output
                </span>
                {output && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {output.executionTimeMs}ms • {output.creditsDeducted} cr
                  </span>
                )}
              </div>

              {output && (
                <div className="flex items-center gap-2">
                  <button
                    id="copy-result-btn"
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    id="download-result-btn"
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}
            </div>

            {/* Output Body */}
            <div className="flex-1 p-6 flex flex-col justify-center overflow-y-auto">
              {loading ? (
                /* Loading State */
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center animate-pulse">
                      <Sparkles className="w-7 h-7 text-indigo-400 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-100">{loadingStep}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      {tool.id === 'ai-chat' || tool.id === 'blog-writer' ? 'Calling Gemini API (gemini-2.5-flash)...' : 'Simulating high-throughput neural inference...'}
                    </p>
                  </div>
                </div>
              ) : output ? (
                /* Render Output */
                <div className="space-y-4">
                  {/* If output is image generation */}
                  {output.outputType === 'image' ? (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 p-4 text-center">
                        <div className="relative aspect-video max-h-[380px] w-full rounded-lg bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-slate-300">
                          <DynamicIcon name={tool.icon} className="w-12 h-12 text-indigo-400 mb-3" />
                          <p className="text-sm font-bold text-white mb-1">
                            {output.metadata?.prompt || tool.name}
                          </p>
                          <p className="text-xs text-slate-400 max-w-md font-mono">
                            {output.metadata?.engine || 'Simulated Gemini Imagen 3 Generation'}
                          </p>
                          <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] font-mono">
                            {output.metadata && Object.entries(output.metadata).map(([k, v]) => (
                              <span key={k} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
                        <span>High-res rendering complete. Click Download to save image package.</span>
                        <button
                          onClick={handleDownload}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download Asset
                        </button>
                      </div>
                    </div>
                  ) : output.outputType === 'palette' && output.metadata?.tokens ? (
                    /* Render Color Palette */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {output.metadata.tokens.map((token: any, idx: number) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 p-3 space-y-2"
                          >
                            <div
                              className="h-16 w-full rounded-lg border border-slate-700/50 shadow-inner flex items-end p-2"
                              style={{ backgroundColor: token.hex }}
                            >
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/70 text-white backdrop-blur-sm">
                                {token.hex}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white">{token.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{token.role}</p>
                              <p className="text-[10px] font-mono text-emerald-400 mt-1">WCAG: {token.contrastOnDark}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Render Text / Markdown / Code */
                    <div className="rounded-xl bg-slate-950 p-5 border border-slate-800 text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap leading-relaxed selection:bg-indigo-500 selection:text-white">
                      {output.result}
                    </div>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-slate-400">
                    <DynamicIcon name={tool.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">No output generated yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Configure your prompt and settings on the left, then click Generate to produce high-precision output.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                {CONNECTED_GEMINI_TOOLS.includes(tool.id) ? 'Server-side Gemini 2.5 Flash Lite Generative API' : 'Demo output simulation for prototype testing'}
              </span>
              <span>{CONNECTED_GEMINI_TOOLS.includes(tool.id) ? 'Gemini 2.5 Flash Lite • Real Output' : 'Gemini 2.5 Flash Lite Server-Side Ready'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
