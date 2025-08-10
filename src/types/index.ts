// Spotify Bot Ana Tipleri
export interface BotStats {
  totalListenTime: number; // Toplam dinleme süresi (dakika)
  currentSession: number; // Mevcut oturum süresi (dakika)
  isPlaying: boolean; // Bot çalıyor mu?
  currentTrack: Track | null; // Şu anda çalınan şarkı
  playlistMode: boolean; // Playlist modu aktif mi?
  spotifySync: boolean; // Spotify senkronizasyonu aktif mi?
}

// Müzik Parçası Tipi
export interface Track {
  id: string;
  name: string;
  artist: string;
  album?: string;
  duration: number; // saniye cinsinden
  imageUrl?: string;
  spotifyUrl?: string;
  isLocal?: boolean; // Client-side müzik mi?
}

// Playlist Tipi
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: Track[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Bot Konfiguräsyonu
export interface BotConfig {
  autoStart: boolean;
  shuffleMode: boolean;
  repeatMode: 'none' | 'track' | 'playlist';
  volume: number; // 0-100
  fadeDuration: number; // saniye
  silentMode: boolean; // Sessizde çalışma
  minTrackDuration: number; // Minimum şarkı süresi (saniye)
  maxTrackDuration: number; // Maximum şarkı süresi (saniye)
  dailyTarget: number; // Günlük hedef (dakika)
}

// Uygulama Durumu
export interface AppState {
  isElectron: boolean;
  isDev: boolean;
  platform: string;
  version: string;
  theme: 'dark' | 'light';
  language: 'tr' | 'en';
}

// Electron API Tipleri
export interface ElectronAPI {
  // Bot İstatistikleri
  getBotStats: () => Promise<BotStats>;
  updateBotStats: (stats: Partial<BotStats>) => Promise<BotStats>;
  
  // Müzik Kontrolleri
  togglePlayback: (trackInfo?: Track) => Promise<BotStats>;
  updateListenTime: (duration: number) => Promise<BotStats>;
  
  // Mod Değişiklikleri
  togglePlaylistMode: () => Promise<BotStats>;
  toggleSpotifySync: () => Promise<BotStats>;
  
  // Dosya İşlemleri
  openFileDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  saveFileDialog: () => Promise<{ canceled: boolean; filePath?: string }>;
  
  // Event Listeners
  onPlaybackStatusChanged: (callback: (data: { isPlaying: boolean; currentTrack: Track | null }) => void) => void;
  onListenTimeUpdated: (callback: (data: { totalListenTime: number; currentSession: number }) => void) => void;
  onLoadPlaylist: (callback: () => void) => void;
  onSaveStats: (callback: () => void) => void;
  onToggleBot: (callback: () => void) => void;
  onStatsReset: (callback: () => void) => void;
  onPlaylistModeChanged: (callback: (enabled: boolean) => void) => void;
  onSpotifySyncChanged: (callback: (enabled: boolean) => void) => void;
  onShowAbout: (callback: () => void) => void;
  
  removeAllListeners: (channel: string) => void;
}

// Component Props Tipleri
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export interface TrackCardProps {
  track: Track;
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  showControls?: boolean;
}

export interface PlaylistCardProps {
  playlist: Playlist;
  isActive?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Modal Tipleri
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

// Form Tipleri
export interface TrackFormData {
  name: string;
  artist: string;
  album?: string;
  duration: number;
  imageUrl?: string;
  spotifyUrl?: string;
}

export interface PlaylistFormData {
  name: string;
  description?: string;
}

// API Response Tipleri
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Spotify API Tipleri (geçmiş referans için)
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string; height: number; width: number }>;
  tracks: {
    total: number;
    items: Array<{ track: SpotifyTrack }>;
  };
}

// Utility Types
export type Theme = 'dark' | 'light';
export type Language = 'tr' | 'en';
export type RepeatMode = 'none' | 'track' | 'playlist';
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

// Global Window interface extensions
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    isDev?: boolean;
    platform?: string;
    appInfo?: {
      version: string;
      name: string;
    };
  }
}

