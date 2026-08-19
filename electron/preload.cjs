const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  arch: process.arch,
  brewPath: process.arch === 'arm64' ? '/opt/homebrew/bin/brew' : '/usr/local/bin/brew',

  executeCommand: async (cmd, args = []) => {
    return await ipcRenderer.invoke('brew:execute', { command: cmd, args });
  },

  fetchAllBrewData: async () => {
    return await ipcRenderer.invoke('brew:fetch-all-data');
  },

  getSystemInfo: async () => {
    return await ipcRenderer.invoke('brew:get-system-info');
  },

  onLogOutput: (callback) => {
    const handler = (event, text) => callback(text);
    ipcRenderer.on('brew:stream-log', handler);
    return () => {
      ipcRenderer.removeListener('brew:stream-log', handler);
    };
  },

  openExternal: (url) => {
    ipcRenderer.invoke('shell:open-external', url);
  }
});
