import React from 'react';
import { useBrew } from '../../context/BrewContext';
import { ActiveNavTab } from '../../types';
import { 
  LayoutDashboard, 
  Package, 
  Compass, 
  Sparkles, 
  GitFork, 
  Stethoscope, 
  FileCode2, 
  Server,
  Laptop
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    systemInfo, 
    packages, 
    taps, 
    services, 
    doctorChecks, 
    isElectron,
    setIsAiAdvisorOpen 
  } = useBrew();

  const outdatedCount = packages.filter(p => p.isInstalled && p.isOutdated).length;
  const warningChecksCount = doctorChecks.filter(c => c.severity !== 'ok').length;
  const runningServicesCount = services.filter(s => s.status === 'started').length;
  const totalInstalled = systemInfo.installedFormulaeCount + systemInfo.installedCasksCount;

  interface NavItem {
    id: ActiveNavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeActiveColor?: string;
  }

  const mainNav: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Updates & Overview',
      icon: <LayoutDashboard className="w-4 h-4 text-blue-400" />,
      badge: outdatedCount > 0 ? outdatedCount : undefined
    },
    {
      id: 'discover',
      label: 'Discover Packages',
      icon: <Compass className="w-4 h-4 text-[#999999]" />
    }
  ];

  const libraryNav: NavItem[] = [
    {
      id: 'installed',
      label: 'Installed Packages',
      icon: <Package className="w-4 h-4 text-[#999999]" />,
      badge: totalInstalled
    },
    {
      id: 'taps',
      label: 'Taps & Sources',
      icon: <GitFork className="w-4 h-4 text-[#999999]" />,
      badge: taps.length
    }
  ];

  const managementNav: NavItem[] = [
    {
      id: 'services',
      label: 'Background Services',
      icon: <Server className="w-4 h-4 text-[#999999]" />,
      badge: runningServicesCount > 0 ? `${runningServicesCount} active` : undefined
    },
    {
      id: 'doctor',
      label: 'Doctor Diagnostics',
      icon: <Stethoscope className="w-4 h-4 text-[#999999]" />,
      badge: warningChecksCount > 0 ? warningChecksCount : undefined
    },
    {
      id: 'brewfile',
      label: 'Brewfile Bundle',
      icon: <FileCode2 className="w-4 h-4 text-[#999999]" />
    },
    {
      id: 'electron',
      label: 'Electron Desktop App',
      icon: <Laptop className="w-4 h-4 text-blue-400" />,
      badge: isElectron ? 'Native' : 'Ready'
    }
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-6">
      <p className="text-[10px] font-bold text-[#666666] uppercase tracking-widest mb-2.5 ml-2 select-none">
        {title}
      </p>
      <div className="space-y-1">
        {items.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors cursor-pointer select-none ${
                isActive
                  ? 'bg-[#3A3A3A] text-white font-medium shadow-xs'
                  : 'text-[#999999] hover:text-white hover:bg-[#2E2E2E]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={isActive ? 'text-blue-400' : ''}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#333333] text-[#AAAAAA]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-64 bg-[#252525] border-r border-[#333333] flex flex-col h-full select-none shrink-0">
      {/* Top Navigation Area */}
      <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
        {renderNavGroup('Overview', mainNav)}
        {renderNavGroup('Library', libraryNav)}
        {renderNavGroup('System & Tools', managementNav)}

        {/* AI Advisor Button */}
        <div className="pt-2 px-1">
          <button
            onClick={() => setIsAiAdvisorOpen(true)}
            className="w-full p-3 rounded-xl bg-[#282828] hover:bg-[#303030] border border-[#383838] text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-white">
                Brew AI Assistant
              </span>
            </div>
            <p className="text-[11px] text-[#777777] leading-relaxed">
              Package stack advisor & doctor conflict solver
            </p>
          </button>
        </div>
      </div>

      {/* Bottom Footer Status */}
      <div className="p-4 border-t border-[#333333] bg-[#222222]">
        <div className="flex items-center justify-between text-xs text-[#777777] mb-1.5">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isElectron ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[#999999] font-mono">
              {isElectron ? 'Electron Native' : 'Brew Engine 4.4'}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#333333] text-[#AAAAAA]">
            {systemInfo.architecture}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#555555]">
          <span className="font-mono truncate">{systemInfo.prefix}</span>
          <span className="text-emerald-400 text-[10px]">Healthy</span>
        </div>
      </div>
    </aside>
  );
};
