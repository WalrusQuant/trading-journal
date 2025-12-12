import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from './components/Navigation';
import { SettingsProvider } from './lib/contexts/SettingsContext';
import { PortfolioProvider } from './lib/contexts/PortfolioContext';
import { TradeProvider } from './lib/contexts/TradeContext';
import { SetupProvider } from './lib/contexts/SetupContext';
import { TagProvider } from './lib/contexts/TagContext';

export const metadata: Metadata = {
  title: 'Bloomberg Trade - Trading Journal',
  description: 'A professional-grade trading journal with Bloomberg terminal aesthetics',
  keywords: ['trading', 'journal', 'stocks', 'options', 'crypto', 'forex', 'analytics', 'bloomberg'],
  authors: [{ name: 'Bloomberg Trade' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0e17',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-mono bg-terminal-bg text-gray-100">
        <SettingsProvider>
          <PortfolioProvider>
            <TradeProvider>
              <SetupProvider>
                <TagProvider>
                  <div className="flex h-screen overflow-hidden bg-terminal-bg">
                    <Navigation />
                    <main className="flex-1 overflow-y-auto lg:ml-64 pt-16 lg:pt-0 bg-terminal-bg">
                      <div className="container mx-auto px-4 py-6 max-w-7xl">
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
