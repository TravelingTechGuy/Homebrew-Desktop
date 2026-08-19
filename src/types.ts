export type PackageType = 'formula' | 'cask';
export type ServiceStatus = 'started' | 'stopped' | 'error' | 'none';

export interface BrewPackage {
  id: string;
  name: string;
  fullName: string;
  version: string;
  installedVersion?: string;
  latestVersion: string;
  type: PackageType;
  description: string;
  homepage: string;
  license: string;
  isInstalled: boolean;
  isOutdated: boolean;
  isPinned: boolean;
  installedDate?: string;
  size?: string;
  sizeBytes?: number;
  dependencies: string[];
  dependents?: string[];
  caveats?: string;
  tap: string;
  serviceName?: string;
  serviceStatus?: ServiceStatus;
  category: string;
  analyticsRank?: number;
  downloads30d?: number;
  autoUpdates?: boolean;
  artifacts?: string[];
  bottleArch?: string;
  rubyFormula?: string;
}

export interface BrewTap {
  id: string;
  name: string;
  url: string;
  isOfficial: boolean;
  formulaeCount: number;
  casksCount: number;
  installedCount: number;
  lastUpdated: string;
  description: string;
}

export interface BrewService {
  name: string;
  status: 'started' | 'stopped' | 'error' | 'unknown';
  user: string;
  plist: string;
  port?: number;
  loaded: boolean;
  autoStart: boolean;
}

export interface DoctorCheck {
  id: string;
  title: string;
  description: string;
  severity: 'ok' | 'warning' | 'error';
  fixCommand?: string;
  fixLabel?: string;
  category: 'permissions' | 'symlinks' | 'clt' | 'config' | 'cache';
}

export interface TerminalLog {
  id: string;
  text: string;
  type: 'cmd' | 'info' | 'success' | 'warn' | 'error' | 'system';
  timestamp: string;
}

export interface TerminalTask {
  id: string;
  command: string;
  status: 'running' | 'success' | 'failed';
  logs: TerminalLog[];
  startedAt: string;
  duration?: string;
}

export interface BrewSystemInfo {
  brewVersion: string;
  prefix: string;
  brewPath?: string;
  architecture: 'arm64' | 'x86_64';
  cltVersion: string;
  macOSVersion: string;
  lastUpdated: string;
  analyticsEnabled: boolean;
  cacheSize: string;
  installedFormulaeCount: number;
  installedCasksCount: number;
  outdatedCount: number;
  servicesRunningCount: number;
}

export type ActiveNavTab = 
  | 'dashboard'
  | 'installed'
  | 'discover'
  | 'taps'
  | 'services'
  | 'doctor'
  | 'brewfile'
  | 'electron';

export interface ElectronFetchResult {
  success: boolean;
  packages?: BrewPackage[];
  taps?: BrewTap[];
  services?: BrewService[];
  systemInfo?: Partial<BrewSystemInfo>;
  error?: string;
}

export interface ElectronAPI {
  isElectron: boolean;
  platform: string;
  arch: string;
  brewPath: string;
  executeCommand: (cmd: string, args?: string[]) => Promise<{ stdout: string; stderr: string; exitCode: number }>;
  fetchAllBrewData: () => Promise<ElectronFetchResult>;
  onLogOutput?: (callback: (log: string) => void) => () => void;
  getSystemInfo: () => Promise<Partial<BrewSystemInfo> & { brewPath?: string }>;
  getInstalledPackages?: () => Promise<{ formulae: any[]; casks: any[] }>;
  getOutdatedPackages?: () => Promise<string[]>;
  getTaps?: () => Promise<string[]>;
  getServices?: () => Promise<any[]>;
  openExternal: (url: string) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
