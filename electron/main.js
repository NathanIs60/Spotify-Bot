const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let splashWindow;

// Spotify bot özellikleri için global değişkenler
let botStats = {
  totalListenTime: 0,
  currentSession: 0,
  isPlaying: false,
  currentTrack: null,
  playlistMode: false,
  spotifySync: false
};

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  
  // 3 saniye sonra splash ekranını kapat ve ana pencereyi aç
  setTimeout(() => {
    splashWindow.close();
    createMainWindow();
  }, 3000);
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '../public/icon.png'),
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#191414',
      symbolColor: '#FFFFFF',
      height: 40
    }
  });

  // Development modunda localhost, production'da build dosyalarını yükle
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../out/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Pencere hazır olduğunda göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Development modunda DevTools'u aç
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Pencere kapatılırken minimize et (sistem tepsisinde çalışmaya devam et)
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

// Uygulama hazır olduğunda splash ekranını aç
app.whenReady().then(() => {
  createSplashWindow();
  
  // macOS için dock'ta tıklandığında pencereyi tekrar aç
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

// Tüm pencereler kapatıldığında uygulamayı sonlandır (macOS hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
});

// IPC Event Handlers - Renderer process ile iletişim

// Bot istatistiklerini al
ipcMain.handle('get-bot-stats', () => {
  return botStats;
});

// Bot istatistiklerini güncelle
ipcMain.handle('update-bot-stats', (event, newStats) => {
  botStats = { ...botStats, ...newStats };
  return botStats;
});

// Müzik çalmaya başla/durdur
ipcMain.handle('toggle-playback', (event, trackInfo) => {
  botStats.isPlaying = !botStats.isPlaying;
  if (trackInfo) {
    botStats.currentTrack = trackInfo;
  }
  
  // Ana pencereye durum güncellemesini gönder
  if (mainWindow) {
    mainWindow.webContents.send('playback-status-changed', {
      isPlaying: botStats.isPlaying,
      currentTrack: botStats.currentTrack
    });
  }
  
  return botStats;
});

// Dinleme süresini güncelle
ipcMain.handle('update-listen-time', (event, duration) => {
  botStats.totalListenTime += duration;
  botStats.currentSession += duration;
  
  // Ana pencereye süre güncellemesini gönder
  if (mainWindow) {
    mainWindow.webContents.send('listen-time-updated', {
      totalListenTime: botStats.totalListenTime,
      currentSession: botStats.currentSession
    });
  }
  
  return botStats;
});

// Playlist modu değiştir
ipcMain.handle('toggle-playlist-mode', () => {
  botStats.playlistMode = !botStats.playlistMode;
  return botStats;
});

// Spotify senkronizasyonu değiştir
ipcMain.handle('toggle-spotify-sync', () => {
  botStats.spotifySync = !botStats.spotifySync;
  return botStats;
});

// Dosya diyaloğu aç (playlist için)
ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result;
});

// Dosya kaydetme diyaloğu aç
ipcMain.handle('save-file-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'Text Files', extensions: ['txt'] }
    ]
  });
  return result;
});

// Menü oluştur
const template = [
  {
    label: 'Dosya',
    submenu: [
      {
        label: 'Playlist Yükle',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('load-playlist');
          }
        }
      },
      {
        label: 'İstatistikleri Kaydet',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('save-stats');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Çıkış',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.isQuiting = true;
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Bot',
    submenu: [
      {
        label: 'Başlat/Durdur',
        accelerator: 'Space',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('toggle-bot');
          }
        }
      },
      {
        label: 'İstatistikleri Sıfırla',
        click: () => {
          botStats.totalListenTime = 0;
          botStats.currentSession = 0;
          if (mainWindow) {
            mainWindow.webContents.send('stats-reset');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Playlist Modu',
        type: 'checkbox',
        checked: botStats.playlistMode,
        click: () => {
          botStats.playlistMode = !botStats.playlistMode;
          if (mainWindow) {
            mainWindow.webContents.send('playlist-mode-changed', botStats.playlistMode);
          }
        }
      },
      {
        label: 'Spotify Senkronizasyonu',
        type: 'checkbox',
        checked: botStats.spotifySync,
        click: () => {
          botStats.spotifySync = !botStats.spotifySync;
          if (mainWindow) {
            mainWindow.webContents.send('spotify-sync-changed', botStats.spotifySync);
          }
        }
      }
    ]
  },
  {
    label: 'Görünüm',
    submenu: [
      { role: 'reload', label: 'Yenile' },
      { role: 'forceReload', label: 'Zorla Yenile' },
      { role: 'toggleDevTools', label: 'Geliştirici Araçları' },
      { type: 'separator' },
      { role: 'resetZoom', label: 'Yakınlaştırmayı Sıfırla' },
      { role: 'zoomIn', label: 'Yakınlaştır' },
      { role: 'zoomOut', label: 'Uzaklaştır' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: 'Tam Ekran' }
    ]
  },
  {
    label: 'Yardım',
    submenu: [
      {
        label: 'Hakkında',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('show-about');
          }
        }
      },
      {
        label: 'GitHub',
        click: () => {
          require('electron').shell.openExternal('https://github.com/NathanIs60/Spotify-Bot');
        }
      }
    ]
  }
];

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      { role: 'about', label: `${app.getName()} Hakkında` },
      { type: 'separator' },
      { role: 'services', label: 'Servisler' },
      { type: 'separator' },
      { role: 'hide', label: `${app.getName()} Gizle` },
      { role: 'hideOthers', label: 'Diğerlerini Gizle' },
      { role: 'unhide', label: 'Hepsini Göster' },
      { type: 'separator' },
      { role: 'quit', label: `${app.getName()} Çıkış` }
    ]
  });
}

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

