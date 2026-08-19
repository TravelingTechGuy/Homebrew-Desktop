import React, { useState, useMemo } from 'react';
import { useBrew } from '../../context/BrewContext';
import { BrewPackage } from '../../types';
import { StatusBadge } from '../swiftui/StatusBadge';
import { SegmentedControl } from '../swiftui/SegmentedControl';
import { 
  Package, 
  Box, 
  Terminal, 
  RefreshCw, 
  Pin, 
  Trash2, 
  Search, 
  ArrowUpDown, 
  HardDrive, 
  LayoutList, 
  LayoutGrid,
  ChevronRight
} from 'lucide-react';

export const PackagesView: React.FC = () => {
  const { 
    packages, 
    searchQuery, 
    setSearchQuery, 
    selectedPackage, 
    setSelectedPackage,
    upgradePackage,
    uninstallPackage,
    togglePinPackage,
    upgradeAllOutdated
  } = useBrew();

  const [typeFilter, setTypeFilter] = useState<'all' | 'formula' | 'cask' | 'outdated' | 'pinned'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'popularity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');

  const categories = useMemo(() => {
    const set = new Set<string>();
    packages.filter(p => p.isInstalled).forEach(p => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [packages]);

  const filteredPackages = useMemo(() => {
    return packages
      .filter(p => p.isInstalled)
      .filter(p => {
        if (typeFilter === 'formula' && p.type !== 'formula') return false;
        if (typeFilter === 'cask' && p.type !== 'cask') return false;
        if (typeFilter === 'outdated' && !p.isOutdated) return false;
        if (typeFilter === 'pinned' && !p.isPinned) return false;
        if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q) || p.fullName.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchDeps = p.dependencies.some(d => d.toLowerCase().includes(q));
          return matchName || matchDesc || matchDeps;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') {
          diff = a.name.localeCompare(b.name);
        } else if (sortBy === 'size') {
          diff = (b.sizeBytes || 0) - (a.sizeBytes || 0);
        } else if (sortBy === 'date') {
          diff = (b.installedDate || '').localeCompare(a.installedDate || '');
        } else if (sortBy === 'popularity') {
          diff = (a.analyticsRank || 999) - (b.analyticsRank || 999);
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [packages, typeFilter, selectedCategory, searchQuery, sortBy, sortOrder]);

  const installedCount = packages.filter(p => p.isInstalled).length;
  const formulaeCount = packages.filter(p => p.isInstalled && p.type === 'formula').length;
  const casksCount = packages.filter(p => p.isInstalled && p.type === 'cask').length;
  const outdatedCount = packages.filter(p => p.isInstalled && p.isOutdated).length;
  const pinnedCount = packages.filter(p => p.isInstalled && p.isPinned).length;

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#1E1E1E]">
      
      {/* Top Toolbar Header */}
      <header className="border-b border-[#333333] p-6 space-y-4 shrink-0 bg-[#1E1E1E]/80 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              Installed Packages ({installedCount})
            </h1>
            <p className="text-xs text-[#777777] mt-0.5">
              CLI formulae in Cellar and macOS GUI applications in /Applications
            </p>
          </div>

          {outdatedCount > 0 && (
            <button
              onClick={() => upgradeAllOutdated()}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-medium rounded-md text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Upgrade All ({outdatedCount})
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <SegmentedControl
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { id: 'all', label: 'All', count: installedCount },
              { id: 'formula', label: 'Formulas', count: formulaeCount, icon: <Terminal className="w-3 h-3 text-orange-400" /> },
              { id: 'cask', label: 'Casks', count: casksCount, icon: <Box className="w-3 h-3 text-blue-400" /> },
              { id: 'outdated', label: 'Outdated', count: outdatedCount },
              { id: 'pinned', label: 'Pinned', count: pinnedCount }
            ]}
          />

          {/* Secondary Controls (Category & Sorting & Layout) */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="h-8 px-2.5 text-xs rounded-md bg-[#333333] border border-[#444444] text-[#E0E0E0] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>Category: {cat}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="h-8 px-2.5 text-xs rounded-md bg-[#333333] border border-[#444444] text-[#E0E0E0] focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="date">Sort by Date</option>
              <option value="popularity">Sort by Popularity</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="h-8 px-2.5 rounded-md bg-[#333333] hover:bg-[#444444] border border-[#444444] text-[#CCCCCC] text-xs flex items-center gap-1 cursor-pointer transition-colors"
              title="Toggle sort direction"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span className="uppercase text-[10px] font-mono">{sortOrder}</span>
            </button>

            <div className="flex items-center rounded-md bg-[#333333] border border-[#444444] p-0.5">
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded text-xs cursor-pointer transition-colors ${
                  viewLayout === 'list' ? 'bg-[#4A4A4A] text-white shadow-xs' : 'text-[#888888] hover:text-white'
                }`}
                title="List View"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded text-xs cursor-pointer transition-colors ${
                  viewLayout === 'grid' ? 'bg-[#4A4A4A] text-white shadow-xs' : 'text-[#888888] hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Package List / Grid Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {filteredPackages.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-[#777777]">
            <Search className="w-8 h-8 mb-2 opacity-40 text-[#555555]" />
            <p className="text-sm font-semibold text-[#AAAAAA]">No packages match your query.</p>
            <p className="text-xs text-[#666666] mt-1">Try changing filters or search terms.</p>
          </div>
        ) : viewLayout === 'list' ? (
          /* LIST VIEW (matching Sophisticated Dark aesthetic) */
          <div className="space-y-2">
            {filteredPackages.map((pkg, idx) => {
              const isSelected = selectedPackage?.id === pkg.id;
              const isCask = pkg.type === 'cask';

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#333333] border-blue-500/80 shadow-xs'
                      : 'bg-[#282828] hover:bg-[#2E2E2E] border-[#333333]'
                  }`}
                >
                  {/* Left Column */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="p-2 bg-[#333333] rounded-lg shrink-0">
                      {isCask ? (
                        <Box className="w-5 h-5 text-blue-400" />
                      ) : idx % 2 === 0 ? (
                        <Terminal className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Terminal className="w-5 h-5 text-orange-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-white">
                          {pkg.name}
                        </span>
                        <StatusBadge type={pkg.type} />
                        {pkg.isOutdated && <StatusBadge type="outdated" />}
                        {pkg.isPinned && <StatusBadge type="pinned" />}
                        {pkg.serviceStatus && pkg.serviceStatus !== 'none' && (
                          <StatusBadge serviceStatus={pkg.serviceStatus} />
                        )}
                      </div>

                      <p className="text-xs text-[#777777] truncate mt-0.5">
                        {pkg.description}
                      </p>
                    </div>
                  </div>

                  {/* Middle Column: Version */}
                  <div className="hidden sm:flex items-center gap-6 text-xs text-[#777777] shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-[#555555]">Version</p>
                      <span className="font-mono text-blue-400 font-medium">
                        {pkg.installedVersion || pkg.latestVersion}
                      </span>
                    </div>

                    <span className="text-xs text-[#777777] font-mono">
                      {pkg.size || '32 MB'}
                    </span>
                  </div>

                  {/* Right Column: Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    {pkg.isOutdated && (
                      <button
                        onClick={() => upgradePackage(pkg.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-medium rounded-md text-white transition-colors cursor-pointer"
                      >
                        Update
                      </button>
                    )}

                    <button
                      onClick={() => togglePinPackage(pkg.id)}
                      className={`p-2 rounded-md transition-colors cursor-pointer border ${
                        pkg.isPinned 
                          ? 'bg-purple-950/50 text-purple-400 border-purple-800/40' 
                          : 'bg-[#333333] text-[#777777] hover:text-white border-[#444444]'
                      }`}
                      title={pkg.isPinned ? "Unpin version" : "Pin version"}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => uninstallPackage(pkg.id)}
                      className="p-2 rounded-md bg-[#333333] text-[#777777] hover:text-rose-400 hover:bg-rose-950/30 border border-[#444444] transition-colors cursor-pointer"
                      title="Uninstall package"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* GRID VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPackages.map((pkg, idx) => {
              const isSelected = selectedPackage?.id === pkg.id;
              const isCask = pkg.type === 'cask';

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#333333] border-blue-500/80 shadow-xs'
                      : 'bg-[#282828] hover:bg-[#2E2E2E] border-[#333333]'
                  }`}
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
                            v{pkg.installedVersion || pkg.latestVersion}
                          </span>
                        </div>
                      </div>

                      <StatusBadge type={pkg.type} />
                    </div>

                    <p className="text-xs text-[#777777] line-clamp-2 mb-3">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#333333] flex items-center justify-between" onClick={e => e.stopPropagation()}>
                    <span className="text-xs text-[#777777] font-mono">
                      {pkg.size || '32 MB'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {pkg.isOutdated && (
                        <button
                          onClick={() => upgradePackage(pkg.id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-xs font-medium rounded-md text-white transition-colors"
                        >
                          Update
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedPackage(pkg)}
                        className="px-2.5 py-1 bg-[#333333] hover:bg-[#444444] text-xs font-medium rounded-md text-white border border-[#444444] transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
