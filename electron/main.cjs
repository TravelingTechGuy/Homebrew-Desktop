const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

let mainWindow;

// Locate Homebrew binary path on macOS / Linux
function getBrewPath() {
  const armPath = '/opt/homebrew/bin/brew';
  const intelPath = '/usr/local/bin/brew';
  const linuxPath = '/home/linuxbrew/.linuxbrew/bin/brew';

  if (fs.existsSync(armPath)) return armPath;
  if (fs.existsSync(intelPath)) return intelPath;
  if (fs.existsSync(linuxPath)) return linuxPath;
  return 'brew';
}

function getSanitizedEnv() {
  const env = { ...process.env };
  const brewBin = '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/homebrew/sbin';
  env.PATH = env.PATH ? `${brewBin}:${env.PATH}` : brewBin;
  env.HOMEBREW_NO_AUTO_UPDATE = '1';
  env.HOMEBREW_COLOR = '1';
  return env;
}

function createWindow() {
  const appIconPngPath = path.join(__dirname, '../assets/icon.png');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: 'Homebrew Desktop',
    icon: fs.existsSync(appIconPngPath) ? appIconPngPath : undefined,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    backgroundColor: '#1E1E1E',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    }
  });

  const distIndexPath = path.resolve(__dirname, '../dist/index.html');
  const devServerUrl = process.env.VITE_DEV_SERVER_URL || process.env.ELECTRON_START_URL;

  if (devServerUrl) {
    console.log(`[Electron] Loading dev server: ${devServerUrl}`);
    mainWindow.loadURL(devServerUrl);
  } else if (fs.existsSync(distIndexPath)) {
    console.log(`[Electron] Loading built file: ${distIndexPath}`);
    mainWindow.loadFile(distIndexPath);
  } else {
    console.log(`[Electron] dist/index.html not found, fallback to localhost:3000`);
    mainWindow.loadURL('http://localhost:3000');
  }

  // Catch load failures and report clearly
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron] Failed to load ${validatedURL}: ${errorDescription} (${errorCode})`);
    if (fs.existsSync(distIndexPath) && validatedURL !== `file://${distIndexPath}`) {
      console.log(`[Electron] Retrying with local dist: ${distIndexPath}`);
      mainWindow.loadFile(distIndexPath);
    }
  });

  // Open external links in user's default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure proper macOS application menu
function createMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' }
        ] : [
          { role: 'close' }
        ])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Helper to execute brew command with promise
function runBrewPromise(args, maxBuffer = 1024 * 1024 * 30) {
  const brewPath = getBrewPath();
  return new Promise((resolve, reject) => {
    exec(`"${brewPath}" ${args.join(' ')}`, {
      env: getSanitizedEnv(),
      maxBuffer
    }, (error, stdout, stderr) => {
      if (error && !stdout) {
        resolve({ error: error.message, stdout: '', stderr });
      } else {
        resolve({ error: null, stdout, stderr });
      }
    });
  });
}

function setupIPCHandlers() {
  const brewPath = getBrewPath();

  // Execute general command with live streaming
  ipcMain.handle('brew:execute', async (event, { command, args = [] }) => {
    return new Promise((resolve) => {
      const fullArgs = Array.isArray(args) ? args : [];
      const proc = spawn(brewPath, [command, ...fullArgs], {
        env: getSanitizedEnv()
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('brew:stream-log', text);
        }
      });

      proc.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('brew:stream-log', text);
        }
      });

      proc.on('close', (exitCode) => {
        resolve({
          stdout,
          stderr,
          exitCode: exitCode || 0
        });
      });

      proc.on('error', (err) => {
        resolve({
          stdout,
          stderr: err.message,
          exitCode: 1
        });
      });
    });
  });

  // REAL LIVE DATA SYNC: Fetch all installed packages, outdated versions, taps, and services
  ipcMain.handle('brew:fetch-all-data', async () => {
    try {
      console.log('[Electron] Fetching real Homebrew data from system...');
      
      // 1. Fetch complete metadata of installed packages via JSON
      const [infoRes, outdatedRes, tapsRes, servicesRes] = await Promise.all([
        runBrewPromise(['info', '--json=v2', '--installed']),
        runBrewPromise(['outdated', '--json=v2']),
        runBrewPromise(['tap']),
        runBrewPromise(['services', 'list'])
      ]);

      const packages = [];
      const outdatedMap = new Map();

      // Parse Outdated JSON
      if (outdatedRes.stdout) {
        try {
          const outdatedJson = JSON.parse(outdatedRes.stdout);
          if (outdatedJson.formulae) {
            for (const item of outdatedJson.formulae) {
              outdatedMap.set(item.name, {
                currentVersion: item.installed_versions?.[0] || 'outdated',
                latestVersion: item.current_version
              });
            }
          }
          if (outdatedJson.casks) {
            for (const item of outdatedJson.casks) {
              outdatedMap.set(item.name, {
                currentVersion: item.installed_versions?.[0] || 'outdated',
                latestVersion: item.current_version
              });
            }
          }
        } catch (e) {
          console.warn('[Electron] Could not parse brew outdated JSON:', e.message);
        }
      }

      // Parse Installed Packages from `brew info --json=v2 --installed`
      if (infoRes.stdout) {
        try {
          const infoJson = JSON.parse(infoRes.stdout);
          
          // Process Formulae
          if (Array.isArray(infoJson.formulae)) {
            for (const f of infoJson.formulae) {
              const isOutdated = outdatedMap.has(f.name) || Boolean(f.outdated);
              const latestVer = f.versions?.stable || f.versions?.head || 'latest';
              const installedVer = f.installed?.[0]?.version || latestVer;

              packages.push({
                id: f.name,
                name: f.name,
                fullName: f.full_name || f.name,
                version: latestVer,
                installedVersion: installedVer,
                latestVersion: isOutdated && outdatedMap.get(f.name) ? outdatedMap.get(f.name).latestVersion : latestVer,
                type: 'formula',
                description: f.desc || 'Command line formula',
                homepage: f.homepage || 'https://brew.sh',
                license: f.license || 'Open Source',
                isInstalled: true,
                isOutdated: isOutdated,
                isPinned: Boolean(f.pinned),
                dependencies: Array.isArray(f.dependencies) ? f.dependencies : [],
                caveats: f.caveats || undefined,
                tap: f.tap || 'homebrew/core',
                category: categorizePackage(f.name, f.desc),
                size: 'Installed in Cellar'
              });
            }
          }

          // Process Casks (GUI Mac Apps)
          if (Array.isArray(infoJson.casks)) {
            for (const c of infoJson.casks) {
              const caskName = Array.isArray(c.name) ? c.name[0] : (c.token || c.name);
              const isOutdated = outdatedMap.has(c.token) || Boolean(c.outdated);
              const latestVer = c.version || 'latest';
              const installedVer = typeof c.installed === 'string' ? c.installed : latestVer;

              packages.push({
                id: c.token,
                name: caskName || c.token,
                fullName: c.token,
                version: latestVer,
                installedVersion: installedVer,
                latestVersion: isOutdated && outdatedMap.get(c.token) ? outdatedMap.get(c.token).latestVersion : latestVer,
                type: 'cask',
                description: c.desc || 'macOS Application',
                homepage: c.homepage || 'https://brew.sh',
                license: 'Proprietary / Freeware',
                isInstalled: true,
                isOutdated: isOutdated,
                isPinned: false,
                dependencies: [],
                caveats: c.caveats || undefined,
                tap: c.tap || 'homebrew/cask',
                category: categorizePackage(caskName || c.token, c.desc),
                autoUpdates: Boolean(c.auto_updates),
                size: 'Application bundle'
              });
            }
          }
        } catch (e) {
          console.warn('[Electron] Could not parse brew info JSON, falling back to simple list:', e.message);
        }
      }

      // Fallback: If `brew info` was empty, use `brew list --versions`
      if (packages.length === 0) {
        const [formulaList, caskList] = await Promise.all([
          runBrewPromise(['list', '--formula', '--versions']),
          runBrewPromise(['list', '--cask', '--versions'])
        ]);

        if (formulaList.stdout) {
          for (const line of formulaList.stdout.split('\n')) {
            const parts = line.trim().split(' ');
            if (parts[0]) {
              packages.push({
                id: parts[0],
                name: parts[0],
                fullName: parts[0],
                version: parts[1] || '1.0.0',
                installedVersion: parts[1] || '1.0.0',
                latestVersion: parts[1] || '1.0.0',
                type: 'formula',
                description: 'Homebrew Formula',
                homepage: 'https://brew.sh',
                license: 'MIT',
                isInstalled: true,
                isOutdated: false,
                isPinned: false,
                dependencies: [],
                tap: 'homebrew/core',
                category: 'Developer Tools'
              });
            }
          }
        }

        if (caskList.stdout) {
          for (const line of caskList.stdout.split('\n')) {
            const parts = line.trim().split(' ');
            if (parts[0]) {
              packages.push({
                id: parts[0],
                name: parts[0],
                fullName: parts[0],
                version: parts[1] || 'latest',
                installedVersion: parts[1] || 'latest',
                latestVersion: parts[1] || 'latest',
                type: 'cask',
                description: 'Homebrew Cask',
                homepage: 'https://brew.sh',
                license: 'Proprietary',
                isInstalled: true,
                isOutdated: false,
                isPinned: false,
                dependencies: [],
                tap: 'homebrew/cask',
                category: 'Utilities'
              });
            }
          }
        }
      }

      // Parse Taps
      const taps = [];
      if (tapsRes.stdout) {
        for (const line of tapsRes.stdout.split('\n')) {
          const tapName = line.trim();
          if (tapName) {
            taps.push({
              id: tapName,
              name: tapName,
              url: `https://github.com/${tapName}`,
              isOfficial: tapName.startsWith('homebrew/'),
              formulaeCount: 0,
              casksCount: 0,
              installedCount: packages.filter(p => p.tap === tapName).length,
              lastUpdated: 'Synced',
              description: tapName.startsWith('homebrew/') ? 'Official Homebrew Tap' : `Third-party tap repository ${tapName}`
            });
          }
        }
      }

      // Parse Services
      const services = [];
      if (servicesRes.stdout) {
        const serviceLines = servicesRes.stdout.split('\n').slice(1);
        for (const line of serviceLines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            const name = parts[0];
            const status = parts[1] === 'started' ? 'started' : (parts[1] === 'error' ? 'error' : 'stopped');
            const user = parts[2] || 'user';
            const plist = parts[3] || '~/Library/LaunchAgents';
            services.push({
              name,
              status,
              user,
              plist,
              loaded: status === 'started',
              autoStart: status === 'started'
            });
          }
        }
      }

      return {
        success: true,
        packages,
        taps,
        services,
        brewPath,
        systemInfo: {
          brewPath,
          prefix: fs.existsSync('/opt/homebrew') ? '/opt/homebrew' : '/usr/local',
          architecture: process.arch === 'arm64' ? 'arm64' : 'x86_64',
          macOSVersion: 'macOS ' + process.platform,
          installedFormulaeCount: packages.filter(p => p.type === 'formula').length,
          installedCasksCount: packages.filter(p => p.type === 'cask').length,
          outdatedCount: packages.filter(p => p.isOutdated).length
        }
      };
    } catch (err) {
      console.error('[Electron] Error fetching real brew data:', err);
      return {
        success: false,
        error: err.message
      };
    }
  });

  // Get system & Homebrew environment info
  ipcMain.handle('brew:get-system-info', async () => {
    return {
      brewPath,
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      prefix: fs.existsSync('/opt/homebrew') ? '/opt/homebrew' : '/usr/local'
    };
  });

  // Open external URL in macOS default browser
  ipcMain.handle('shell:open-external', async (event, url) => {
    if (url && (url.startsWith('https://') || url.startsWith('http://'))) {
      await shell.openExternal(url);
    }
  });
}

function categorizePackage(name, desc = '') {
  const text = (name + ' ' + desc).toLowerCase();
  if (text.includes('database') || text.includes('sql') || text.includes('redis') || text.includes('mongo')) return 'Databases';
  if (text.includes('terminal') || text.includes('cli') || text.includes('shell') || text.includes('prompt')) return 'Utilities';
  if (text.includes('browser') || text.includes('editor') || text.includes('ide') || text.includes('code') || text.includes('git')) return 'Developer Tools';
  if (text.includes('media') || text.includes('video') || text.includes('audio') || text.includes('music') || text.includes('photo')) return 'Media & Design';
  if (text.includes('security') || text.includes('crypto') || text.includes('ssh') || text.includes('gpg') || text.includes('vpn')) return 'Security';
  return 'Developer Tools';
}

app.whenReady().then(() => {
  const appIconPngPath = path.join(__dirname, '../assets/icon.png');

  if (app.setAboutPanelOptions) {
    app.setAboutPanelOptions({
      applicationName: 'Homebrew Desktop',
      applicationVersion: '1.0.0',
      version: '1.0.0',
      copyright: 'Copyright © 2026 Traveling Tech Guy LLC',
      authors: ['Traveling Tech Guy LLC'],
      website: 'https://brew.sh',
      iconPath: fs.existsSync(appIconPngPath) ? appIconPngPath : undefined
    });
  }

  if (process.platform === 'darwin' && app.dock && fs.existsSync(appIconPngPath)) {
    try {
      app.dock.setIcon(appIconPngPath);
    } catch (e) {
      console.warn('[Electron] Could not set dock icon:', e.message);
    }
  }

  setupIPCHandlers();
  createMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
