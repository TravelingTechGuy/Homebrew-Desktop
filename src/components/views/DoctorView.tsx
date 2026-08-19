import React, { useState } from 'react';
import { useBrew } from '../../context/BrewContext';
import { 
  Stethoscope, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Wrench, 
  RefreshCw, 
  Terminal
} from 'lucide-react';

export const DoctorView: React.FC = () => {
  const { doctorChecks, runDoctor, fixDoctorIssue, systemInfo } = useBrew();
  const [isScanning, setIsScanning] = useState(false);
  const [fixingId, setFixingId] = useState<string | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    await runDoctor();
    setIsScanning(false);
  };

  const handleFix = async (checkId: string) => {
    setFixingId(checkId);
    await fixDoctorIssue(checkId);
    setFixingId(null);
  };

  const warningCount = doctorChecks.filter(c => c.severity === 'warning').length;
  const errorCount = doctorChecks.filter(c => c.severity === 'error').length;

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#1E1E1E]">
      
      {/* Top Header */}
      <header className="h-16 border-b border-[#333333] px-8 flex items-center justify-between bg-[#1E1E1E]/80 backdrop-blur-md shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-white">
              Brew Doctor Diagnostics
            </h1>
            {warningCount === 0 && errorCount === 0 ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 font-medium border border-emerald-800/40">
                100% Ready
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 font-medium border border-amber-800/40">
                {warningCount + errorCount} Issues Found
              </span>
            )}
          </div>
          <p className="text-xs text-[#777777] mt-0.5">
            Automated system health audit (<code className="font-mono text-blue-400">brew doctor</code>)
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium rounded-md text-white transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          Re-scan System
        </button>
      </header>

      {/* Doctor Checks List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 max-w-4xl">
        
        {/* System Summary Card */}
        <div className="p-6 rounded-2xl bg-[#252525] border border-[#333333] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[#666666] block text-[10px] uppercase font-bold tracking-wider">Homebrew Prefix</span>
            <span className="font-mono font-semibold text-white mt-0.5 block">
              {systemInfo.prefix}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block text-[10px] uppercase font-bold tracking-wider">Xcode CLT Version</span>
            <span className="font-mono font-semibold text-white mt-0.5 block">
              {systemInfo.cltVersion}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block text-[10px] uppercase font-bold tracking-wider">Target Architecture</span>
            <span className="font-semibold text-white mt-0.5 block">
              {systemInfo.architecture}
            </span>
          </div>
        </div>

        {/* Checks Breakdown */}
        <div className="space-y-3">
          {doctorChecks.map(check => {
            const isOk = check.severity === 'ok';
            const isWarning = check.severity === 'warning';
            const isFixing = fixingId === check.id;

            return (
              <div
                key={check.id}
                className={`p-5 rounded-2xl border transition-colors ${
                  isOk
                    ? 'bg-[#252525] border-[#333333]'
                    : isWarning
                    ? 'bg-[#28251F] border-amber-700/40'
                    : 'bg-[#281F1F] border-rose-700/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="mt-0.5 shrink-0">
                      {isOk && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                      {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                      {!isOk && !isWarning && <XCircle className="w-5 h-5 text-rose-400" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        {check.title}
                      </h4>
                      <p className="text-xs text-[#AAAAAA] mt-1 leading-relaxed">
                        {check.description}
                      </p>

                      {check.fixCommand && (
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1E1E1E] border border-[#333333] text-xs font-mono text-blue-400">
                          <Terminal className="w-3.5 h-3.5 text-[#777777]" />
                          <code>{check.fixCommand}</code>
                        </div>
                      )}
                    </div>
                  </div>

                  {check.fixCommand && (
                    <button
                      onClick={() => handleFix(check.id)}
                      disabled={isFixing}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium rounded-md text-white transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {isFixing ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Wrench className="w-3.5 h-3.5" />
                      )}
                      {check.fixLabel || 'Fix Issue'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
