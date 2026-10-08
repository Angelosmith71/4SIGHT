import type { Metadata, Viewport } from 'next';
import { Rajdhani, Share_Tech_Mono } from 'next/font/google';
import { InstallApp } from '@/components/pwa/InstallApp';
import './globals.css';
const rajdhani = Rajdhani({ subsets:['latin'], weight:['400','500','600','700'], variable:'--font-rajdhani', display:'swap' });
const shareTechMono = Share_Tech_Mono({ subsets:['latin'], weight:'400', variable:'--font-share-tech-mono', display:'swap' });
export const metadata: Metadata = {
  title: 'Guardian AI — 4SIGHT',
  description: 'Your AI shield for cookies, trackers & bots.',
  applicationName: '4Sight Guardian AI',
  appleWebApp: { capable: true, title: '4Sight', statusBarStyle: 'black-translucent' },
  icons: {
    icon: '/guardian-ai-favicon.jpeg',
    shortcut: '/guardian-ai-favicon.jpeg',
    apple: '/guardian-ai-favicon.jpeg',
  },
};
export const viewport: Viewport = {
  themeColor: '#05060A',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${shareTechMono.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-deepVoid text-white antialiased">
        {children}
        <InstallApp />
      </body>
    </html>
  );
}
