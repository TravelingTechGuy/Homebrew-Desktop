import React, { useState } from 'react';
import { BrewPackage } from '../../types';
import { useBrew } from '../../context/BrewContext';
import { StatusBadge } from './StatusBadge';
import { 
  X, 
  Terminal, 
  Box, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  RefreshCw, 
  Pin, 
  AlertCircle, 
  HardDrive, 
  Calendar, 
  Layers, 
  Code2,
  Share2
} from 'lucide-react';

interface DetailInspectorProps {
  packageItem: BrewPackage;
  onClose: () => void;
}

export const DetailInspector: React.FC<DetailInspectorProps> = ({ packageItem, onClose }) => {
  const { 
    upgradePackage, 
    uninstallPackage, 
    installPackage, 
    togglePinPackage,
    packages,
    setSelectedPackage
  } = useBrew();

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'dependencies' | 'formula'>('info');

  const isCask = packageItem.type === 'cask';
  const isInstalled = packageItem.isInstalled;
  const isOutdated = packageItem.isOutdated;
  const isPinned = packageItem.isPinned;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const installCmd = isCask 
    ? `brew install --cask ${packageItem.name}`
    : `brew install ${packageItem.name}`;

  return (
    <aside className="w-96 bg-[#252525] border-l border-[#333333] flex flex-col h-full overflow-hidden shrink-0 z-20 select-none">
      
      {/* Top Header with Close */}
      <div className="p-4 border-b border-[#333333] flex items-center justify-between bg-[#222222]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-[#333333] rounded-md shrink-0">
            {isCask ? <Box className="w-4 h-4 text-blue-400" /> : <Terminal className="w-4 h-4 text-orange-400" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {packageItem.name}
            </h3>
            <p className="text-[10px] text-[#777777] font-mono truncate">
              {packageItem.tap}
            </p>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-1.5 rounded-md text-[#777777] hover:text-white hover:bg-[#333333] transition-colors cursor-pointer"
          title="Close Inspector (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Action Bar in Inspector */}
      <div className="p-4 bg-[#282828] border-b border-[#333333] flex items-center gap-2">
        {isInstalled ? (
          <>
            {isOutdated && (
              <button
                onClick={() => upgradePackage(packageItem.id)}
                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-medium rounded-md text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Upgrade to v{packageItem.latestVersion}
              </button>
            )}

            <button
              onClick={() => togglePinPackage(packageItem.id)}
              className={`p-2 rounded-md transition-colors cursor-pointer border ${
                isPinned
                  ? 'bg-purple-950/50 text-purple-400 border-purple-800/40'
                  : 'bg-[#333333] hover:bg-[#444444] text-[#CCCCCC] border-[#444444]'
              }`}
              title={isPinned ? "Unpin version" : "Pin version"}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => uninstallPackage(packageItem.id)}
              className="p-2 rounded-md bg-[#333333] hover:bg-rose-950/40 hover:text-rose-400 text-[#777777] border border-[#444444] transition-colors cursor-pointer"
              title="Uninstall package"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => installPackage(packageItem.id)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-medium rounded-md text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            Install {isCask ? 'Cask' : 'Formula'}
          </button>
        )}
      </div>

      {/* Tab Navigation in Inspector */}
      <div className="flex border-b border-[#333333] bg-[#222222] text-xs">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2 text-center font-medium transition-colors cursor-pointer ${
            activeTab === 'info' 
              ? 'text-white border-b-2 border-blue-500 bg-[#252525]' 
              : 'text-[#777777] hover:text-[#CCCCCC]'
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setActiveTab('dependencies')}
          className={`flex-1 py-2 text-center font-medium transition-colors cursor-pointer ${
            activeTab === 'dependencies' 
              ? 'text-white border-b-2 border-blue-500 bg-[#252525]' 
              : 'text-[#777777] hover:text-[#CCCCCC]'
          }`}
        >
          Deps ({packageItem.dependencies.length})
        </button>
        <button
          onClick={() => setActiveTab('formula')}
          className={`flex-1 py-2 text-center font-medium transition-colors cursor-pointer ${
            activeTab === 'formula' 
              ? 'text-white border-b-2 border-blue-500 bg-[#252525]' 
              : 'text-[#777777] hover:text-[#CCCCCC]'
          }`}
        >
          Source
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 text-xs">
        {activeTab === 'info' && (
          <>
            {/* Description Card */}
            <div className="p-3 rounded-xl bg-[#282828] border border-[#333333] space-y-2">
              <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest block">
                Description
              </span>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                {packageItem.description}
              </p>
              {packageItem.homepage && (
                <a
                  href={packageItem.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:underline pt-1 text-[11px]"
                >
                  Visit Project Homepage
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Quick Command Card */}
            <div className="p-3 rounded-xl bg-[#282828] border border-[#333333] space-y-2">
              <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest block">
                Terminal Command
              </span>
              <div className="flex items-center justify-between p-2 rounded-md bg-[#1E1E1E] border border-[#333333] font-mono text-[11px] text-[#E0E0E0]">
                <code className="truncate mr-2">{installCmd}</code>
                <button
                  onClick={() => copyToClipboard(installCmd, 'installCmd')}
                  className="p-1 text-[#777777] hover:text-white transition-colors"
                  title="Copy command"
                >
                  {copiedCmd === 'installCmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="p-3 rounded-xl bg-[#282828] border border-[#333333] space-y-2.5">
              <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest block">
                Specifications
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#777777]">Installed Version</span>
                  <span className="font-mono text-blue-400 font-medium">
                    {packageItem.installedVersion ? `v${packageItem.installedVersion}` : 'Not installed'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#777777]">Latest Release</span>
                  <span className="font-mono text-[#E0E0E0]">
                    v{packageItem.latestVersion}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#777777]">Size on Disk</span>
                  <span className="font-mono text-[#E0E0E0]">{packageItem.size || '32 MB'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#777777]">License</span>
                  <span className="text-[#E0E0E0] font-mono">{packageItem.license || 'MIT'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#777777]">Category</span>
                  <span className="text-[#E0E0E0]">{packageItem.category}</span>
                </div>
              </div>
            </div>

            {/* Caveats */}
            {packageItem.caveats && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Installation Caveats</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/90 font-mono">
                  {packageItem.caveats}
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'dependencies' && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest block">
              Dependency Tree ({packageItem.dependencies.length})
            </span>
            {packageItem.dependencies.length === 0 ? (
              <p className="text-xs text-[#777777] italic">No external dependencies required.</p>
            ) : (
              <div className="space-y-1.5">
                {packageItem.dependencies.map(depName => {
                  const depPkg = packages.find(p => p.name === depName || p.id === depName);
                  return (
                    <div
                      key={depName}
                      onClick={() => depPkg && setSelectedPackage(depPkg)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                        depPkg 
                          ? 'bg-[#282828] hover:bg-[#303030] border-[#333333]' 
                          : 'bg-[#222222] border-[#333333] opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-mono text-[#E0E0E0] font-medium">{depName}</span>
                      </div>
                      {depPkg?.isInstalled ? (
                        <span className="text-[10px] text-emerald-400">Installed</span>
                      ) : (
                        <span className="text-[10px] text-[#777777]">Dependency</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'formula' && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest block">
              Ruby Formula Definition
            </span>
            <div className="p-3 rounded-lg bg-[#1E1E1E] border border-[#333333] font-mono text-[11px] text-[#A6E22E] overflow-x-auto custom-scrollbar">
              <pre className="text-blue-300 leading-relaxed whitespace-pre">
{`class ${packageItem.name.charAt(0).toUpperCase() + packageItem.name.slice(1)} < Formula
  desc "${packageItem.description}"
  homepage "${packageItem.homepage || 'https://brew.sh'}"
  url "https://ghcr.io/v2/homebrew/core/${packageItem.name}/blobs/sha256:4f8..."
  version "${packageItem.latestVersion}"
  license "${packageItem.license || 'MIT'}"

  depends_on "${packageItem.dependencies[0] || 'openssl@3'}"

  def install
    bin.install "${packageItem.name}"
  end
end`}
              </pre>
            </div>
          </div>
        )}
      </div>

    </aside>
  );
};
