import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spotify DK Bot - Dakika Kasma Botu',
  description: 'Spotify dakika kasma botu. Client-side ve Spotify senkronizasyonu ile müzik dinleme sürenizi artırın.',
  keywords: ['spotify', 'bot', 'müzik', 'dakika kasma', 'streaming'],
  authors: [{ name: 'Spotify DK Bot Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Spotify DK Bot',
    description: 'Spotify dakika kasma botu - Client-side ve hibrit çözüm',
    type: 'website',
    locale: 'tr_TR',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1DB954" />
        <meta name="application-name" content="Spotify DK Bot" />
        <meta name="msapplication-TileColor" content="#1DB954" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-spotify-black via-spotify-dark to-spotify-black text-white antialiased">
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="border-t border-spotify-gray/20 py-6 px-6 text-center text-sm text-spotify-lightgray">
            <div className="max-w-4xl mx-auto">
              <p>
                © 2025 Spotify DK Bot. Tüm hakları saklıdır.
              </p>
              <p className="mt-2 text-xs opacity-75">
                Bu uygulama Spotify ile resmi olarak bağlı değildir.
              </p>
            </div>
          </footer>
        </div>
        
        {/* Global Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Dark mode ve tema ayarları
              if (typeof window !== 'undefined') {
                // Electron ortamı kontrolü
                window.isElectron = !!(window.electronAPI);
                
                // Platform bilgisi
                window.platform = window.platform || 'web';
                
                // Uygulama başlatıldığında konsola hoşgeldin mesajı
                console.log('%cSpotify DK Bot v1.0.0', 'color: #1DB954; font-size: 18px; font-weight: bold;');
                console.log('%cDakika kasma botuna hoşgeldiniz! 🎵', 'color: #B3B3B3; font-size: 12px;');
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

