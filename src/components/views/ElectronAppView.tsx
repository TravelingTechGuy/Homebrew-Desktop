import React, { useState } from 'react';
import { useBrew } from '../../context/BrewContext';
import { 
  Laptop, 
  Terminal, 
  Check, 
  Copy, 
  ShieldCheck, 
  HardDrive, 
  Cpu, 
  Play, 
  FileCode2, 
  CheckCircle2,
  FolderGit2,
  AlertCircle
} from 'lucide-react';

export const ElectronAppView: React.FC = () => {
  const { isElectron, electronPath, executeCustomCommand } = useBrew();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestBridge = async () => {
    setIsTesting(true);
    if (isElectron && window.electronAPI) {
      try {
        const res = await window.electronAPI.executeCommand('--version');
        setTestOutput(`Connected! ${res.stdout || 'Homebrew detected.'}`);
      } catch (err: any) {
        setTestOutput(`IPC Error: ${err.message}`);
      }
    } else {
      await executeCustomCommand('brew --version');
      setTestOutput('Running in Web Browser Preview Mode. Launch via `npm run electron:dev` on macOS for full native process access.');
    }
    setIsTesting(false);
  };

  const launchSteps = `# 1. In your local project directory on your Mac:
npm install

# 2. Run the Electron Desktop App:
npm run electron:dev

# 3. Or run with hot-reloading dev server:
npm run electron:watch

# 4. Build a standalone signed macOS .dmg / .app bundle:
npm run electron:build`;

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#1E1E1E]">
      
      {/* Header */}
      <header className="h-16 border-b border-[#333333] px-8 flex items-center justify-between bg-[#1E1E1E]/80 backdrop-blur-md shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-blue-400" />
              Electron macOS Desktop App
            </h1>
            {isElectron ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 font-medium border border-emerald-800/40 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Native Electron Runtime Active
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-400 font-medium border border-blue-800/40">
                Electron Configured
              </span>
            )}
          </div>
          <p className="text-xs text-[#777777] mt-0.5">
            Standalone desktop application executing real <code className="font-mono text-blue-400">{electronPath}</code> commands on Apple Silicon & Intel Macs
          </p>
        </div>

        <button
          onClick={handleTestBridge}
          disabled={isTesting}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium rounded-md text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          Test CLI Bridge
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 max-w-5xl">
        
        {/* Bridge Status Card */}
        <div className="p-6 rounded-2xl bg-[#252525] border border-[#333333] grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest block">
              Execution Architecture
            </span>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Electron + child_process</span>
            </div>
            <p className="text-xs text-[#777777]">
              Uses <code className="font-mono text-[#CCCCCC]">spawn()</code> with user login PATH
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest block">
              Homebrew Binary Target
            </span>
            <div className="flex items-center gap-2 text-sm font-mono text-white">
              <HardDrive className="w-4 h-4 text-orange-400" />
              <span>{electronPath}</span>
            </div>
            <p className="text-xs text-[#777777]">
              Apple Silicon & Intel paths supported
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest block">
              Asset Resolution Fix
            </span>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Relative Base Path (<code className="font-mono text-xs">base: './'</code>)</span>
            </div>
            <p className="text-xs text-[#777777]">
              Loads assets cleanly via file:// protocol
            </p>
          </div>
        </div>

        {/* Test output banner if clicked */}
        {testOutput && (
          <div className="p-4 rounded-xl bg-[#282828] border border-blue-500/40 text-xs font-mono text-blue-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{testOutput}</span>
            </div>
            <button
              onClick={() => setTestOutput(null)}
              className="text-[#777777] hover:text-white text-xs ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick Start Guide */}
        <div className="p-6 rounded-2xl bg-[#252525] border border-[#333333] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-400" />
                How to Run Locally on Your Mac
              </h3>
              <p className="text-xs text-[#777777] mt-0.5">
                Execute these commands in your Mac Terminal:
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(launchSteps, 'launchSteps')}
              className="px-3 py-1.5 rounded-md bg-[#333333] hover:bg-[#444444] text-xs font-medium text-[#CCCCCC] hover:text-white border border-[#444444] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {copiedId === 'launchSteps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedId === 'launchSteps' ? 'Copied' : 'Copy Commands'}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#1E1E1E] border border-[#333333] font-mono text-xs text-emerald-400 overflow-x-auto custom-scrollbar">
            <pre className="leading-relaxed whitespace-pre">
              {launchSteps}
            </pre>
          </div>
        </div>

        {/* Included Electron Files Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-5 rounded-2xl bg-[#252525] border border-[#333333] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <FileCode2 className="w-4 h-4 text-blue-400" />
                <span>electron/main.cjs (Main Process)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#333333] text-[#AAAAAA]">
                Native Window & IPC
              </span>
            </div>
            <p className="text-xs text-[#777777] leading-relaxed">
              Creates the macOS <code className="font-mono text-[#CCCCCC]">BrowserWindow</code> with dark theme and <code className="font-mono text-[#CCCCCC]">hiddenInset</code> titlebar, manages standard macOS application menus, and bridges real <code className="font-mono text-blue-400">brew</code> CLI commands.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#252525] border border-[#333333] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <FileCode2 className="w-4 h-4 text-blue-400" />
                <span>electron/preload.cjs (Preload Bridge)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#333333] text-[#AAAAAA]">
                ContextBridge
              </span>
            </div>
            <p className="text-xs text-[#777777] leading-relaxed">
              Securely exposes <code className="font-mono text-blue-400">window.electronAPI</code> to React with context isolation, enabling asynchronous execution and real-time terminal stdout streaming.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
