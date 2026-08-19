import React, { useState } from 'react';
import { useBrew } from '../../context/BrewContext';
import { BrewTap } from '../../types';
import { 
  GitFork, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ShieldCheck
} from 'lucide-react';

export const TapsView: React.FC = () => {
  const { taps, addTap, removeTap, packages, setSelectedPackage } = useBrew();
  const [newTapName, setNewTapName] = useState('');
  const [newTapUrl, setNewTapUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTap, setSelectedTap] = useState<BrewTap | null>(taps[0] || null);

  const POPULAR_TAPS = [
    { name: 'mongodb/brew', desc: 'Official MongoDB database and server tools' },
    { name: 'hashicorp/tap', desc: 'Terraform, Nomad, Vault, and Consul binaries' },
    { name: 'cloudflare/cloudflare', desc: 'Cloudflare Developer tools and cloudflared tunnels' },
    { name: 'buo/cask-upgrade', desc: 'Command line tool for upgrading outdated GUI casks' }
  ];

  const handleAddTap = async (e?: React.FormEvent, tapName?: string) => {
    if (e) e.preventDefault();
    const targetName = tapName || newTapName.trim();
    if (!targetName) return;

    setIsAdding(true);
    await addTap(targetName, newTapUrl.trim() || undefined);
    setNewTapName('');
    setNewTapUrl('');
    setIsAdding(false);
  };

  const handleUntap = async (tapId: string) => {
    if (tapId === 'homebrew/core' || tapId === 'homebrew/cask') {
      alert('Cannot untap core Homebrew repositories.');
      return;
    }
    await removeTap(tapId);
    if (selectedTap?.id === tapId) {
      setSelectedTap(taps.find(t => t.id !== tapId) || null);
    }
  };

  const tapPackages = selectedTap 
    ? packages.filter(p => p.tap === selectedTap.id || (selectedTap.id === 'homebrew/core' && p.type === 'formula') || (selectedTap.id === 'homebrew/cask' && p.type === 'cask'))
    : [];

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#1E1E1E]">
      
      {/* Top Header */}
      <header className="h-16 border-b border-[#333333] px-8 flex items-center justify-between bg-[#1E1E1E]/80 backdrop-blur-md shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            Taps & Repositories ({taps.length})
          </h1>
          <p className="text-xs text-[#777777]">
            Third-party Git repositories supplying custom formulae and casks
          </p>
        </div>
      </header>

      {/* Main Two-Column Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left List of Taps */}
        <div className="w-80 border-r border-[#333333] flex flex-col overflow-hidden bg-[#252525]">
          
          {/* Add New Tap Input Form */}
          <form onSubmit={e => handleAddTap(e)} className="p-4 border-b border-[#333333] space-y-2">
            <div className="text-xs font-semibold text-white">
              Add New Tap (<code className="font-mono text-blue-400">brew tap</code>)
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTapName}
                onChange={e => setNewTapName(e.target.value)}
                placeholder="user/repo (e.g. mongodb/brew)"
                className="flex-1 h-8 px-2.5 text-xs rounded-md bg-[#333333] border border-[#444444] text-[#E0E0E0] placeholder-[#777777] focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <button
                type="submit"
                disabled={!newTapName.trim() || isAdding}
                className="px-3 h-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium rounded-md text-white transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Tap
              </button>
            </div>
          </form>

          {/* Taps List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
            {taps.map(tap => {
              const isSelected = selectedTap?.id === tap.id;
              return (
                <div
                  key={tap.id}
                  onClick={() => setSelectedTap(tap)}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#3A3A3A] border-blue-500/80 shadow-xs'
                      : 'bg-[#282828] hover:bg-[#2E2E2E] border-[#333333]'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold text-white truncate">
                        {tap.name}
                      </span>
                      {tap.isOfficial && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-600/30 text-blue-400 font-semibold shrink-0">
                          Official
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#777777] truncate mt-0.5">
                      {tap.description}
                    </p>
                  </div>

                  {!tap.isOfficial && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleUntap(tap.id);
                      }}
                      className="p-1.5 rounded text-[#777777] hover:text-rose-400 hover:bg-[#333333] transition-colors"
                      title="Untap repository"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Suggested Popular Taps */}
          <div className="p-4 border-t border-[#333333] bg-[#222222]">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest block mb-2.5">
              Popular Third-Party Taps
            </span>
            <div className="space-y-2">
              {POPULAR_TAPS.filter(pt => !taps.some(t => t.id === pt.name)).map(pt => (
                <div key={pt.name} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-xs text-[#CCCCCC] truncate pr-2">
                    {pt.name}
                  </span>
                  <button
                    onClick={() => handleAddTap(undefined, pt.name)}
                    className="px-2 py-1 bg-[#333333] hover:bg-blue-600 text-[11px] font-medium rounded text-white transition-colors cursor-pointer"
                  >
                    Tap
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Tap Detail View */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {selectedTap ? (
            <div className="space-y-6 max-w-4xl">
              
              {/* Tap Info Header */}
              <div className="p-6 rounded-2xl bg-[#252525] border border-[#333333] space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg font-bold font-mono text-white">
                        {selectedTap.name}
                      </h2>
                      {selectedTap.isOfficial ? (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800/40 flex items-center gap-1 font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Official Homebrew
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950/60 text-purple-400 border border-purple-800/40 font-medium">
                          Third-Party Tap
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#777777] mt-1">
                      {selectedTap.description}
                    </p>
                  </div>

                  <a
                    href={selectedTap.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-400 hover:underline font-medium"
                  >
                    GitHub Repo
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#333333] text-xs">
                  <div>
                    <span className="text-[#666666] block text-[10px] uppercase font-bold tracking-wider">Formulae Available</span>
                    <span className="font-mono text-sm text-white font-medium">
                      {selectedTap.formulaeCount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#666666] block text-[10px] uppercase font-bold tracking-wider">Casks Available</span>
                    <span className="font-mono text-sm text-white font-medium">
                      {selectedTap.casksCount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#666666] block text-[10px] uppercase font-bold tracking-wider">Installed on this Mac</span>
                    <span className="font-mono text-sm text-emerald-400 font-medium">
                      {tapPackages.filter(p => p.isInstalled).length} packages
                    </span>
                  </div>
                </div>
              </div>

              {/* Packages from this Tap */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#666666] uppercase tracking-widest">
                  Packages in this Tap ({tapPackages.length})
                </h3>

                <div className="grid grid-cols-1 gap-2">
                  {tapPackages.map(pkg => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg)}
                      className="p-3.5 rounded-xl bg-[#282828] hover:bg-[#2E2E2E] border border-[#333333] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-white">
                            {pkg.name}
                          </span>
                          <span className="text-xs font-mono text-blue-400">
                            v{pkg.latestVersion}
                          </span>
                        </div>
                        <p className="text-xs text-[#777777] truncate mt-0.5">
                          {pkg.description}
                        </p>
                      </div>

                      <div>
                        {pkg.isInstalled ? (
                          <span className="text-xs text-emerald-400 font-medium">Installed</span>
                        ) : (
                          <span className="text-xs text-[#777777]">Available</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-[#777777]">
              Select a tap on the left to view details.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
