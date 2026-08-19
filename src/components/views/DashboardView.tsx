import React, { useState } from 'react';
import { useBrew } from '../../context/BrewContext';
import { StatusBadge } from '../swiftui/StatusBadge';
import { 
  Package, 
  Box, 
  RefreshCw, 
  Sparkles, 
  Stethoscope, 
  Trash2, 
  CheckCircle2, 
  HardDrive,
  FileCode2,
  ShieldCheck,
  Plus,
  Terminal,
  Cpu
} from 'lucide-react';
import appIconImg from '../../assets/images/app_icon_1787093736418.jpg';

export const DashboardView: React.FC = () => {
  const { 
    packages, 
    services, 
    systemInfo, 
    doctorChecks, 
    setActiveTab, 
    setSelectedPackage, 
    upgradeAllOutdated,
    upgradePackage,
    runDoctor,
    runCleanup,
    runUpdate,
    isElectron,
    isSyncing,
    isLiveSynced,
    syncWithLocalHomebrew,
    setIsAiAdvisorOpen
  } = useBrew();

  const [isUpgradingAll, setIsUpgradingAll] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [isScanningDoctor, setIsScanningDoctor] = useState(false);

  const installedPackages = packages.filter(p => p.isInstalled);
  const outdatedPackages = installedPackages.filter(p => p.isOutdated);
  const runningServices = services.filter(s => s.status === 'started');
  const warningChecks = doctorChecks.filter(c => c.severity !== 'ok');

  const handleUpgradeAll = async () => {
    setIsUpgradingAll(true);
    await upgradeAllOutdated();
    setIsUpgradingAll(false);
  };

  const handleCleanup = async () => {
    setIsCleaning(true);
    await runCleanup();
    setIsCleaning(false);
  };

  const handleDoctor = async () => {
    setIsScanningDoctor(true);
    await runDoctor();
    setIsScanningDoctor(false);
    setActiveTab('doctor');
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#1E1E1E]">
      
      {/* Top Header */}
      <header className="h-16 border-b border-[#333333] px-8 flex items-center justify-between bg-[#1E1E1E]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3.5">
          <img 
            src={appIconImg} 
            alt="App Icon" 
            className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">
                {outdatedPackages.length > 0 ? 'Updates Available' : 'Overview & System Status'}
              </h2>
              {isElectron && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  {isLiveSynced ? 'Synced with Mac' : 'Electron Native'}
                </span>
              )}
            </div>
            <p className="text-xs text-[#777777] hidden sm:block">
              Homebrew engine active on {systemInfo.macOSVersion} ({systemInfo.architecture}) • {systemInfo.prefix}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => isElectron ? syncWithLocalHomebrew() : runUpdate()}
            disabled={isSyncing}
            className="px-4 py-1.5 bg-[#333333] hover:bg-[#444444] text-xs font-medium rounded-md text-white transition-colors border border-[#444444] cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : (isElectron ? 'Sync Mac Packages' : 'Refresh')}
          </button>
          
          {outdatedPackages.length > 0 ? (
            <button
              onClick={handleUpgradeAll}
              disabled={isUpgradingAll}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-medium rounded-md text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isUpgradingAll && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              Update All ({outdatedPackages.length})
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('discover')}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-medium rounded-md text-white transition-colors cursor-pointer"
            >
              Discover
            </button>
          )}
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
        
        {/* Outdated Packages Cards Grid */}
        <div>
          {outdatedPackages.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5">
              {outdatedPackages.map((pkg, idx) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className="flex items-center justify-between p-4 bg-[#282828] hover:bg-[#2D2D2D] rounded-xl border border-[#333333] transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                    <div className="p-2 bg-[#333333] rounded-lg shrink-0">
                      {pkg.type === 'cask' ? (
                        <Box className="w-5 h-5 text-blue-400" />
                      ) : idx % 2 === 0 ? (
                        <Terminal className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Terminal className="w-5 h-5 text-orange-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white text-sm">
                          {pkg.name}
                        </h3>
                        <StatusBadge type={pkg.type} />
                      </div>
                      <p className="text-xs text-[#777777] truncate mt-0.5">
                        {pkg.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0" onClick={e => e.stopPropagation()}>
                    <div className="text-right hidden sm:block">
                      <p className="text-[11px] text-[#555555]">Version</p>
                      <p className="text-xs font-mono text-blue-400">
                        {pkg.installedVersion} → {pkg.latestVersion}
                      </p>
                    </div>

                    <button
                      onClick={() => upgradePackage(pkg.id)}
                      className="px-3 py-1.5 bg-[#333333] hover:bg-blue-600 text-xs font-medium rounded-md text-white transition-colors border border-[#444444] hover:border-blue-500 cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-[#252525] border border-[#333333] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#333333] rounded-lg text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">All Packages are Up to Date</h3>
                  <p className="text-xs text-[#777777]">Your installed formulae and casks are on the latest versions.</p>
                </div>
              </div>
              <button
                onClick={() => isElectron ? syncWithLocalHomebrew() : runUpdate()}
                className="px-3.5 py-1.5 bg-[#333333] hover:bg-[#444444] text-xs font-medium rounded-md text-white transition-colors border border-[#444444]"
              >
                Check Repos
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions & System Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Quick Actions Card */}
          <div className="bg-[#252525] p-6 rounded-2xl border border-[#333333] flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold mb-4 text-[#AAAAAA]">
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('discover')}
                  className="flex flex-col items-center justify-center p-4 bg-[#333333] hover:bg-[#3A3A3A] rounded-xl border border-transparent hover:border-[#444444] transition-all cursor-pointer group"
                >
                  <Plus className="w-5 h-5 mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-white font-medium">New Formula</span>
                </button>

                <button
                  onClick={handleCleanup}
                  disabled={isCleaning}
                  className="flex flex-col items-center justify-center p-4 bg-[#333333] hover:bg-[#3A3A3A] rounded-xl border border-transparent hover:border-[#444444] transition-all cursor-pointer group disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5 mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-white font-medium">
                    {isCleaning ? 'Cleaning...' : 'Cleanup Cache'}
                  </span>
                </button>

                <button
                  onClick={handleDoctor}
                  disabled={isScanningDoctor}
                  className="flex flex-col items-center justify-center p-4 bg-[#333333] hover:bg-[#3A3A3A] rounded-xl border border-transparent hover:border-[#444444] transition-all cursor-pointer group"
                >
                  <Stethoscope className="w-5 h-5 mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-white font-medium">Run Doctor</span>
                </button>

                <button
                  onClick={() => setActiveTab('brewfile')}
                  className="flex flex-col items-center justify-center p-4 bg-[#333333] hover:bg-[#3A3A3A] rounded-xl border border-transparent hover:border-[#444444] transition-all cursor-pointer group"
                >
                  <FileCode2 className="w-5 h-5 mb-2 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-white font-medium">Dump Brewfile</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#333333] flex items-center justify-between text-xs text-[#777777]">
              <span>Need toolchain recommendations?</span>
              <button
                onClick={() => setIsAiAdvisorOpen(true)}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI Advisor
              </button>
            </div>
          </div>

          {/* System Stats Card */}
          <div className="bg-[#252525] p-6 rounded-2xl border border-[#333333]">
            <h4 className="text-sm font-semibold mb-4 text-[#AAAAAA]">
              System Stats
            </h4>
            <div className="space-y-4">
              
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-[#777777]">Disk Space Used (Cache)</span>
                  <span className="text-white font-mono">{systemInfo.cacheSize}</span>
                </div>
                <div className="w-full bg-[#333333] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: systemInfo.cacheSize === '0 B' ? '5%' : '65%' }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-[#777777]">Installed Formulas</span>
                <span className="text-white font-mono">{systemInfo.installedFormulaeCount}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[#777777]">Installed Casks</span>
                <span className="text-white font-mono">{systemInfo.installedCasksCount}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[#777777]">Active Taps</span>
                <span className="text-white font-mono">6</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[#777777]">Running Daemons</span>
                <span className="text-emerald-400 font-mono font-medium">{runningServices.length} active</span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
