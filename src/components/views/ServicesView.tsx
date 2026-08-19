import React, { useState } from 'react';
import { useBrew } from '../../context/BrewContext';
import { StatusBadge } from '../swiftui/StatusBadge';
import { 
  Server, 
  Play, 
  Square, 
  RotateCw, 
  Zap
} from 'lucide-react';

export const ServicesView: React.FC = () => {
  const { services, toggleService, toggleServiceAutoStart } = useBrew();
  const [loadingService, setLoadingService] = useState<string | null>(null);

  const handleAction = async (serviceName: string, action: 'start' | 'stop' | 'restart') => {
    setLoadingService(serviceName + '_' + action);
    await toggleService(serviceName, action);
    setLoadingService(null);
  };

  const runningCount = services.filter(s => s.status === 'started').length;

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#1E1E1E]">
      
      {/* Top Header */}
      <header className="h-16 border-b border-[#333333] px-8 flex items-center justify-between bg-[#1E1E1E]/80 backdrop-blur-md shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-white">
              Background Services
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 font-medium border border-emerald-800/40">
              {runningCount} Active
            </span>
          </div>
          <p className="text-xs text-[#777777] mt-0.5">
            Control launchd plist background processes and server daemons (<code className="font-mono text-blue-400">brew services</code>)
          </p>
        </div>
      </header>

      {/* Services List Table / Cards */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-4 max-w-5xl">
        <div className="space-y-3">
          {services.map(service => {
            const isStarted = service.status === 'started';
            const isStarting = loadingService === `${service.name}_start`;
            const isStopping = loadingService === `${service.name}_stop`;
            const isRestarting = loadingService === `${service.name}_restart`;

            return (
              <div
                key={service.name}
                className="p-5 rounded-2xl bg-[#252525] border border-[#333333] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                {/* Left: Service Info & Status */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    isStarted
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                      : 'bg-[#333333] text-[#777777] border border-[#444444]'
                  }`}>
                    <Server className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-sm font-semibold text-white">
                        {service.name}
                      </span>
                      <StatusBadge serviceStatus={service.status} />
                      {service.port && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#333333] text-[#CCCCCC] font-mono border border-[#444444]">
                          Port {service.port}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#777777] font-mono truncate mt-1">
                      {service.plist}
                    </p>

                    {/* Launch on login toggle */}
                    <div className="flex items-center gap-2 mt-3">
                      <label className="flex items-center gap-2 text-xs text-[#AAAAAA] cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={service.autoStart}
                          onChange={() => toggleServiceAutoStart(service.name)}
                          className="rounded text-blue-600 focus:ring-blue-500 bg-[#333333] border-[#444444]"
                        />
                        <span>Launch automatically at login</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right: Service Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {isStarted ? (
                    <>
                      <button
                        onClick={() => handleAction(service.name, 'restart')}
                        disabled={isRestarting}
                        className="px-3 py-1.5 bg-[#333333] hover:bg-[#444444] text-xs font-medium rounded-md text-white transition-colors border border-[#444444] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Restart daemon"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isRestarting ? 'animate-spin' : ''}`} />
                        Restart
                      </button>

                      <button
                        onClick={() => handleAction(service.name, 'stop')}
                        disabled={isStopping}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-xs font-medium rounded-md text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        Stop
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleAction(service.name, 'start')}
                      disabled={isStarting}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-medium rounded-md text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Start Service
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Informational Footer */}
        <div className="p-5 rounded-2xl bg-[#222222] border border-[#333333] text-xs text-[#777777] space-y-1.5">
          <div className="font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            Homebrew Services Integration
          </div>
          <p>
            Homebrew services are managed via Apple's <code className="font-mono text-blue-400">launchctl</code> engine. User-level services write their LaunchAgent plist definitions to <code className="font-mono text-[#CCCCCC]">~/Library/LaunchAgents</code>.
          </p>
        </div>
      </div>

    </div>
  );
};
