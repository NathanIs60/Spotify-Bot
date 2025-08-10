const { contextBridge, ipcRenderer } = require('electron');

// Renderer process için güvenli API'leri contexte maruz bırak
contextBridge.exposeInMainWorld('electronAPI', {
  // Bot İstatistikleri
  getBotStats: () => ipcRenderer.invoke('get-bot-stats'),
  updateBotStats: (stats) => ipcRenderer.invoke('update-bot-stats', stats),
  
  // Müzik Kontrolleri
  togglePlayback: (trackInfo) => ipcRenderer.invoke('toggle-playback', trackInfo),
  updateListenTime: (duration) => ipcRenderer.invoke('update-listen-time', duration),
  
  // Mod Değişiklikleri
  togglePlaylistMode: () => ipcRenderer.invoke('toggle-playlist-mode'),
  toggleSpotifySync: () => ipcRenderer.invoke('toggle-spotify-sync'),
  
  // Dosya İşlemleri
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: () => ipcRenderer.invoke('save-file-dialog'),
  
  // Event Listeners
  onPlaybackStatusChanged: (callback) => {
    ipcRenderer.on('playback-status-changed', (event, data) => callback(data));
  },
  onListenTimeUpdated: (callback) => {
    ipcRenderer.on('listen-time-updated', (event, data) => callback(data));
  },
  onLoadPlaylist: (callback) => {
    ipcRenderer.on('load-playlist', () => callback());
  },
  onSaveStats: (callback) => {
    ipcRenderer.on('save-stats', () => callback());
  },
  onToggleBot: (callback) => {
    ipcRenderer.on('toggle-bot', () => callback());
  },
  onStatsReset: (callback) => {
    ipcRenderer.on('stats-reset', () => callback());
  },
  onPlaylistModeChanged: (callback) => {
    ipcRenderer.on('playlist-mode-changed', (event, enabled) => callback(enabled));
  },
  onSpotifySyncChanged: (callback) => {
    ipcRenderer.on('spotify-sync-changed', (event, enabled) => callback(enabled));
  },
  onShowAbout: (callback) => {
    ipcRenderer.on('show-about', () => callback());
  },
  
  // Event Listener'ları temizleme
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Development modu kontrolü
contextBridge.exposeInMainWorld('isDev', process.env.NODE_ENV === 'development');

// Platform bilgisi
contextBridge.exposeInMainWorld('platform', process.platform);

// Uygulama bilgileri
contextBridge.exposeInMainWorld('appInfo', {
  version: require('../package.json').version,
  name: require('../package.json').name
});

