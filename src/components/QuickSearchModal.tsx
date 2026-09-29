import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { AI_TOOLS, CATEGORY_INFO } from '../data/tools';
import { DynamicIcon } from './DynamicIcon';
import { Search, X, Zap, ArrowRight, CornerDownLeft } from 'lucide-react';

export const QuickSearchModal: React.FC = () => {
  const { searchModalOpen, setSearchModalOpen, openTool } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTools = AI_TOOLS.filter((tool) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.shortDesc.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (searchModalOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchModalOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredTools.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % Math.max(1, filteredTools.length));
    } else if (e.key === 'Enter' && filteredTools[selectedIndex]) {
      e.preventDefault();
      openTool(filteredTools[selectedIndex].id);
      setSearchModalOpen(false);
    } else if (e.key === 'Escape') {
      setSearchModalOpen(false);
    }
  };

  if (!searchModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={() => setSearchModalOpen(false)}
      />

      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 26 AI tools (e.g. blog, youtube, logo, schema)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={() => setSearchModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              const catInfo = CATEGORY_INFO[tool.category];
              return (
                <div
                  key={tool.id}
                  id={`search-item-${tool.id}`}
                  onClick={() => {
                    openTool(tool.id);
                    setSearchModalOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-600/10 border border-indigo-500/30' : 'hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${catInfo.bg} ${catInfo.color}`}>
                      <DynamicIcon name={tool.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{tool.name}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                          {catInfo.name}
                        </span>
                        {tool.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {tool.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                      {tool.creditCost}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
                        Launch <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">
              <p>No AI tools matched "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for writing, image, prompt, or SEO.</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700">↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700">↵</kbd> to launch</span>
          </div>
          <span>Showing {filteredTools.length} of 26 tools</span>
        </div>
      </div>
    </div>
  );
};
