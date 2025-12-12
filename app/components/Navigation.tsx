'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  BarChart3,
  Calendar,
  Wallet,
  Settings,
  Tag,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useSettings } from '../lib/contexts/SettingsContext';
import { usePortfolios } from '../lib/contexts/PortfolioContext';
import { useState } from 'react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'DASHBOARD', href: '/', icon: LayoutDashboard },
  { name: 'TRADES', href: '/trades', icon: TrendingUp },
  { name: 'SETUPS', href: '/setups', icon: Target },
  { name: 'ANALYTICS', href: '/analytics', icon: BarChart3 },
  { name: 'CALENDAR', href: '/calendar', icon: Calendar },
  { name: 'PORTFOLIOS', href: '/portfolios', icon: Wallet },
  { name: 'TAGS', href: '/tags', icon: Tag },
  { name: 'SETTINGS', href: '/settings', icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  const { activePortfolio } = usePortfolios();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-terminal-panel border-b border-terminal-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-400 hover:text-matrix-400 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-bloomberg-500" />
              <h1 className="text-lg font-bold text-bloomberg-500 tracking-wider font-mono">
                BLOOMBERG<span className="text-matrix-400">TRADE</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-live">LIVE</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-terminal-panel border-r border-terminal-border transition-transform',
          'lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Header */}
          <div className="p-4 border-b border-terminal-border">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-6 h-6 text-bloomberg-500" />
              <h1 className="text-xl font-bold tracking-wider font-mono">
                <span className="text-bloomberg-500">BLOOMBERG</span>
                <span className="text-matrix-400">TRADE</span>
              </h1>
            </div>
            <div className="flex items-center justify-between">
              <span className="status-live">LIVE</span>
              {activePortfolio && (
                <span className="text-xs text-gray-500 font-mono uppercase tracking-wide">
                  {activePortfolio.name}
                </span>
              )}
            </div>
          </div>

          {/* System Status Bar */}
          <div className="px-4 py-2 border-b border-terminal-border bg-terminal-bg/50">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500">SYS</span>
              <span className="text-matrix-400">CONNECTED</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
            <div className="px-3 py-2">
              <span className="text-xs font-mono text-gray-600 uppercase tracking-widest">Navigation</span>
            </div>
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 font-mono text-sm transition-all duration-150 border-l-2',
                    isActive
                      ? 'bg-matrix-500/10 text-matrix-400 border-l-matrix-500'
                      : 'text-gray-400 hover:text-matrix-400 hover:bg-terminal-hover border-l-transparent hover:border-l-matrix-500/50'
                  )}
                >
                  <span className="text-gray-600 text-xs w-4">{index + 1}.</span>
                  <Icon className={cn('w-4 h-4', isActive ? 'text-matrix-400' : 'text-gray-500')} />
                  <span className="tracking-wide">{item.name}</span>
                  {isActive && (
                    <span className="ml-auto text-matrix-500 text-xs">●</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Keyboard shortcuts hint */}
          <div className="p-3 border-t border-terminal-border bg-terminal-bg/50">
            <div className="text-xs font-mono text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Quick Trade</span>
                <span className="text-gray-500">⌘ + N</span>
              </div>
              <div className="flex justify-between">
                <span>Search</span>
                <span className="text-gray-500">⌘ + K</span>
              </div>
            </div>
          </div>

          {/* Footer with timestamp */}
          <div className="p-3 border-t border-terminal-border">
            <div className="text-xs font-mono text-gray-600 text-center">
              <span className="text-bloomberg-500">TRADE</span>
              <span className="text-gray-500"> JOURNAL v1.0</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
