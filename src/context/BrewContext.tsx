import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  BrewPackage, 
  BrewTap, 
  BrewService, 
  DoctorCheck, 
  BrewSystemInfo, 
  ActiveNavTab,
  TerminalTask,
  TerminalLog
} from '../types';
import { 
  INITIAL_PACKAGES, 
  INITIAL_TAPS, 
  INITIAL_SERVICES, 
  INITIAL_DOCTOR_CHECKS, 
  INITIAL_SYSTEM_INFO 
} from '../data/brewData';

interface BrewContextType {
  packages: BrewPackage[];
  taps: BrewTap[];
  services: BrewService[];
  doctorChecks: DoctorCheck[];
  systemInfo: BrewSystemInfo;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  selectedPackage: BrewPackage | null;
  setSelectedPackage: (pkg: BrewPackage | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isTerminalOpen: boolean;
  setIsTerminalOpen: (open: boolean) => void;
  currentTask: TerminalTask | null;
  taskHistory: TerminalTask[];
  isDarkTheme: boolean;
  setIsDarkTheme: (isDark: boolean) => void;
  isElectron: boolean;
  electronPath?: string;
  isSyncing: boolean;
  isLiveSynced: boolean;
  syncWithLocalHomebrew: () => Promise<void>;
  
  // Actions
  installPackage: (packageId: string) => Promise<void>;
  uninstallPackage: (packageId: string) => Promise<void>;
  upgradePackage: (packageId: string) => Promise<void>;
  upgradeAllOutdated: () => Promise<void>;
  togglePinPackage: (packageId: string) => void;
  addTap: (name: string, url?: string) => Promise<void>;
  removeTap: (tapId: string) => Promise<void>;
  toggleService: (serviceName: string, action: 'start' | 'stop' | 'restart') => Promise<void>;
  toggleServiceAutoStart: (serviceName: string) => void;
  runDoctor: () => Promise<void>;
  fixDoctorIssue: (checkId: string) => Promise<void>;
  runCleanup: () => Promise<void>;
  runUpdate: () => Promise<void>;
  executeCustomCommand: (command: string) => Promise<void>;
  exportBrewfile: () => string;
  importBrewfile: (content: string) => Promise<{ installed: number; skipped: number }>;
  askAIAdvisor: (prompt: string, queryType?: string) => Promise<{ advice: string; recommendations: any[] }>;
  isAiAdvisorOpen: boolean;
  setIsAiAdvisorOpen: (open: boolean) => void;
}

const BrewContext = createContext<BrewContextType | undefined>(undefined);

export const BrewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);
  const [electronPath, setElectronPath] = useState<string>(
    isElectron ? (window.electronAPI?.brewPath || '/opt/homebrew/bin/brew') : '/opt/homebrew/bin/brew'
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLiveSynced, setIsLiveSynced] = useState<boolean>(false);

  const [packages, setPackages] = useState<BrewPackage[]>(() => {
    const saved = localStorage.getItem('brew_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [taps, setTaps] = useState<BrewTap[]>(() => {
    const saved = localStorage.getItem('brew_taps');
    return saved ? JSON.parse(saved) : INITIAL_TAPS;
  });

  const [services, setServices] = useState<BrewService[]>(() => {
    const saved = localStorage.getItem('brew_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [doctorChecks, setDoctorChecks] = useState<DoctorCheck[]>(() => {
    const saved = localStorage.getItem('brew_doctor');
    return saved ? JSON.parse(saved) : INITIAL_DOCTOR_CHECKS;
  });

  const [systemInfo, setSystemInfo] = useState<BrewSystemInfo>(INITIAL_SYSTEM_INFO);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [selectedPackage, setSelectedPackage] = useState<BrewPackage | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState<boolean>(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

  const [currentTask, setCurrentTask] = useState<TerminalTask | null>(null);
  const [taskHistory, setTaskHistory] = useState<TerminalTask[]>([]);

  // Function to sync real Homebrew data directly from user's Mac
  const syncWithLocalHomebrew = async () => {
    if (isElectron && window.electronAPI && window.electronAPI.fetchAllBrewData) {
      setIsSyncing(true);
      try {
        console.log('[BrewContext] Syncing real Homebrew data via Electron IPC...');
        const result = await window.electronAPI.fetchAllBrewData();
        if (result && result.success) {
          if (result.packages && result.packages.length > 0) {
            setPackages(result.packages);
          }
          if (result.taps) {
            setTaps(result.taps);
          }
          if (result.services) {
            setServices(result.services);
          }
          if (result.systemInfo) {
            setSystemInfo(prev => ({
              ...prev,
              ...result.systemInfo,
              brewPath: result.systemInfo?.brewPath || prev.brewPath
            }));
          }
          setIsLiveSynced(true);
        }
      } catch (err) {
        console.error('[BrewContext] Failed to sync live brew data:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  // Check Electron runtime environment & fetch live data on startup
  useEffect(() => {
    if (isElectron && window.electronAPI) {
      window.electronAPI.getSystemInfo().then(info => {
        if (info && info.brewPath) {
          setElectronPath(info.brewPath);
        }
      }).catch(console.error);

      // Perform real data fetch from Mac
      syncWithLocalHomebrew();
    }
  }, [isElectron]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('brew_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem('brew_taps', JSON.stringify(taps));
  }, [taps]);

  useEffect(() => {
    localStorage.setItem('brew_services', JSON.stringify(services));
  }, [services]);

  // Recalculate system info metrics
  useEffect(() => {
    const installedFormulae = packages.filter(p => p.isInstalled && p.type === 'formula').length;
    const installedCasks = packages.filter(p => p.isInstalled && p.type === 'cask').length;
    const outdated = packages.filter(p => p.isInstalled && p.isOutdated).length;
    const runningServices = services.filter(s => s.status === 'started').length;

    setSystemInfo(prev => ({
      ...prev,
      installedFormulaeCount: installedFormulae,
      installedCasksCount: installedCasks,
      outdatedCount: outdated,
      servicesRunningCount: runningServices,
    }));
  }, [packages, services]);

  // Terminal Runner Helper with real Electron spawn and stdout streaming
  const runTerminalTask = async (
    command: string, 
    logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }>,
    electronArgs?: { cmd: string; args: string[] }
  ): Promise<boolean> => {
    setIsTerminalOpen(true);
    const taskId = 'task_' + Date.now();
    const startTime = Date.now();
    const task: TerminalTask = {
      id: taskId,
      command,
      status: 'running',
      logs: [
        {
          id: 'log_0',
          text: `$ ${command}`,
          type: 'cmd',
          timestamp: new Date().toLocaleTimeString()
        }
      ],
      startedAt: new Date().toLocaleTimeString()
    };

    setCurrentTask(task);

    // Native Electron Execution Path
    if (isElectron && window.electronAPI && electronArgs) {
      let logIndex = 1;
      const cleanupStream = window.electronAPI.onLogOutput 
        ? window.electronAPI.onLogOutput((outputChunk) => {
            const lines = outputChunk.split('\n').filter(l => l.trim().length > 0);
            lines.forEach(line => {
              const newLog: TerminalLog = {
                id: `log_${logIndex++}`,
                text: line,
                type: line.toLowerCase().includes('error') ? 'error' : (line.toLowerCase().includes('warning') ? 'warn' : 'info'),
                timestamp: new Date().toLocaleTimeString()
              };
              setCurrentTask(prev => {
                if (!prev || prev.id !== taskId) return prev;
                return {
                  ...prev,
                  logs: [...prev.logs, newLog]
                };
              });
            });
          })
        : () => {};

      try {
        const res = await window.electronAPI.executeCommand(electronArgs.cmd, electronArgs.args);
        cleanupStream();

        const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
        const finishedTask: TerminalTask = {
          ...task,
          status: res.exitCode === 0 ? 'success' : 'failed',
          duration,
          logs: [
            ...task.logs,
            {
              id: `log_end`,
              text: res.exitCode === 0 
                ? `✔ Process finished successfully in ${duration}`
                : `✘ Command failed with exit code ${res.exitCode}`,
              type: res.exitCode === 0 ? 'success' : 'error',
              timestamp: new Date().toLocaleTimeString()
            }
          ]
        };
        setCurrentTask(finishedTask);
        setTaskHistory(prev => [finishedTask, ...prev.slice(0, 19)]);
        
        // Re-sync local data after real command finishes
        syncWithLocalHomebrew();
        return res.exitCode === 0;
      } catch (err: any) {
        cleanupStream();
      }
    }

    // Default Web Simulation Flow
    for (let i = 0; i < logSteps.length; i++) {
      const step = logSteps[i];
      await new Promise(r => setTimeout(r, step.delay));
      
      const newLog: TerminalLog = {
        id: `log_${i + 1}`,
        text: step.text,
        type: step.type,
        timestamp: new Date().toLocaleTimeString()
      };

      setCurrentTask(prev => {
        if (!prev || prev.id !== taskId) return prev;
        return {
          ...prev,
          logs: [...prev.logs, newLog]
        };
      });
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
    const finishedTask: TerminalTask = {
      ...task,
      status: 'success',
      duration,
      logs: [
        ...task.logs,
        ...logSteps.map((s, idx) => ({
          id: `log_${idx + 1}`,
          text: s.text,
          type: s.type,
          timestamp: new Date().toLocaleTimeString()
        }))
      ]
    };

    setCurrentTask(finishedTask);
    setTaskHistory(prev => [finishedTask, ...prev.slice(0, 19)]);
    return true;
  };

  // Install Package
  const installPackage = async (packageId: string) => {
    const target = packages.find(p => p.id === packageId);
    if (!target) return;

    const isCask = target.type === 'cask';
    const command = isCask ? `brew install --cask ${target.id}` : `brew install ${target.id}`;

    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 350, text: `==> Downloading https://ghcr.io/v2/homebrew/${target.tap.split('/')[1] || 'core'}/${target.id}/manifests/${target.latestVersion}`, type: 'info' },
      { delay: 500, text: `==> Fetching ${target.id} bottle (${target.size || '34 MB'})...`, type: 'info' },
      { delay: 600, text: `==> Verifying SHA256 cryptographic checksum... OK`, type: 'info' },
      { delay: 450, text: `==> Pouring ${target.id}--${target.latestVersion}.arm64_sequoia.bottle.tar.gz`, type: 'info' },
      { delay: 400, text: isCask ? `==> Linking Binary '${target.name}.app' to '/Applications'` : `==> Linking /opt/homebrew/Cellar/${target.id}/${target.latestVersion}... 142 symlinks created`, type: 'info' },
      { delay: 350, text: `🍺  /opt/homebrew/Cellar/${target.id}/${target.latestVersion}: ${target.size || '28.4MB'} (${target.dependencies.length ? target.dependencies.length + ' dependencies' : 'standalone'})`, type: 'success' },
      { delay: 200, text: `==> Successfully installed ${target.name}!`, type: 'success' }
    ];

    if (target.caveats) {
      logSteps.push({
        delay: 200,
        text: `==> Caveats\n${target.caveats}`,
        type: 'warn'
      });
    }

    const electronArgs = isCask 
      ? { cmd: 'install', args: ['--cask', target.id] }
      : { cmd: 'install', args: [target.id] };

    await runTerminalTask(command, logSteps, electronArgs);

    setPackages(prev => prev.map(p => {
      if (p.id === packageId) {
        return {
          ...p,
          isInstalled: true,
          installedVersion: p.latestVersion,
          isOutdated: false,
          installedDate: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    }));

    if (selectedPackage && selectedPackage.id === packageId) {
      setSelectedPackage(prev => prev ? {
        ...prev,
        isInstalled: true,
        installedVersion: prev.latestVersion,
        isOutdated: false
      } : null);
    }
  };

  // Uninstall Package
  const uninstallPackage = async (packageId: string) => {
    const target = packages.find(p => p.id === packageId);
    if (!target) return;

    const isCask = target.type === 'cask';
    const command = isCask ? `brew uninstall --cask ${target.id}` : `brew uninstall ${target.id}`;

    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Uninstalling ${target.id}...`, type: 'info' },
      { delay: 400, text: isCask ? `==> Backing up and removing '${target.name}.app'` : `==> Unlinking /opt/homebrew/Cellar/${target.id}/${target.installedVersion || target.latestVersion}...`, type: 'info' },
      { delay: 350, text: `==> Purging Cellar keg directories and stale config files...`, type: 'info' },
      { delay: 250, text: `🍺  Uninstalled ${target.name} (freed ${target.size || '45 MB'} on disk)`, type: 'success' }
    ];

    const electronArgs = isCask
      ? { cmd: 'uninstall', args: ['--cask', target.id] }
      : { cmd: 'uninstall', args: [target.id] };

    await runTerminalTask(command, logSteps, electronArgs);

    setPackages(prev => prev.map(p => {
      if (p.id === packageId) {
        return {
          ...p,
          isInstalled: false,
          installedVersion: undefined,
          isOutdated: false,
          isPinned: false
        };
      }
      return p;
    }));

    if (selectedPackage && selectedPackage.id === packageId) {
      setSelectedPackage(prev => prev ? {
        ...prev,
        isInstalled: false,
        installedVersion: undefined,
        isOutdated: false,
        isPinned: false
      } : null);
    }
  };

  // Upgrade Package
  const upgradePackage = async (packageId: string) => {
    const target = packages.find(p => p.id === packageId);
    if (!target || !target.isOutdated) return;

    const command = `brew upgrade ${target.id}`;

    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Upgrading 1 outdated package:`, type: 'info' },
      { delay: 200, text: `    ${target.id} ${target.installedVersion} -> ${target.latestVersion}`, type: 'info' },
      { delay: 450, text: `==> Downloading bottle for ${target.id} (${target.latestVersion})...`, type: 'info' },
      { delay: 500, text: `==> Pouring bottle and updating symlinks...`, type: 'info' },
      { delay: 300, text: `==> Unlinking old keg ${target.id} ${target.installedVersion}`, type: 'info' },
      { delay: 250, text: `🍺  Upgraded ${target.name} to ${target.latestVersion} successfully!`, type: 'success' }
    ];

    const electronArgs = { cmd: 'upgrade', args: [target.id] };

    await runTerminalTask(command, logSteps, electronArgs);

    setPackages(prev => prev.map(p => {
      if (p.id === packageId) {
        return {
          ...p,
          installedVersion: p.latestVersion,
          isOutdated: false
        };
      }
      return p;
    }));

    if (selectedPackage && selectedPackage.id === packageId) {
      setSelectedPackage(prev => prev ? {
        ...prev,
        installedVersion: prev.latestVersion,
        isOutdated: false
      } : null);
    }
  };

  // Upgrade All Outdated
  const upgradeAllOutdated = async () => {
    const outdatedPackages = packages.filter(p => p.isInstalled && p.isOutdated);
    if (outdatedPackages.length === 0) return;

    const command = `brew upgrade`;
    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Upgrading ${outdatedPackages.length} outdated packages...`, type: 'info' },
      ...outdatedPackages.flatMap(p => [
        { delay: 350, text: `==> Upgrading ${p.name} (${p.installedVersion} -> ${p.latestVersion})`, type: 'info' as const },
        { delay: 400, text: `==> Downloading & pouring ${p.id} bottle...`, type: 'info' as const },
        { delay: 200, text: `🍺  ${p.name} updated to latest`, type: 'success' as const }
      ]),
      { delay: 300, text: `==> Summary: Upgraded ${outdatedPackages.length} packages. All formulas up to date.`, type: 'success' }
    ];

    const electronArgs = { cmd: 'upgrade', args: [] };
    await runTerminalTask(command, logSteps, electronArgs);

    setPackages(prev => prev.map(p => {
      if (p.isInstalled && p.isOutdated) {
        return {
          ...p,
          installedVersion: p.latestVersion,
          isOutdated: false
        };
      }
      return p;
    }));
  };

  // Toggle Pin
  const togglePinPackage = (packageId: string) => {
    setPackages(prev => prev.map(p => {
      if (p.id === packageId) {
        return {
          ...p,
          isPinned: !p.isPinned
        };
      }
      return p;
    }));

    if (selectedPackage && selectedPackage.id === packageId) {
      setSelectedPackage(prev => prev ? {
        ...prev,
        isPinned: !prev.isPinned
      } : null);
    }
  };

  // Add Tap
  const addTap = async (name: string, url?: string) => {
    const command = `brew tap ${name}`;
    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Tapping ${name}...`, type: 'info' },
      { delay: 500, text: `Cloning into '/opt/homebrew/Library/Taps/${name.replace('/', '/homebrew-')}'...`, type: 'info' },
      { delay: 400, text: `==> Tapped repository successfully`, type: 'success' },
      { delay: 200, text: `🍺  Tapped 1 repository (12 formulae, 4 casks)`, type: 'success' }
    ];

    const electronArgs = { cmd: 'tap', args: [name] };
    await runTerminalTask(command, logSteps, electronArgs);

    const newTap: BrewTap = {
      id: name,
      name,
      url: url || `https://github.com/${name}`,
      isOfficial: name.startsWith('homebrew/'),
      formulaeCount: 12,
      casksCount: 4,
      installedCount: 0,
      lastUpdated: 'Just now',
      description: `User-added tap for ${name}`
    };

    setTaps(prev => [...prev.filter(t => t.id !== name), newTap]);
  };

  // Remove Tap
  const removeTap = async (tapId: string) => {
    const command = `brew untap ${tapId}`;
    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Untapping ${tapId}...`, type: 'info' },
      { delay: 400, text: `Untapped 1 repository`, type: 'success' }
    ];

    const electronArgs = { cmd: 'untap', args: [tapId] };
    await runTerminalTask(command, logSteps, electronArgs);

    setTaps(prev => prev.filter(t => t.id !== tapId));
  };

  // Toggle Service
  const toggleService = async (serviceName: string, action: 'start' | 'stop' | 'restart') => {
    const command = `brew services ${action} ${serviceName}`;
    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Executing brew services ${action} ${serviceName}...`, type: 'info' },
      { delay: 400, text: `==> Successfully ${action}ed \`${serviceName}\` (label: homebrew.mxcl.${serviceName})`, type: 'success' }
    ];

    const electronArgs = { cmd: 'services', args: [action, serviceName] };
    await runTerminalTask(command, logSteps, electronArgs);

    setServices(prev => prev.map(s => {
      if (s.name === serviceName) {
        return {
          ...s,
          status: action === 'stop' ? 'stopped' : 'started',
          loaded: action !== 'stop'
        };
      }
      return s;
    }));
  };

  // Toggle Service Auto-start
  const toggleServiceAutoStart = (serviceName: string) => {
    setServices(prev => prev.map(s => {
      if (s.name === serviceName) {
        return {
          ...s,
          autoStart: !s.autoStart
        };
      }
      return s;
    }));
  };

  // Doctor
  const runDoctor = async () => {
    const command = `brew doctor`;
    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Checking your Homebrew environment and system configuration...`, type: 'info' },
      { delay: 400, text: `==> Verifying macOS CLT version 16.2.0... OK`, type: 'info' },
      { delay: 350, text: `==> Inspecting Cellar symlinks and /opt/homebrew/bin permissions...`, type: 'info' },
      { delay: 300, text: `==> Checking tapped repositories git health... OK`, type: 'info' },
      { delay: 200, text: `Your system is ready to brew with 2 minor warnings detected.`, type: 'warn' }
    ];

    const electronArgs = { cmd: 'doctor', args: [] };
    await runTerminalTask(command, logSteps, electronArgs);
  };

  // Fix Doctor Issue
  const fixDoctorIssue = async (checkId: string) => {
    const check = doctorChecks.find(c => c.id === checkId);
    if (!check || !check.fixCommand) return;

    const command = check.fixCommand;
    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Running fix: ${command}...`, type: 'info' },
      { delay: 500, text: `==> Cleaning up broken links & fixing permissions...`, type: 'info' },
      { delay: 300, text: `✔ Successfully resolved ${check.title}`, type: 'success' }
    ];

    const parts = command.replace('brew ', '').split(' ');
    const electronArgs = { cmd: parts[0], args: parts.slice(1) };

    await runTerminalTask(command, logSteps, electronArgs);

    setDoctorChecks(prev => prev.map(c => {
      if (c.id === checkId) {
        return {
          ...c,
          severity: 'ok',
          description: 'Resolved: ' + c.description
        };
      }
      return c;
    }));
  };

  // Run Cleanup
  const runCleanup = async () => {
    const command = `brew cleanup --prune=all`;
    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Removing cached downloads older than 120 days...`, type: 'info' },
      { delay: 450, text: `==> Pruning /Users/user/Library/Caches/Homebrew/downloads...`, type: 'info' },
      { delay: 400, text: `==> Removing old bottle lockfiles and unneeded versions...`, type: 'info' },
      { delay: 300, text: `🍺  Cleaned up 1.84 GB of disk space!`, type: 'success' }
    ];

    const electronArgs = { cmd: 'cleanup', args: ['--prune=all'] };
    await runTerminalTask(command, logSteps, electronArgs);

    setSystemInfo(prev => ({
      ...prev,
      cacheSize: '42.1 MB'
    }));
  };

  // Run Update
  const runUpdate = async () => {
    const command = `brew update`;
    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Updating Homebrew...`, type: 'info' },
      { delay: 600, text: `==> Fetching homebrew/core and homebrew/cask git references...`, type: 'info' },
      { delay: 400, text: `==> Updated 3 taps (homebrew/core, homebrew/cask, homebrew/services)`, type: 'info' },
      { delay: 300, text: `Already up-to-date. (Checked 7,842 formulae, 4,319 casks)`, type: 'success' }
    ];

    const electronArgs = { cmd: 'update', args: [] };
    await runTerminalTask(command, logSteps, electronArgs);

    setSystemInfo(prev => ({
      ...prev,
      lastUpdated: 'Just now'
    }));
  };

  // Execute Custom Terminal Command
  const executeCustomCommand = async (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;

    const parts = trimmed.startsWith('brew ') ? trimmed.slice(5).split(' ') : trimmed.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Executing: ${command}`, type: 'info' },
      { delay: 400, text: `Output processed.`, type: 'success' }
    ];

    await runTerminalTask(trimmed, logSteps, { cmd, args });
  };

  // Export Brewfile
  const exportBrewfile = (): string => {
    const lines: string[] = [
      `# Homebrew Bundle Export`,
      `# Generated: ${new Date().toISOString()}`,
      `# System Architecture: ${systemInfo.architecture} (${systemInfo.prefix})`,
      ``
    ];

    taps.forEach(t => {
      lines.push(`tap "${t.name}"`);
    });

    lines.push(``);
    packages.filter(p => p.isInstalled && p.type === 'formula').forEach(f => {
      lines.push(`brew "${f.id}"`);
    });

    lines.push(``);
    packages.filter(p => p.isInstalled && p.type === 'cask').forEach(c => {
      lines.push(`cask "${c.id}"`);
    });

    return lines.join('\n');
  };

  // Import Brewfile
  const importBrewfile = async (content: string): Promise<{ installed: number; skipped: number }> => {
    const lines = content.split('\n');
    let installedCount = 0;
    let skippedCount = 0;

    const command = `brew bundle --file=./Brewfile`;
    const logSteps: Array<{ delay: number; text: string; type: TerminalLog['type'] }> = [
      { delay: 300, text: `==> Parsing Brewfile bundle specifications...`, type: 'info' },
      { delay: 500, text: `==> Verifying installed taps, formulas, and casks...`, type: 'info' }
    ];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('brew "') || trimmed.startsWith("brew '")) {
        const pkgName = trimmed.replace(/brew ["']([^"']+)["'].*/, '$1');
        const match = packages.find(p => p.id === pkgName);
        if (match && !match.isInstalled) {
          logSteps.push({
            delay: 300,
            text: `==> Installing formula: ${pkgName}...`,
            type: 'info'
          });
          installedCount++;
        } else {
          skippedCount++;
        }
      } else if (trimmed.startsWith('cask "') || trimmed.startsWith("cask '")) {
        const caskName = trimmed.replace(/cask ["']([^"']+)["'].*/, '$1');
        const match = packages.find(p => p.id === caskName);
        if (match && !match.isInstalled) {
          logSteps.push({
            delay: 350,
            text: `==> Installing cask: ${caskName}...`,
            type: 'info'
          });
          installedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    logSteps.push({
      delay: 200,
      text: `🍺  Brewfile bundle execution finished: ${installedCount} installed, ${skippedCount} skipped (already present)`,
      type: 'success'
    });

    await runTerminalTask(command, logSteps);
    return { installed: installedCount, skipped: skippedCount };
  };

  // Ask AI Package Advisor
  const askAIAdvisor = async (prompt: string, queryType?: string): Promise<{ advice: string; recommendations: any[] }> => {
    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          queryType,
          installedPackages: packages.filter(p => p.isInstalled).map(p => p.id),
          systemInfo
        })
      });

      if (!response.ok) {
        throw new Error(`Advisor API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.warn('Falling back to local heuristic advisor:', err);
      return {
        advice: 'Recommended packages tailored to your development stack and modern macOS tools.',
        recommendations: [
          {
            name: 'ripgrep',
            type: 'formula',
            command: 'brew install ripgrep',
            reason: 'Fastest file search utility with regex matching',
            category: 'Developer Tools'
          },
          {
            name: 'eza',
            type: 'formula',
            command: 'brew install eza',
            reason: 'A modern, vibrant replacement for standard ls',
            category: 'Utilities'
          },
          {
            name: 'obsidian',
            type: 'cask',
            command: 'brew install --cask obsidian',
            reason: 'Local Markdown notes graph database',
            category: 'Productivity'
          }
        ]
      };
    }
  };

  return (
    <BrewContext.Provider
      value={{
        packages,
        taps,
        services,
        doctorChecks,
        systemInfo,
        activeTab,
        setActiveTab,
        selectedPackage,
        setSelectedPackage,
        searchQuery,
        setSearchQuery,
        isTerminalOpen,
        setIsTerminalOpen,
        currentTask,
        taskHistory,
        isDarkTheme,
        setIsDarkTheme,
        isElectron,
        electronPath,
        isSyncing,
        isLiveSynced,
        syncWithLocalHomebrew,
        installPackage,
        uninstallPackage,
        upgradePackage,
        upgradeAllOutdated,
        togglePinPackage,
        addTap,
        removeTap,
        toggleService,
        toggleServiceAutoStart,
        runDoctor,
        fixDoctorIssue,
        runCleanup,
        runUpdate,
        executeCustomCommand,
        exportBrewfile,
        importBrewfile,
        askAIAdvisor,
        isAiAdvisorOpen,
        setIsAiAdvisorOpen
      }}
    >
      {children}
    </BrewContext.Provider>
  );
};

export const useBrew = () => {
  const context = useContext(BrewContext);
  if (!context) {
    throw new Error('useBrew must be used within a BrewProvider');
  }
  return context;
};
