import React, { useState } from 'react';
import { useBrew } from '../../context/BrewContext';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  Play, 
  FileText, 
  CheckCircle2
} from 'lucide-react';

export const BrewfileView: React.FC = () => {
  const { exportBrewfile, importBrewfile, packages, taps } = useBrew();
  const [copied, setCopied] = useState(false);
  const [importContent, setImportContent] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ installed: number; skipped: number } | null>(null);

  const currentBrewfile = exportBrewfile();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentBrewfile);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentBrewfile], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Brewfile';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importContent.trim()) return;

    setIsImporting(true);
    const res = await importBrewfile(importContent.trim());
    setImportResult(res);
    setIsImporting(false);
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#1E1E1E]">
      
      {/* Top Header */}
      <header className="h-16 border-b border-[#333333] px-8 flex items-center justify-between bg-[#1E1E1E]/80 backdrop-blur-md shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-white">
            Brewfile Bundle Manager
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Export and synchronize your Mac developer environment (<code className="font-mono text-blue-400">brew bundle</code>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 bg-[#333333] hover:bg-[#444444] text-xs font-medium rounded-md text-white transition-colors border border-[#444444] flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Brewfile'}
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-medium rounded-md text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            Export Brewfile
          </button>
        </div>
      </header>

      {/* Main Content: Two Panes (Current Brewfile vs Import) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        
        {/* Left Pane: Current Brewfile */}
        <div className="p-6 rounded-2xl bg-[#252525] border border-[#333333] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">
                  Current System Brewfile
                </h3>
              </div>
              <span className="text-xs font-mono text-[#777777]">
                {taps.length} taps · {packages.filter(p => p.isInstalled).length} packages
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#1E1E1E] text-blue-300 font-mono text-xs overflow-x-auto border border-[#333333] h-80 custom-scrollbar">
              <pre className="leading-relaxed whitespace-pre">
                {currentBrewfile}
              </pre>
            </div>
          </div>

          <p className="text-xs text-[#777777] mt-4">
            Save this file as <code className="font-mono text-[#CCCCCC]">~/Brewfile</code> in your dotfiles repository to reproduce your development setup anywhere.
          </p>
        </div>

        {/* Right Pane: Import External Brewfile */}
        <div className="p-6 rounded-2xl bg-[#252525] border border-[#333333] flex flex-col justify-between">
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">
                  Import & Install Brewfile Bundle
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#777777]">
              Paste Brewfile contents to batch-install missing formulas and casks (<code className="font-mono text-blue-400">brew bundle install</code>):
            </p>

            <textarea
              rows={9}
              value={importContent}
              onChange={e => setImportContent(e.target.value)}
              placeholder={`# Paste your Brewfile here:
tap "homebrew/core"
brew "ripgrep"
brew "eza"
cask "raycast"
cask "arc"`}
              className="w-full p-4 rounded-xl bg-[#1E1E1E] border border-[#333333] text-xs font-mono text-[#E0E0E0] placeholder-[#666666] focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setImportContent(`tap "homebrew/core"
brew "neovim"
brew "rust"
brew "go"
cask "arc"
cask "orbstack"`)}
                className="text-xs text-blue-400 hover:underline cursor-pointer"
              >
                Load Sample Stack
              </button>

              <button
                type="submit"
                disabled={!importContent.trim() || isImporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium rounded-md text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isImporting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Run Bundle Install
              </button>
            </div>
          </form>

          {importResult && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Bundle installed: {importResult.installed} packages ({importResult.skipped} already installed).
              </span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
