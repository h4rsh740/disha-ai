import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="app-body bg-[#f0f4ff] text-[#1a2e5a] antialiased" suppressHydrationWarning>
        <ClerkProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a2e5a',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  );
}