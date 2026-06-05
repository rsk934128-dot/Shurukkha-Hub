'use client';
import { useEffect } from 'react';
import { initializeFirebase, FirebaseClientProvider } from '@/firebase';
import { GlobalSignalHandler } from '@/components/layout/global-signal-handler';
import { MobileBridge } from '@/lib/mobile-bridge';
import './globals.css';

const { firebaseApp, firestore, auth } = initializeFirebase();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  useEffect(() => {
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((reg) => {
          console.log('[Sovereign SW] Registered with scope:', reg.scope);
        }).catch((err) => {
          console.error('[Sovereign SW] Registration failed:', err);
        });
      });
    }

    // Initialize Android BackPress / Home Bridge
    MobileBridge.init();
  }, []);

  const faviconSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
      <path d='M50 5L15 20V45C15 70 50 95 50 95C50 95 85 70 85 45V20L50 5Z' fill='#7597FF'/>
      <path d='M35 50C40 45 45 55 50 50C55 45 60 55 65 50' stroke='white' stroke-width='5' stroke-linecap='round'/>
      <circle cx='50' cy='35' r='8' fill='white'/>
    </svg>
  `;

  return (
    <html lang="bn" className="dark">
      <head>
        <title>Shurukkha Hub | সিরাজগঞ্জ সুরক্ষা 🛡️</title>
        <meta name="title" content="Shurukkha Hub | সিরাজগঞ্জ সুরক্ষা 🛡️" />
        <meta name="description" content="সিরাজগঞ্জ জেলা প্রশাসনের জন্য একটি সার্বভৌম এআই-চালিত জরুরি ও আর্থিক পরিকাঠামো। Mission-Critical Sovereign Infrastructure." />
        <link rel="icon" href={`data:image/svg+xml,${encodeURIComponent(faviconSvg)}`} />
        
        {/* Imperial Mobile Configuration */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#05070a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Shurukkha Hub | সিরাজগঞ্জ সুরক্ষা 🛡️" />
        <meta property="og:description" content="এআই-চালিত দুর্যোগ ব্যবস্থাপনা এবং সভারেন পেমেন্ট গ্রিডের এক অপূর্ব সমন্বয়।" />
        <meta property="og:image" content="https://picsum.photos/seed/42/1200/630" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30">
        <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
          <GlobalSignalHandler />
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
