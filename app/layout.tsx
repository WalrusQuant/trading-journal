import type { Metadata } from 'next';
import './globals.css';
import Navigation from './components/Navigation';
import { SettingsProvider } from './lib/contexts/SettingsContext';
import { PortfolioProvider } from './lib/contexts/PortfolioContext';
import { TradeProvider } from './lib/contexts/TradeContext';
import { SetupProvider } from './lib/contexts/SetupContext';
import { TagProvider } from './lib/contexts/TagContext';

export const metadata: Metadata = {
  title: 'TradeTracker Pro - Trading Journal',
  description: 'A comprehensive trading journal to track, analyze, and improve your trading performance',
  keywords: ['trading', 'journal', 'stocks', 'options', 'crypto', 'forex', 'analytics'],
  authors: [{ name: 'TradeTracker Pro' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <SettingsProvider>
          <PortfolioProvider>
            <TradeProvider>
              <SetupProvider>
                <TagProvider>
                  <div className="flex h-screen overflow-hidden">
                    <Navigation />
                    <main className="flex-1 overflow-y-auto lg:ml-64 pt-16 lg:pt-0">
                      <div className="container mx-auto px-4 py-8 max-w-7xl">
                        {children}
                      </div>
                    </main>
                  </div>
                </TagProvider>
              </SetupProvider>
            </TradeProvider>
          </PortfolioProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
