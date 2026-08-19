import React, { useState, useMemo } from 'react';
import { useBrew } from '../../context/BrewContext';
import { CURATED_COLLECTIONS } from '../../data/brewData';
import { StatusBadge } from '../swiftui/StatusBadge';
import { SegmentedControl } from '../swiftui/SegmentedControl';
import { 
  Compass, 
  Search, 
  Terminal, 
  Box, 
  Download, 
  Check, 
  Sparkles, 
  HardDrive, 
  TrendingUp,
  Plus
} from 'lucide-react';

export const DiscoverView: React.FC = () => {
  const { 
    packages, 
    searchQuery, 
    setSearchQuery, 
    setSelectedPackage, 
    installPackage,
    setIsAiAdvisorOpen
  } = useBrew();

  const [typeFilter, setTypeFilter] = useState<'all' | 'formula' | 'cask'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [installingId, setInstallingId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    packages.forEach(p => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [packages]);

  const filteredDiscoverPackages = useMemo(() => {
    return packages
      .filter(p => {
        if (typeFilter === 'formula' && p.type !== 'formula') return false;
        if (typeFilter === 'cask' && p.type !== 'cask') return false;
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q) || p.fullName.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          return matchName || matchDesc;
        }
        return true;
      })
      .sort((a, b) => (a.analyticsRank || 999) - (b.analyticsRank || 999));
  }, [packages, typeFilter, selectedCategory, searchQuery]);

  const handleInstall = async (pkgId: string) => {
    setInstallingId(pkgId);
    await installPackage(pkgId);
    setInstallingId(null);
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#1E1E1E]">
      
      {/* Top Header */}
      <header className="border-b border-[#333333] p-6 space-y-4 shrink-0 bg-[#1E1E1E]/80 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">
              Discover & Install Packages
            </h1>
            <p className="text-xs text-[#777777] mt-0.5">
              Explore CLI tools, development stacks, and macOS GUI software
            </p>
          </div>

          <button
            onClick={() => setIsAiAdvisorOpen(true)}
            className="px-3.5 py-1.5 bg-[#333333] hover:bg-[#444444] text-xs font-medium rounded-md text-white transition-colors border border-[#444444] flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            AI Stack Advisor
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <SegmentedControl
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { id: 'all', label: 'All Packages' },
              { id: 'formula', label: 'Formulas', icon: <Terminal className="w-3 h-3 text-orange-400" /> },
              { id: 'cask', label: 'Casks', icon: <Box className="w-3 h-3 text-blue-400" /> }
            ]}
          />

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-md bg-[#333333] border border-[#444444] text-[#E0E0E0] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Main Discover Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        
        {/* Curated Collections (Shown when not in deep search) */}
        {!searchQuery && selectedCategory === 'All' && typeFilter === 'all' && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-[#666666] uppercase tracking-widest">
              Curated Developer Collections
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CURATED_COLLECTIONS.map(col => (
                <div
                  key={col.id}
                  className="p-5 rounded-2xl bg-[#252525] border border-[#333333] flex flex-col justify-between"
                >
                  <div>
                    <span className="text-sm font-semibold text-white block mb-1">
                      {col.title}
                    </span>
                    <p className="text-xs text-[#777777] mb-4 leading-relaxed">
                      {col.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#333333]">
                    {col.packageIds.map(pkgId => {
                      const match = packages.find(p => p.id === pkgId);
                      if (!match) return null;
                      return (
                        <button
                          key={pkgId}
                          onClick={() => setSelectedPackage(match)}
                          className="px-2 py-1 rounded bg-[#333333] hover:bg-blue-600 text-xs font-mono text-[#CCCCCC] hover:text-white transition-colors cursor-pointer"
                        >
                          {match.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All / Search Results Catalog */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#666666] uppercase tracking-widest">
              {searchQuery ? `Results (${filteredDiscoverPackages.length})` : 'Popular Homebrew Packages'}
            </h2>
            <span className="text-xs text-[#555555]">
              Ranked by 30-day analytics
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDiscoverPackages.map((pkg, idx) => {
              const isCask = pkg.type === 'cask';
              const isInstalling = installingId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className="p-4 rounded-xl bg-[#282828] hover:bg-[#2D2D2D] border border-[#333333] flex flex-col justify-between transition-colors cursor-pointer group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#333333] rounded-lg shrink-0">
                          {isCask ? (
                            <Box className="w-4 h-4 text-blue-400" />
                          ) : idx % 2 === 0 ? (
                            <Terminal className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Terminal className="w-4 h-4 text-orange-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm text-white">
                            {pkg.name}
                          </h4>
                          <span className="text-xs font-mono text-blue-400">
                            v{pkg.latestVersion}
                          </span>
                        </div>
                      </div>

                      <StatusBadge type={pkg.type} />
                    </div>

                    <p className="text-xs text-[#777777] line-clamp-2 mb-3">
                      {pkg.description}
                    </p>
                  </div>

                  <div 
                    className="pt-3 border-t border-[#333333] flex items-center justify-between"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3 text-xs text-[#777777] font-mono">
                      <span>{pkg.size || '30 MB'}</span>
                      {pkg.downloads30d && (
                        <span className="text-[#555555]">
                          {(pkg.downloads30d / 1000).toFixed(0)}k/mo
                        </span>
                      )}
                    </div>

                    {pkg.isInstalled ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        Installed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInstall(pkg.id)}
                        disabled={isInstalling}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium rounded-md text-white transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {isInstalling ? (
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        Install
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
