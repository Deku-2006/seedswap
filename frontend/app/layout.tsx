import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { TranslationProvider } from '@/context/TranslationContext';

export const metadata: Metadata = {
  title: 'SeedSwap – Trade Seeds, Grow Together',
  description: 'A community marketplace for trading seeds and sharing gardening knowledge.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <TranslationProvider>
          <AppShell>{children}</AppShell>
        </TranslationProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: '#1e291e',
              border: '1px solid #d4e5cb',
              borderRadius: '0.75rem',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#2ea82e', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  );
}
