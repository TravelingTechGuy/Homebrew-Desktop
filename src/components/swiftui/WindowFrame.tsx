import React, { useState } from 'react';
import { useBrew } from '../../context/BrewContext';
import { 
  Terminal, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Command, 
  X,
  Minus,
  Maximize2,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import appIconImg from '../../assets/images/app_icon_1787093736418.jpg';

interface WindowFrameProps {
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ children }) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    isTerminalOpen, 
    setIsTerminalOpen,
    isAiAdvisorOpen,
    setIsAiAdvisorOpen,
    isElectron,
    isSyncing,
    isLiveSynced,
    syncWithLocalHomebrew,
    runUpdate,
    currentTask,
    systemInfo
  } = useBrew();

  const [isUpdating, setIsUpdating] = useState(false);
  const [trafficHovered, setTrafficHovered] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleSyncOrUpdate = async () => {
    if (isElectron) {
      await syncWithLocalHomebrew();
    } else {
      setIsUpdating(true);
      await runUpdate();
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col font-sans select-none overflow-hidden bg-[#1E1E1E] text-[#E0E0E0]">
      {/* Sophisticated Dark macOS Window Title Bar */}
      <header className="h-12 bg-[#1E1E1E]/90 border-b border-[#333333] flex items-center justify-between px-4 backdrop-blur-md shrink-0 z-30">
        
        {/* Left: Traffic Lights & Brand Logo with App Icon */}
        <div className="flex items-center gap-3.5 min-w-[220px]">
          <div 
            className="flex items-center gap-2 group cursor-pointer"
            onMouseEnter={() => setTrafficHovered(true)}
            onMouseLeave={() => setTrafficHovered(false)}
          >
            {/* Red (Close) */}
            <button 
              className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center text-[8px] text-black/60 opacity-90 transition-opacity hover:opacity-100"
              title="Close window"
            >
              {trafficHovered && <X className="w-2 h-2" />}
            </button>
            {/* Yellow (Minimize) */}
            <button 
              className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center text-[8px] text-black/60 opacity-90 transition-opacity hover:opacity-100"
              title="Minimize window"
            >
              {trafficHovered && <Minus className="w-2 h-2" />}
            </button>
            {/* Green (Zoom / Maximize) */}
            <button 
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center text-[8px] text-black/60 opacity-90 transition-opacity hover:opacity-100"
              title="Toggle full screen"
            >
              {trafficHovered && <Maximize2 className="w-2 h-2" />}
            </button>
          </div>

          <div className="flex items-center gap-2.5 pl-2 border-l border-[#333333]">
            <img 
              src={appIconImg} 
              alt="Homebrew Desktop App Icon" 
              className="w-6 h-6 rounded-lg object-cover shadow-sm border border-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-white tracking-tight">
                Homebrew Desktop
              </span>
              {isLiveSynced && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar in Sophisticated Dark style */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-[#777777] pointer-events-none" />
            <input
              type="text"
              placeholder="Search packages, casks, taps... (⌘F)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#333333] border border-[#3A3A3A] rounded-md py-1.5 pl-8 pr-7 text-xs text-[#E0E0E0] placeholder-[#888888] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-[#777777] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <div className="absolute right-2 flex items-center gap-0.5 pointer-events-none opacity-40">
                <Command className="w-2.5 h-2.5 text-[#AAA]" />
                <span className="text-[9px] font-mono text-[#AAA]">F</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Window Toolbar Actions */}
        <div className="flex items-center gap-2 min-w-[220px] justify-end">
          {/* Real Mac Sync Button / Refresh */}
          <button
            onClick={handleSyncOrUpdate}
            disabled={isUpdating || isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#333333] hover:bg-[#444444] text-xs font-medium rounded-md text-white transition-colors border border-[#444444] cursor-pointer disabled:opacity-50"
            title={isElectron ? "Fetch actual packages directly from your Mac's Homebrew" : "Refresh repository manifests"}
          >
            <RefreshCw className={`w-3 h-3 text-blue-400 ${isUpdating || isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isSyncing ? 'Syncing...' : (isElectron ? 'Sync Mac Packages' : 'Refresh')}
            </span>
          </button>

          {/* AI Advisor Button */}
          <button
            onClick={() => setIsAiAdvisorOpen(!isAiAdvisorOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
              isAiAdvisorOpen 
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-[#333333] hover:bg-[#444444] text-white border-[#444444]'
            }`}
            title="Brew AI Advisor"
          >
            <Sparkles className="w-3 h-3 text-blue-300" />
            <span className="hidden sm:inline">AI Advisor</span>
          </button>

          {/* Live Terminal Toggle */}
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
              isTerminalOpen
                ? 'bg-[#222222] text-blue-400 border-blue-500/50'
                : 'bg-[#333333] hover:bg-[#444444] text-white border-[#444444]'
            }`}
            title="Toggle Live Terminal"
          >
            <Terminal className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Console</span>
            {currentTask?.status === 'running' && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};
