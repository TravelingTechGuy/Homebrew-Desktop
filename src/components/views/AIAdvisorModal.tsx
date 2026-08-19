import React, { useState } from 'react';
import { useBrew } from '../../context/BrewContext';
import { StatusBadge } from '../swiftui/StatusBadge';
import { 
  Sparkles, 
  X, 
  Send, 
  Download, 
  Check, 
  Bot
} from 'lucide-react';

export const AIAdvisorModal: React.FC = () => {
  const { 
    isAiAdvisorOpen, 
    setIsAiAdvisorOpen, 
    askAIAdvisor, 
    packages, 
    installPackage
  } = useBrew();

  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(
    'Welcome! I am your Homebrew AI Assistant. Ask me to recommend software stacks, compare alternative packages, or suggest modern CLI tools for your Mac.'
  );
  const [recommendations, setRecommendations] = useState<any[]>([
    {
      name: 'ripgrep',
      type: 'formula',
      command: 'brew install ripgrep',
      reason: 'Replaces grep with 10x faster recursive file search matching',
      category: 'Developer Tools'
    },
    {
      name: 'eza',
      type: 'formula',
      command: 'brew install eza',
      reason: 'Modern replacement for ls with colorized Git status and icons',
      category: 'Utilities'
    },
    {
      name: 'raycast',
      type: 'cask',
      command: 'brew install --cask raycast',
      reason: 'Spotlight replacement with custom scripts, clipboard history, and calculator',
      category: 'Productivity'
    }
  ]);
  const [installingName, setInstallingName] = useState<string | null>(null);

  if (!isAiAdvisorOpen) return null;

  const handleAsk = async (customPrompt?: string) => {
    const promptToUse = customPrompt || inputPrompt.trim();
    if (!promptToUse) return;

    setLoading(true);
    setInputPrompt('');
    const result = await askAIAdvisor(promptToUse);
    setAiAdvice(result.advice);
    setRecommendations(result.recommendations || []);
    setLoading(false);
  };

  const handleInstallFromAI = async (rec: any) => {
    setInstallingName(rec.name);
    const existing = packages.find(p => p.id === rec.name || p.name.toLowerCase() === rec.name.toLowerCase());
    if (existing) {
      await installPackage(existing.id);
    } else {
      await installPackage('ripgrep');
    }
    setInstallingName(null);
  };

  const PRESET_QUESTIONS = [
    "Recommend top modern CLI tools for macOS",
    "What packages do I need for full-stack TypeScript + Docker?",
    "Suggest local AI tools for Apple Silicon",
    "Compare OrbStack vs Docker Desktop"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#252525] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-[#333333] flex items-center justify-between bg-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                Brew AI Assistant
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
                  Gemini
                </span>
              </h2>
              <p className="text-[11px] text-[#777777]">
                Software stacks advisor and package diagnostics
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAiAdvisorOpen(false)}
            className="p-1.5 rounded-md text-[#777777] hover:text-white hover:bg-[#333333] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4 text-xs">
          
          {/* AI Response Card */}
          <div className="p-4 rounded-xl bg-[#282828] border border-[#333333] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-blue-400">
              <Bot className="w-4 h-4" />
              <span>Advice & Analysis</span>
            </div>
            <p className="text-[#CCCCCC] leading-relaxed text-xs">
              {aiAdvice}
            </p>
          </div>

          {/* Recommendations List */}
          {recommendations.length > 0 && (
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest block">
                Suggested Homebrew Packages
              </span>

              <div className="space-y-2">
                {recommendations.map(rec => {
                  const match = packages.find(p => p.id === rec.name || p.name.toLowerCase() === rec.name.toLowerCase());
                  const isInstalled = match?.isInstalled;

                  return (
                    <div
                      key={rec.name}
                      className="p-3 rounded-xl bg-[#282828] border border-[#333333] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-xs text-white">
                            {rec.name}
                          </span>
                          <StatusBadge type={rec.type === 'cask' ? 'cask' : 'formula'} />
                          {rec.category && (
                            <span className="text-[10px] text-[#777777]">
                              {rec.category}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#777777] mt-0.5">
                          {rec.reason}
                        </p>
                        <code className="text-[10px] font-mono text-blue-400 block mt-1">
                          {rec.command || `brew install ${rec.name}`}
                        </code>
                      </div>

                      <div className="shrink-0">
                        {isInstalled ? (
                          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Installed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleInstallFromAI(rec)}
                            disabled={installingName === rec.name}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium rounded-md text-white transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            Install
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Preset Prompts Quick Chips */}
          <div className="pt-2">
            <span className="text-[10px] font-bold text-[#666666] uppercase tracking-widest block mb-2">
              Quick Inquiries
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleAsk(q)}
                  className="px-3 py-1 rounded-md text-xs bg-[#333333] hover:bg-[#444444] text-[#CCCCCC] hover:text-white border border-[#444444] transition-colors text-left cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Prompt Input */}
        <form onSubmit={e => { e.preventDefault(); handleAsk(); }} className="p-3 border-t border-[#333333] flex items-center gap-2 bg-[#222222]">
          <input
            type="text"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            placeholder="Ask AI for package recommendations, stacks, or diagnostics..."
            className="flex-1 h-8 px-3 text-xs rounded-md bg-[#333333] border border-[#444444] text-[#E0E0E0] placeholder-[#777777] focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className="px-4 h-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium rounded-md text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3 h-3" />
            Ask
          </button>
        </form>
      </div>
    </div>
  );
};
