import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AI_TOOLS, CATEGORY_INFO } from '../data/tools';
import { ToolCard } from '../components/ToolCard';
import { DynamicIcon } from '../components/DynamicIcon';
import { ToolCategory } from '../types';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';

export const CategoryView: React.FC = () => {
  const { selectedCategory, openCategory, navigateTo } = useApp();
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'cost-asc' | 'cost-desc' | 'name'>('popular');

  const catInfo = CATEGORY_INFO[selectedCategory];
  const allCategories: ToolCategory[] = ['writing', 'image', 'video', 'business', 'seo'];

  const categoryTools = AI_TOOLS.filter((t) => t.category === selectedCategory);

  const filteredTools = categoryTools
    .filter((t) => {
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.shortDesc.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'cost-asc') return a.creditCost - b.creditCost;
      if (sortBy === 'cost-desc') return b.creditCost - a.creditCost;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // popular
      if (a.badge === 'Popular' && b.badge !== 'Popular') return -1;
      if (b.badge === 'Popular' && a.badge !== 'Popular') return 1;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Pills Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-800/80">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {allCategories.map((cat) => {
            const isCurrent = cat === selectedCategory;
            const info = CATEGORY_INFO[cat];
            return (
              <button
                key={cat}
                onClick={() => openCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <DynamicIcon name={info.icon} className="w-3.5 h-3.5" />
                <span>{info.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-xl border ${catInfo.bg} ${catInfo.color}`}>
            <DynamicIcon name={catInfo.icon} className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {catInfo.name} Suite
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                {categoryTools.length} Tools
              </span>
            </div>
            <p className="mt-1.5 text-sm text-slate-400 max-w-2xl leading-relaxed">
              {catInfo.description}
            </p>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter these tools..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full sm:w-auto text-xs px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="popular">Sort: Popular First</option>
            <option value="name">Sort: A-Z</option>
            <option value="cost-asc">Sort: Lowest Credits</option>
            <option value="cost-desc">Sort: Highest Credits</option>
          </select>
        </div>
      </div>

      {/* Tools Grid */}
      <div>
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 space-y-2">
            <p className="text-sm font-semibold text-slate-300">No tools found matching "{searchFilter}"</p>
            <p className="text-xs text-slate-500">Try adjusting your filter search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};
