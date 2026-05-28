
'use client';
import { initializeFirebase, FirebaseClientProvider } from '@/firebase';
import './globals.css';
import type { Metadata } from 'next';

const { firebaseApp, firestore, auth } = initializeFirebase();

// Note: Metadata must be exported from a Server Component or a static file.
// Since layout.tsx is 'use client', we define basic tags here, 
// but for full SEO we would normally use a separate file. 
// However, standard OG tags are added via the head for immediate visibility.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="dark">
      <head>
        {/* Primary Meta Tags */}
        <title>Shurukkha Hub | সিরাজগঞ্জ সুরক্ষা 🛡️</title>
        <meta name="title" content="Shurukkha Hub | সিরাজগঞ্জ সুরক্ষা 🛡️" />
        <meta name="description" content="সিরাজগঞ্জ জেলা প্রশাসনের জন্য একটি সার্বভৌম এআই-চালিত জরুরি ও আর্থিক পরিকাঠামো। Mission-Critical Sovereign Infrastructure." />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://core.sheikh" />
        <meta property="og:title" content="Shurukkha Hub | সিরাজগঞ্জ সুরক্ষা 🛡️" />
        <meta property="og:description" content="এআই-চালিত দুর্যোগ ব্যবস্থাপনা এবং সভারেন পেমেন্ট গ্রিডের এক অপূর্ব সমন্বয়।" />
        <meta property="og:image" content="https://picsum.photos/seed/42/1200/630" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://core.sheikh" />
        <meta property="twitter:title" content="Shurukkha Hub | সিরাজগঞ্জ সুরক্ষা 🛡️" />
        <meta property="twitter:description" content="সিরাজগঞ্জের ডিজিটাল সার্বভৌমত্বের নতুন দিগন্ত।" />
        <meta property="twitter:image" content="https://picsum.photos/seed/42/1200/630" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30">
        <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
