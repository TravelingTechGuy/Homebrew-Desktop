import React, { useState, useRef, useEffect } from 'react';
import { useBrew } from '../../context/BrewContext';
import { 
  Terminal as TerminalIcon, 
  X, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Play
} from 'lucide-react';

export const TerminalDrawer: React.FC = () => {
  const { 
    isTerminalOpen, 
    setIsTerminalOpen, 
    currentTask, 
    taskHistory, 
    executeCustomCommand 
  } = useBrew();

  const [inputCommand, setInputCommand] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedTaskHistoryId, setSelectedTaskHistoryId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const activeTask = selectedTaskHistoryId 
    ? taskHistory.find(t => t.id === selectedTaskHistoryId) || currentTask 
    : currentTask;

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTask?.logs]);

  if (!isTerminalOpen) return null;

  const handleRunCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCommand.trim()) return;
    const cmd = inputCommand.trim();
    setInputCommand('');
    setSelectedTaskHistoryId(null);
    await executeCustomCommand(cmd);
  };

  const handleCopyLogs = () => {
    if (!activeTask) return;
    const text = activeTask.logs.map(l => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderLogItem = (log: any) => {
    let colorClass = 'text-[#CCCCCC]';
    if (log.type === 'cmd') colorClass = 'text-blue-400 font-bold';
    if (log.type === 'info') colorClass = 'text-blue-300';
    if (log.type === 'success') colorClass = 'text-emerald-400';
    if (log.type === 'warn') colorClass = 'text-amber-400';
    if (log.type === 'error') colorClass = 'text-rose-400 font-semibold';
    if (log.type === 'system') colorClass = 'text-purple-400';

    return (
      <div key={log.id} className="flex gap-2.5 font-mono text-[11px] leading-relaxed py-0.5 select-text">
        <span className="text-[#666666] select-none shrink-0 font-sans text-[10px]">
          {log.timestamp}
        </span>
        <span className={`${colorClass} whitespace-pre-wrap break-all flex-1`}>
          {log.text}
        </span>
      </div>
    );
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] border-t border-[#333333] shadow-2xl flex flex-col font-mono transition-all duration-200 ${
      isExpanded ? 'h-[65vh]' : 'h-72'
    }`}>
      {/* Terminal Title Bar */}
      <div className="h-9 bg-[#222222] px-4 flex items-center justify-between border-b border-[#333333] shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold">
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Homebrew Live Console</span>
          </div>

          {activeTask && (
            <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded bg-[#333333] text-[10px] text-[#CCCCCC]">
              <span className={`w-1.5 h-1.5 rounded-full ${
                activeTask.status === 'running' 
                  ? 'bg-amber-400 animate-pulse' 
                  : activeTask.status === 'success' 
                  ? 'bg-emerald-400' 
                  : 'bg-rose-400'
              }`} />
              <span className="font-mono">{activeTask.command}</span>
              {activeTask.duration && (
                <span className="text-[#777777] font-sans">({activeTask.duration})</span>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 mr-2 text-[10px]">
            <button
              onClick={() => executeCustomCommand('brew doctor')}
              className="px-2 py-0.5 rounded bg-[#333333] hover:bg-[#444444] text-[#CCCCCC] hover:text-white transition-colors cursor-pointer"
            >
              doctor
            </button>
            <button
              onClick={() => executeCustomCommand('brew leaves')}
              className="px-2 py-0.5 rounded bg-[#333333] hover:bg-[#444444] text-[#CCCCCC] hover:text-white transition-colors cursor-pointer"
            >
              leaves
            </button>
            <button
              onClick={() => executeCustomCommand('brew cleanup -n')}
              className="px-2 py-0.5 rounded bg-[#333333] hover:bg-[#444444] text-[#CCCCCC] hover:text-white transition-colors cursor-pointer"
            >
              cleanup -n
            </button>
          </div>

          <button
            onClick={handleCopyLogs}
            className="p-1 rounded hover:bg-[#333333] text-[#777777] hover:text-white transition-colors cursor-pointer"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded hover:bg-[#333333] text-[#777777] hover:text-white transition-colors cursor-pointer"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsTerminalOpen(false)}
            className="p-1 rounded hover:bg-[#333333] text-[#777777] hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Output Area */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs">
        {activeTask && activeTask.logs.length > 0 ? (
          <div>
            {activeTask.logs.map(renderLogItem)}
            {activeTask.status === 'running' && (
              <div className="flex items-center gap-2 mt-2 text-[#777777] text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>Executing process...</span>
              </div>
            )}
            <div ref={logsEndRef} />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[#555555] select-none">
            <TerminalIcon className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs text-[#777777]">No active terminal task.</p>
            <p className="text-[11px] text-[#555555] mt-1">Run an install, update, doctor check, or enter a command below.</p>
          </div>
        )}
      </div>

      {/* Interactive Command Prompt */}
      <form onSubmit={handleRunCustom} className="h-10 bg-[#222222] border-t border-[#333333] flex items-center px-4 gap-2 shrink-0">
        <span className="text-blue-400 text-xs font-bold select-none">$</span>
        <input
          type="text"
          value={inputCommand}
          onChange={e => setInputCommand(e.target.value)}
          placeholder="brew command (e.g. brew info node, brew doctor, brew leaves)"
          className="flex-1 bg-transparent border-none text-xs text-[#E0E0E0] placeholder-[#555555] focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={!inputCommand.trim()}
          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-xs font-sans font-medium flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Play className="w-2.5 h-2.5 fill-current" />
          Run
        </button>
      </form>
    </div>
  );
};
