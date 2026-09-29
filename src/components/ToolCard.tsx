import React from 'react';
import { AITool } from '../types';
import { CATEGORY_INFO } from '../data/tools';
import { DynamicIcon } from './DynamicIcon';
import { useApp } from '../context/AppContext';
import { Star, Zap, ArrowUpRight } from 'lucide-react';

interface ToolCardProps {
  tool: AITool;
  featured?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, featured = false }) => {
  const { openTool, favorites, toggleFavorite } = useApp();
  const isFav = favorites.includes(tool.id);
  const catInfo = CATEGORY_INFO[tool.category];

  return (
    <div
      id={`tool-card-${tool.id}`}
      onClick={() => openTool(tool.id)}
      className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 cursor-pointer bg-slate-900/70 border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-indigo-500/10 ${
        featured ? 'ring-1 ring-indigo-500/30' : ''
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${catInfo.bg} ${catInfo.color}`}>
              <DynamicIcon name={tool.icon} className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-700/60 bg-slate-800/50 text-slate-300">
              {catInfo.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {tool.badge && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                tool.badge === 'Popular'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  : tool.badge === 'New'
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
              }`}>
                {tool.badge}
              </span>
            )}
            <button
              id={`fav-btn-${tool.id}`}
              type="button"
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
              onClick={() => toggleFavorite(tool.id)}
              className="p-1.5 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
            >
              <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors flex items-center justify-between">
          <span>{tool.name}</span>
          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all text-indigo-400" />
        </h3>
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
          {tool.shortDesc}
        </p>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1 font-medium text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span>{tool.creditCost} {tool.creditCost === 1 ? 'credit' : 'credits'}</span>
        </div>
        <span className="text-[11px] text-slate-500 group-hover:text-indigo-400 font-medium transition-colors">
          Open Tool →
        </span>
      </div>
    </div>
  );
};
