import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './workspace.css';
import { ClientToaster } from '@/components/ui/ClientToaster';
import { AuthProvider } from '@/components/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#0a0806',
};

export const metadata: Metadata = {
  title: 'DishaAI — Career Counselling & Family Decision Platform',
  description:
    'AI-powered career counselling and family decision-support platform for vocational education in India. Helping students choose careers, helping families understand them.',
  keywords: 'career counselling, vocational education, ITI, NSDC, skill development, career path, India',
  authors: [{ name: 'DishaAI Team' }],
  openGraph: {
    title: 'DishaAI',
    description: 'Helping students choose careers. Helping families understand them.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="app-body bg-[#0a0806] text-[#f6efe5] antialiased" suppressHydrationWarning>
        <AuthProvider>
          {children}
          <ClientToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
