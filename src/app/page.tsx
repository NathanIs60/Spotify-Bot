'use client';

import { useEffect, useState } from 'react';
import { BotStats, Track, Playlist } from '@/types';
import { formatListenTime, formatDuration, isElectron } from '@/lib/utils';

// İkonlar (basit SVG ikonları)
const PlayIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const MusicIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
);

const StatsIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3.5 18.5l6-6 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 17.08l1.5 1.42z" />
  </svg>
);

const PlaylistIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.5c-.59-.34-1.27-.5-2-.5-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V8h3V6h-5z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.5 12c0-.23-.01-.45-.03-.68l1.86-1.41c.4-.3.51-.86.26-1.3l-1.87-3.23c-.25-.44-.79-.62-1.25-.42l-2.15.91c-.37-.26-.76-.49-1.17-.68l-.29-2.31C14.8 2.38 14.37 2 13.87 2h-3.73c-.5 0-.93.38-.97.88l-.29 2.31c-.41.19-.8.42-1.17.68l-2.15-.91c-.46-.2-1-.02-1.25.42L2.44 8.61c-.25.44-.14 1 .26 1.3l1.86 1.41A7.343 7.343 0 0 0 4.5 12c0 .23.01.45.03.68l-1.86 1.41c-.4.3-.51.86-.26 1.3l1.87 3.23c.25.44.79.62 1.25.42l2.15-.91c.37.26.76.49 1.17.68l.29 2.31c.04.5.47.88.97.88h3.73c.5 0 .93-.38.97-.88l.29-2.31c.41-.19.8-.42 1.17-.68l2.15.91c.46.2 1 .02 1.25-.42l1.87-3.23c.25-.44.14-1-.26-1.3l-1.86-1.41c.02-.23.03-.45.03-.68zm-7.5 3c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
  </svg>
);

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [botStats, setBotStats] = useState<BotStats>({
    totalListenTime: 0,
    currentSession: 0,
    isPlaying: false,
    currentTrack: null,
    playlistMode: false,
    spotifySync: false
  });
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isElectronApp, setIsElectronApp] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  
  // Demo müzik listesi
  const demoTracks: Track[] = [
    {
      id: '1',
      name: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: 200,
      imageUrl: '/demo-cover.jpg',
      isLocal: true
    },
    {
      id: '2',
      name: 'Good 4 U',
      artist: 'Olivia Rodrigo',
      album: 'Sour',
      duration: 178,
      imageUrl: '/demo-cover2.jpg',
      isLocal: true
    },
    {
      id: '3',
      name: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      duration: 203,
      imageUrl: '/demo-cover3.jpg',
      isLocal: true
    }
  ];

  useEffect(() => {
    setIsClient(true);
    setIsElectronApp(isElectron());
    
    // Eğer Electron ortamında ise, bot istatistiklerini yükle
    if (isElectron() && window.electronAPI) {
      window.electronAPI.getBotStats().then(setBotStats);
      
      // Event listener'ları kur
      window.electronAPI.onPlaybackStatusChanged((data) => {
        setBotStats(prev => ({
          ...prev,
          isPlaying: data.isPlaying,
          currentTrack: data.currentTrack
        }));
        setCurrentTrack(data.currentTrack);
      });
      
      window.electronAPI.onListenTimeUpdated((data) => {
        setBotStats(prev => ({
          ...prev,
          totalListenTime: data.totalListenTime,
          currentSession: data.currentSession
        }));
      });
    }
    
    // Progress simulation for demo
    const interval = setInterval(() => {
      if (botStats.isPlaying && currentTrack) {
        setPlaybackProgress(prev => {
          if (prev >= currentTrack.duration) {
            return 0;
          }
          return prev + 1;
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [botStats.isPlaying, currentTrack]);

  const handlePlayPause = async () => {
    const track = currentTrack || demoTracks[0];
    
    if (isElectronApp && window.electronAPI) {
      const updatedStats = await window.electronAPI.togglePlayback(track);
      setBotStats(updatedStats);
      setCurrentTrack(updatedStats.currentTrack);
    } else {
      // Web versiyonu için basit simülasyon
      setBotStats(prev => ({
        ...prev,
        isPlaying: !prev.isPlaying,
        currentTrack: track
      }));
      setCurrentTrack(track);
    }
  };

  const handleTrackSelect = (track: Track) => {
    setCurrentTrack(track);
    setPlaybackProgress(0);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin-slow">
          <MusicIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                <MusicIcon />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Spotify DK Bot
                </h1>
                <p className="text-spotify-lightgray">
                  {isElectronApp ? 'Desktop Uygulaması' : 'Web Versiyonu'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${
                  botStats.isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`} />
                <span className="text-spotify-lightgray">
                  {botStats.isPlaying ? 'Aktif' : 'Durduruldu'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-spotify-lightgray text-sm font-medium">
                  Toplam Süre
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatListenTime(botStats.totalListenTime)}
                </p>
              </div>
              <div className="text-spotify-green">
                <StatsIcon />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-spotify-lightgray text-sm font-medium">
                  Bu Oturum
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatListenTime(botStats.currentSession)}
                </p>
              </div>
              <div className="text-blue-400">
                <StatsIcon />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-spotify-lightgray text-sm font-medium">
                  Playlist Modu
                </p>
                <p className="text-2xl font-bold text-white">
                  {botStats.playlistMode ? 'Aktif' : 'Kapalı'}
                </p>
              </div>
              <div className={botStats.playlistMode ? 'text-green-400' : 'text-gray-400'}>
                <PlaylistIcon />
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-spotify-lightgray text-sm font-medium">
                  Spotify Sync
                </p>
                <p className="text-2xl font-bold text-white">
                  {botStats.spotifySync ? 'Aktif' : 'Kapalı'}
                </p>
              </div>
              <div className={botStats.spotifySync ? 'text-green-400' : 'text-gray-400'}>
                <SettingsIcon />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Section */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
                <MusicIcon />
                <span className="ml-2">Müzik Çalar</span>
              </h2>
              
              {/* Current Track */}
              {currentTrack && (
                <div className="mb-6 p-4 bg-spotify-dark rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-spotify-gray rounded-lg flex items-center justify-center">
                      <MusicIcon />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{currentTrack.name}</h3>
                      <p className="text-spotify-lightgray">{currentTrack.artist}</p>
                      <p className="text-sm text-spotify-lightgray">{currentTrack.album}</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-spotify-lightgray mb-2">
                      <span>{formatDuration(playbackProgress)}</span>
                      <span>{formatDuration(currentTrack.duration)}</span>
                    </div>
                    <div className="w-full bg-spotify-gray rounded-full h-2">
                      <div 
                        className="bg-spotify-green h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${(playbackProgress / currentTrack.duration) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Controls */}
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={handlePlayPause}
                  className="w-14 h-14 bg-spotify-green hover:bg-green-400 rounded-full flex items-center justify-center text-black transition-colors"
                >
                  {botStats.isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
              </div>
              
              {/* Track List */}
              <div className="space-y-2">
                <h3 className="font-semibold text-white mb-3">Demo Şarkılar</h3>
                {demoTracks.map(track => (
                  <div 
                    key={track.id}
                    onClick={() => handleTrackSelect(track)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentTrack?.id === track.id 
                        ? 'bg-spotify-green/20 border border-spotify-green/30' 
                        : 'bg-spotify-dark hover:bg-spotify-gray'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{track.name}</p>
                        <p className="text-sm text-spotify-lightgray">{track.artist}</p>
                      </div>
                      <div className="text-sm text-spotify-lightgray">
                        {formatDuration(track.duration)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settings & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
                <SettingsIcon />
                <span className="ml-2">Hızlı Ayarlar</span>
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-spotify-lightgray">Playlist Modu</span>
                  <button 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      botStats.playlistMode ? 'bg-spotify-green' : 'bg-spotify-gray'
                    }`}
                    onClick={() => {
                      if (isElectronApp && window.electronAPI) {
                        window.electronAPI.togglePlaylistMode().then(setBotStats);
                      } else {
                        setBotStats(prev => ({
                          ...prev,
                          playlistMode: !prev.playlistMode
                        }));
                      }
                    }}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        botStats.playlistMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-spotify-lightgray">Spotify Sync</span>
                  <button 
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      botStats.spotifySync ? 'bg-spotify-green' : 'bg-spotify-gray'
                    }`}
                    onClick={() => {
                      if (isElectronApp && window.electronAPI) {
                        window.electronAPI.toggleSpotifySync().then(setBotStats);
                      } else {
                        setBotStats(prev => ({
                          ...prev,
                          spotifySync: !prev.spotifySync
                        }));
                      }
                    }}
                  >
                    <span 
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        botStats.spotifySync ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            
            {/* App Info */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 text-white">
                Uygulama Bilgisi
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-spotify-lightgray">Versiyon:</span>
                  <span className="text-white">v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-spotify-lightgray">Platform:</span>
                  <span className="text-white">
                    {isElectronApp ? 'Desktop' : 'Web'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-spotify-lightgray">Durum:</span>
                  <span className="text-green-400">Aktif</span>
                </div>
              </div>
            </div>
            
            {/* Features */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 text-white">
                Özellikler
              </h2>
              <ul className="space-y-2 text-sm text-spotify-lightgray">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-spotify-green rounded-full mr-2" />
                  Client-side dakika kasma
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-spotify-green rounded-full mr-2" />
                  Playlist modu
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-spotify-green rounded-full mr-2" />
                  Spotify senkronizasyonu
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-spotify-green rounded-full mr-2" />
                  Süre takibi ve istatistikler
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-spotify-green rounded-full mr-2" />
                  Hibrit desktop/web çalışma
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

